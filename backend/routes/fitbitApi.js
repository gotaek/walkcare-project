// backend/routes/fitbitApi.js
const express = require("express");
const axios = require("axios");
const { refreshAccessToken } = require("../oauth/refreshToken");
const router = express.Router();

router.get("/fitbit/heart/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const access_token = await refreshAccessToken(userId);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const url = `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Fitbit API 호출 오류:", err.message);
    res.status(500).json({ error: "API 호출 실패" });
  }
});

module.exports = router;
