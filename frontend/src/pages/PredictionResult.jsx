import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FiArrowLeft,
    FiDownload,
    FiFlag,
    FiCheckCircle,
    FiAlertTriangle,
} from "react-icons/fi";

import { predictionService } from "../services/api";
import {
    computeRiskLevel,
    riskLevelClass,
} from "../utils/formatters";


// ============================================================
// PROBABILITY METER
// ============================================================

function ProbabilityMeter({ value = 0 }) {

    const r = 70;

    const circ =
        2 * Math.PI * r;

    const pct = Math.max(
        0,
        Math.min(
            100,
            Math.round(value * 100)
        )
    );

    const color =
        pct < 30
            ? "#4CAF50"
            : pct < 60
                ? "#FF9800"
                : "#F44336";

    const offset =
        circ -
        (pct / 100) * circ;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
            }}
        >

            <svg
                width={180}
                height={180}
                viewBox="0 0 180 180"
            >

                {/* Track */}
                <circle
                    cx={90}
                    cy={90}
                    r={r}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth={14}
                />

                {/* Progress */}
                <circle
                    cx={90}
                    cy={90}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 90 90)"
                    style={{
                        transition:
                            "stroke-dashoffset 1.2s ease-in-out",
                    }}
                />

                {/* Percentage */}
                <text
                    x={90}
                    y={83}
                    textAnchor="middle"
                    fontSize={28}
                    fontWeight={800}
                    fill={color}
                >
                    {pct}%
                </text>

                <text
                    x={90}
                    y={105}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#9CA3AF"
                >
                    Fraud Risk
                </text>

            </svg>
        </div>
    );
}


// ============================================================
// CONVERT BACKEND RESPONSE
// ============================================================

function normalizePrediction(data, claimId) {

    /*
     * Backend response:
     *
     * {
     *   success: true,
     *   message: "Fraud prediction completed successfully.",
     *   claim_id: "5",
     *   prediction: "Genuine",
     *   fraud_score: 4,
     *   risk_level: "Low",
     *   confidence: 96
     * }
     */

    const prediction =
        data?.prediction || "Unknown";

    const confidence =
        Number(data?.confidence || 0);

    const fraudScore =
        Number(data?.fraud_score || 0);

    const riskLevel =
        data?.risk_level ||
        computeRiskLevel(
            fraudScore / 100
        );

    /*
     * IMPORTANT:
     *
     * Your current backend returns fraud_score,
     * not fraud_probability.
     *
     * Until the backend returns an actual probability,
     * we use the fraud score as a percentage.
     *
     * If your Python model later returns:
     *
     * fraud_probability: 0.04
     *
     * this can be changed to use that directly.
     */

    const fraudProbability =
        Math.max(
            0,
            Math.min(
                1,
                fraudScore / 100
            )
        );

    const genuineProbability =
        1 - fraudProbability;

    return {
        claimId:
            data?.claim_id ||
            claimId,

        prediction,

        confidenceScore:
            confidence / 100,

        confidence,

        fraudScore,

        fraudProbability,

        genuineProbability,

        riskLevel,

        reasons:
            data?.reasons || [],

        recommendedAction:
            data?.recommended_action ||
            getRecommendedAction(
                prediction,
                riskLevel
            ),

        analyzedAt:
            data?.analyzed_at ||
            new Date().toISOString(),
    };
}


// ============================================================
// RECOMMENDED ACTION
// ============================================================

