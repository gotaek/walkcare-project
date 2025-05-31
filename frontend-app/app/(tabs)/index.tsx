import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { getAccessToken } from "@/utils/TokenStorage";
import { AuthContext } from "@/context/AuthContext";

export default function HomeScreen() {
  const [pm25, setPm25] = useState<number | null>(null);
  const [pm10, setPm10] = useState<number | null>(null);

  const [profile, setProfile] = useState<{ fullName: string } | null>(null);
  const [activity, setActivity] = useState<{
    steps: number;
    caloriesOut: number;
  } | null>(null);

  const [loadingPM, setLoadingPM] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { isLoggedIn } = useContext(AuthContext);

  const getPMCardBorderColor = (pm10: number | null) => {
    if (pm10 === null) return "#d0e7ff";
    if (pm10 <= 30) return "#5cb85c";
    if (pm10 <= 80) return "#f0ad4e";
    if (pm10 <= 150) return "#f86712";
    return "#d9534f";
  };

  const fetchPM = useCallback(async () => {
    setLoadingPM(true);
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
      setLoadingPM(false);
    }
  }, []);

  const fetchFitbitData = useCallback(async (token: string) => {
    try {
      console.log("🟢 fetchFitbitData 진입");
      console.log("🔐 access_token:", token);

      const profileUrl =
        "https://ite64nurad.execute-api.ap-northeast-2.amazonaws.com/fitbitProfile";
      const activityUrl =
        "https://6st6a9j910.execute-api.ap-northeast-2.amazonaws.com/fitbitActivity";

      console.log("📤 profile 요청:", profileUrl);
      console.log("📤 activity 요청:", activityUrl);

      const [profileRes, activityRes] = await Promise.all([
        fetch(profileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(activityUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error("❌ 프로필 응답 실패:", profileRes.status, errorText);
        return;
      } else {
        console.log("✅ 프로필 응답 성공:", profileRes.status);
      }

      const profileData = await profileRes.json();
      console.log("📥 프로필 데이터:", profileData);

      if (!activityRes.ok) {
        const errorText = await activityRes.text();
        console.error("❌ 활동 응답 실패:", activityRes.status, errorText);
        return;
      } else {
        console.log("✅ 활동 응답 성공:", activityRes.status);
      }

      const activityData = await activityRes.json();
      console.log("📥 활동 데이터:", activityData);

      setProfile(profileData);
      setActivity(activityData);
    } catch (error) {
      console.error("❌ Fitbit 데이터 요청 실패 (전체):", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = await getAccessToken();
      setAccessToken(token);

      fetchPM();

      if (token) {
        await fetchFitbitData(token);
      } else {
        // 로그아웃 상태면 상태 초기화
        setProfile(null);
        setActivity(null);
      }

      setCheckingToken(false);
    };

    init();
  }, [isLoggedIn]); // ✅ 로그인 상태가 바뀌면 자동 실행

  if (checkingToken) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        {isLoggedIn && profile
          ? `안녕하세요, ${profile.fullName}님 👋`
          : "안녕하세요 👋"}
      </Text>
      <Text style={styles.title}>WalkCare에 오신 걸 환영합니다</Text>

      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>오늘의 건강 요약</Text>
        {isLoggedIn ? (
          activity ? (
            <>
              <Text style={styles.healthText}>
                👟 걸음 수: {activity.steps.toLocaleString()}보
              </Text>
              <Text style={styles.healthText}>
                🔥 칼로리 소모량: {activity.caloriesOut} kcal
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => fetchFitbitData(accessToken!)}
              >
                <Text style={styles.refreshText}>건강 데이터 새로고침</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.healthText}>건강 데이터 로딩 중...</Text>
          )
        ) : (
          <Text style={styles.healthText}>로그인이 필요합니다.</Text>
        )}
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
        {loadingPM ? (
          <ActivityIndicator size="small" color="#888" />
        ) : (
          <>
            <Text style={styles.pmText}>
              😷 미세먼지 농도:{" "}
              {pm10 !== null ? `${pm10} ㎍/㎥` : "데이터 없음"}
            </Text>
            <Text style={styles.pmText}>
              😶‍🌫️ 초미세먼지 농도:{" "}
              {pm25 !== null ? `${pm25} ㎍/㎥` : "데이터 없음"}
            </Text>
          </>
        )}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchPM}>
          <Text style={styles.refreshText}>새로고침</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  healthText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
    color: "#0077cc",
  },
  pmText: {
    fontSize: 18,
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
