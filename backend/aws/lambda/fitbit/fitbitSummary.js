//경로: backend/aws/lambda/fitbit/fitbitSummary.js
// Fitbit 활동 요약(걸음수, 칼로리 소모량, 안정 심박수)를 가져오는 Lambda 함수

const axios = require("axios");

exports.handler = async (event) => {
  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Authorization 헤더 누락" }),
      };
    }

    const token = authHeader.replace("Bearer ", "");

    const access_token = token;
    const today = new Date().toISOString().slice(0, 10);

    const activityRes = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const heartRateRes = await axios.get(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { steps, caloriesOut } = activityRes.data.summary;
    const heartData = heartRateRes.data["activities-heart"][0];
    const heartRateAvg = heartData?.value?.restingHeartRate || null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        steps,
        caloriesOut,
        heartRateAvg,
      }),
    };
  } catch (err) {
    console.error("❌ 활동 요약 Lambda 에러:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fitbit 활동 요약 실패" }),
    };
  }
};
