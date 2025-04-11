import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const questions = [
  // Cyber Hygiene (3 questions)
  {
    question: "What's the minimum recommended length for a strong password?",
    options: ["6 characters", "8 characters", "12 characters", "4 characters"],
    answer: "12 characters",
    topic: "Cyber Hygiene"
  },
  {
    question: "Why is it important to install software updates promptly?",
    options: [
      "They only add new features",
      "They fix security vulnerabilities",
      "They make your device slower",
      "They change your settings automatically"
    ],
    answer: "They fix security vulnerabilities",
    topic: "Cyber Hygiene"
  },
  {
    question: "What's the risk of using the same password across multiple accounts?",
    options: [
      "No risk - it's convenient",
      "If one account is hacked, all become vulnerable",
      "It makes passwords easier to remember",
      "It improves login speed"
    ],
    answer: "If one account is hacked, all become vulnerable",
    topic: "Cyber Hygiene"
  },

  // Public Wi-Fi Safety (3 questions)
  {
    question: "What's the safest action when using public Wi-Fi at an airport?",
    options: [
      "Online banking without protection",
      "Checking email via VPN",
      "Shopping on unfamiliar websites",
      "Turning off your firewall"
    ],
    answer: "Checking email via VPN",
    topic: "Public Wi-Fi Safety"
  },
  {
    question: "Why should you disable auto-connect to Wi-Fi networks?",
    options: [
      "To save battery life",
      "To prevent automatically connecting to malicious hotspots",
      "To make your device discoverable",
      "It's required by law"
    ],
    answer: "To prevent automatically connecting to malicious hotspots",
    topic: "Public Wi-Fi Safety"
  },
  {
    question: "What does a VPN protect when using public Wi-Fi?",
    options: [
      "Only your email password",
      "Just your browsing history",
      "All your internet traffic",
      "Nothing - it's just for accessing blocked sites"
    ],
    answer: "All your internet traffic",
    topic: "Public Wi-Fi Safety"
  },

  // Phishing (3 questions)
  {
    question: "Which element is MOST likely to indicate a phishing email?",
    options: [
      "Professional logo",
      "Urgent request for personal information",
      "Proper grammar and spelling",
      "Familiar sender name"
    ],
    answer: "Urgent request for personal information",
    topic: "Phishing"
  },
  {
    question: "What should you do with a suspicious email from your 'bank'?",
    options: [
      "Click 'Unsubscribe'",
      "Forward to your bank's fraud department",
      "Reply with your account number to verify",
      "Open attachments to check authenticity"
    ],
    answer: "Forward to your bank's fraud department",
    topic: "Phishing"
  },
  {
    question: "How does multi-factor authentication help prevent phishing success?",
    options: [
      "It makes passwords unnecessary",
      "Attackers can't bypass the second factor",
      "It encrypts all your emails",
      "It automatically detects fake websites"
    ],
    answer: "Attackers can't bypass the second factor",
    topic: "Phishing"
  },

  // Secure Browsing (3 questions)
  {
    question: "What does the padlock icon in your browser guarantee?",
    options: [
      "The website is completely safe",
      "Your connection is encrypted",
      "The company is legitimate",
      "No malware exists on the site"
    ],
    answer: "Your connection is encrypted",
    topic: "Secure Browsing"
  },
  {
    question: "Why should you clear browser cache on shared computers?",
    options: [
      "To make the computer faster",
      "To remove saved login credentials",
      "To update the browser",
      "To see newer website designs"
    ],
    answer: "To remove saved login credentials",
    topic: "Secure Browsing"
  },
  {
    question: "What's the safest response to a browser security warning?",
    options: [
      "Proceed anyway - warnings are usually false",
      "Take a screenshot and continue",
      "Leave the site immediately",
      "Disable your antivirus temporarily"
    ],
    answer: "Leave the site immediately",
    topic: "Secure Browsing"
  },

  // Authentication (3 questions)
  {
    question: "Which authentication method is MOST secure?",
    options: [
      "Single password",
      "Password + security questions",
      "Password + SMS code",
      "Password + biometric scan"
    ],
    answer: "Password + biometric scan",
    topic: "Authentication"
  },
  {
    question: "What makes 'Winter2023!' a better password than 'password123'?",
    options: [
      "It's longer and more complex",
      "It contains a season reference",
      "It has a capital letter",
      "It's easier to remember"
    ],
    answer: "It's longer and more complex",
    topic: "Authentication"
  },
  {
    question: "Why should you change passwords after a data breach?",
    options: [
      "Breaches never expose passwords",
      "Your password might be compromised",
      "It's required by all websites",
      "To get free credit monitoring"
    ],
    answer: "Your password might be compromised",
    topic: "Authentication"
  },

  // Device Security (3 questions)
  {
    question: "What's the purpose of device encryption?",
    options: [
      "Make deleted files unrecoverable",
      "Protect data if device is stolen",
      "Improve touchscreen sensitivity",
      "Increase storage capacity"
    ],
    answer: "Protect data if device is stolen",
    topic: "Device Security"
  },
  {
    question: "Which screen lock method is MOST secure?",
    options: [
      "4-digit PIN",
      "Swipe pattern",
      "Facial recognition",
      "Fingerprint + PIN"
    ],
    answer: "Fingerprint + PIN",
    topic: "Device Security"
  },
  {
    question: "Before selling your phone, you should:",
    options: [
      "Just delete your photos",
      "Remove the SIM card only",
      "Perform factory reset + remove accounts",
      "Throw it away - it's unsafe to sell"
    ],
    answer: "Perform factory reset + remove accounts",
    topic: "Device Security"
  },

  // Data Privacy (3 questions)
  {
    question: "Which social media post poses privacy risks?",
    options: [
      "Photo of your lunch",
      "Check-in at your workplace",
      "Birthday wishes to a friend",
      "Shared news article"
    ],
    answer: "Check-in at your workplace",
    topic: "Data Privacy"
  },
  {
    question: "What personal information is safest to share publicly?",
    options: [
      "Your mother's maiden name",
      "Your first pet's name",
      "Your favorite sports team",
      "Your childhood street address"
    ],
    answer: "Your favorite sports team",
    topic: "Data Privacy"
  },
  {
    question: "Where should you store sensitive documents digitally?",
    options: [
      "Unencrypted cloud folder",
      "Password-protected encrypted drive",
      "Email drafts folder",
      "Public file-sharing service"
    ],
    answer: "Password-protected encrypted drive",
    topic: "Data Privacy"
  }
];

