// 경로: frontend-app/app/review/write.tsx
// 설명:리뷰 작성 화면을 구성하는 컴포넌트로, 사용자가 산책 후 리뷰를 작성할 수 있는 기능을 제공
// 추가: Fitbit 활동 요약 (걸음수, 칼로리, 평균 심박수)도 함께 서버로 전송

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { getAccessToken } from "@/utils/TokenStorage";

export default function ReviewWrite() {
  const { courseName, endedAt } = useLocalSearchParams(); // URL 쿼리 파라미터 추출
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [activity, setActivity] = useState({
    // Fitbit 활동 데이터
    steps: 0,
    caloriesOut: 0,
    heartRate: 0,
  });

  // Fitbit 활동 요약 데이터 가져오기
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          console.warn("❌ access token 없음 - 로그인 필요");
          return;
        }

        const res = await axios.get(
          `https://cg5kxlgo7k.execute-api.ap-northeast-2.amazonaws.com/fitbit/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setActivity({
          steps: res.data.steps,
          caloriesOut: res.data.caloriesOut,
          heartRate: res.data.heartRateAvg,
        });
      } catch (err) {
        console.error("활동 정보 로딩 실패:", err);
      }
    };

    fetchSummary();
  }, []);

  // 리뷰 제출 핸들러
  const handleSubmit = async () => {
    if (!courseName || !endedAt || !rating) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      await axios.post(
        `https://t6fqav840h.execute-api.ap-northeast-2.amazonaws.com/review`,
        {
          user_id: "CLYLD9",
          course_name: courseName,
          ended_at: endedAt,
          rating,
          comment,
          total_steps: activity.steps,
          total_calories: activity.caloriesOut,
          total_heart_rate: activity.heartRate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("리뷰가 저장되었습니다.");
      router.replace("/History");
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      alert("리뷰 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 리뷰 작성</Text>
      <Text style={styles.label}>📍 {courseName}</Text>
      <Text style={styles.label}>⏱ {endedAt}</Text>

      <Text style={styles.label}>⭐ 만족도</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)}>
            <Text style={[styles.star, rating >= n && styles.starSelected]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="리뷰를 작성하세요"
        multiline
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>저장하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#ffffff" },
  title: { fontSize: 24, fontWeight: "bold", color: PRIMARY_COLOR },
  label: { marginTop: 20, fontSize: 16 },
  stars: { flexDirection: "row", marginVertical: 10 },
  star: { fontSize: 32, color: "#ccc", marginRight: 8 },
  starSelected: { color: "#FFD700" },
  input: {
    borderWidth: 1,
    borderColor: "#f1f1f1",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginTop: 8,
  },
  button: {
    marginTop: 30,
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "bold" },
});
