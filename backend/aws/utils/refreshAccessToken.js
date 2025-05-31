const axios = require("axios");
const { getToken, setToken } = require("./dynamoToken");

const client_id = process.env.FITBIT_CLIENT_ID;
const client_secret = process.env.FITBIT_CLIENT_SECRET;
const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString(
  "base64"
);

exports.refreshAccessToken = async (user_id) => {
  const tokenData = await getToken(user_id);
  const now = Math.floor(Date.now() / 1000);

  if (!tokenData) throw new Error("❌ Token data 없음");

  if (tokenData.expires_at > now) {
    console.log("✅ access_token 유효");
    return tokenData.access_token;
  }

  console.log("🔁 access_token 만료 → refresh 중...");

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

  await setToken(user_id, { access_token, refresh_token, expires_at });

  console.log("✅ access_token 갱신 완료");
  return access_token;
};
