require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

const daysKor = ["일", "월", "화", "수", "목", "금", "토"];

router.get("/", async (req, res) => {
  const { lat, lon, time } = req.query;
  const radius = Math.min(Math.floor(time * 50), 3000);

  if (!lat || !lon || !time) {
    return res.status(400).json({ error: "lat, lon, time은 필수입니다." });
  }

  try {
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

    // 2. 날씨 정보 호출 (7일 예보 포함)
    const weatherRes = await axios.get(
      "https://api.openweathermap.org/data/3.0/onecall",
      {
        params: {
          lat,
          lon,
          exclude: "minutely,hourly,alerts",
          units: "metric",
          lang: "kr",
          appid: OPEN_WEATHER_API_KEY,
        },
      }
    );

    const daily = weatherRes.data.daily || [];

    const weeklyWeather = daily.slice(0, 7).map((d) => {
      const date = new Date(d.dt * 1000);
      return {
        date: date.toISOString().split("T")[0],
        day: daysKor[date.getDay()],
        main: d.weather[0].main,
        description: d.weather[0].description,
        icon: d.weather[0].icon,
        min_temp: d.temp.min,
        max_temp: d.temp.max,
        uvi: d.uvi,
        pop: Math.round((d.pop || 0) * 100), // 0~1 → %
      };
    });

    const todayWeather = weeklyWeather[0];

    const responseData = {
      recommendation: places.length > 0 ? "산책 추천 장소" : "실내 운동 권장",
      estimated_time: `${time}분`,
      weather_today: todayWeather,
      weekly_weather: weeklyWeather,
      courses: courseList,
    };

    console.log(
      "📤 클라이언트로 전송되는 응답 데이터:\n",
      JSON.stringify(responseData, null, 2)
    );

    return res.json(responseData);
  } catch (error) {
    console.error("❌ API 오류:", error.message);
    return res.status(500).json({ error: "외부 API 호출 실패" });
  }
});

module.exports = router;
