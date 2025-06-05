// 경로: backend/routes/recommendation.js
// 공원 추천 및 산책 시간 예측을 위한 라우트 설정

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { spawn } = require("child_process");
const router = express.Router();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

const daysKor = ["일", "월", "화", "수", "목", "금", "토"];

// 🔧 Python 예측 함수
const getBestWalkTimes = async (hourlyWeather) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["models/predict/predict_walk_time.py"]);
    let result = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (err) => {
      console.error("Python stderr:", err.toString());
    });

    py.on("close", () => {
      try {
        const parsed = JSON.parse(result);
        resolve(parsed.best_times || []);
      } catch (e) {
        console.error("Python 예측 응답 파싱 실패:", e.message);
        resolve([]);
      }
    });

    py.stdin.write(JSON.stringify({ hourly_weather: hourlyWeather }));
    py.stdin.end();
  });
};
// GET /recommendation-공원 추천 및 산책 시간 예측
router.get("/", async (req, res) => {
  const { lat, lon, time } = req.query;
  const radius = Math.min(Math.floor(time * 50), 3000);

  if (!lat || !lon || !time) {
    return res.status(400).json({ error: "lat, lon, time은 필수입니다." });
  }

  try {
    const axiosInstance = axios.create({
      timeout: 10000, // 10초 타임아웃
    });
    // 1. Kakao 공원 검색
    const kakaoRes = await axios.get(
      "https://dapi.kakao.com/v2/local/search/keyword.json",
      {
        headers: { Authorization: KAKAO_REST_API_KEY },
        params: {
          query: "공원",
          x: lon,
          y: lat,
          radius,
          sort: "accuracy",
        },
      }
    );

    const places = kakaoRes.data.documents;
    const courseList = places.slice(0, 5).map((p) => ({
      name: p.place_name,
      distance: Number(p.distance),
      address: p.road_address_name || p.address_name,
      url: p.place_url,
      x: Number(p.x),
      y: Number(p.y),
    }));

    // 2. 날씨 정보 호출 (48시간 예보 사용)
    const weatherRes = await axios.get(
      "https://api.openweathermap.org/data/3.0/onecall",
      {
        params: {
          lat,
          lon,
          exclude: "minutely,daily,alerts",
          units: "metric",
          lang: "kr",
          appid: OPEN_WEATHER_API_KEY,
        },
      }
    );

    const hourly = weatherRes.data.hourly || [];

    const hourlyWeather = hourly.slice(0, 48).map((h) => ({
      dt: h.dt,
      temp: h.temp,
      humidity: h.humidity,
      uvi: h.uvi ?? 0,
      pop: h.pop ?? 0,
      main: h.weather?.[0]?.main || "Clear",
    }));

    const now = new Date();
    const today = {
      date: now.toISOString().split("T")[0],
      day: daysKor[now.getDay()],
      temp: weatherRes.data.current.temp,
      humidity: weatherRes.data.current.humidity,
      uvi: weatherRes.data.current.uvi ?? 0,
      main: weatherRes.data.current.weather?.[0]?.main || "Clear",
      icon: weatherRes.data.current.weather?.[0]?.icon || "01d",
    };

    console.log(hourlyWeather);
    // 3. 머신러닝 예측 기반 best_times 도출
    const bestTimes = await getBestWalkTimes(hourlyWeather);

    const responseData = {
      recommendation: places.length > 0 ? "산책 추천 장소" : "실내 운동 권장",
      estimated_time: `${time}분`,
      weather_today: today,
      best_times: bestTimes, // ✅ 추천 시간대
      courses: courseList,
    };

    console.log(
      "📤 클라이언트로 전송되는 응답 데이터:\n",
      JSON.stringify(responseData, null, 2)
    );

    return res.json(responseData);
  } catch (error) {
    console.error("❌ API 오류:", error.message, error.config?.url);
    console.error("❌ API 오류:", error.message);
    return res.status(500).json({ error: "외부 API 호출 실패" });
  }
});

module.exports = router;
