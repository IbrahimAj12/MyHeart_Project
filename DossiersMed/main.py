from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict

app = FastAPI(title="Microservice Dossiers Médicaux")
PORT = 8004 # On utilise le port 8004 pour ne pas faire de conflit

# Connexion au même serveur MongoDB, mais sur une base de données différente !
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.dossiers_db 
collection = db.dossiers

# Modèle d'un dossier médical flexible
class NoteMedecin(BaseModel):
    medecin_nom: str
    date: str
    description: str

class DossierMedical(BaseModel):
    patient_id: int
    groupe_sanguin: Optional[str] = None
    allergies: List[str] = []
    traitements_en_cours: List[str] = []
    notes: List[NoteMedecin] = []

@app.post("/dossiers/", status_code=201)
async def creer_ou_mettre_a_jour_dossier(dossier: DossierMedical):
    # On cherche si le patient a déjà un dossier
    dossier_existant = await collection.find_one({"patient_id": dossier.patient_id})
    
    if dossier_existant:
        # Si oui, on le met à jour
        await collection.replace_one({"patient_id": dossier.patient_id}, dossier.dict())
        return {"message": "Dossier médical mis à jour"}
    else:
        # Sinon, on le crée
        nouveau_dossier = await collection.insert_one(dossier.dict())
        return {"message": "Dossier médical créé", "id": str(nouveau_dossier.inserted_id)}

@app.get("/dossiers/{patient_id}")
async def lire_dossier(patient_id: int):
    dossier = await collection.find_one({"patient_id": patient_id})
    
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable pour ce patient")
    
    dossier["_id"] = str(dossier["_id"]) # Conversion de l'ID Mongo pour le JSON
    return dossier
