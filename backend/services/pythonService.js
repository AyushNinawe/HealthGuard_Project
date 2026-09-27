const { spawn } = require("child_process");
const path = require("path");

function calculateFraudFallback(claimData) {
    const amount = Number(claimData.claim_amount) || 0;
    const vehicleAge = Number(claimData.vehicle_age) || 0;
    const policeReport =
        Number(claimData.police_report) === 1 ||
        String(claimData.police_report).toLowerCase() === "yes" ||
        String(claimData.police_report) === "1";
    const claimType = String(claimData.claim_type || "").toLowerCase();
    const hospital = String(claimData.hospital_name || "").toLowerCase();

    let probability = 0.12;

    // Amount scoring
    if (amount > 500000) probability += 0.52;
    else if (amount > 200000) probability += 0.38;
    else if (amount > 100000) probability += 0.22;
    else if (amount > 40000) probability += 0.10;

    // Police report scoring
    if (!policeReport && (amount > 50000 || claimType.includes("accident") || claimType.includes("vehicle"))) {
        probability += 0.28;
    }

    // Vehicle age scoring
    if (vehicleAge > 12) probability += 0.18;
    else if (vehicleAge > 7) probability += 0.08;

    // Clamp
    probability = Math.min(0.96, Math.max(0.04, probability));

    const isFraud = probability >= 0.50;
    const risk = probability >= 0.80 ? "High" : (probability >= 0.50 ? "Medium" : "Low");
    const confidence = Math.max(probability, 1 - probability);

    return {
        success: true,
        prediction: isFraud ? "Fraud" : "Genuine",
        fraud_score: Math.round(probability * 10000) / 100,
        risk_level: risk,
        confidence: Math.round(confidence * 10000) / 100
    };
}

const predictFraud = (claimData) => {
    return new Promise((resolve) => {
        const pythonScript = path.join(__dirname, "..", "python", "predict.py");

        const python = spawn("python3", [
            pythonScript,
            JSON.stringify(claimData)
        ]);

        let result = "";
        let error = "";

        python.stdout.on("data", (data) => {
            result += data.toString();
        });

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("error", (err) => {
            console.warn("[ML] Python invocation unavailable, using JS fallback engine:", err.message);
            resolve(calculateFraudFallback(claimData));
        });

        python.on("close", (code) => {
            if (code !== 0) {
                console.warn("[ML] Python exited with code", code, "- using JS fallback engine");
                return resolve(calculateFraudFallback(claimData));
            }

            try {
                const parsed = JSON.parse(result.trim());
                if (parsed.success === false) {
                    return resolve(calculateFraudFallback(claimData));
                }
                return resolve(parsed);
            } catch (err) {
                return resolve(calculateFraudFallback(claimData));
            }
        });
    });
};

module.exports = {
    predictFraud,
    calculateFraudFallback
};
