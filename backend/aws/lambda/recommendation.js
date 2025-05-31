const axios = require("axios");

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

const daysKor = ["일", "월", "화", "수", "목", "금", "토"];

exports.handler = async (event) => {
  const query = event.queryStringParameters || {};
  const { lat, lon, time } = query;
  const radius = Math.min(Math.floor(time * 50), 3000);

  if (!lat || !lon || !time) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "lat, lon, time은 필수입니다." }),
    };
  }

  try {
    // Kakao Map API 요청
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
        timeout: 10000,
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

    // 날씨 정보 가져오기
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

    // ⚠️ 여기는 실제론 Python으로 예측하지만 지금은 더미로 대체
    const bestTimes = ["09:00", "17:00"];

    const responseData = {
      recommendation: places.length > 0 ? "산책 추천 장소" : "실내 운동 권장",
      estimated_time: `${time}분`,
      weather_today: today,
      best_times: bestTimes,
      courses: courseList,
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("API 오류:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "외부 API 호출 실패" }),
    };
  }
};
