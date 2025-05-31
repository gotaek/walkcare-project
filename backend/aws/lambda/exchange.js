const axios = require("axios");
const qs = require("qs");

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;
  if (!code) return { statusCode: 400, body: "Missing code" };

  const authHeader = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const res = await axios.post(
      "https://api.fitbit.com/oauth2/token",
      qs.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri:
          "https://d8qdx561m5.execute-api.ap-northeast-2.amazonaws.com/callback",
      }),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, user_id, expires_in } = res.data;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, user_id }),
    };
  } catch (err) {
    console.error(
      "❌ Token exchange error:",
      err.response?.data || err.message
    );
    return { statusCode: 500, body: "OAuth Token Exchange Failed" };
  }
};
