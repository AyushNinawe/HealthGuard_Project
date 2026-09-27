const { predictFraud } = require("./services/pythonService");

const claimData = {
    claim_amount: 250000,
    claim_type: "Accident",
    hospital_name: "Apollo Hospital",
    vehicle_age: 12,
    police_report: 1,
    incident_location: "Pune",
    claim_status: "Pending"
};

async function test() {
    try {
        const result = await predictFraud(claimData);
        console.log("Prediction Result:");
        console.log(result);
    } catch (error) {
        console.error("Error:");
        console.error(error);
    }
}

test();