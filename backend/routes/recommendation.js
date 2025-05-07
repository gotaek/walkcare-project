// 📁 backend/routes/recommendation.js
// 사용자의 위치와 산책 시간 기반으로 공원 추천을 제공하는 API

require("dotenv").config(); // 환경변수 사용 (서버 또는 상위 파일에서 한번만 실행)

const express = require("express");
const axios = require("axios");
const router = express.Router();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY; // 🔐 .env에서 불러오기

// GET /recommendation?lat=37.55&lon=127.01&time=30
// 🔹 입력: 위도(lat), 경도(lon), 산책 시간(time, 분 단위)
// 🔹 출력: 추천 장소 리스트 또는 실내 운동 권장 메시지
router.get("/", async (req, res) => {
  const { lat, lon, time } = req.query;
  const radius = Math.min(Math.floor(time * 50), 3000); // 🔸 산책 반경 계산 (최대 3km 제한)
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
          query: "공원", // 🔍 검색 키워드
          x: lon, // 경도
          y: lat, // 위도
          radius: radius, // 검색 반경
          sort: "accuracy", // 정확도 순 정렬
        },
      }
    );

    const places = kakaoRes.data.documents;
    // 🔸 검색 결과 없을 경우
    if (places.length === 0) {
      return res.json({
        recommendation: "실내 운동 권장",
        estimated_time: `${time}분`,
        courses: [],
      });
    }

    // 🔸 결과 데이터 가공 (상위 5개)
    const courseList = places.slice(0, 5).map((p) => ({
      name: p.place_name,
      distance: Number(p.distance), // 단위: m
      address: p.road_address_name || p.address_name,
      url: p.place_url,
      x: Number(p.x), // 경도
      y: Number(p.y), // 위도
    }));

    // 🔸 최종 응답
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
