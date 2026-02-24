from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import engine, get_db

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microservice Patient")

# Schéma Pydantic pour valider les données entrantes (Sécurité)
class PatientCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str

@app.post("/patients/", response_model=PatientCreate)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    # Logique métier (Couche Service simplifiée ici)
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients/{patient_id}")
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return patient
