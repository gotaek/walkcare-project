import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { useState } from "react";
import * as Location from "expo-location";
import axios from "axios";

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

  const handleRecommend = async () => {
    if (!time) {
      Alert.alert("시간 선택", "산책 시간을 먼저 선택하세요!");
      return;
    }

    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 접근 거부", "위치 권한이 필요합니다.");
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
              👉 자세히 보기
            </Text>
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
    paddingBottom: 180,
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
