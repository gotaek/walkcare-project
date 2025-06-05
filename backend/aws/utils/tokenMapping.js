//경로: backend/aws/lambda/utils/tokenMapping.js
//access_token으로 user_id 찾는 유틸리티 함수수

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "FitbitTokens";

exports.getUserIdByToken = async (access_token) => {
  const result = await dynamo
    .scan({
      TableName: TABLE_NAME,
      FilterExpression: "#a = :access_token",
      ExpressionAttributeNames: {
        "#a": "access_token",
      },
      ExpressionAttributeValues: {
        ":access_token": access_token,
      },
    })
    .promise();

  if (result.Items.length > 0) {
    return result.Items[0].user_id;
  }

  return null;
};
