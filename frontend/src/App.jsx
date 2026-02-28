import React, { useState } from 'react'
import axios from 'axios'

function App() {
  const [patient, setPatient] = useState({ nom: '', prenom: '', email: '', telephone: '' })
  const [patientMsg, setPatientMsg] = useState('')
  const [rendezvous, setRdv] = useState({ patient_id: '', medecin_nom: 'Dr. Idrissi', date_heure: '2026-03-02T10:30:00' })
  const [rdvMsg, setRdvMsg] = useState('')

  const creerPatient = async (e) => {
    e.preventDefault();

    // On crée une copie du patient et on lui donne un email unique aléatoire
    const patientPourEnvoi = {
      ...patient,
      prenom: patient.prenom || 'Inconnu',
      email: `patient_${Math.floor(Math.random() * 10000)}@hopital.com`,
      telephone: patient.telephone || '00000000'
    };

    try {
      const res = await axios.post('/api/patients/', patientPourEnvoi);
      setPatientMsg('✅ Patient créé avec succès dans la base de données !');
    } catch (err) {
      setPatientMsg('❌ Erreur création patient');
    }
  }

  const prendreRdv = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/rendezvous/', rendezvous);
      setRdvMsg(`✅ ${res.data.message}`);
    } catch (err) { setRdvMsg('❌ Erreur RDV'); }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🏥 Hôpital MyHeart</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Ajouter Patient</h2>
        <form onSubmit={creerPatient}>
          <input type="text" placeholder="Nom" onChange={e => setPatient({ ...patient, nom: e.target.value })} /><br />
          <button type="submit">Créer</button>
        </form>
        <p>{patientMsg}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>Prendre RDV</h2>
        <form onSubmit={prendreRdv}>
          <input type="number" placeholder="ID Patient" onChange={e => setRdv({ ...rendezvous, patient_id: e.target.value })} /><br />
          <button type="submit">Confirmer</button>
        </form>
        <p>{rdvMsg}</p>
      </div>
    </div>
  )
}
export default App