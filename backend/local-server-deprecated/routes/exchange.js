// 경로: backend/routes/exchange.js
// Fitbit OAuth 인증 코드를 액세스 토큰으로 교환하는 라우트 설정

const axios = require("axios");
const qs = require("qs");

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;
  const redirect_uri =
    "https://d8qdx561m5.execute-api.ap-northeast-2.amazonaws.com/callback";

  if (!code) {
    return { statusCode: 400, body: "Missing code" };
  }

  const authHeader = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const res = await axios.post(
      "https://api.fitbit.com/oauth2/token",
      qs.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri,
      }),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "OAuth exchange failed",
        detail: err.message,
      }),
    };
  }
};
