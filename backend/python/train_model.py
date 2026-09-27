import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# Load Dataset
# ==========================================
df = pd.read_csv("fraud_dataset.csv")

print("Dataset columns:")
print(df.columns.tolist())

# Remove missing values
df = df.dropna()


# ==========================================
# Check Target
# ==========================================
if "fraud" not in df.columns:
    raise ValueError(
        "Target column 'fraud' not found in dataset."
    )


# ==========================================
# Separate Features and Target
# ==========================================
X = df.drop("fraud", axis=1)
y = df["fraud"]


# ==========================================
# Encode Categorical Columns
# ==========================================
label_encoders = {}

for column in X.select_dtypes(
    include=["object", "string"]
).columns:

    le = LabelEncoder()

    X[column] = le.fit_transform(
        X[column].astype(str)
    )

    label_encoders[column] = le


# ==========================================
# Save Feature Names
# ==========================================
feature_names = X.columns.tolist()

print("\nFeatures used by model:")
print(feature_names)


# ==========================================
# Split Dataset
# ==========================================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ==========================================
# Train Random Forest
# ==========================================
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)


# ==========================================
# Prediction
# ==========================================
y_pred = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)


# ==========================================
# Display Accuracy
# ==========================================
print("\n==========================================")
print(
    f"Model Accuracy: {accuracy * 100:.2f}%"
)
print("==========================================\n")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# ==========================================
# Save Model
# ==========================================
joblib.dump(
    model,
    "fraud_model.pkl"
)

joblib.dump(
    label_encoders,
    "label_encoders.pkl"
)

joblib.dump(
    feature_names,
    "feature_names.pkl"
)


print("\n✅ Model saved as fraud_model.pkl")
print("✅ Encoders saved as label_encoders.pkl")
print("✅ Feature names saved as feature_names.pkl")