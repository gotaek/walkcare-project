// 📁 components/Header.tsx
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { PRIMARY_COLOR } from "@/constants/Colors";

const FITBIT_AUTH_URL =
  "https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QB55&redirect_uri=https://8865-221-146-169-164.ngrok-free.app%2Fcallback&scope=activity+heartrate+sleep+profile";

export default function Header() {
  const handleLogin = () => {
    Linking.openURL(FITBIT_AUTH_URL);
  };

  return (
    <View style={styles.header}>
      <Image
        source={require("@/assets/images/walkcare-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>WalkCare</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>로그인</Text>
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
