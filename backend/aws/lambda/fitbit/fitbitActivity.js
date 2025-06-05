// 경로: backend/aws/lambda/fitbit/fitbitActivity.js
// Fitbit 활동 데이터(걸음수, 칼로리 소모량)를 가져오는 Lambda 함수

const axios = require("axios");

exports.handler = async (event) => {
  const auth = event.headers.authorization || event.headers.Authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Authorization 헤더 누락" }),
    };
  }

  const access_token = auth.replace("Bearer ", "");
  const today = new Date().toISOString().slice(0, 10);

  try {
    const response = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { steps, caloriesOut } = response.data.summary;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps, caloriesOut, date: today }),
    };
  } catch (err) {
    console.error(
      "❌ Fitbit 활동 API 에러:",
      err.response?.data || err.message
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fitbit 활동 데이터 호출 실패" }),
    };
  }
};
