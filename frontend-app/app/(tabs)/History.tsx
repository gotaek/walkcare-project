// 📁 app/(tabs)/History.tsx
// 사용자의 산책 히스토리를 불러오고 삭제할 수 있는 화면입니다.
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants"; // ✅ 환경변수 불러오기
import { PRIMARY_COLOR, SECONDARY_COLOR } from "@/constants/Colors";
import dayjs from "dayjs";

// ✅ 환경변수에서 API 주소를 불러옵니다 (.env → app.config.ts를 통해 주입됨)
const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

// 🔹 산책 기록 하나의 타입을 정의합니다 (타입스크립트용)
interface HistoryItem {
  id: number;
  course_name: string;
  date: string;
  time_slot: string;
  feedback_rating: number;
  feedback_comment: string;
  created_at: string;
}

export default function HistoryScreen() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 1; // const userId = 1; // TODO: 실제 사용자 ID로 변경 필요

  // ✅ 화면이 처음 렌더링될 때 실행: 서버에서 산책 기록을 가져옵니다
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/history`, {
          params: { user_id: userId },
        });
        if (Array.isArray(res.data.history)) {
          setData(res.data.history);
        } else {
          console.error("예상치 못한 응답 형식:", res.data);
        }
      } catch (err) {
        console.error("히스토리 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ✅ 사용자가 휴지통 아이콘을 눌렀을 때 실행되는 삭제 함수
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/history/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Alert.alert("삭제 실패", "기록을 삭제할 수 없습니다.");
      console.error("삭제 실패:", err);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 내 산책 기록</Text>

      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>
                📍 {item.course_name || "코스명 없음"}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text>{dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}</Text>
            {item.feedback_rating > 0 && (
              <Text style={styles.stars}>
                {"★".repeat(item.feedback_rating)}
                {"☆".repeat(5 - item.feedback_rating)}
              </Text>
            )}
            {item.feedback_comment && (
              <Text style={styles.comment}>💬 {item.feedback_comment}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

// 🎨 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: PRIMARY_COLOR,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: SECONDARY_COLOR,
    marginBottom: 16,
  },
  name: { fontSize: 16, fontWeight: "bold", color: PRIMARY_COLOR },
  stars: { marginTop: 8, fontSize: 18, color: "#FFD700" },
  comment: { marginTop: 8, fontStyle: "italic", color: "#333" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  delete: {
    fontSize: 18,
    color: "red",
  },
});
