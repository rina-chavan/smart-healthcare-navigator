/* =====================================================
   SMART HEALTHCARE NAVIGATOR
   CLEAN SCRIPT - PART 1
===================================================== */

let allPatients = [];
let allDoctors = [];
let highPriorityMode = false;
// =====================================================
// SMART SYMPTOM → DEPARTMENT RECOMMENDATION
// =====================================================

let symptomTimer = null;

function recommendDepartmentFromSymptoms() {

    const symptomsElement =
        getElement("symptoms");

    if (!symptomsElement) {
        return;
    }

    const symptoms =
        normalize(symptomsElement.value);

    // Nothing entered
    if (!symptoms) {
        return;
    }

    // Wait until user stops typing
    clearTimeout(symptomTimer);

    symptomTimer = setTimeout(
        function () {

            let recommendedDepartment = "";

            // Cardiology
            if (
                symptoms.includes("chest pain") ||
                symptoms.includes("heart pain") ||
                symptoms.includes("palpitation") ||
                symptoms.includes("breathing problem") ||
                symptoms.includes("shortness of breath")
            ) {

                recommendedDepartment =
                    "Cardiology";
            }

            // Neurology
            else if (
                symptoms.includes("severe headache") ||
                symptoms.includes("migraine") ||
                symptoms.includes("dizziness") ||
                symptoms.includes("seizure") ||
                symptoms.includes("numbness")
            ) {

                recommendedDepartment =
                    "Neurology";
            }

            // Orthopedics
            else if (
                symptoms.includes("fracture") ||
                symptoms.includes("bone pain") ||
                symptoms.includes("joint pain") ||
                symptoms.includes("back pain") ||
                symptoms.includes("leg pain") ||
                symptoms.includes("arm pain")
            ) {

                recommendedDepartment =
                    "Orthopedics";
            }

            // Ophthalmology
            else if (
                symptoms.includes("eye pain") ||
                symptoms.includes("eye problem") ||
                symptoms.includes("blurred vision") ||
                symptoms.includes("vision problem") ||
                symptoms.includes("red eye")
            ) {

                recommendedDepartment =
                    "Ophthalmology";
            }

            // General Medicine
            else if (
                symptoms.includes("fever") ||
                symptoms.includes("cold") ||
                symptoms.includes("cough") ||
                symptoms.includes("body pain") ||
                symptoms.includes("sore throat")
            ) {

                recommendedDepartment =
                    "General Medicine";
            }


            // If a department was found
            if (recommendedDepartment) {

                const department =
                    getElement("department");

                if (department) {

                    // Check that department exists
                    const exists =
                        [...department.options].some(
                            option =>
                                normalize(
                                    option.value
                                ) ===
                                normalize(
                                    recommendedDepartment
                                )
                        );

                    if (exists) {

                        department.value =
                            recommendedDepartment;

                        // Load doctors automatically
                        loadDoctorsByDepartment();

                        showDepartmentRecommendation(
                            recommendedDepartment
                        );
                    }
                }
            }

        },
        700
    );
}


function showDepartmentRecommendation(
    department
) {

    const box =
        getElement(
            "doctorRecommendation"
        );

    if (!box) {
        return;
    }

    box.innerHTML = `
        <div style="
            background:#f0fdf4;
            border:1px solid #86efac;
            border-radius:12px;
            padding:12px 15px;
            margin-top:10px;
            color:#166534;
            font-weight:600;
        ">

            💡 Smart Department Suggested:
            <strong>
                ${escapeHTML(department)}
            </strong>

        </div>
    `;

    box.style.display = "block";
}


/* =====================================================
   COMMON HELPERS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}


function setText(id, value) {

    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}


function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase();
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Smart Healthcare Navigator loaded.");


    /* Load existing database data */

    loadDoctors();

    loadPatients();


    /* Patient registration */

    const patientForm = getElement("patientForm");

    if (patientForm) {

        patientForm.addEventListener(
            "submit",
            registerPatient
        );
    }


    /* Department selection */

    const department = getElement("department");

    if (department) {

        department.addEventListener(
            "change",
            loadDoctorsByDepartment
        );
    }


    /* Doctor selection */

    const doctor = getElement("doctor");

    if (doctor) {

        doctor.addEventListener(
            "change",
            predictPriority
        );
    }


    /* Age */

    const age = getElement("age");

    if (age) {

        age.addEventListener(
            "input",
            predictPriority
        );
    }


    /* Gender */

    const gender = getElement("gender");

    if (gender) {

        gender.addEventListener(
            "change",
            predictPriority
        );
    }


    /* Symptoms */

    const symptoms = getElement("symptoms");

