const crypto = require("crypto");

function normalize(value) {
    if (value === undefined || value === null) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : null;
    return String(value).trim();
}

function canonicalize(value) {
    if (value === null || value === undefined) return "null";
    if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
    if (typeof value === "object") {
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}

function hashCanonicalPayload(payload) {
    return `0x${crypto.createHash("sha256").update(canonicalize(payload), "utf8").digest("hex")}`;
}

function buildClaimPayload(claim) {
    return {
        claim_amount: normalize(claim.claim_amount), claim_id: normalize(claim.claim_id),
        claim_status: normalize(claim.claim_status), claim_type: normalize(claim.claim_type),
        description: normalize(claim.description), hospital_name: normalize(claim.hospital_name),
        incident_date: normalize(claim.incident_date), incident_location: normalize(claim.incident_location),
        policy_id: normalize(claim.policy_id), police_report: normalize(claim.police_report),
        user_id: normalize(claim.user_id), vehicle_age: normalize(claim.vehicle_age), vehicle_number: normalize(claim.vehicle_number),
    };
}

function buildPredictionPayload(prediction) {
    return {
        claim_id: normalize(prediction.claim_id), confidence: normalize(prediction.confidence),
        fraud_score: normalize(prediction.fraud_score), prediction: normalize(prediction.prediction),
        prediction_id: normalize(prediction.prediction_id), risk_level: normalize(prediction.risk_level),
    };
}

const generateClaimHash = (claim) => hashCanonicalPayload(buildClaimPayload(claim));
const generatePredictionHash = (prediction) => hashCanonicalPayload(buildPredictionPayload(prediction));
module.exports = { canonicalize, hashCanonicalPayload, buildClaimPayload, buildPredictionPayload, generateClaimHash, generatePredictionHash };
