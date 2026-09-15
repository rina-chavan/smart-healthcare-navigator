// ADD PATIENT
document.getElementById("patientForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const patientData = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        symptoms: document.getElementById("symptoms").value,
        priority: document.getElementById("priority").value
    };

    try {

        const response = await fetch("/patients", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(patientData)
        });

        const result = await response.json();

        document.getElementById("message").innerText = result.message;

        document.getElementById("patientForm").reset();

    } catch (error) {

        document.getElementById("message").innerText =
            "Error adding patient";

        console.error(error);
    }
});


// VIEW ALL PATIENTS
async function loadPatients() {

    try {

        const response = await fetch("/patients");

        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const patients = await response.json();
        // DASHBOARD COUNTS
document.getElementById("totalPatients").innerText = patients.length;

document.getElementById("highPatients").innerText =
    patients.filter(patient => patient.priority === "High").length;

document.getElementById("mediumPatients").innerText =
    patients.filter(patient => patient.priority === "Medium").length;

document.getElementById("lowPatients").innerText =
    patients.filter(patient => patient.priority === "Low").length;

        const patientList = document.getElementById("patientList");

        patientList.innerHTML = "";

        patients.forEach(function(patient, index) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${patient.patient_id}</td>
                <td>${patient.name}</td>
                <td>${patient.age}</td>
                <td>${patient.gender}</td>
                <td>${patient.symptoms}</td>
                <td class="${patient.priority.toLowerCase()}">
                ${patient.priority}
                </td>
                <td>${index * 10} minutes</td>
            `;

            patientList.appendChild(row);
        });

    } catch (error) {

        console.error("Error:", error);

        alert("Error loading patients");
    }
}
// SEARCH PATIENT
async function searchPatients() {

    const searchText = document.getElementById("searchPatient").value
        .trim()
        .toLowerCase();

    if (searchText === "") {
        alert("Please enter a patient name");
        return;
    }

    try {

        const response = await fetch("/patients");

        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const patients = await response.json();

        const filteredPatients = patients.filter(function(patient) {
            return patient.name.toLowerCase().includes(searchText);
        });

        const patientList = document.getElementById("patientList");

        patientList.innerHTML = "";

        filteredPatients.forEach(function(patient, index) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${patient.patient_id}</td>
                <td>${patient.name}</td>
                <td>${patient.age}</td>
                <td>${patient.gender}</td>
                <td>${patient.symptoms}</td>
                <td class="${patient.priority.toLowerCase()}">
                    ${patient.priority}
                </td>
                <td>${index * 10} minutes</td>
            `;

            patientList.appendChild(row);
        });

        if (filteredPatients.length === 0) {
            alert("Patient not found");
        }

    } catch (error) {

        console.error("Error:", error);

        alert("Error searching patients");
    }
}