if (symptoms) {

    symptoms.addEventListener(
        "input",
        function () {

            recommendDepartmentFromSymptoms();

            predictPriority();

        }
    );
}


    /* Patient search */

    const search = getElement("searchPatient");

    if (search) {

        search.addEventListener(
            "input",
            searchPatients
        );
    }


    /* Doctor filter */

    const doctorFilter = getElement("doctorFilter");

    if (doctorFilter) {

        doctorFilter.addEventListener(
            "change",
            filterByDoctor
        );
    }


    console.log(
        "All healthcare application controls connected."
    );

});
/* =====================================================
   LOAD PATIENTS
===================================================== */

async function loadPatients() {

    try {

        const response = await fetch("/patients");

        if (!response.ok) {
            throw new Error("Unable to load patients");
        }

        allPatients = await response.json();

        console.log(
            "Patients loaded:",
            allPatients.length
        );

        updateDashboard();
        updateQueuePrediction();
        updateAnalytics();
        displayPatients(allPatients);

    } catch (error) {

        console.error(
            "Patient loading error:",
            error
        );
    }
}


/* =====================================================
   DASHBOARD COUNTS
===================================================== */

function updateDashboard() {

    const total = allPatients.length;

    const waiting = allPatients.filter(
        patient =>
            normalize(patient.status) === "waiting"
    ).length;

    const consultation = allPatients.filter(
        patient =>
            normalize(patient.status) === "in consultation"
    ).length;

    const completed = allPatients.filter(
        patient =>
            normalize(patient.status) === "completed"
    ).length;


    const high = allPatients.filter(
        patient =>
            normalize(patient.priority) === "high"
    ).length;

    const medium = allPatients.filter(
        patient =>
            normalize(patient.priority) === "medium"
    ).length;

    const low = allPatients.filter(
        patient =>
            normalize(patient.priority) === "low"
    ).length;


    setText("totalPatients", total);

    setText("waitingPatients", waiting);

    setText(
        "consultationPatients",
        consultation
    );

    setText(
        "completedPatients",
        completed
    );


    setText(
        "highPatients",
        high
    );

    setText(
        "mediumPatients",
        medium
    );

    setText(
        "lowPatients",
        low
    );
}


/* =====================================================
   QUEUE PREDICTION
===================================================== */

function calculateEstimatedWait(patient, allPatientsList) {

    if (normalize(patient.status) !== "waiting") {
        return 0;
    }

    const priorityValue = {
        high: 1,
        medium: 2,
        low: 3
    };

    const patientPriority =
        priorityValue[normalize(patient.priority)] || 4;

    const sameDoctorPatients =
        allPatientsList.filter(function (item) {

            return normalize(item.doctor) ===
                   normalize(patient.doctor);

        });

    let patientsAhead = 0;

    sameDoctorPatients.forEach(function (item) {

        if (item.patient_id === patient.patient_id) {
            return;
        }

        const itemStatus =
            normalize(item.status);

        if (
            itemStatus === "completed"
        ) {
            return;
        }

        const itemPriority =
            priorityValue[
                normalize(item.priority)
            ] || 4;

        if (itemPriority < patientPriority) {

            patientsAhead++;

        } else if (
            itemPriority === patientPriority &&
            Number(item.patient_id) <
            Number(patient.patient_id)
        ) {

            patientsAhead++;
        }

    });

    const consultingSameDoctor =
        sameDoctorPatients.filter(function (item) {

            return normalize(item.status) ===
                   "in consultation";

        }).length;

    const estimatedWait =
        (patientsAhead + consultingSameDoctor) * 10;

    return estimatedWait;
}


function updateQueuePrediction() {

    const total =
        allPatients.length;

    const highWaiting =
        allPatients.filter(function (patient) {

            return normalize(patient.priority) === "high" &&
                   normalize(patient.status) === "waiting";

        }).length;

    const waiting =
        allPatients.filter(function (patient) {

            return normalize(patient.status) === "waiting";

        }).length;

    const consulting =
        allPatients.filter(function (patient) {

            return normalize(patient.status) ===
                   "in consultation";

        }).length;


    /* ==========================================
       DASHBOARD QUEUE COUNTS
    ========================================== */

    setText(
        "predictionTotal",
        total
    );

    setText(
        "predictionHigh",
        highWaiting
    );

    setText(
        "predictionWaiting",
        waiting
    );

    setText(
        "predictionConsulting",
        consulting
    );


    /* ==========================================
       ESTIMATED WAITING TIME
    ========================================== */

    const waitingPatients =
        allPatients.filter(function (patient) {

            return normalize(patient.status) ===
                   "waiting";

        });


    let averageWait = 0;


    if (waitingPatients.length > 0) {

        const waitTimes =
            waitingPatients.map(function (patient) {

                return calculateEstimatedWait(
                    patient,
                    allPatients
                );

            });


        averageWait =
            Math.round(
                waitTimes.reduce(
                    function (sum, time) {
                        return sum + time;
                    },
                    0
                ) /
                waitTimes.length
            );
    }


    setText(
        "predictionWaitTime",
        averageWait + " min"
    );


    /* ==========================================
       QUEUE MESSAGE
    ========================================== */

    let message =
        "No patients are currently waiting.";


    if (waiting > 0) {

        if (highWaiting > 0) {

            message =
                "High-priority patients are handled first.";

        } else {

            message =
                "Patients are being served according to queue priority.";
        }
    }


    setText(
        "predictionMessage",
        message
    );
}
/* =====================================================
   PATIENT REGISTRATION
===================================================== */

