// backend/routes/fitbitApi.js
const express = require("express");
const axios = require("axios");
const { refreshAccessToken } = require("../oauth/refreshToken");

const router = express.Router();

// 👤 사용자 프로필 조회
router.get("/profile/:userId", async (req, res) => {
  try {
    const access_token = await refreshAccessToken(req.params.userId);

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
router.get("/activity/:userId", async (req, res) => {
  try {
    const access_token = await refreshAccessToken(req.params.userId);
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

module.exports = router;
