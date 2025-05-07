// 📁 app/(tabs)/_layout.tsx
// 하단 탭(Tab Navigator) + 공통 상단 헤더 구성

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet } from "react-native";
import { PRIMARY_COLOR } from "@/constants/Colors";
import Header from "@/components/Header"; // 공통 헤더

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      {/* ✅ 모든 탭 위에 고정되는 공통 헤더 */}
      <Header />

      {/* ✅ 하단 탭 */}
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#fff",
            height: 70,
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            paddingBottom: 10,
          },
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
          tabBarIcon: ({ focused, color }) => {
            let iconName = "";
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
            return <Ionicons name={iconName as any} size={24} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ headerShown: false }} />
        <Tabs.Screen name="Recommendation" options={{ headerShown: false }} />
        <Tabs.Screen name="History" options={{ headerShown: false }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
