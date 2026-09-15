import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score


# =====================================================
# SMART HEALTHCARE NAVIGATOR
# ML PRIORITY TRAINING
# =====================================================

# This is SYNTHETIC demonstration data.
# It is NOT real medical data.


# =====================================================
# PATIENT FEATURES
# =====================================================

ages = [
    18, 22, 25, 28, 30,
    35, 40, 45, 50, 55,
    60, 65, 70, 75
]

genders = [
    "Male",
    "Female"
]

departments = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Ophthalmology"
]

symptoms = [
    "mild fever",
    "cold",
    "cough",
    "mild headache",
    "body pain",
    "joint pain",
    "back pain",
    "high fever",
    "severe dizziness",
    "fracture",
    "severe headache",
    "chest pain"
]


# =====================================================
# CREATE SYNTHETIC TRAINING DATA
# =====================================================

records = []


for age in ages:

    for gender in genders:

        for department in departments:

            for symptom in symptoms:

                # -------------------------------------
                # BASE PRIORITY
                # -------------------------------------

                if symptom in [
                    "chest pain",
                    "severe headache",
                    "fracture"
                ]:

                    priority = "High"


                elif symptom in [
                    "high fever",
                    "severe dizziness",
                    "joint pain",
                    "back pain"
                ]:

                    priority = "Medium"


                else:

                    priority = "Low"


                # -------------------------------------
                # DEPARTMENT + SYMPTOM
                # -------------------------------------

                if department == "Cardiology" and symptom == "chest pain":
                    priority = "High"

                elif department == "Neurology" and symptom == "severe headache":
                    priority = "High"

                elif department == "Orthopedics" and symptom == "fracture":
                    priority = "High"

                elif department == "Ophthalmology" and symptom == "severe headache":
                    priority = "Medium"


                # -------------------------------------
                # AGE EFFECT
                # -------------------------------------

                if age >= 65 and priority == "Medium":
                    priority = "High"


                # -------------------------------------
                # CREATE RECORD
                # -------------------------------------

                records.append({

                    "age": age,

                    "gender": gender,

                    "department": department,

                    "symptoms": symptom,

                    "priority": priority

                })


# =====================================================
# CREATE DATAFRAME
# =====================================================

df = pd.DataFrame(records)


# =====================================================
# DISPLAY DATASET
# =====================================================

print("----------------------------------------")
print("SMART HEALTHCARE ML DATASET")
print("----------------------------------------")

print("Total records:", len(df))

print("\nPriority distribution:")
print(df["priority"].value_counts())


# =====================================================
# INPUT FEATURES
# =====================================================

X = df[
    [
        "age",
        "gender",
        "department",
        "symptoms"
    ]
]


# =====================================================
# OUTPUT
# =====================================================

y = df["priority"]


# =====================================================
# TRAIN / TEST SPLIT
# =====================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


# =====================================================
# PREPROCESSING
# =====================================================

preprocessor = ColumnTransformer(

    transformers=[

        (

            "categorical",

            OneHotEncoder(
                handle_unknown="ignore"
            ),

            [
                "gender",
                "department",
                "symptoms"
            ]

        )

    ],

    remainder="passthrough"
)


# =====================================================
# RANDOM FOREST MODEL
# =====================================================

model = RandomForestClassifier(

    n_estimators=150,

    max_depth=10,

    random_state=42,

    class_weight="balanced"

)


# =====================================================
# ML PIPELINE
# =====================================================

pipeline = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            model
        )

    ]

)


# =====================================================
# TRAIN MODEL
# =====================================================

print("\nTraining ML model...")

pipeline.fit(

    X_train,

    y_train

)


# =====================================================
# TEST MODEL
# =====================================================

predictions = pipeline.predict(

    X_test

)


accuracy = accuracy_score(

    y_test,

    predictions

)


# =====================================================
# DISPLAY ACCURACY
# =====================================================

print("\n----------------------------------------")
print("ML MODEL TRAINING COMPLETED")
print("----------------------------------------")

print(

    "Model Accuracy:",

    round(
        accuracy * 100,
        2
    ),

    "%"

)


# =====================================================
# SAVE MODEL
# =====================================================

with open(

    "priority_model.pkl",

    "wb"

) as file:

    pickle.dump(

        pipeline,

        file

    )


print("----------------------------------------")
print("Model saved as priority_model.pkl")
print("----------------------------------------")