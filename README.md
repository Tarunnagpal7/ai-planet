

# Frontend - PDF Question Answering App (React.js + TailwindCSS)

This is the **frontend client** for the Fullstack Internship Assignment — a PDF Question-Answering system using React.js.

---

## 📚 Features

- Upload PDF files to the backend
- Preview uploaded PDFs
- Interactive Question-Answer Chat Interface
- Mobile Responsive: Switch between PDF view and Chat on small screens
- Smooth error handling and user feedback

---

## ⚙️ Tech Stack

- **React.js** - Frontend framework
- **TailwindCSS** - Utility-first CSS framework
- **Lucide-React** - Icon set
- **Vite** - Fast development server and bundler

## Architecture
 ![ai-planet-architecture drawio](https://github.com/user-attachments/assets/f0c16ed2-cc81-4043-aed9-3a0282f35d41)

---
## Backend :
- https://github.com/Tarunnagpal7/ai-planet-langchain



MUST READ
The project uses large embedding vectors, and the backend is currently deployed on Render’s free service tier.
Due to limited server resources (memory, compute, timeout restrictions), there may occasionally be delays or timeouts when processing very large documents or during high traffic.
---

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Tarunnagpal7/ai-planet.git
cd frontend
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Create a .env file inside frontend/:
```bash
VITE_BACKEND_URL=http://localhost:8000
```
### 4. Run the Development Server
```bash
npm run dev
```
