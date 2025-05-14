// 📁 app/(tabs)/index.tsx
// 앱의 메인 홈 화면. 사용자에게 환영 인사와 주요 기능으로 이동할 수 있는 버튼을 제공합니다.

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { PRIMARY_COLOR } from "@/constants/Colors";

export default function HomeScreen() {
  const [pm25, setPm25] = useState<number | null>(null);
  const [pm10, setPm10] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 테두리 색상만 결정 (배경색 유지)
  const getPMCardBorderColor = (pm10: number | null) => {
    if (pm10 === null) return "#d0e7ff"; // 기본 테두리
    if (pm10 <= 30) return "#5cb85c"; // 초록
    if (pm10 <= 80) return "#f0ad4e"; // 노랑/주황
    if (pm10 <= 150) return "#f27c38"; // 진한 주황
    return "#d9534f"; // 빨강
  };

  const fetchPM = useCallback(async () => {
    setLoading(true); // 새로고침 시 로딩 상태로 설정
    try {
      const res = await fetch(
        "https://nm3aawl64m.execute-api.ap-northeast-2.amazonaws.com/default/getSensorData?sensor_id=mock-pm-sensor"
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPm25(data[0].pm2_5); // 가장 최근 값
        setPm10(data[0].pm10); // 가장 최근 값
      }
    } catch (error) {
      console.error("미세먼지 데이터 가져오기 실패:", error);
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  }, []);

  useEffect(() => {
    fetchPM(); // 컴포넌트가 처음 렌더링될 때 데이터 가져오기
  }, [fetchPM]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>안녕하세요, 👋</Text>
      <Text style={styles.title}>WalkCare에 오신 걸 환영합니다</Text>

      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>오늘의 건강 요약</Text>
        <Text style={styles.healthText}>걸음 수: 5,200보</Text>
        <Text style={styles.healthText}>심박수: 82bpm</Text>
      </View>

      <View
        style={[
          styles.pmCard,
          {
            borderColor: getPMCardBorderColor(pm10),
            borderWidth: 2,
          },
        ]}
      >
        <Text style={styles.cardTitle}>오늘의 미세먼지</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#888" />
        ) : (
          <>
            <Text style={styles.pmText}>
              미세먼지 농도: {pm10 !== null ? `${pm10} ㎍/㎥` : "데이터 없음"}
            </Text>
            <Text style={styles.pmText}>
              초미세먼지 농도: {pm25 !== null ? `${pm25} ㎍/㎥` : "데이터 없음"}
            </Text>
          </>
        )}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchPM}>
          <Text style={styles.refreshText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.recommendButton}
        onPress={() => router.push("/Recommendation")}
      >
        <Text style={styles.buttonText}>산책 추천 받기</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginBottom: 20,
  },
  pmCard: {
    backgroundColor: "#f1f8ff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d0e7ff",
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  healthText: { fontSize: 16, marginBottom: 4, color: "#555" },
  pmText: { fontSize: 16, color: "#0077cc" },

  refreshButton: {
    backgroundColor: "#0077cc",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  refreshText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  recommendButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
});
