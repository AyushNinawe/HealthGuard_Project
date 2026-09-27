import sys
import json
import joblib
import pandas as pd
import os


# ============================================================
# GET PYTHON FOLDER PATH
# ============================================================
BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# ============================================================
# LOAD MODEL FILES
# ============================================================
try:

    model = joblib.load(
        os.path.join(BASE_DIR, "fraud_model.pkl")
    )

    label_encoders = joblib.load(
        os.path.join(BASE_DIR, "label_encoders.pkl")
    )

    feature_names = joblib.load(
        os.path.join(BASE_DIR, "feature_names.pkl")
    )

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Failed to load ML model files.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# CHECK INPUT
# ============================================================
if len(sys.argv) < 2:

    print(json.dumps({
        "success": False,
        "message": "No input data provided."
    }))

    sys.exit(1)


# ============================================================
# READ JSON INPUT
# ============================================================
try:

    input_data = json.loads(sys.argv[1])

except json.JSONDecodeError as e:

    print(json.dumps({
        "success": False,
        "message": "Invalid JSON input.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# CREATE DATAFRAME
# ============================================================
try:

    df = pd.DataFrame([input_data])

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Failed to create DataFrame.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# CHECK REQUIRED FEATURES
# ============================================================
missing_features = [
    feature
    for feature in feature_names
    if feature not in df.columns
]

if missing_features:

    print(json.dumps({
        "success": False,
        "message": "Missing required ML features.",
        "missing_features": missing_features,
        "required_features": feature_names
    }))

    sys.exit(1)


# ============================================================
# KEEP ONLY REQUIRED FEATURES
# ============================================================
df = df[feature_names].copy()


# ============================================================
# CONVERT CLAIM AMOUNT
# ============================================================
try:

    df["claim_amount"] = pd.to_numeric(
        df["claim_amount"]
    )

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Invalid claim_amount.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# CONVERT VEHICLE AGE
# ============================================================
try:

    df["vehicle_age"] = pd.to_numeric(
        df["vehicle_age"]
    )

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Invalid vehicle_age.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# CONVERT POLICE REPORT
# Dataset:
# Yes -> 1
# No  -> 0
# ============================================================
try:

    police_value = str(
        df["police_report"].iloc[0]
    ).strip().lower()

    if police_value == "yes":
        df["police_report"] = 1

    elif police_value == "no":
        df["police_report"] = 0

    elif police_value == "1":
        df["police_report"] = 1

    elif police_value == "0":
        df["police_report"] = 0

    else:

        print(json.dumps({
            "success": False,
            "message": "Invalid police_report value.",
            "received": police_value,
            "allowed_values": [
                "Yes",
                "No",
                "1",
                "0"
            ]
        }))

        sys.exit(1)

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Police report conversion failed.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# LABEL ENCODE CATEGORICAL FEATURES
# CASE-INSENSITIVE
# ============================================================
try:

    for column, encoder in label_encoders.items():

        if column not in df.columns:
            continue

        value = str(
            df[column].iloc[0]
        ).strip()

        matched_value = None

        # ----------------------------------------------------
        # Find the original training value ignoring case
        # ----------------------------------------------------
        for allowed_value in encoder.classes_:

            if str(allowed_value).strip().lower() == value.lower():

                matched_value = allowed_value
                break


        # ----------------------------------------------------
        # Unknown category
        # ----------------------------------------------------
        if matched_value is None:

            print(json.dumps({
                "success": False,
                "message":
                    f"Unknown value '{value}' "
                    f"for column '{column}'.",

                "allowed_values":
                    encoder.classes_.tolist()
            }))

            sys.exit(1)


        # ----------------------------------------------------
        # Encode using the ORIGINAL training value
        # ----------------------------------------------------
        df[column] = encoder.transform(
            [matched_value]
        )


except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Categorical encoding failed.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# FINAL FEATURE ORDER
# ============================================================
try:

    df = df[feature_names]

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Feature ordering failed.",
        "error": str(e),
        "expected_features": feature_names
    }))

    sys.exit(1)


# ============================================================
# CHECK ALL FEATURES ARE NUMERIC
# ============================================================
try:

    df = df.apply(
        pd.to_numeric
    )

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "ML input contains non-numeric values.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# RUN ML PREDICTION
# ============================================================
try:

    prediction = model.predict(df)[0]

    probability = model.predict_proba(df)[0][1]

except Exception as e:

    print(json.dumps({
        "success": False,
        "message": "Prediction failed.",
        "error": str(e)
    }))

    sys.exit(1)


# ============================================================
# CALCULATE RISK LEVEL
# ============================================================
if probability >= 0.80:

    risk = "High"

elif probability >= 0.50:

    risk = "Medium"

else:

    risk = "Low"


# ============================================================
# CALCULATE CONFIDENCE
# ============================================================
confidence = max(
    probability,
    1 - probability
)


# ============================================================
# PREPARE RESULT
# ============================================================
result = {

    "success": True,

    "prediction":
        "Fraud"
        if prediction == 1
        else "Genuine",

    "fraud_score":
        round(
            probability * 100,
            2
        ),

    "risk_level":
        risk,

    "confidence":
        round(
            confidence * 100,
            2
        )
}


# ============================================================
# RETURN JSON TO NODE.JS
# ============================================================
print(
    json.dumps(result)
)