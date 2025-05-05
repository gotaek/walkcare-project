import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";

export default function RecommendationScreen() {
  const [time, setTime] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleRecommend = () => {
    if (!time) {
      Alert.alert("시간 선택", "산책 시간을 먼저 선택하세요!");
      return;
    }

    // 더미 추천 결과
    const random = Math.random();
    if (random > 0.5) {
      setResult(`✅ ${time}분 산책 장소를를 추천드립니다!`);
    } else {
      setResult(`🚫 오늘은 실내 운동이 더 좋아 보여요.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏱ 원하는 산책 시간을 선택하세요</Text>

      <View style={styles.timeOptions}>
        {[10, 20, 30, 40, 50, 60].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.optionButton,
              time === t && styles.optionButtonSelected,
            ]}
            onPress={() => setTime(t)}
          >
            <Text
              style={time === t ? styles.optionTextSelected : styles.optionText}
            >
              {t}분
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {result && <Text style={styles.resultText}>{result}</Text>}

      <TouchableOpacity
        style={styles.recommendButton}
        onPress={handleRecommend}
      >
        <Text style={styles.recommendText}>추천 받기</Text>
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = "#014f72";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 24,
    textAlign: "center",
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    margin: 6,
    minWidth: 90,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: PRIMARY,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 16,
    textAlign: "center",
    color: PRIMARY,
    marginBottom: 20,
    fontWeight: "500",
  },
  recommendButton: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  recommendText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
