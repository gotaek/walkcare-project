import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#014f72",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#ffffff",
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
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="Recommendation" options={{ headerShown: false }} />
      <Tabs.Screen name="History" options={{ headerShown: false }} />
    </Tabs>
  );
}
