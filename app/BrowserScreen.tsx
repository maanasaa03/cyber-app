import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import WebView from "react-native-webview";

const BrowserScreen = () => {
  const [url, setUrl] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [isBlocked, setIsBlocked] = useState(false); // Track if site is blocked
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [fullAnalysis, setFullAnalysis] = useState<string | null>(null);

  const BACKEND_URL = "http://10.123.123.205:5000";

  const handleGo = async () => {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;

    // 🔍 Check if website is blacklisted
    try {
      const response = await fetch(`${BACKEND_URL}/check-blacklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();
      if (data.blacklisted) {
        setIsBlocked(true);
        Alert.alert("Blocked", "This website is blacklisted and cannot be accessed.");
        return;
      }
    } catch (error) {
      console.error("Error checking blacklist:", error);
      Alert.alert("Error", "Could not check blacklist status.");
    }

    // ✅ Load the website if not blacklisted
    setFinalUrl(formattedUrl);
    setIsBlocked(false);
    analyzeWebsite(formattedUrl);
  };

  const analyzeWebsite = async (websiteUrl: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze website");
      }

      const { securityScore, summaryChecklist, detailedReport } = await response.json();
      setSecurityScore(securityScore);
      setChecklist(summaryChecklist || []);
      setFullAnalysis(detailedReport);

      Alert.alert(
        "🔍 Website Security Analysis",
        `🛡️ Security Score: ${securityScore}/100\n\n✅ Checklist:\n${(summaryChecklist || []).join("\n")}`,
        [
          { text: "OK" },
          {
            text: "Show Detailed Report",
            onPress: () =>
              Alert.alert("📋 Full Report", detailedReport || "No report available."),
          },
        ]
      );
    } catch (error) {
      console.error("Error analyzing website:", error);
      Alert.alert("Analysis Error", "Failed to analyze website. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter URL..."
          value={url}
          onChangeText={setUrl}
        />
        <TouchableOpacity style={styles.goButton} onPress={handleGo}>
          <Text style={styles.goButtonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* 🚫 Show Blocked Message if the Website is Blacklisted */}
      {isBlocked ? (
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedText}>🚫 This website is blacklisted and cannot be accessed.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => {setFinalUrl("");  // Reset the URL
          setIsBlocked(false);  // Ensure block state is reset
          }}>
  <Text style={styles.backButtonText}>Go Back</Text>
</TouchableOpacity>

        </View>
      ) : (
        finalUrl && <WebView source={{ uri: finalUrl }} style={styles.webView} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2", padding: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 10,
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 16 },
  goButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  goButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  webView: { flex: 1, marginTop: 10, borderRadius: 10, overflow: "hidden" },

  // 🚫 Styles for Blocked Message
  blockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    padding: 20,
    borderRadius: 10,
  },
  blockedText: { fontSize: 18, fontWeight: "bold", color: "#D9534F", textAlign: "center" },
  backButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default BrowserScreen;
