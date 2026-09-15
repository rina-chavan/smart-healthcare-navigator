
from flask import Flask, jsonify, request, send_from_directory, session, redirect
import mysql.connector
import os
import pickle
import pandas as pd
# ==========================================
# LOAD MACHINE LEARNING PRIORITY MODEL
# ==========================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "ml",
    "priority_model.pkl"
)

with open(MODEL_PATH, "rb") as file:
    priority_model = pickle.load(file)

print("ML priority model loaded successfully")

app = Flask(__name__)
app.secret_key = "smart_healthcare_secret_2026"


@app.after_request
def add_no_cache_headers(response):

    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response

# -------------------------------------------------
# FRONTEND FOLDER
# -------------------------------------------------

FRONTEND_FOLDER = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)


# -------------------------------------------------
# DATABASE CONNECTION
# -------------------------------------------------

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Meena@9594#",
        database="smart_healthcare"
    )


# -------------------------------------------------
# HOME PAGE
# -------------------------------------------------

@app.route("/")
def home():

    if not session.get("logged_in"):

        return redirect("/login")

    return send_from_directory(
        FRONTEND_FOLDER,
        "index.html"
    )
    # -------------------------------------------------
# LOGIN PAGE AND LOGIN PROCESS
# -------------------------------------------------

@app.route("/login", methods=["GET", "POST"])
def login():

    # SHOW LOGIN PAGE
    if request.method == "GET":

        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )


    # PROCESS LOGIN
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")


    if username == "admin" and password == "admin123":

        session["logged_in"] = True
        session["username"] = username

        return jsonify({
            "message": "Login successful"
        }), 200


    return jsonify({
        "message": "Invalid username or password"
    }), 401


# -------------------------------------------------
# LOGOUT
# -------------------------------------------------

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/login")


# -------------------------------------------------
# JAVASCRIPT FILE
# -------------------------------------------------

@app.route("/script.js")
def script():
    return send_from_directory(FRONTEND_FOLDER, "script.js")


# -------------------------------------------------
# TEST DATABASE CONNECTION
# -------------------------------------------------

@app.route("/test-db")
def test_db():

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT DATABASE()")
    result = cursor.fetchone()

    cursor.close()
    db.close()

    return f"Connected to database: {result[0]}"


# -------------------------------------------------
# ADD PATIENT
# -------------------------------------------------

@app.route("/patients", methods=["POST"])
def add_patient():

    data = request.get_json()

    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    symptoms = data.get("symptoms")
    priority = data.get("priority")

    # NEW FIELDS
    department = data.get("department")
    doctor = data.get("doctor")

    db = get_db_connection()
    cursor = db.cursor()

    query = """
    INSERT INTO patients
    (name, age, gender, symptoms, priority, department, doctor, status)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""
    values = (
    name,
    age,
    gender,
    symptoms,
    priority,
    department,
    doctor,
    "Waiting"
)

    cursor.execute(query, values)

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "Patient added successfully"
    }), 200


# -------------------------------------------------
# GET ALL PATIENTS
# -------------------------------------------------

@app.route("/patients", methods=["GET"])
def get_patients():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM patients
        ORDER BY
            CASE priority
                WHEN 'High' THEN 1
                WHEN 'Medium' THEN 2
                WHEN 'Low' THEN 3
                ELSE 4
            END,
            patient_id ASC
    """)

    patients = cursor.fetchall()

    cursor.close()
    db.close()


    # ==========================================
    # SMART ESTIMATED WAITING TIME
    # ==========================================

    doctor_waiting_count = {}

    for patient in patients:

        doctor = patient.get("doctor") or "Unknown"

        if doctor not in doctor_waiting_count:
            doctor_waiting_count[doctor] = 0


    for patient in patients:

        status = str(
            patient.get("status") or ""
        ).strip().lower()

        doctor = patient.get("doctor") or "Unknown"


        # Completed patients don't wait
        if status == "completed":

            patient["estimated_waiting_time"] = 0
            patient["waiting_time"] = 0

            continue


        # Patient already in consultation
        if status == "in consultation":

            patient["estimated_waiting_time"] = 0
            patient["waiting_time"] = 0

            continue


        # Waiting patient
        position = doctor_waiting_count[doctor]

        # Each patient is estimated at 10 minutes
        estimated_time = position * 10

        patient["estimated_waiting_time"] = estimated_time
        patient["waiting_time"] = estimated_time

        doctor_waiting_count[doctor] += 1


    return jsonify(patients)

    # -------------------------------------------------
