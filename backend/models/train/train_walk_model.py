import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# ========================
# 🔹 경로 설정
# ========================
DATA_PATH = "../weather_samples.csv"
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))            # models/train/
ROOT_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))           # 프로젝트 루트
MODEL_DIR = os.path.join(ROOT_DIR, "models")                       # models/
MODEL_PATH = os.path.join(MODEL_DIR, "walk_forest_model.pkl")

# ✅ 저장 경로 확인
os.makedirs(MODEL_DIR, exist_ok=True)

# ========================
# 📦 데이터 로딩
# ========================
df = pd.read_csv(DATA_PATH)

# 유효성 체크
required_columns = [
    "temp", "humidity", "uvi", "pop", "hour", "dayofweek",
    "main_Clear", "main_Clouds", "main_Rain", "main_Snow", "label"
]
missing = [col for col in required_columns if col not in df.columns]
if missing:
    raise ValueError(f"❌ 누락된 컬럼: {missing}")

# ========================
# 🔄 입력/타겟 분리
# ========================
X = df.drop(columns=["label"])
y = df["label"]

# ========================
# 🎯 모델 학습
# ========================
model = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
model.fit(X, y)

# ========================
# 💾 모델 저장
# ========================
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(model, MODEL_PATH)

print("✅ Random Forest 모델 저장 완료:", MODEL_PATH)
