from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, Dict, Any

app = FastAPI(title="Microservice Resultats (Laboratoire)")
PORT = 8003

# Connexion à MongoDB (On supposera qu'il tourne en local sur le port par défaut 27017)
client = AsyncIOMotorClient("mongodb://mongodb:27017")
db = client.laboratoire_db # Créera la base automatiquement
collection = db.resultats  # Créera la collection automatiquement

# Modèle de données NoSQL ultra-flexible
class ResultatLabo(BaseModel):
    patient_id: int
    type_analyse: str
    # 'Dict[str, Any]' permet de stocker n'importe quel JSON à l'intérieur !
    donnees_brutes: Dict[str, Any] 
    commentaires: Optional[str] = None

@app.post("/resultats/", status_code=201)
async def ajouter_resultat(resultat: ResultatLabo):
    # On convertit l'objet en dictionnaire pour MongoDB
    resultat_dict = resultat.dict()
    # Insertion dans la base NoSQL
    nouvel_enregistrement = await collection.insert_one(resultat_dict)
    
    return {
        "message": "Résultat de laboratoire enregistré", 
        "id_mongo": str(nouvel_enregistrement.inserted_id)
    }

@app.get("/resultats/patient/{patient_id}")
async def obtenir_resultats_patient(patient_id: int):
    # Recherche tous les résultats d'un patient spécifique
    cursor = collection.find({"patient_id": patient_id})
    resultats = await cursor.to_list(length=100)
    
    # MongoDB utilise un type '_id' spécial (ObjectId), on le convertit en texte pour le JSON
    for res in resultats:
        res["_id"] = str(res["_id"])
        
    if not resultats:
        raise HTTPException(status_code=404, detail="Aucun résultat trouvé pour ce patient")
    
    return resultats
