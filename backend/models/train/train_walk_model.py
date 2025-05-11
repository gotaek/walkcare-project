import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# CSV 로드 (경로 주의)
df = pd.read_csv("../weather_samples.csv")

# 인코딩
main_enc = LabelEncoder()
desc_enc = LabelEncoder()
df["main"] = main_enc.fit_transform(df["main"])
df["result"] = df["result"].map({"yes": 1, "no": 0})

# 학습
X = df[["main", "min_temp", "max_temp", "uvi", "pop"]]
y = df["result"]
model = DecisionTreeClassifier(max_depth=4, random_state=42)
model.fit(X, y)

# 저장 경로 생성
os.makedirs("../models", exist_ok=True)

# 모델과 인코더 저장
joblib.dump(model, "../walk_decision_model.pkl")
joblib.dump(main_enc, "../main_encoder.pkl")
joblib.dump(desc_enc, "../desc_encoder.pkl")

print("✅ 모델 및 인코더 저장 완료")
accuracy = model.score(X, y)
print(f"✅ 학습 정확도: {accuracy:.2f}")

preds = model.predict(X)
print("🔍 예측 결과 샘플:", preds[:10])
print("🎯 정답(y):", y.values[:10])