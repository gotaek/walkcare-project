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
  const userId = 1;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://192.168.0.4:3000/history", {
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

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://192.168.0.4:3000/history/${id}`);
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
            <Text>{item.created_at}</Text>
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

const PRIMARY = "#014f72";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: PRIMARY },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f9fd",
    marginBottom: 16,
  },
  name: { fontSize: 16, fontWeight: "bold", color: PRIMARY },
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