async function registerPatient(event) {

    event.preventDefault();


    const name = getElement("name")?.value.trim();
    const age = getElement("age")?.value;
    const gender = getElement("gender")?.value;
    const department = getElement("department")?.value;
    const doctor = getElement("doctor")?.value;
    const priority = getElement("priority")?.value;
    const symptoms = getElement("symptoms")?.value.trim();


    if (
        !name ||
        !age ||
        !gender ||
        !department ||
        !doctor ||
        !priority
    ) {

        showMessage(
            "Please fill all required fields.",
            "error"
        );

        return;
    }


    const patientData = {

        name: name,

        age: Number(age),

        gender: gender,

        department: department,

        doctor: doctor,

        priority: priority,

        symptoms: symptoms
    };


    try {

        const response = await fetch(
            "/patients",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(patientData)
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Unable to register patient."
            );
        }


        showMessage(
            "Patient registered successfully!",
            "success"
        );


        const form =
            getElement("patientForm");

        if (form) {
            form.reset();
        }


        const recommendation =
            getElement(
                "doctorRecommendation"
            );

        if (recommendation) {

            recommendation.style.display =
                "none";

            recommendation.innerHTML = "";
        }


        const mlMessage =
            getElement(
                "mlPriorityMessage"
            );

        if (mlMessage) {

            mlMessage.style.display =
                "none";

            mlMessage.innerHTML = "";
        }


        await loadPatients();


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            error.message ||
            "Patient registration failed.",
            "error"
        );
    }
}


/* =====================================================
   MESSAGE BOX
===================================================== */

function showMessage(text, type) {

    const message =
        getElement("message");


    if (!message) {
        return;
    }


    message.textContent = text;

    message.className =
        "message " + type;


    message.style.display =
        "block";


    setTimeout(function () {

        message.style.display =
            "none";

    }, 4000);
}


/* =====================================================
   ML PRIORITY PREDICTION
===================================================== */

let predictionTimer = null;
let predictionRequest = null;

function predictPriority() {

    // Stop previous timer
    if (predictionTimer) {
        clearTimeout(predictionTimer);
    }

    // Wait until the user stops typing
    predictionTimer = setTimeout(
        runPriorityPrediction,
        600
    );
}


async function runPriorityPrediction() {

    const age =
        getElement("age")?.value;

    const gender =
        getElement("gender")?.value;

    const department =
        getElement("department")?.value;

    const symptoms =
        getElement("symptoms")?.value.trim();


    // Do not predict until all information is available
    if (
        !age ||
        !gender ||
        !department ||
        !symptoms
    ) {

        hideMLPrediction();

        return;
    }


    // Cancel previous request if possible
    if (
        predictionRequest &&
        predictionRequest.abort
    ) {
        predictionRequest.abort();
    }


    predictionRequest =
        new AbortController();


    try {

        const response =
            await fetch(
                "/api/predict-priority",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        age: Number(age),

                        gender: gender,

                        department:
                            department,

                        symptoms:
                            symptoms

                    }),

                    signal:
                        predictionRequest.signal
                }
            );


        if (!response.ok) {

            throw new Error(
                "ML prediction failed"
            );

        }


        const result =
            await response.json();


        const predictedPriority =
            result.predicted_priority;


        if (predictedPriority) {

            const prioritySelect =
                getElement("priority");


            if (prioritySelect) {

                prioritySelect.value =
                    predictedPriority;

            }


            showMLPrediction(
                predictedPriority
            );

        }


    } catch (error) {

        if (
            error.name !==
            "AbortError"
        ) {

            console.error(
                "ML prediction error:",
                error
            );

        }

    } finally {

        predictionRequest = null;

    }
}


function hideMLPrediction() {

    const box =
        getElement(
            "mlPriorityMessage"
        );


    if (box) {

        box.style.display =
            "none";

        box.innerHTML =
            "";

    }

}
/* =====================================================
   SHOW ML PREDICTION
===================================================== */

