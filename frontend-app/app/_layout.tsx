// app/_layout.tsx
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
