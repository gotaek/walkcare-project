// 📁 app/(tabs)/review/Write.tsx
// 산책을 마친 후, 사용자가 별점과 후기를 입력할 수 있는 리뷰 작성 화면입니다

import { useLocalSearchParams, useRouter } from "expo-router"; // ✅ URL 파라미터, 라우팅 처리
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "@/constants/Colors";
// ✅ 환경변수에서 API 주소를 불러옵니다 (.env → app.config.ts를 통해 주입됨)
const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

export default function ReviewWrite() {
  const { courseName, endedAt } = useLocalSearchParams();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // 📤 서버로 리뷰 제출 처리
  const handleSubmit = async () => {
    if (!courseName || !endedAt || !rating) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/reviews`, {
        course_name: courseName,
        ended_at: endedAt,
        rating,
        comment,
      });

      alert("리뷰가 저장되었습니다.");
      router.replace("/"); // 홈으로 돌아가기
    } catch (error) {
      console.error("리뷰 저장 실패:", error);
      alert("리뷰 저장 중 오류가 발생했습니다.");
    }
  };
  // 🎨 스타일 정의
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
  container: { flex: 1, padding: 24, backgroundColor: SECONDARY_COLOR },
  title: { fontSize: 24, fontWeight: "bold", color: PRIMARY_COLOR },
  label: { marginTop: 20, fontSize: 16 },
  stars: { flexDirection: "row", marginVertical: 10 },
  star: { fontSize: 32, color: "#ccc", marginRight: 8 },
  starSelected: { color: "#FFD700" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
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
  buttonText: { color: SECONDARY_COLOR, fontWeight: "bold" },
});
