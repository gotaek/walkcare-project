// 📁 components/Header.tsx
import { View, Text, Image, StyleSheet } from "react-native";
import { PRIMARY_COLOR } from "@/constants/Colors";

export default function Header() {
  return (
    <View style={styles.header}>
      <Image
        source={require("@/assets/images/walkcare-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>WalkCare</Text>
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
  },
});