function showMLPrediction(priority) {

    const box =
        getElement(
            "mlPriorityMessage"
        );


    if (!box) {
        return;
    }


    const p =
        normalize(priority);


    let icon = "🤖";
    let text = "ML Priority Prediction";


    if (p === "high") {

        icon = "🔴";

        text =
            "ML Prediction: HIGH Priority";

    } else if (p === "medium") {

        icon = "🟠";

        text =
            "ML Prediction: MEDIUM Priority";

    } else if (p === "low") {

        icon = "🟢";

        text =
            "ML Prediction: LOW Priority";
    }


    box.innerHTML =
        `<strong>${icon} ${escapeHTML(text)}</strong>
         <span>Priority automatically predicted using the trained ML model.</span>`;


    box.style.display =
        "block";
}
/* =====================================================
   LOAD DOCTORS FROM DATABASE
===================================================== */

async function loadDoctors() {

    try {

        const response =
            await fetch("/api/doctors");


        if (!response.ok) {

            throw new Error(
                "Unable to load doctors"
            );
        }


        const data =
            await response.json();


        allDoctors =
            Array.isArray(data)
                ? data
                : (data.doctors || []);


        console.log(
            "Doctors loaded:",
            allDoctors.length
        );


        loadDoctorFilter();

        loadDepartments();

        displayDoctors();
updateAnalytics();
updateDoctorAnalytics();

    } catch (error) {

        console.error(
            "Doctor loading error:",
            error
        );
    }
}


/* =====================================================
   DOCTOR FILTER
===================================================== */

function loadDoctorFilter() {

    const filter =
        getElement("doctorFilter");


    if (!filter) {
        return;
    }


    filter.innerHTML = `
        <option value="">
            All Doctors
        </option>
    `;


    allDoctors.forEach(function (doctor) {

        if (!doctor.name) {
            return;
        }


        const option =
            document.createElement("option");


        option.value =
            doctor.name;


        option.textContent =
            doctor.name;


        filter.appendChild(option);

    });
}


/* =====================================================
   DEPARTMENT DROPDOWN
===================================================== */

function loadDepartments() {

    const department =
        getElement("department");


    if (!department) {
        return;
    }


    const departments =
        [
            ...new Set(
                allDoctors
                    .map(
                        doctor =>
                            doctor.department
                    )
                    .filter(Boolean)
            )
        ];


    department.innerHTML = `
        <option value="">
            Select Department
        </option>
    `;


    departments.forEach(
        function (name) {

            const option =
                document.createElement(
                    "option"
                );


            option.value = name;

            option.textContent = name;


            department.appendChild(
                option
            );
        }
    );
}


/* =====================================================
   LOAD DOCTORS WHEN DEPARTMENT CHANGES
===================================================== */

function loadDoctorsByDepartment() {

    const department =
        getElement("department");

    const doctor =
        getElement("doctor");

    if (!department || !doctor) {
        return;
    }

    const selectedDepartment =
        department.value;


    // Clear doctor list first
    doctor.innerHTML = `
        <option value="">
            Selecting doctor...
        </option>
    `;


    // No department selected
    if (!selectedDepartment) {

        doctor.innerHTML = `
            <option value="">
                Select Doctor
            </option>
        `;

        const recommendation =
            getElement(
                "doctorRecommendation"
            );

        if (recommendation) {

            recommendation.style.display =
                "none";

            recommendation.innerHTML =
                "";

        }

        return;
    }


    // Find doctors in selected department
    const doctors =
        allDoctors.filter(
            function (item) {

                return normalize(
                    item.department
                ) ===
                normalize(
                    selectedDepartment
                );

            }
        );


    // Add doctors to dropdown
    doctors.forEach(
        function (item) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item.name;

            option.textContent =
                item.name;

            doctor.appendChild(
                option
            );

        }
    );


    // Automatically recommend doctor
    recommendDoctor(
        selectedDepartment
    );


    // Run ML priority prediction
    predictPriority();
}
/* =====================================================
   SMART DOCTOR RECOMMENDATION
===================================================== */

async function recommendDoctor(department) {

    const box =
        getElement(
            "doctorRecommendation"
        );


    if (!department) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/recommend-doctor/" +
                encodeURIComponent(
                    department
                )
            );


        if (!response.ok) {

            throw new Error(
                "Recommendation failed"
            );

        }


        const data =
            await response.json();


        // Get recommended doctor
        const recommendedDoctor =
            data.doctor;


        if (
            !recommendedDoctor ||
            !recommendedDoctor.name
        ) {

            if (box) {

                box.innerHTML = `
                    <div style="
                        background:#fff7ed;
                        border:1px solid #fed7aa;
                        border-radius:12px;
                        padding:12px;
                        margin-top:10px;
                        color:#9a3412;
                    ">
                        ⚠️ No available doctor found
                        for this department.
                    </div>
                `;

                box.style.display =
                    "block";

            }

            return;
        }


        const doctorName =
            recommendedDoctor.name;


        // Show recommendation
        if (box) {

            box.innerHTML = `
                <div style="
                    background:
                    linear-gradient(
                        135deg,
                        #e0f7fa,
                        #e0f2fe
                    );
                    border:
                    1px solid #67e8f9;
                    border-radius:12px;
                    padding:12px 15px;
                    margin-top:10px;
                    color:#075985;
                    font-weight:600;
                ">

                    🧠 Smart Doctor Selected:
                    <strong>
                        ${escapeHTML(
                            doctorName
                        )}
                    </strong>

                </div>
            `;

            box.style.display =
                "block";

        }


        // Automatically select doctor
        const doctorSelect =
            getElement("doctor");


        if (doctorSelect) {

            doctorSelect.value =
                doctorName;

        }


        // Run priority prediction
        predictPriority();


    } catch (error) {

        console.error(
            "Doctor recommendation error:",
            error
        );

    }
}
/* =====================================================
   PATIENT QUEUE DISPLAY
===================================================== */

