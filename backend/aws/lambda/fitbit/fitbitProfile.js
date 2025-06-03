const axios = require("axios");

exports.handler = async (event) => {
  const auth = event.headers.authorization || event.headers.Authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Authorization 헤더 누락" }),
    };
  }

  const token = auth.replace("Bearer ", "");

  try {
    const response = await axios.get(
      "https://api.fitbit.com/1/user/-/profile.json",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.data.user),
    };
  } catch (err) {
    console.error("❌ 프로필 요청 실패:", err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "프로필 API 호출 실패" }),
    };
  }
};
