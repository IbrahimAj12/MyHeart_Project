# MyHeart: Healthcare Microservices Architecture

A fully containerized healthcare management system built to demonstrate a polyglot microservices architecture, synchronous inter-service communication, and data isolation.

![Architecture Diagram](link_to_your_diagram_image_here)

## 🛠 Tech Stack
* **Infrastructure & Orchestration:** Docker, Docker Compose
* **Backend Frameworks:** Python (FastAPI, Flask), Node.js (Express.js)
* **Frontend:** React.js (Vite)
* **Databases:** SQLite (Relational), MongoDB (NoSQL)

## 🏗 Architecture Overview

The system is decoupled into 6 independent, single-responsibility microservices, each managing its own isolated database:

1. **Patient Service (Port 8000 - FastAPI):** Manages patient identities and demographics (SQLite).
2. **Rendezvous Service (Port 8001 - Express.js):** Handles appointment scheduling (SQLite).
3. **Facturation Service (Port 8002 - Flask):** Automates billing generation (SQLite).
4. **Resultats Service (Port 8003 - FastAPI):** Records unstructured lab and test results (MongoDB).
5. **DossiersMed Service (Port 8004 - FastAPI):** Manages core medical records and allergy tracking (MongoDB).
6. **Prescriptions Service (Port 8005 - Express.js):** Validates and creates medical prescriptions (SQLite).

### Inter-Service Communication
Services communicate via **synchronous REST APIs** to ensure real-time validation. 
* *Example 1:* When an appointment is booked via the `Rendezvous` service, it automatically makes a POST request to `Facturation` to generate a bill.
* *Example 2:* When a doctor issues an Rx via `Prescriptions`, the service queries `DossiersMed` to verify patient allergies before validating the medication.

## 🚀 How to Run

The entire 8-container stack (6 microservices, 1 MongoDB instance, 1 React frontend) is orchestrated via a single command.

1. Clone the repository:
   ```bash
   git clone [https://github.com/IbrahimAj12/MyHeart_Project.git](https://github.com/IbrahimAj12/MyHeart_Project.git)
   cd MyHeart_Project
   ```
2. Build and launch the containers:
   ```bash
   docker-compose up --build -d
   ```
3. Access the Frontend UI:
   * Open `http://localhost:5173` in your browser.
