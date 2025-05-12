import json
import boto3
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorData')

def lambda_handler(event, context):
    print("📥 이벤트 수신:", event)

    try:
        data = event
        timestamp = data.get("timestamp") or datetime.now().isoformat()

        # Decimal로 변환
        pm2_5 = Decimal(str(data['pm2_5']))
        pm10 = Decimal(str(data['pm10']))

        # 저장
        table.put_item(
            Item={
                'sensor_id': str(data['sensor_id']),
                'timestamp': timestamp,
                'pm2_5': pm2_5,
                'pm10': pm10
            }
        )

        print("✅ 저장 성공:", data)

        return {
            'statusCode': 200,
            'body': json.dumps('✅ Data saved to DynamoDB')
        }

    except Exception as e:
        print("❌ 저장 실패:", str(e))
        return {
            'statusCode': 500,
            'body': json.dumps('❌ Error saving data')
        }
