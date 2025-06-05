// 경로: backend/routes/fitbitApi.js
// Fitbit API와의 통신을 위한 라우트 설정

const express = require("express");
const axios = require("axios");
const { refreshAccessToken } = require("../oauth/refreshToken");

const router = express.Router();

// GET /profile - Fitbit 사용자 프로필 정보 반환
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization 헤더 누락" });
    }

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

// GET /activity - Fitbit 활동 정보 (오늘의 걸음수, 칼로리 소모량) 반환
router.get("/activity", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization 헤더 누락" });
    }

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

// GET /summary - Fitbit 활동 요약 정보 (걸음수, 칼로리 소모량, 안정 심박수) 반환
router.get("/summary", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization 헤더 누락" });
    }

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
