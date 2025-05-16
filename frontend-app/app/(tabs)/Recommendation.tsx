// 파일: app/(tabs)/Recommendation.tsx
// 사용자가 산책 시간을 선택하면 위치 기반으로 산책 코스를 추천해주고,
// 산책 타이머까지 제공하는 주요 기능 화면입니다.

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Modal,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import dayjs from "dayjs";
import axios from "axios";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "@/constants/Colors";

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface Course {
  name: string;
  distance: number;
  address: string;
  url: string;
  x: number;
  y: number;
}

export default function RecommendationScreen() {
  const [time, setTime] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isWalking, setIsWalking] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [bestTimes, setBestTimes] = useState<any[]>([]);
  const [todayWeather, setTodayWeather] = useState<any | null>(null);

  const router = useRouter();

  const handleRecommend = async () => {
    if (!time) {
      Alert.alert("시간 선택", "산책 시간을 먼저 선택하세요!");
      return;
    }

    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 거부", "위치 접근 권한이 필요합니다.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.get(`${BASE_URL}/recommendation`, {
        params: { lat: latitude, lon: longitude, time },
      });

      const data = res.data;
      if (!data || !data.recommendation) {
        setResult("추천 결과가 없습니다.");
        setCourses([]);
        return;
      }

      setResult(`${data.recommendation} (${data.estimated_time})`);
      setCourses(data.courses || []);
      setBestTimes(data.best_times || []);
      setTodayWeather(data.weather_today || null);
    } catch (err) {
      console.error("추천 요청 실패:", err);
      Alert.alert("오류", "서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWalk = (course: Course) => {
    if (!time) return;
    setSelectedCourse(course);
    setTimeLeft(time * 60);
    setIsWalking(true);
  };

  const handleStopWalk = () => {
    if (!selectedCourse) return;
    const endedAt = dayjs().format("YYYY-MM-DD HH:mm");

    router.push({
      pathname: "/review/write",
      params: {
        courseName: selectedCourse.name,
        endedAt,
      },
    });

    setIsWalking(false);
    setSelectedCourse(null);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (!isWalking || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleStopWalk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWalking, timeLeft]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
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
                  style={
                    time === t ? styles.optionTextSelected : styles.optionText
                  }
                >
                  {t}분
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.recommendButton}
            onPress={handleRecommend}
            disabled={loading}
          >
            <Text style={styles.recommendText}>
              {loading ? "요청 중..." : "추천 받기"}
            </Text>
          </TouchableOpacity>

          {result && <Text style={styles.resultText}>{result}</Text>}
          {todayWeather && (
            <View style={{ alignItems: "center", marginTop: 10 }}>
              {bestTimes.length === 0 ? (
                <>
                  <Text style={styles.subText}>
                    오늘과 내일은 산책하기 좋은 시간이 없어요 😢
                  </Text>
                  <Text style={styles.subText}>
                    실내에서 스트레칭이나 가벼운 활동을 추천드려요 🧘
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.subText}>
                    ✅ 산책하기 좋은 시간대를 추천드릴게요!
                  </Text>

                  {bestTimes.map((t, i) => (
                    <View key={i} style={styles.walkTimeCard}>
                      <View style={styles.walkTimeRow}>
                        <Text style={styles.walkTimeLabel}>🕒 시간</Text>
                        <Text style={styles.walkTimeValue}>{t.time}</Text>
                      </View>
                      <View style={styles.walkTimeRow}>
                        <Text style={styles.walkTimeLabel}>🌡️ 온도</Text>
                        <Text style={styles.walkTimeValue}>{t.temp}°C</Text>
                      </View>
                      <View style={styles.walkTimeRow}>
                        <Text style={styles.walkTimeLabel}>☀️ 자외선</Text>
                        <Text style={styles.walkTimeValue}>UVI {t.uvi}</Text>
                      </View>
                      <View style={styles.walkTimeRow}>
                        <Text style={styles.walkTimeLabel}>☔ 강수확률</Text>
                        <Text style={styles.walkTimeValue}>{t.pop}%</Text>
                      </View>
                      <View style={styles.walkTimeRow}>
                        <Text style={styles.walkTimeLabel}>🌤️ 요약</Text>
                        <Text style={styles.walkTimeValue}>{t.summary}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text style={styles.subText}>현재 날씨:</Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${todayWeather.icon}@2x.png`,
                  }}
                  style={{ width: 40, height: 40, marginLeft: 8 }}
                />
                <Text style={styles.subText}>{todayWeather.main}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.courseList}>
          {courses.map((c, idx) => (
            <View key={idx} style={styles.courseCard}>
              <Text style={styles.courseName}>📍 {c.name}</Text>
              <Text style={styles.courseAddress}>{c.address}</Text>
              <Text style={styles.courseDistance}>거리: {c.distance}m</Text>
              <Text
                style={styles.courseLink}
                onPress={() => Linking.openURL(c.url)}
              >
                👉 장소 정보 보기
              </Text>
              <TouchableOpacity
                style={styles.walkButton}
                onPress={() => handleStartWalk(c)}
              >
                <Text style={styles.walkButtonText}>산책 시작</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Modal visible={isWalking} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                🚶 산책 중: {selectedCourse?.name}
              </Text>
              <Text style={styles.timerText}>
                남은 시간: {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초
              </Text>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopWalk}
              >
                <Text style={styles.stopButtonText}>산책 종료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  topSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginBottom: 24,
    textAlign: "center",
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
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
    backgroundColor: PRIMARY_COLOR,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    fontSize: 16,
    color: "#f1f1f1",
    fontWeight: "bold",
  },
  recommendButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  recommendText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    marginVertical: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  subText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#203A43",
    marginTop: 4,
    textAlign: "center",
  },
  /** 🆕 산책 추천 카드 */
  walkTimeCard: {
    backgroundColor: "#fefefe",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  walkTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  walkTimeLabel: {
    fontWeight: "900",
    marginRight: 6,
    color: PRIMARY_COLOR,
  },
  walkTimeValue: {
    fontSize: 14,
    color: "#444",
  },
  courseList: {
    paddingBottom: 200,
    width: "100%",
  },
  courseCard: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  courseAddress: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  courseDistance: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  courseLink: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 8,
  },
  walkButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  walkButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#f1f1f1",
    padding: 28,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: PRIMARY_COLOR,
  },
  stopButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  stopButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
