import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";

export default function ReviewWrite() {
  const { courseName, endedAt } = useLocalSearchParams();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!courseName || !endedAt || !rating) {
      alert("모든 항목을 입력해 주세요.");
      return;
    }

    try {
      await axios.post("http://192.168.0.4:3000/reviews", {
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

const PRIMARY = "#014f72";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: PRIMARY },
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
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