# UPDATE PATIENT STATUS
# -------------------------------------------------

@app.route("/patients/<int:patient_id>/status", methods=["PUT"])
def update_patient_status(patient_id):

    data = request.get_json()

    status = data.get("status")

    db = get_db_connection()
    cursor = db.cursor()

    query = """
        UPDATE patients
        SET status = %s
        WHERE patient_id = %s
    """

    cursor.execute(query, (status, patient_id))

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "Patient status updated successfully"
    }), 200
    # -------------------------------------------------


# -------------------------------------------------
# GET DOCTORS FROM DATABASE
# -------------------------------------------------

@app.route("/api/doctors", methods=["GET"])
def get_doctors():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            d.doctor_id,
            d.name,
            d.department,
            d.status,
            COUNT(
                CASE
                    WHEN p.status != 'Completed'
                    THEN p.patient_id
                END
            ) AS patients_count,
            d.rating
        FROM doctors d
        LEFT JOIN patients p
            ON p.doctor = d.name
        GROUP BY
            d.doctor_id,
            d.name,
            d.department,
            d.status,
            d.rating
        ORDER BY d.doctor_id ASC
    """)

    doctors = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(doctors)
# -------------------------------------------------
# RUN FLASK
# -------------------------------------------------
# -------------------------------------------------
# SMART DOCTOR RECOMMENDATION
# -------------------------------------------------

@app.route("/api/recommend-doctor/<department>", methods=["GET"])
def recommend_doctor(department):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            d.doctor_id,
            d.name,
            d.department,
            d.status,
            COUNT(
                CASE
                    WHEN p.status != 'Completed'
                    THEN p.patient_id
                END
            ) AS patients_count,
            d.rating
        FROM doctors d
        LEFT JOIN patients p
            ON p.doctor = d.name
        WHERE d.department = %s
        AND LOWER(d.status) = 'available'
        GROUP BY
            d.doctor_id,
            d.name,
            d.department,
            d.status,
            d.rating
        ORDER BY patients_count ASC, d.rating DESC
        LIMIT 1
    """, (department,))

    doctor = cursor.fetchone()

    cursor.close()
    db.close()

    if doctor:

        return jsonify({
            "recommended": True,
            "doctor": doctor,
            "reason": "Available doctor with the lowest current patient workload"
        })

    return jsonify({
        "recommended": False,
        "message": "No available doctor found in this department"
    })
    # ==========================================
# ML-BASED PATIENT PRIORITY PREDICTION
# ==========================================

@app.route("/api/predict-priority", methods=["POST"])
def predict_priority():

    try:

        data = request.get_json()

        age = int(data.get("age"))
        gender = data.get("gender")
        department = data.get("department")
        symptoms = data.get("symptoms")

        # Check required information
        if not age or not gender or not department or not symptoms:

            return jsonify({
                "success": False,
                "message": "Age, gender, department and symptoms are required."
            }), 400


        # Create patient data for ML model
        patient_data = pd.DataFrame([{

            "age": age,

            "gender": gender,

            "department": department,

            "symptoms": symptoms

        }])


        # Make prediction
        prediction = priority_model.predict(
            patient_data
        )[0]


        # Return prediction
        return jsonify({

            "success": True,

            "predicted_priority": prediction,

            "message": "Priority predicted using ML model."

        }), 200


    except Exception as e:

        print(
            "Priority prediction error:",
            e
        )

        return jsonify({

            "success": False,

            "message": "Unable to predict priority."

        }), 500
        # ==========================================
# START CONSULTATION
# ==========================================

@app.route("/patients/<int:patient_id>/consult", methods=["PUT"])
def start_consultation(patient_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        UPDATE patients
        SET status = 'In Consultation'
        WHERE patient_id = %s
    """, (patient_id,))

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Consultation started successfully."
    }), 200


# ==========================================
# COMPLETE CONSULTATION
# ==========================================

@app.route("/patients/<int:patient_id>/complete", methods=["PUT"])
def complete_consultation(patient_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        UPDATE patients
        SET status = 'Completed'
        WHERE patient_id = %s
    """, (patient_id,))

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Consultation completed successfully."
    }), 200

if __name__ == "__main__":
    app.run(debug=True)

   