// 경로: frontend-app/components/Header.tsx
// 설명: WalkCare 앱의 상단 헤더 컴포넌트로, 로고와 로그인/로그아웃 버튼을 포함
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { removeAccessToken } from "@/utils/TokenStorage";

// WalkCare 앱의 상단 헤더 컴포넌트
export default function Header() {
  const navigation = useNavigation();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  console.log("isLoggedIn", isLoggedIn);
  const handleLogin = () => {
    navigation.navigate("FitbitAuth");
  };

  const handleLogout = async () => {
    await removeAccessToken();
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.header}>
      <Image
        source={require("@/assets/images/walkcare-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>WalkCare</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={isLoggedIn ? handleLogout : handleLogin}
      >
        <Text style={styles.loginText}>
          {isLoggedIn ? "로그아웃" : "로그인"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  loginText: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: "bold",
  },
});
