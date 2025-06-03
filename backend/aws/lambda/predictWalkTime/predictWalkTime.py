# lambda_predict.py
import json
import joblib
import pandas as pd
from datetime import datetime
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "walk_forest_model.pkl")
model = joblib.load(MODEL_PATH)

def preprocess_hourly_data(hourly_data):
    processed = []
    for item in hourly_data:
        dt_obj = datetime.fromtimestamp(item["dt"])
        hour = dt_obj.hour
        dayofweek = dt_obj.weekday()
        temp = item["temp"]
        humidity = item["humidity"]
        uvi = item.get("uvi", 0)
        pop = item.get("pop", 0)
        main = item["main"]

        processed.append({
            "dt": dt_obj.strftime("%Y-%m-%d %H:%M"),
            "temp": temp,
            "humidity": humidity,
            "uvi": uvi,
            "pop": pop,
            "hour": hour,
            "dayofweek": dayofweek,
            "main_Clear": 1 if main == "Clear" else 0,
            "main_Clouds": 1 if main == "Clouds" else 0,
            "main_Rain": 1 if main in ["Rain", "Drizzle", "Thunderstorm"] else 0,
            "main_Snow": 1 if main == "Snow" else 0
        })
    return pd.DataFrame(processed)

def lambda_handler(event, context):
    body = json.loads(event["body"])
    hourly_weather = body.get("hourly_weather", [])
    df = preprocess_hourly_data(hourly_weather)
    X = df.drop(columns=["dt"])
    df["walkable"] = model.predict(X)

    candidates = df[df["walkable"] == 1]
    candidates = candidates.sort_values(by=["pop", "uvi", "temp"]).head(3)

    best_times = []
    for _, row in candidates.iterrows():
        summary = "맑음" if row["main_Clear"] else "흐림" if row["main_Clouds"] else "비/눈"
        best_times.append({
            "time": row["dt"],
            "temp": round(row["temp"], 1),
            "uvi": round(row["uvi"], 1),
            "pop": round(row["pop"] * 100),
            "summary": summary
        })

    return {
        "statusCode": 200,
        "body": json.dumps({ "best_times": best_times }, ensure_ascii=False)
    }
