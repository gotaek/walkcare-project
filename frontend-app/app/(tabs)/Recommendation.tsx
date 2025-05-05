import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import axios from "axios";
import { useRouter } from "expo-router";

interface Course {
  name: string;
  distance: number;
  address: string;
  url: string;
  x: number;
  y: number;
}

const PRIMARY = "#014f72";

export default function RecommendationScreen() {
  const [time, setTime] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isWalking, setIsWalking] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

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

      const res = await axios.get("http://192.168.0.4:3000/recommendation", {
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
    const endedAt = new Date().toLocaleString();

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

      <ScrollView contentContainerStyle={styles.courseList}>
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
      </ScrollView>

      <TouchableOpacity
        style={styles.recommendButton}
        onPress={handleRecommend}
        disabled={loading}
      >
        <Text style={styles.recommendText}>
          {loading ? "요청 중..." : "추천 받기"}
        </Text>
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 100,
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
    color: PRIMARY,
    marginVertical: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  courseList: {
    paddingBottom: 200,
    width: "100%",
  },
  courseCard: {
    backgroundColor: "#f4f9fc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY,
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
    color: "#1e90ff",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  walkButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  walkButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY,
    marginTop: 20,
    marginBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: PRIMARY,
  },
  stopButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
