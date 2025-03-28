import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';

const BACKEND_URL = 'http://192.168.0.105:8000';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Cyber Hygiene Assistant.", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userLevel, setUserLevel] = useState('beginner'); // Add user level state
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const netInfo = useNetInfo();

  // Load user level from storage when component mounts
  useEffect(() => {
    const loadUserLevel = async () => {
      try {
        const savedResults = await AsyncStorage.getItem('cyber_results');
        if (savedResults) {
          const results = JSON.parse(savedResults);
          setUserLevel(results.userLevel || 'beginner');
        }
      } catch (error) {
        console.error('Failed to load user level:', error);
      }
    };
    
    loadUserLevel();
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '' || isTyping) return;

    if (!netInfo.isConnected) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "You're offline. Please check your internet connection.",
        sender: 'bot'
      }]);
      return;
    }

    const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: inputText,
          user_level: userLevel // Include user level in the request
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const botResponse = { id: Date.now() + 1, text: data.answer, sender: 'bot' };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('API Error:', error);
      const errorResponse = { 
        id: Date.now() + 1, 
        text: error.message.includes('Network request failed') 
          ? "Couldn't connect to the server. Please check your network and API URL."
          : "Sorry, something went wrong. Please try again.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userContainer : styles.botContainer
    ]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about cyber security..."
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={isTyping}
        >
          <Icon 
            name={isTyping ? "hourglass-empty" : "send"} 
            size={24} 
            color={isTyping ? "#ccc" : "#fff"} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#9275D7',
    borderBottomRightRadius: 4,
  },
  botContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  botText: {
    color: '#212529',
    fontSize: 16,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  typingText: {
    color: '#666',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    marginRight: 8,
    color: '#212529',
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9C4DCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ChatbotScreen;




