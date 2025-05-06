require("dotenv").config(); // 환경변수 사용 (서버 또는 상위 파일에서 한번만 실행)

const express = require("express");
const axios = require("axios");
const router = express.Router();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY; // 🔐 .env에서 불러오기

// GET /recommendation?lat=37.55&lon=127.01&time=30
router.get("/", async (req, res) => {
  const { lat, lon, time } = req.query;
  const radius = Math.min(Math.floor(time * 50), 3000);
  if (!lat || !lon || !time) {
    return res.status(400).json({ error: "lat, lon, time은 필수입니다." });
  }

  try {
    // 📡 Kakao API 요청: 산책로 or 공원 검색
    const kakaoRes = await axios.get(
      "https://dapi.kakao.com/v2/local/search/keyword.json",
      {
        headers: { Authorization: KAKAO_REST_API_KEY },
        params: {
          query: "공원", // 또는 '공원'
          x: lon,
          y: lat,
          radius: radius,
          sort: "accuracy", // 거리순 정렬
        },
      }
    );

    const places = kakaoRes.data.documents;

    if (places.length === 0) {
      return res.json({
        recommendation: "실내 운동 권장",
        estimated_time: `${time}분`,
        courses: [],
      });
    }

    const courseList = places.slice(0, 5).map((p) => ({
      name: p.place_name,
      distance: Number(p.distance), // 단위: m
      address: p.road_address_name || p.address_name,
      url: p.place_url,
      x: Number(p.x), // 경도
      y: Number(p.y), // 위도
    }));

    return res.json({
      recommendation: "산책 추천 장소",
      estimated_time: `${time}분`,
      courses: courseList, // 위에서 가공한 배열
    });
  } catch (error) {
    console.error("Kakao API 오류:", error.message);
    return res.status(500).json({ error: "Kakao API 호출 실패" });
  }
});

module.exports = router;