function displayPatients(patients) {

    const patientList =
        getElement("patientList");

    if (!patientList) {
        return;
    }


    if (!patients || patients.length === 0) {

        patientList.innerHTML = `
            <tr>
                <td
                    colspan="12"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#64748b;
                        font-weight:600;
                    "
                >
                    🔍 No patients found.
                </td>
            </tr>
        `;

        return;
    }


    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
    };


    const sortedPatients =
        [...patients].sort(
            function(a, b) {

                const first =
                    priorityOrder[
                        normalize(a.priority)
                    ] || 4;

                const second =
                    priorityOrder[
                        normalize(b.priority)
                    ] || 4;

                return first - second;

            }
        );


    patientList.innerHTML =
        sortedPatients.map(
            function(patient, index) {

                const id =
                    patient.patient_id ??
                    patient.id ??
                    "";


                const name =
                    patient.name ?? "";


                const age =
                    patient.age ?? "";


                const gender =
                    patient.gender ?? "";


                const symptoms =
                    patient.symptoms ?? "";


                const department =
                    patient.department ?? "";


                const doctor =
                    patient.doctor ?? "";


                const priority =
                    patient.priority ?? "";


                const status =
                    patient.status ??
                    "Waiting";


                let waitingTime = 0;

if (normalize(status) === "waiting") {

    const patientsAhead =
        sortedPatients
            .slice(0, index)
            .filter(function(item) {

                if (
                    normalize(item.status) ===
                    "completed"
                ) {
                    return false;
                }

                return normalize(item.doctor) ===
                       normalize(doctor);
            });

    waitingTime =
        patientsAhead.length * 10;
}


                // ==================================
                // PRIORITY STYLE
                // ==================================

                let priorityClass =
                    "priority-low";


                if (
                    normalize(priority) === "high"
                ) {

                    priorityClass =
                        "priority-high";

                } else if (
                    normalize(priority) === "medium"
                ) {

                    priorityClass =
                        "priority-medium";

                }


                // ==================================
                // STATUS
                // ==================================

                let statusHTML = "";


                if (
                    normalize(status) ===
                    "waiting"
                ) {

                    statusHTML = `
                        <span class="status-waiting">
                            🟡 Waiting
                        </span>
                    `;

                } else if (
                    normalize(status) ===
                    "in consultation"
                ) {

                    statusHTML = `
                        <span class="status-consultation">
                            🟢 In Consultation
                        </span>
                    `;

                } else {

                    statusHTML = `
                        <span class="status-completed">
                            🔵 Completed
                        </span>
                    `;

                }


                // ==================================
                // ACTION BUTTON
                // ==================================

                let actionHTML = "";


                if (
                    normalize(status) ===
                    "waiting"
                ) {

                    actionHTML = `
                        <button
                            class="action-btn consult-btn"
                            onclick="
                                startConsultation(${id})
                            "
                        >
                            ▶ Start
                        </button>
                    `;

                } else if (
                    normalize(status) ===
                    "in consultation"
                ) {

                    actionHTML = `
                        <button
                            class="action-btn complete-btn"
                            onclick="
                                completeConsultation(${id})
                            "
                        >
                            ✓ Complete
                        </button>
                    `;

                } else {

                    actionHTML = `
                        <span style="
                            color:#16a34a;
                            font-weight:700;
                        ">
                            ✓ Done
                        </span>
                    `;

                }


                // ==================================
                // TABLE ROW
                // ==================================

                return `
                    <tr>

                        <td>
                            <strong>
                                ${index + 1}
                            </strong>
                        </td>


                        <td>
                            ${escapeHTML(id)}
                        </td>


                        <td>
                            <strong>
                                ${escapeHTML(name)}
                            </strong>
                        </td>


                        <td>
                            ${escapeHTML(age)}
                        </td>


                        <td>
                            ${escapeHTML(gender)}
                        </td>


                        <td>
                            ${escapeHTML(symptoms)}
                        </td>


                        <td>
                            ${escapeHTML(department)}
                        </td>


                        <td>
                            ${escapeHTML(doctor)}
                        </td>


                        <td>
                            <span
                                class="${priorityClass}"
                            >
                                ${escapeHTML(priority)}
                            </span>
                        </td>


                        <td>
                            ${statusHTML}
                        </td>


                        <td>
                            <strong>
                                ${waitingTime} min
                            </strong>
                        </td>


                        <td>
                            ${actionHTML}
                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* =====================================================
   SEARCH PATIENTS
===================================================== */

function searchPatients() {

    applyPatientFilters();
}


/* =====================================================
   APPLY SEARCH + FILTERS
===================================================== */

function applyPatientFilters() {

    let patients =
        [...allPatients];


    const searchInput =
        getElement(
            "searchPatient"
        );


    const doctorFilter =
        getElement(
            "doctorFilter"
        );


    const searchValue =
        normalize(
            searchInput
                ? searchInput.value
                : ""
        );


    const doctorValue =
        normalize(
            doctorFilter
                ? doctorFilter.value
                : ""
        );


    /* -----------------------------
       SEARCH
    ----------------------------- */

    if (searchValue) {

        patients =
            patients.filter(
                function (patient) {

                    const searchable =
                        [

                            patient.patient_id,

                            patient.id,

                            patient.name,

                            patient.age,

                            patient.gender,

                            patient.symptoms,

                            patient.department,

                            patient.doctor,

                            patient.priority,

                            patient.status,

                            patient.waiting_time

                        ]
                        .join(" ")
                        .toLowerCase();


                    return searchable
                        .includes(
                            searchValue
                        );
                }
            );
    }


    /* -----------------------------
       DOCTOR FILTER
    ----------------------------- */

    if (
        doctorValue &&
        doctorValue !== "all"
    ) {

        patients =
            patients.filter(
                function (patient) {

                    return normalize(
                        patient.doctor
                    ) === doctorValue;
                }
            );
    }


    /* -----------------------------
       HIGH PRIORITY FILTER
    ----------------------------- */

    if (highPriorityMode) {

        patients =
            patients.filter(
                function (patient) {

                    return normalize(
                        patient.priority
                    ) === "high";
                }
            );
    }


    displayPatients(patients);
}


/* =====================================================
   HIGH PRIORITY BUTTON
===================================================== */

function filterHighPriority() {

    highPriorityMode =
        !highPriorityMode;


    const button =
        getElement(
            "highPriorityButton"
        );


    if (button) {

        if (highPriorityMode) {

            button.innerHTML =
                "🔴 Showing High Priority";


            button.style.background =
                "linear-gradient(135deg,#dc2626,#ef4444)";


            button.style.color =
                "#ffffff";

        } else {

            button.innerHTML =
                "🔴 High Priority";


            button.style.background =
                "";

            button.style.color =
                "";
        }
    }


    applyPatientFilters();
}


/* =====================================================
   DOCTOR FILTER
===================================================== */

function filterByDoctor() {

    applyPatientFilters();
}
/* =====================================================
   SMART HEALTHCARE NAVIGATOR
   CLEAN SCRIPT - PART 6
===================================================== */

async function startConsultation(patientId) {

    try {

        const response = await fetch(
            `/patients/${patientId}/consult`,
            {
                method: "PUT"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to start consultation."
            );
        }

        showMessage(
            "Consultation started successfully!",
            "success"
        );

        await loadPatients();

    } catch (error) {

        console.error(
            "Start consultation error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to start consultation.",
            "error"
        );
    }
}


async function completeConsultation(patientId) {

    try {

        const response = await fetch(
            `/patients/${patientId}/complete`,
            {
                method: "PUT"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to complete consultation."
            );
        }

        showMessage(
            "Consultation completed successfully!",
            "success"
        );

        await loadPatients();

    } catch (error) {

        console.error(
            "Complete consultation error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to complete consultation.",
            "error"
        );
    }
}


/* =====================================================
   DOCTOR DISPLAY
===================================================== */

function displayDoctors() {

    const doctorList =
        getElement("doctorList");

    if (!doctorList) {
        return;
    }

    if (!allDoctors || allDoctors.length === 0) {

        doctorList.innerHTML = `
            <div style="
                padding:25px;
                text-align:center;
                color:#64748b;
                font-weight:600;
            ">
                👨‍⚕️ No doctors available.
            </div>
        `;

        setText("totalDoctors", 0);
        setText("availableDoctors", 0);

        return;
    }

    const availableDoctors =
        allDoctors.filter(function (doctor) {

            return normalize(
                doctor.status
            ) === "available";

        }).length;

    setText(
        "totalDoctors",
        allDoctors.length
    );

    setText(
        "availableDoctors",
        availableDoctors
    );


    doctorList.innerHTML =
        allDoctors.map(function (doctor) {

            const name =
                doctor.name || "Unknown Doctor";

            const department =
                doctor.department || "General";

            const status =
                doctor.status || "Unavailable";

            const patientsCount =
    allPatients.filter(function(patient) {

        return normalize(patient.doctor) ===
               normalize(name) &&
               normalize(patient.status) !==
               "completed";

    }).length;

            const rating =
                doctor.rating !== undefined
                    ? doctor.rating
                    : "N/A";

            const isAvailable =
                normalize(status)
                === "available";


            return `
                <div class="doctor-card">

                    <div class="doctor-top">

                        <div class="doctor-icon">
                            👨‍⚕️
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(name)}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    department
                                )}
                            </p>

                        </div>

                    </div>


                    <div class="
                        availability
                        ${isAvailable
                            ? "available"
                            : "unavailable"}
                    ">

                        ${isAvailable
                            ? "🟢 Available"
                            : "🔴 Unavailable"}

                    </div>


                    <p>
                        👥 Current Patients:
                        <strong>
                            ${patientsCount}
                        </strong>
                    </p>


                    <p>
                        ⭐ Rating:
                        <strong>
                            ${escapeHTML(rating)}
                        </strong>
                    </p>

                </div>
            `;

        }).join("");
}


/* =====================================================
   ANALYTICS
===================================================== */

function updateAnalytics() {

    const totalPatients =
        allPatients.length;

    const high =
        allPatients.filter(
            patient =>
                normalize(
                    patient.priority
                ) === "high"
        ).length;

    const medium =
        allPatients.filter(
            patient =>
                normalize(
                    patient.priority
                ) === "medium"
        ).length;

    const low =
        allPatients.filter(
            patient =>
                normalize(
                    patient.priority
                ) === "low"
        ).length;


    setText(
        "analyticsDepartmentCount",
        new Set(
            allDoctors
                .map(
                    doctor =>
                        doctor.department
                )
                .filter(Boolean)
        ).size
    );

    setText(
        "analyticsDoctorCount",
        allDoctors.length
    );


    const waitingTimes =
        allPatients
            .map(function (patient) {

                return Number(
                    patient.waiting_time ||
                    patient.estimated_waiting_time ||
                    patient.estimated_wait_time ||
                    0
                );

            })
            .filter(function (time) {

                return !isNaN(time) &&
                       time > 0;

            });


    let averageWait = 0;

    if (waitingTimes.length > 0) {

        averageWait =
            Math.round(
                waitingTimes.reduce(
                    (sum, time) =>
                        sum + time,
                    0
                ) /
                waitingTimes.length
            );
    }


    setText(
        "analyticsAverageWait",
        averageWait + " min"
    );

    setText(
        "analyticsHigh",
        high
    );

    setText(
        "analyticsMedium",
        medium
    );

    setText(
        "analyticsLow",
        low
    );


    updateDepartmentAnalytics();
    updateDoctorAnalytics();
}


/* =====================================================
   DEPARTMENT ANALYTICS
===================================================== */

function updateDepartmentAnalytics() {

    const container =
        getElement("departmentAnalytics");

    if (!container) {
        return;
    }


    /* ==========================================
       CREATE ALL DEPARTMENTS FROM DOCTOR DATA
       This includes departments with 0 patients.
    ========================================== */

    const departments = {};


    allDoctors.forEach(function (doctor) {

        const department =
            doctor.department || "Unknown";

        if (!departments[department]) {

            departments[department] = {
                total: 0,
                waiting: 0,
                consultation: 0,
                completed: 0
            };
        }

    });


    /* ==========================================
       ADD PATIENT INFORMATION
    ========================================== */

    allPatients.forEach(function (patient) {

        const department =
            patient.department || "Unknown";


        if (!departments[department]) {

            departments[department] = {
                total: 0,
                waiting: 0,
                consultation: 0,
                completed: 0
            };

        }


        departments[department].total++;


        const status =
            normalize(patient.status);


        if (status === "waiting") {

            departments[department].waiting++;

        }


        if (status === "in consultation") {

            departments[department].consultation++;

        }


        if (status === "completed") {

            departments[department].completed++;

        }

    });


    const names =
        Object.keys(departments);


    if (names.length === 0) {

        container.innerHTML = `
            <p style="
                color:#64748b;
                font-weight:600;
            ">
                No department analytics available.
            </p>
        `;

        return;
    }


    /* ==========================================
       DISPLAY DEPARTMENT ANALYTICS
    ========================================== */

    container.innerHTML =
        names.map(function (department) {

            const data =
                departments[department];


            return `
                <div style="
                    padding:18px;
                    margin-bottom:12px;
                    border:1px solid #dbeafe;
                    border-radius:15px;
                    background:
                        linear-gradient(
                            135deg,
                            #ffffff,
                            #f0f9ff
                        );
                    box-shadow:
                        0 5px 15px
                        rgba(15,23,42,0.06);
                ">

                    <strong style="
                        font-size:16px;
                        color:#1e3a8a;
                    ">
                        🏥 ${escapeHTML(
                            department
                        )}
                    </strong>


                    <div style="
                        margin-top:10px;
                        color:#475569;
                        font-size:14px;
                        line-height:1.8;
                    ">

                        👥 Patients:
                        <strong>
                            ${data.total}
                        </strong>

                        &nbsp; | &nbsp;

                        🟡 Waiting:
                        <strong>
                            ${data.waiting}
                        </strong>

                        &nbsp; | &nbsp;

                        🟢 Consultation:
                        <strong>
                            ${data.consultation}
                        </strong>

                        &nbsp; | &nbsp;

                        🔵 Completed:
                        <strong>
                            ${data.completed}
                        </strong>

                    </div>

                </div>
            `;

        }).join("");
}

/* =====================================================
   DOCTOR ANALYTICS - FIXED
===================================================== */

function updateDoctorAnalytics() {

    const container =
        getElement("doctorAnalytics");

    if (!container) {
        return;
    }

    /* Wait until doctor data is loaded */
    if (!allDoctors || allDoctors.length === 0) {

        container.innerHTML = `
            <p style="
                color:#64748b;
                font-weight:600;
            ">
                Loading doctor analytics...
            </p>
        `;

        return;
    }

    container.innerHTML =
        allDoctors.map(function(doctor) {

            const patientsCount =
                allPatients.filter(function(patient) {

                    return normalize(patient.doctor) ===
                           normalize(doctor.name) &&
                           normalize(patient.status) !==
                           "completed";

                }).length;

            const status =
                doctor.status ||
                "Unavailable";

            return `
                <div style="
                    padding:15px;
                    margin-bottom:10px;
                    border:1px solid #e2e8f0;
                    border-radius:12px;
                    background:#ffffff;
                ">

                    <strong>
                        👨‍⚕️ ${escapeHTML(doctor.name)}
                    </strong>

                    <div style="
                        margin-top:7px;
                        color:#475569;
                        font-size:14px;
                    ">

                        Department:
                        ${escapeHTML(doctor.department)}

                        &nbsp; | &nbsp;

                        Patients:
                        <strong>
                            ${patientsCount}
                        </strong>

                        &nbsp; | &nbsp;

                        Status:
                        <strong>
                            ${escapeHTML(status)}
                        </strong>

                    </div>

                </div>
            `;

        }).join("");
}
/* =====================================================
   SMART HEALTHCARE NAVIGATOR
   CLEAN SCRIPT - PART 7
===================================================== */


/* =====================================================
   DEPARTMENT / DOCTOR REFRESH
===================================================== */

function refreshDoctorData() {

    loadDoctors();

    loadPatients();
}


/* =====================================================
   SIMPLE QUEUE ORDER HELPER
===================================================== */

function getPriorityValue(priority) {

    const value =
        normalize(priority);

    if (value === "high") {
        return 1;
    }

    if (value === "medium") {
        return 2;
    }

    if (value === "low") {
        return 3;
    }

    return 4;
}


/* =====================================================
   QUEUE SORTING
===================================================== */

function sortPatientsByPriority(patients) {

    return [...patients].sort(
        function (a, b) {

            return (
                getPriorityValue(
                    a.priority
                ) -
                getPriorityValue(
                    b.priority
                )
            );

        }
    );
}


/* =====================================================
   CLEAR SEARCH / FILTERS
===================================================== */

function clearPatientFilters() {

    const search =
        getElement(
            "searchPatient"
        );

    const doctorFilter =
        getElement(
            "doctorFilter"
        );


    if (search) {
        search.value = "";
    }

    if (doctorFilter) {
        doctorFilter.value = "";
    }


    highPriorityMode = false;


    const button =
        getElement(
            "highPriorityButton"
        );

    if (button) {

        button.innerHTML =
            "🔴 High Priority";

        button.style.background =
            "";

        button.style.color =
            "";
    }


    displayPatients(
        allPatients
    );
}


/* =====================================================
   CONSOLE STATUS
===================================================== */

console.log(
    "✅ Smart Healthcare Navigator JavaScript loaded successfully."
);

console.log(
    "✅ Patient registration connected."
);

console.log(
    "✅ Queue management connected."
);

console.log(
    "✅ Doctor management connected."
);

console.log(
    "✅ Analytics connected."
);

console.log(
    "✅ ML priority prediction connected."
);

console.log(
    "🚀 Application ready."
);