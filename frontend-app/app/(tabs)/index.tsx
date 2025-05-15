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
import { setUserId, getUserId } from "@/utils/GlobalState";

export default function HomeScreen() {
  const [pm25, setPm25] = useState<number | null>(null);
  const [pm10, setPm10] = useState<number | null>(null);

  const [profile, setProfile] = useState<{ fullName: string } | null>(null);
  const [activity, setActivity] = useState<{
    steps: number;
    caloriesOut: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const getPMCardBorderColor = (pm10: number | null) => {
    if (pm10 === null) return "#d0e7ff";
    if (pm10 <= 30) return "#5cb85c";
    if (pm10 <= 80) return "#f0ad4e";
    if (pm10 <= 150) return "#f27c38";
    return "#d9534f";
  };

  const user_id = "CLYLD9";
  const fetchPM = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://nm3aawl64m.execute-api.ap-northeast-2.amazonaws.com/default/getSensorData?sensor_id=mock-pm-sensor"
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPm25(data[0].pm2_5);
        setPm10(data[0].pm10);
      }
    } catch (error) {
      console.error("미세먼지 데이터 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFitbitData = useCallback(async () => {
    if (user_id !== "CLYLD9") return;

    console.log("🧪 userId is CLYLD9 → API 호출 시도");

    try {
      const [profileRes, activityRes] = await Promise.all([
        fetch(
          `https://8865-221-146-169-164.ngrok-free.app/fitbit/profile/${user_id}`
        ),
        fetch(
          `https://8865-221-146-169-164.ngrok-free.app/fitbit/activity/${user_id}`
        ),
      ]);

      const profileData = await profileRes.json();
      const activityData = await activityRes.json();

      setProfile(profileData);
      setActivity(activityData);
    } catch (error) {
      console.error("❌ Fitbit 데이터 가져오기 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchPM();
    // CLYLD9 하드코딩된 유저만 활동 정보 불러오기
    if (user_id === "CLYLD9") {
      fetchFitbitData();
    }
  }, [fetchPM, fetchFitbitData]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        안녕하세요, {profile ? `${profile.fullName}님 👋` : "👋"}
      </Text>
      <Text style={styles.title}>WalkCare에 오신 걸 환영합니다</Text>

      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>오늘의 건강 요약</Text>
        <Text style={styles.healthText}>
          👟 걸음 수:{" "}
          {activity ? `${activity.steps.toLocaleString()}보` : "로딩 중..."}
        </Text>
        <Text style={styles.healthText}>
          🔥 칼로리 소모:{" "}
          {activity ? `${activity.caloriesOut} kcal` : "로딩 중..."}
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchFitbitData}
        >
          <Text style={styles.refreshText}>건강 데이터 새로고침</Text>
        </TouchableOpacity>
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
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ffffff",
  },
  welcome: {
    fontSize: 20,
    marginTop: 40,
    marginBottom: 8,
    color: "#333",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },

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
  healthText: {
    fontSize: 16,
    marginBottom: 4,
    color: "#555",
  },
  pmText: {
    fontSize: 16,
    color: "#0077cc",
  },

  refreshButton: {
    backgroundColor: "#0077cc",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  refreshText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  recommendButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
