// 📁 app/screens/FitbitAuth.tsx
import { WebView } from "react-native-webview";
import { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { storeAccessToken } from "@/utils/TokenStorage";
import { AuthContext } from "@/context/AuthContext";
import { useNavigation } from "expo-router";

const CLIENT_ID = "23QB55";
const FITBIT_AUTH_URL = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QB55&redirect_uri=${encodeURIComponent(
  "https://d8qdx561m5.execute-api.ap-northeast-2.amazonaws.com/callback"
)}&scope=activity+heartrate+sleep+profile`;

export default function FitbitAuth() {
  const navigation = useNavigation();
  const { setIsLoggedIn } = useContext(AuthContext);

  // ✅ 서버에서 받은 postMessage(code) 수신
  const handleMessage = async (event: any) => {
    const code = event.nativeEvent.data;
    console.log("✅ Received OAuth code from WebView:", code);

    try {
      const res = await fetch(
        `https://qlvpoaklfb.execute-api.ap-northeast-2.amazonaws.com/exchange?code=${code}`
      );
      const data = await res.json();

      if (data.access_token) {
        await storeAccessToken(data.access_token);
        setIsLoggedIn(true);
        navigation.goBack();
      } else {
        console.error("❌ 서버 응답에 access_token 없음", data);
      }
    } catch (err) {
      console.error("❌ 로그인 실패", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: FITBIT_AUTH_URL }}
        onMessage={handleMessage} // ✅ 메시지 기반으로 변경
        javaScriptEnabled={true}
        originWhitelist={["*"]}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 100 }}
          />
        )}
      />
    </View>
  );
}
