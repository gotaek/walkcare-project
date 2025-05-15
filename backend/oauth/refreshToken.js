// backend/oauth/refreshToken.js
const axios = require("axios");
const { getToken, setToken } = require("../utils/tokenManager");

const client_id = process.env.FITBIT_CLIENT_ID;
const client_secret = process.env.FITBIT_CLIENT_SECRET;
const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString(
  "base64"
);

// ⚙️ access_token을 반환하는 함수 (필요시 refresh 자동 실행)
async function refreshAccessToken(userId) {
  const tokenData = getToken(userId);

  if (!tokenData) {
    throw new Error(`❌ No token data found for user: ${userId}`);
  }

  const now = Math.floor(Date.now() / 1000);

  // ⏳ 아직 유효하면 그냥 access_token 반환
  if (tokenData.expires_at && tokenData.expires_at > now) {
    console.log("✅ access_token 유효함 → 그대로 사용");
    return tokenData.access_token;
  }

  console.log("🔁 access_token 만료 → refresh_token 사용");

  try {
    const res = await axios.post(
      "https://api.fitbit.com/oauth2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token,
      }),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = res.data;
    const expires_at = now + expires_in;

    // 💾 토큰 저장 (갱신)
    setToken(userId, { access_token, refresh_token, expires_at });

    console.log("✅ 토큰 갱신 성공");
    return access_token;
  } catch (err) {
    console.error("❌ 토큰 갱신 실패:", err.response?.data || err.message);
    throw new Error("토큰 갱신 실패");
  }
}

module.exports = { refreshAccessToken };
