// 📁 app/(tabs)/index.tsx
// 앱의 메인 홈 화면. 사용자에게 환영 인사와 주요 기능으로 이동할 수 있는 버튼을 제공합니다.

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router"; // ✅ 화면 이동을 위한 Expo Router 사용
import { PRIMARY_COLOR } from "@/constants/Colors";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>안녕하세요, 👋</Text>
      <Text style={styles.title}>WalkCare에 오신 걸 환영합니다</Text>

      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>오늘의 건강 요약</Text>
        <Text style={styles.healthText}>걸음 수: 5,200보</Text>
        <Text style={styles.healthText}>심박수: 82bpm</Text>
      </View>

      <TouchableOpacity
        style={styles.recommendButton}
        onPress={() => router.push("/Recommendation")}
      >
        <Text style={styles.buttonText}>산책 추천 받기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push("/History")}
      >
        <Text style={styles.historyText}>산책 기록 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🎨 화면 전체 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#ffffff" },
  welcome: { fontSize: 20, marginTop: 40, marginBottom: 8, color: "#333" },
  title: { fontSize: 25, fontWeight: "bold", marginBottom: 20, color: "#222" },
  healthCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  healthText: { fontSize: 16, marginBottom: 4, color: "#555" },

  recommendButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },

  historyButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  historyText: { color: "#333", fontSize: 16 },
});
