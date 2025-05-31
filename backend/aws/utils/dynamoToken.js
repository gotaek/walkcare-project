const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "FitbitTokens";

exports.getToken = async (user_id) => {
  const res = await dynamo
    .get({
      TableName: TABLE_NAME,
      Key: { user_id },
    })
    .promise();
  return res.Item || null;
};

exports.setToken = async (user_id, tokenData) => {
  await dynamo
    .put({
      TableName: TABLE_NAME,
      Item: {
        user_id,
        ...tokenData,
      },
    })
    .promise();
};
