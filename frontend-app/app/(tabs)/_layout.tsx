// 📁 app/(tabs)/_layout.tsx or TabsLayout.tsx
// 하단 탭(Tab Navigator) 구성 및 각 탭 아이콘/텍스트 설정

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "@/constants/Colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        // 🔹 탭 색상 및 스타일 지정
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: " #fff",
          height: 70,
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingBottom: 10,
        },
        // 🔹 탭 라벨 (한글 이름 커스텀)
        tabBarLabel: ({ focused, color }) => {
          let label = "";
          switch (route.name) {
            case "index":
              label = "홈";
              break;
            case "Recommendation":
              label = "추천";
              break;
            case "History":
              label = "기록";
              break;
          }
          return (
            <Text
              style={{
                fontSize: 22,
                marginTop: 5,
                color,
                fontWeight: focused ? "bold" : "normal",
              }}
            >
              {label}
            </Text>
          );
        },
        // 🔹 탭 아이콘 (Ionicons 사용)
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = "";
          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Recommendation":
              iconName = focused ? "location" : "location-outline";
              break;
            case "History":
              iconName = focused ? "time" : "time-outline";
              break;
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      {/* 🔹 각 탭에 해당하는 스크린 연결 */}
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="Recommendation" options={{ headerShown: false }} />
      <Tabs.Screen name="History" options={{ headerShown: false }} />
    </Tabs>
  );
}
