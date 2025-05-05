import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const dummyData = [
  {
    id: "1",
    date: "2025-05-06",
    time_slot: "오후 6시",
    course_name: "뚝섬한강공원",
    recommended: true,
    feedback_rating: 4,
    feedback_comment: "선선해서 걷기 딱 좋았어요!",
  },
  {
    id: "2",
    date: "2025-05-05",
    time_slot: "오전 9시",
    course_name: "서울숲",
    recommended: true,
    feedback_rating: 5,
    feedback_comment: "아침 햇살이 좋아서 상쾌했어요.",
  },
  {
    id: "3",
    date: "2025-05-04",
    time_slot: "오후 2시",
    course_name: "양재천",
    recommended: false,
    feedback_rating: null,
    feedback_comment: null,
  },
];

const renderStars = (count: number) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? "star" : "star-outline"}
          size={18}
          color="#f4c430"
        />
      ))}
    </View>
  );
};

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 산책 기록</Text>

      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardDate}>
              {item.date} • {item.time_slot}
            </Text>
            <Text style={styles.cardCourse}>{item.course_name}</Text>
            <Text style={styles.cardRecommended}>
              {item.recommended ? "✅ 산책 권장됨" : "🚫 권장되지 않음"}
            </Text>

            {item.recommended && item.feedback_rating != null && (
              <View style={styles.starRow}>
                {renderStars(item.feedback_rating)}
              </View>
            )}
            {item.recommended && item.feedback_comment && (
              <Text style={styles.comment}>"{item.feedback_comment}"</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const PRIMARY = "#014f72";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f4f7fccd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  cardCourse: {
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY,
  },
  cardRecommended: {
    marginTop: 4,
    fontSize: 14,
    color: "#444",
  },
  starRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  comment: {
    marginTop: 6,
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
  },
});
