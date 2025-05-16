//routes/fitbitApi.js

const express = require("express");
const axios = require("axios");
const { refreshAccessToken } = require("../oauth/refreshToken");
const { getUserIdByToken } = require("../utils/tokenManager");

const router = express.Router();

// 👤 사용자 프로필 조회
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization 헤더 누락" });
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = getUserIdByToken(token);

    if (!userId) {
      return res.status(404).json({ error: "❌ No token data found for user" });
    }

    const access_token = await refreshAccessToken(userId);

    const response = await axios.get(
      "https://api.fitbit.com/1/user/-/profile.json",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    res.json(response.data.user);
  } catch (err) {
    console.error("❌ 프로필 API 에러:", err.response?.data || err.message);
    res.status(500).json({ error: "Fitbit 프로필 호출 실패" });
  }
});

// 👣 오늘 걸음 수 + 칼로리 소모량
router.get("/activity", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization 헤더 누락" });
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = getUserIdByToken(token);

    if (!userId) {
      return res.status(404).json({ error: "❌ No token data found for user" });
    }

    const access_token = await refreshAccessToken(userId);
    const today = new Date().toISOString().slice(0, 10);

    const response = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { steps, caloriesOut } = response.data.summary;
    res.json({ steps, caloriesOut, date: today });
  } catch (err) {
    console.error("❌ 활동 API 에러:", err.response?.data || err.message);
    res.status(500).json({ error: "Fitbit 활동 데이터 호출 실패" });
  }
});

// 🆕 오늘의 활동 요약 (리뷰용)
router.get("/summary", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization 헤더 누락" });
    }

    const token = authHeader.replace("Bearer ", "");
    const userId = getUserIdByToken(token);
    console.log(token);
    if (!userId) {
      return res.status(404).json({ error: "❌ No token data found for user" });
    }

    const access_token = await refreshAccessToken(userId);
    const today = new Date().toISOString().slice(0, 10);

    // Fitbit 활동 정보
    const activityRes = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // 심박수 정보
    const heartRateRes = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { steps, caloriesOut } = activityRes.data.summary;
    const heartData = heartRateRes.data["activities-heart"][0];
    const heartRateAvg = heartData?.value?.restingHeartRate || null;

    res.json({
      steps,
      caloriesOut,
      heartRateAvg,
    });
  } catch (err) {
    console.error("❌ 활동 요약 API 에러:", err.response?.data || err.message);
    res.status(500).json({ error: "Fitbit 활동 요약 실패" });
  }
});

module.exports = router;