function getRecommendedAction(
    prediction,
    riskLevel
) {

    if (
        prediction === "Fraud" ||
        riskLevel === "Critical" ||
        riskLevel === "High"
    ) {
        return (
            "This claim should be reviewed by the " +
            "fraud investigation team before approval."
        );
    }

    if (riskLevel === "Medium") {
        return (
            "Perform additional verification before " +
            "final claim approval."
        );
    }

    return (
        "The claim appears low risk based on the " +
        "current fraud prediction."
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PredictionResult() {

    const navigate = useNavigate();

    const { id } =
        useParams();

    const [prediction, setPrediction] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [isRunning, setIsRunning] =
        useState(false);


    // ========================================================
    // LOAD / RUN PREDICTION
    // ========================================================

    useEffect(() => {

        if (!id) {

            setError(
                "Claim ID is missing."
            );

            setIsLoading(false);

            return;
        }

        loadPrediction();

    }, [id]);


    async function loadPrediction() {

        try {

            setIsLoading(true);

            setError("");

            /*
             * First try to get an existing prediction.
             */

            const response =
                await predictionService.getPrediction(id);

            const data =
                response?.data ||
                response;

            if (
                data &&
                (
                    data.prediction ||
                    data.risk_level
                )
            ) {

                setPrediction(
                    normalizePrediction(
                        data,
                        id
                    )
                );

                return;
            }

            /*
             * If there is no existing prediction,
             * run the ML prediction.
             */

            await runPrediction();

        } catch (err) {

            /*
             * If GET prediction is not available,
             * directly run prediction.
             */

            try {

                await runPrediction();

            } catch (predictionError) {

                console.error(
                    "Prediction error:",
                    predictionError
                );

                setError(
                    predictionError?.response?.data?.message ||
                    predictionError?.message ||
                    "Unable to run fraud prediction."
                );

            }

        } finally {

            setIsLoading(false);
        }
    }


    // ========================================================
    // RUN NEW PREDICTION
    // ========================================================

    async function runPrediction() {

        try {

            setIsRunning(true);

            setError("");

            const response =
                await predictionService.predict(id);

            const data =
                response?.data ||
                response;

            if (!data) {

                throw new Error(
                    "No prediction data received from server."
                );
            }

            setPrediction(
                normalizePrediction(
                    data,
                    id
                )
            );

        } catch (err) {

            console.error(
                "Fraud prediction failed:",
                err
            );

            throw err;

        } finally {

            setIsRunning(false);
        }
    }


    // ========================================================
    // LOADING
    // ========================================================

    if (isLoading) {

        return (
            <div
                className="animate-fade-in"
                style={{
                    padding: "3rem",
                    textAlign: "center",
                }}
            >

                <div
                    className="spinner-border"
                    role="status"
                />

                <p
                    style={{
                        marginTop: "1rem",
                        color: "var(--text-secondary)",
                    }}
                >
                    Running fraud prediction...
                </p>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error && !prediction) {

        return (
            <div className="animate-fade-in">

                <div className="page-header">

                    <button
                        className="btn-hg btn-secondary-hg btn-sm-hg"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        <FiArrowLeft size={14} />
                        Back
                    </button>

                    <h1>
                        Prediction Result
                    </h1>

                </div>

                <div
                    className="data-card"
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                    }}
                >

                    <FiAlertTriangle
                        size={40}
                        color="#F44336"
                    />

                    <h4
                        style={{
                            marginTop: "1rem",
                        }}
                    >
                        Prediction Failed
                    </h4>

                    <p
                        style={{
                            color:
                                "var(--text-secondary)",
                        }}
                    >
                        {error}
                    </p>

                    <button
                        className="btn-hg btn-primary-hg"
                        onClick={runPrediction}
                        disabled={isRunning}
                    >
                        {isRunning
                            ? "Analyzing..."
                            : "Try Again"}
                    </button>

                </div>

            </div>
        );
    }


    // ========================================================
    // PREDICTION DATA
    // ========================================================

    if (!prediction) {
        return null;
    }

    const isFraud =
        prediction.prediction
            ?.toLowerCase() === "fraud";

    const risk =
        prediction.riskLevel ||
        computeRiskLevel(
            prediction.fraudProbability
        );


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="animate-fade-in">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div
                className="page-header"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >

                <button
                    className="btn-hg btn-secondary-hg btn-sm-hg"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    <FiArrowLeft size={14} />
                    Back
                </button>

                <div>

                    <h1>
                        Prediction Result
                    </h1>

                    <p>
                        Claim ID:{" "}
                        {prediction.claimId || id}
                    </p>

                </div>

            </div>


            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
                <div
                    style={{
                        marginBottom: "1rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        background: "#FFF3E0",
                        color: "#E65100",
                    }}
                >
                    {error}
                </div>
            )}


            {/* ==================================================
                VERDICT BANNER
            ================================================== */}

            <div
                className={`verdict-banner ${
                    isFraud
                        ? "verdict-fraud"
                        : "verdict-genuine"
                }`}
            >

                <div
                    style={{
                        fontSize: "2.5rem",
                        marginBottom: "0.5rem",
                    }}
                >
                    {isFraud
                        ? "⚠️"
                        : "✅"}
                </div>

                <div className="verdict-title">
                    {prediction.prediction?.toUpperCase()}
                </div>

                <div className="verdict-subtitle">

                    {isFraud
                        ? "This claim has been identified as potentially fraudulent by the fraud detection model."
                        : "This claim appears to be genuine based on the current fraud detection model."}

                </div>

            </div>


            {/* ==================================================
                TWO COLUMN LAYOUT
            ================================================== */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "1fr 1fr",
                    gap: "1.25rem",
                }}
            >

                {/* ==================================================
                    LEFT COLUMN
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                    }}
                >

                    {/* ------------------------------------------
                        FRAUD SCORE
                    ------------------------------------------ */}

                    <div
                        className="data-card"
                        style={{
                            textAlign: "center",
                        }}
                    >

                        <h6
                            style={{
                                fontWeight: 700,
                                marginBottom: "1rem",
                                color:
                                    "var(--text-primary)",
                            }}
                        >
                            Fraud Score
                        </h6>

                        <ProbabilityMeter
                            value={
                                prediction.fraudProbability
                            }
                        />

                        <div
                            style={{
                                marginTop: "1rem",
                                display: "flex",
                                justifyContent:
                                    "center",
                                gap: "2rem",
                            }}
                        >

                            <div
                                style={{
                                    textAlign: "center",
                                }}
                            >

                                <div
                                    style={{
                                        fontSize:
                                            "1.2rem",
                                        fontWeight: 800,
                                        color:
                                            "#C62828",
                                    }}
                                >
                                    {prediction.fraudScore}
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            "0.75rem",
                                        color:
                                            "#6B7280",
                                    }}
                                >
                                    Fraud Score
                                </div>

                            </div>


                            <div
                                style={{
                                    textAlign: "center",
                                }}
                            >

                                <div
                                    style={{
                                        fontSize:
                                            "1.2rem",
                                        fontWeight: 800,
                                        color:
                                            "#1565C0",
                                    }}
                                >
                                    {prediction.confidence}%
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            "0.75rem",
                                        color:
                                            "#6B7280",
                                    }}
                                >
                                    Confidence
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ------------------------------------------
                        ANALYSIS SCORES
                    ------------------------------------------ */}

                    <div className="data-card">

                        <h6
                            style={{
                                fontWeight: 700,
                                marginBottom: "1rem",
                                color:
                                    "var(--text-primary)",
                            }}
                        >
                            Analysis Scores
                        </h6>

                        {[
                            {
                                label:
                                    "Confidence Score",

                                value:
                                    `${prediction.confidence}%`,

                                color:
                                    "#1565C0",
                            },

                            {
                                label:
                                    "Fraud Score",

                                value:
                                    prediction.fraudScore,

                                color:
                                    "#C62828",
                            },

                            {
                                label:
                                    "Risk Level",

                                value:
                                    risk,

                                isBadge:
                                    true,
                            },

                            {
                                label:
                                    "Verdict",

                                value:
                                    prediction.prediction,

                                color:
                                    isFraud
                                        ? "#C62828"
                                        : "#2E7D32",
                            },

                        ].map(
                            ({
                                label,
                                value,
                                color,
                                isBadge,
                            }) => (

                                <div
                                    key={label}
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        padding:
                                            "0.625rem 0",
                                        borderBottom:
                                            "1px solid var(--border)",
                                    }}
                                >

                                    <span
                                        style={{
                                            fontSize:
                                                "0.875rem",
                                            color:
                                                "var(--text-secondary)",
                                        }}
                                    >
                                        {label}
                                    </span>

                                    {isBadge ? (

                                        <span
                                            className={
                                                riskLevelClass(
                                                    value
                                                )
                                            }
                                        >
                                            {value}
                                        </span>

                                    ) : (

                                        <span
                                            style={{
                                                fontWeight:
                                                    700,
                                                color:
                                                    color ||
                                                    "var(--text-primary)",
                                            }}
                                        >
                                            {value}
                                        </span>

                                    )}

                                </div>
                            )
                        )}

                    </div>

                </div>


                {/* ==================================================
                    RIGHT COLUMN
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                    }}
                >

                    {/* ------------------------------------------
                        RISK FACTORS
                    ------------------------------------------ */}

                    <div className="data-card">

                        <h6
                            style={{
                                fontWeight: 700,
                                marginBottom: "1rem",
                                color:
                                    "var(--text-primary)",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "0.5rem",
                            }}
                        >

                            <FiAlertTriangle
                                size={16}
                                color="#E65100"
                            />

                            Risk Factors Detected

                        </h6>


                        {prediction.reasons?.length > 0 ? (

                            <ul
                                style={{
                                    listStyle:
                                        "none",
                                    padding: 0,
                                    margin: 0,
                                }}
                            >

                                {prediction.reasons.map(
                                    (reason, index) => (

                                        <li
                                            key={index}
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "flex-start",
                                                gap:
                                                    "0.625rem",
                                                padding:
                                                    "0.5rem 0",
                                                borderBottom:
                                                    "1px solid var(--border-light)",
                                                fontSize:
                                                    "0.875rem",
                                                color:
                                                    "var(--text-primary)",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        "#FFEBEE",
                                                    color:
                                                        "#C62828",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    fontSize:
                                                        "0.7rem",
                                                    fontWeight:
                                                        700,
                                                    flexShrink:
                                                        0,
                                                    marginTop:
                                                        2,
                                                }}
                                            >
                                                {index + 1}
                                            </span>

                                            {reason}

                                        </li>
                                    )
                                )}

                            </ul>

                        ) : (

                            <p
                                style={{
                                    color:
                                        "var(--text-secondary)",
                                    margin: 0,
                                }}
                            >
                                No specific risk factors
                                were returned by the
                                prediction model.
                            </p>

                        )}

                    </div>


                    {/* ------------------------------------------
                        RECOMMENDED ACTION
                    ------------------------------------------ */}

                    <div
                        className="data-card"
                        style={{
                            background:
                                isFraud
                                    ? "#FFF8E1"
                                    : "#F0FDF4",

                            border:
                                `1px solid ${
                                    isFraud
                                        ? "#FFE082"
                                        : "#A7F3D0"
                                }`,
                        }}
                    >

                        <h6
                            style={{
                                fontWeight: 700,
                                marginBottom:
                                    "0.75rem",
                                color:
                                    "var(--text-primary)",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "0.5rem",
                            }}
                        >

                            <FiCheckCircle
                                size={16}
                                color={
                                    isFraud
                                        ? "#E65100"
                                        : "#2E7D32"
                                }
                            />

                            Recommended Action

                        </h6>

                        <p
                            style={{
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                                color:
                                    "var(--text-primary)",
                                margin: 0,
                            }}
                        >
                            {
                                prediction.recommendedAction
                            }
                        </p>

                    </div>


                    {/* ------------------------------------------
                        ACTION BUTTONS
                    ------------------------------------------ */}

                    <div
                        style={{
                            display: "flex",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                        }}
                    >

                        <button
                            className="btn-hg btn-outline-hg"
                            onClick={() =>
                                navigate(
                                    `/claims/${id}`
                                )
                            }
                        >
                            <FiArrowLeft size={15} />
                            Back to Claim
                        </button>


                        <button
                            className="btn-hg btn-secondary-hg"
                            onClick={() =>
                                window.print()
                            }
                        >
                            <FiDownload size={15} />
                            Download / Print Report
                        </button>


                        {isFraud && (

                            <button
                                className="btn-hg btn-danger-hg"
                                onClick={() =>
                                    alert(
                                        "Claim flagged for review."
                                    )
                                }
                            >
                                <FiFlag size={15} />
                                Flag for Review
                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}