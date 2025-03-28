import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const questions = [
  // Cyber Hygiene
  {
    question: "Which of these is a key aspect of cyber hygiene?",
    options: ["Using strong passwords", "Keeping devices always unlocked", "Ignoring security updates", "Connecting to any available Wi-Fi"],
    answer: "Using strong passwords",
    topic: "Cyber Hygiene",
  },
  {
    question: "What is the benefit of regular software updates?",
    options: ["Improves appearance", "Fixes security vulnerabilities", "Makes device slower", "Increases battery usage"],
    answer: "Fixes security vulnerabilities",
    topic: "Cyber Hygiene",
  },
  {
    question: "Why should you avoid using the same password for multiple accounts?",
    options: ["Easier to remember", "Increases security risk", "Improves account performance", "Required by law"],
    answer: "Increases security risk",
    topic: "Cyber Hygiene",
  },

  // Public Wi-Fi Safety
  {
    question: "What is the safest way to access personal data on public Wi-Fi?",
    options: ["Use HTTPS websites", "Turn off device security", "Connect to open networks", "Disable password protection"],
    answer: "Use HTTPS websites",
    topic: "Public Wi-Fi Safety",
  },
  {
    question: "Which tool can protect your data on public Wi-Fi?",
    options: ["VPN", "Bluetooth", "Cookies", "Data Saver Mode"],
    answer: "VPN",
    topic: "Public Wi-Fi Safety",
  },
  {
    question: "When using public Wi-Fi, which of these should you avoid?",
    options: ["Accessing banking apps", "Using HTTPS websites", "Updating your antivirus", "Disabling auto-connect"],
    answer: "Accessing banking apps",
    topic: "Public Wi-Fi Safety",
  },

  // Phishing
  {
    question: "Which of the following is a common sign of a phishing email?",
    options: ["Personalized greeting", "Misspellings and urgent tone", "Email from known address", "Contains only text"],
    answer: "Misspellings and urgent tone",
    topic: "Phishing",
  },
  {
    question: "What should you do if you suspect an email is phishing?",
    options: ["Reply to confirm details", "Click the link to check", "Report it as spam", "Ignore and keep it"],
    answer: "Report it as spam",
    topic: "Phishing",
  },
  {
    question: "Which action is most likely to protect you from phishing attacks?",
    options: ["Clicking unfamiliar links", "Ignoring email subjects", "Enabling multi-factor authentication", "Using common passwords"],
    answer: "Enabling multi-factor authentication",
    topic: "Phishing",
  },

  // Secure Browsing
  {
    question: "Which of these indicates a secure website?",
    options: ["HTTP in the URL", "HTTPS and a lock icon", "No address bar", "Red background"],
    answer: "HTTPS and a lock icon",
    topic: "Secure Browsing",
  },
  {
    question: "Why is it important to log out of websites on public computers?",
    options: ["Saves time", "Prevents unauthorized access", "Boosts computer speed", "Improves internet connection"],
    answer: "Prevents unauthorized access",
    topic: "Secure Browsing",
  },
  {
    question: "What should you do if your browser warns you about a suspicious website?",
    options: ["Ignore the warning", "Close the browser", "Proceed with caution", "Leave the site immediately"],
    answer: "Leave the site immediately",
    topic: "Secure Browsing",
  },

  // Authentication and Access Control
  {
    question: "What does multi-factor authentication (MFA) provide?",
    options: ["Improved battery life", "Stronger account security", "Faster access", "Reduced security"],
    answer: "Stronger account security",
    topic: "Authentication and Access Control",
  },
  {
    question: "Which is considered a weak password?",
    options: ["123456", "Pass@123", "SecureKey!45", "MyDog@Home4"],
    answer: "123456",
    topic: "Authentication and Access Control",
  },
  {
    question: "What should you do if you think someone has accessed your account without permission?",
    options: ["Ignore it", "Change your password immediately", "Delete the account", "Report it to friends"],
    answer: "Change your password immediately",
    topic: "Authentication and Access Control",
  },

  // Device Security and Encryption
  {
    question: "Why is it important to enable encryption on your device?",
    options: ["Improves device speed", "Prevents unauthorized access to data", "Saves battery life", "Increases storage"],
    answer: "Prevents unauthorized access to data",
    topic: "Device Security and Encryption",
  },
  {
    question: "What is a common way to protect mobile devices from theft?",
    options: ["Leaving it unlocked", "Enabling screen lock", "Sharing password", "Turning off GPS"],
    answer: "Enabling screen lock",
    topic: "Device Security and Encryption",
  },
  {
    question: "What should you do before disposing of an old device?",
    options: ["Clear storage", "Reset to factory settings", "Delete a few files", "Nothing"],
    answer: "Reset to factory settings",
    topic: "Device Security and Encryption",
  },

  // Data Privacy
  {
    question: "What information should you avoid sharing on social media?",
    options: ["Vacation plans", "Favorite movie", "Public news", "Hobby"],
    answer: "Vacation plans",
    topic: "Data Privacy",
  },
  {
    question: "Which is an example of personal data you should protect?",
    options: ["Name of favorite pet", "Credit card details", "Favorite color", "Nickname"],
    answer: "Credit card details",
    topic: "Data Privacy",
  },
  {
    question: "What is a safe way to store sensitive data?",
    options: ["Cloud storage without encryption", "Encrypted storage", "On a sticky note", "Shared with friends"],
    answer: "Encrypted storage",
    topic: "Data Privacy",
  },
];

type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export default function QuestionnaireScreen() {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [score, setScore] = useState<number | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [storedResults, setStoredResults] = useState<any>(null);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cybersecurity Questionnaire</Text>

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
          {storedResults.topicDetails && (
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
    backgroundColor: '#228be6',
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
});
  