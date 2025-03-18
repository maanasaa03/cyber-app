import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function EmailBreachSection() {
  const [email, setEmail] = useState('');
  const [breachResult, setBreachResult] = useState('');
  const [loading, setLoading] = useState(false);

  const checkBreach = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setBreachResult('');
    try {
      const response = await fetch(
        `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your actual API key
            'X-RapidAPI-Host': 'breachdirectory.p.rapidapi.com',
          },
        }
      );
      const data = await response.json();
      if (data.success && data.count > 0) {
        setBreachResult(`Your email was found in ${data.count} breach${data.count > 1 ? 'es' : ''}.`);
      } else if (data.success && data.count === 0) {
        setBreachResult('No breaches found for this email.');
      } else {
        setBreachResult('No breaches found for this email.');
      }
    } catch (error) {
      setBreachResult('Error checking breach. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.breachContainer}>
      <Text style={styles.breachTitle}>Check Email Breach</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.checkButton} onPress={checkBreach}>
        <Text style={styles.buttonText}>Check Breach</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="small" color="#8A2BE2" />}
      {breachResult !== '' && <Text style={styles.breachResult}>{breachResult}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  breachContainer: {
    marginTop: 20,
    width: '90%',
    maxWidth: 350,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  breachTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#8A2BE2',
    borderRadius: 8,
    marginBottom: 10,
  },
  checkButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  breachResult: {
    marginTop: 10,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
});
