import { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "@/constants/Colors";
import dayjs from "dayjs";
import { getAccessToken } from "@/utils/TokenStorage";
import { AuthContext } from "@/context/AuthContext";
import { LineChart } from "react-native-chart-kit";

const BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

interface HistoryItem {
  walk_id: string;
  course_name: string;
  start_time: string;
  end_time: string;
  rating: number;
  comment: string;
  created_at: string;
  total_steps?: number;
  total_calories?: number;
  total_heart_rate?: number | null;
}

export default function HistoryScreen() {
  const { isLoggedIn } = useContext(AuthContext);
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const token = await getAccessToken();
      setAccessToken(token);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data.history)) {
          setData(res.data.history);
        }
      } catch (err) {
        console.error("히스토리 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isLoggedIn]);

  const handleDelete = useCallback(async (walk_id: string) => {
    try {
      await axios.delete(`${BASE_URL}/history/${walk_id}`);
      setData((prev) => prev.filter((item) => item.walk_id !== walk_id));
    } catch (err) {
      Alert.alert("삭제 실패", "기록을 삭제할 수 없습니다.");
      console.error("삭제 실패:", err);
    }
  }, []);

  const renderCaloriesChart = useCallback(() => {
    // 오늘 날짜로 필터링 (2025-05-16)
    const today = dayjs().format("YYYY-MM-DD");
    const todayData = data.filter((item) =>
      dayjs(item.end_time).isSame(today, "day")
    );

    if (todayData.length === 0) {
      return (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>📊 오늘의 칼로리 소모량</Text>
          <Text style={styles.noDataText}>오늘의 산책 기록이 없습니다.</Text>
        </View>
      );
    }

    // 시간대별 최대 칼로리 데이터 준비
    const timeSlots: { [key: string]: number } = {};
    todayData.forEach((item) => {
      if (item.total_calories) {
        const time = dayjs(item.end_time).format("HH:00");
        timeSlots[time] = Math.max(timeSlots[time] || 0, item.total_calories);
      }
    });

    // 시간대 정렬 및 차트 데이터 생성
    const sortedTimes = Object.keys(timeSlots).sort();
    const labels = sortedTimes.length > 0 ? sortedTimes : ["00:00"];
    const caloriesData =
      sortedTimes.length > 0 ? sortedTimes.map((time) => timeSlots[time]) : [0];

    // Y축 최댓값 설정
    const yAxisMax = Math.max(...caloriesData, 1);

    return (
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>📊 오늘의 칼로리 소모량</Text>
        <LineChart
          data={{
            labels, // 예: ["월", "화", "수", "목", "금"]
            datasets: [{ data: caloriesData }],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          fromZero
          withInnerLines
          withOuterLines={false}
          bezier
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // 선 색상
            labelColor: () => "#333", // Y축 라벨 컬러 명시
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#007AFF",
              fill: "#ffffff", // 흰색 점
            },
            propsForBackgroundLines: {
              stroke: "#e0e0e0",
            },
          }}
          style={{
            borderRadius: 12,
            marginVertical: 16,
          }}
        />
      </View>
    );
  }, [data]);

  const renderHeader = useCallback(
    () => (
      <View>
        <Text style={styles.title}>📖 내 산책 기록</Text>
        {renderCaloriesChart()}
        <Text style={styles.notice}>
          💡 안정 심박수는 Fitbit 기기를 충분히 착용 시 측정됩니다.
        </Text>
      </View>
    ),
    [renderCaloriesChart]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>
            📍 {item.course_name || "코스명 없음"}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.walk_id)}>
            <Text style={styles.delete}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>
          {dayjs(item.start_time).format("YYYY.MM.DD")}{" "}
          <Text style={styles.time}>
            {dayjs(item.end_time).format("HH:mm")} 까지의 기록
          </Text>
        </Text>

        {item.rating > 0 && (
          <Text style={styles.stars}>
            {"★".repeat(item.rating)}
            {"☆".repeat(5 - item.rating)}
          </Text>
        )}

        {item.total_steps ? (
          <Text style={styles.metrics}>
            👟 걸음 수: {item.total_steps.toLocaleString()} 보
          </Text>
        ) : null}

        {item.total_calories ? (
          <Text style={styles.metrics}>
            🔥 칼로리 소모량: {item.total_calories} kcal
          </Text>
        ) : null}

        {item.total_heart_rate !== null ? (
          <Text style={styles.metrics}>
            💓 안정 심박수: {item.total_heart_rate} bpm
          </Text>
        ) : null}

        {item.comment ? (
          <Text style={styles.comment}>💬 기록: {item.comment}</Text>
        ) : null}
      </View>
    ),
    [handleDelete]
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;

  if (!accessToken) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#888" }}>
          로그인이 필요합니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.walk_id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: PRIMARY_COLOR,
  },
  notice: {
    marginTop: 6,
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },
  chartBox: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#fff", // 배경을 흰색으로 변경
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center", // 그래프를 가운데 정렬하기 위해 추가
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    backgroundColor: "#fff",
  },
  noDataText: {
    marginTop: 10,
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  card: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: SECONDARY_COLOR,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: "600", color: PRIMARY_COLOR },
  stars: { marginTop: 10, fontSize: 18, color: "#FFD700" },
  comment: {
    marginTop: 10,
    fontSize: 15,
    fontStyle: "italic",
    color: "#333",
  },
  date: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  time: {
    fontSize: 15,
    fontWeight: "400",
    color: "#555",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  delete: {
    fontSize: 18,
    color: "red",
  },
  metrics: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
