// 📄 fitbitToken.js
const AWS = require("aws-sdk");

// 지역 설정 (필요 시 .env에서 가져와도 됨)
AWS.config.update({ region: "ap-northeast-2" });

const dynamo = new AWS.DynamoDB.DocumentClient();

/**
 * Fitbit 토큰을 DynamoDB에 저장
 * @param {Object} tokenData
 * @param {string} tokenData.user_id - Fitbit 사용자 ID
 * @param {string} tokenData.access_token
 * @param {string} tokenData.refresh_token
 * @param {number} tokenData.expires_in - access_token의 유효기간 (초 단위)
 */
async function saveFitbitToken({
  user_id,
  access_token,
  refresh_token,
  expires_in,
}) {
  const expires_at = Date.now() + expires_in * 1000;

  const params = {
    TableName: "FitbitTokens",
    Item: {
      user_id,
      access_token,
      refresh_token,
      expires_at,
      updated_at: Date.now(),
    },
  };

  try {
    await dynamo.put(params).promise();
    console.log("✅ Fitbit token saved for user:", user_id);
  } catch (err) {
    console.error("❌ DynamoDB save error:", err);
    throw err;
  }
}

module.exports = { saveFitbitToken };
