// 📁 routes/exchange.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");
const { setToken, saveActiveUser } = require("../utils/tokenManager");

router.get("/exchange", async (req, res) => {
  const code = req.query.code;

  const tokenUrl = "https://api.fitbit.com/oauth2/token";
  const authHeader = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      tokenUrl,
      qs.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.FITBIT_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = response.data;
    const now = Math.floor(Date.now() / 1000);
    const expires_at = now + tokenData.expires_in;

    setToken(tokenData.user_id, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at,
    });

    saveActiveUser(tokenData.user_id);

    console.log(`✅ 토큰 저장 완료: ${tokenData.user_id}`);

    res.json({
      access_token: tokenData.access_token,
      user_id: tokenData.user_id,
      expires_at,
    });
  } catch (err) {
    console.error(
      "❌ Token exchange error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "OAuth Token Exchange Failed" });
  }
});

module.exports = router;
