// 경로: backend/routes/_layout.tsx
// 설명: Expo Router를 사용하여 인증 컨텍스트를 제공하는 레이아웃 파일
import { Slot } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { AuthProvider } from "@/context/AuthContext";

export default function LayoutWithProvider() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <Slot />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