type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export default function QuestionnaireScreen() {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [score, setScore] = useState<number | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [storedResults, setStoredResults] = useState<any>(null);
  const [showTopicBreakdown, setShowTopicBreakdown] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel>('beginner');

  // Load stored results and calculate user level on component mount
  useEffect(() => {
    const loadStoredResults = async () => {
      try {
        const savedResults = await AsyncStorage.getItem('cyber_results');
        if (savedResults !== null) {
          const results = JSON.parse(savedResults);
          setStoredResults(results);
          setUserLevel(calculateUserLevel(results.score, questions.length));
        }
      } catch (error) {
        console.error('Failed to load stored results:', error);
      }
    };

    loadStoredResults();
  }, []);

  const calculateUserLevel = (score: number, total: number): UserLevel => {
    const percentage = (score / total) * 100;
    if (percentage < 40) return 'beginner';
    if (percentage < 75) return 'intermediate';
    return 'advanced';
  };

  const handleAnswerSelect = (questionIndex: number, option: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    let correctAnswers = 0;
    const topicErrors: { [key: string]: number } = {};
    const topicDetails: { [key: string]: { correct: number; total: number } } = {};

    // Initialize topic details
    questions.forEach(question => {
      if (!topicDetails[question.topic]) {
        topicDetails[question.topic] = { correct: 0, total: 0 };
      }
      topicDetails[question.topic].total++;
    });

    // Calculate scores
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctAnswers++;
        topicDetails[question.topic].correct++;
      } else {
        topicErrors[question.topic] = (topicErrors[question.topic] || 0) + 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const newUserLevel = calculateUserLevel(correctAnswers, totalQuestions);

    // Prepare detailed results
    const results = {
      score: correctAnswers,
      total: totalQuestions,
      percentage,
      date: new Date().toISOString(),
      topicErrors,
      topicDetails,
      userLevel: newUserLevel
    };

    setScore(correctAnswers);
    setUserLevel(newUserLevel);

    const leastCorrectTopics = Object.keys(topicErrors)
      .filter(topic => topicErrors[topic] > 0)
      .sort((a, b) => topicErrors[b] - topicErrors[a]);

    setSuggestedTopics(leastCorrectTopics);

    try {
      await AsyncStorage.setItem('cyber_results', JSON.stringify(results));
      setStoredResults(results);
    } catch (error) {
      console.error('Failed to store results:', error);
    }

    // Personalized feedback based on user level
    const levelFeedback = {
      beginner: "Great start! Let's build your cybersecurity knowledge together.",
      intermediate: "Good job! You have solid foundations to build upon.",
      advanced: "Excellent! You're demonstrating advanced cybersecurity awareness."
    };

    Alert.alert(
      "Quiz Results",
      `Your Cyber Awareness Score: ${correctAnswers}/${totalQuestions} (${percentage.toFixed(1)}%)\n\n` +
      `Level: ${newUserLevel.charAt(0).toUpperCase() + newUserLevel.slice(1)}\n\n` +
      `${levelFeedback[newUserLevel]}\n\n` +
      `Suggested Topics to Review:\n${leastCorrectTopics.join(", ")}`,
      [{ text: "OK" }]
    );
  };

  const getLevelColor = () => {
    switch (userLevel) {
      case 'beginner': return '#FF6B6B';
      case 'intermediate': return '#4ECDC4';
      case 'advanced': return '#1DD1A1';
      default: return '#FF6B6B';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 0.75) return '#4CAF50';  // Green
    if (percentage >= 0.5) return '#FFC107';    // Yellow
    return '#F44336';                           // Red
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

{storedResults && (
      <View style={styles.resultsContainer}>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor() }]}>
          <Text style={styles.levelBadgeText}>
            {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
          </Text>
        </View>
        <Text style={styles.storedScoreText}>
          Previous Score: {storedResults.score}/{storedResults.total} ({storedResults.percentage.toFixed(1)}%)
        </Text>

        {/* Show More button with correct Material icon names */}
        <TouchableOpacity 
          onPress={() => setShowTopicBreakdown(!showTopicBreakdown)}
          style={styles.showMoreButton}
        >
          <Text style={styles.showMoreText}>
            {showTopicBreakdown ? 'Show Less' : 'Show More'}
          </Text>
          <Icon 
            name={showTopicBreakdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
            size={20}  // Slightly larger for better visibility
            color="#666" 
          />
        </TouchableOpacity>

        {/* Conditionally render topic breakdown */}
        {showTopicBreakdown && storedResults.topicDetails && (
          <View style={styles.topicBreakdown}>
            <Text style={styles.topicBreakdownTitle}>Topic Breakdown:</Text>
            {Object.entries(storedResults.topicDetails).map(([topic, details]: [string, any]) => (
              <View key={topic} style={styles.topicRow}>
                <Text style={styles.topicName}>{topic}:</Text>
                <Text style={styles.topicScore}>
                  {details.correct}/{details.total} ({Math.round((details.correct / details.total) * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    )}

      {questions.map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.options.map((option, optionIndex) => (
            <TouchableOpacity
              key={optionIndex}
              style={[
                styles.optionButton,
                answers[index] === option && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index, option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor:'#BCA4F5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  levelBadge: {
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  levelBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  storedScoreText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#495057',
  },
  topicBreakdown: {
    marginTop: 10,
  },
  topicBreakdownTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#212529',
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  topicName: {
    color: '#495057',
  },
  topicScore: {
    fontWeight: 'bold',
    color: '#212529',
  },
  questionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#212529',
    fontWeight: '500',
  },
  optionButton: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedOption: {
    backgroundColor: '#d0ebff',
    borderColor: '#74c0fc',
  },
  optionText: {
    fontSize: 15,
    color: '#212529',
  },
  submitButton: {
    backgroundColor: '#9C4DCC',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 8,
  },
  showMoreText: {
    color: '#666',
    marginRight: 4,
    fontSize: 14,
  }
});
  
  