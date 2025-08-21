# 🤖 AMI robot GUI

A modern web application for controlling the AMI robot via a web interface. Features an intuitive dashboard for physical controls and an AI-powered RAG system for context-aware interaction.

## 📋 Table of contents

- [🎯 Project objectives & outcomes](#-project-objectives--outcomes)
- [🏗️ System architecture](#️-system-architecture)
- [📚 How it works](#-how-it-works)
- [🗂️ Project structure](#️-project-structure)
- [🚀 Quick start](#-quick-start)
- [🛠️ Features](#️-features)
- [🔧 Technical stack](#-technical-stack)
- [💡 Usage examples](#-usage-examples)
- [✍️ Development](#️-development)
- [🚨 Troubleshooting](#-troubleshooting)
- [🔒 Security notes](#-security-notes)
- [👨‍💻 Contact](#-contact)

## 🎯 Project objectives & outcomes

### Primary objectives (achieved ✅)

1. **Create intuitive web interface** for robot control
   - **Result:** Modern, responsive dashboard with real-time controls

2. **Implement AI-powered interaction system**
   - **Result:** RAG system with web scraping and context-aware responses

3. **Ensure reliable robot communication**
   - **Result:** Polling-based command queue with authentication

4. **Provide scalable architecture**
   - **Result:** Microservices architecture with Docker containerization

### Secondary objectives (achieved ✅)

- **Dark mode support** for enhanced user experience
- **Emergency stop functionality** for safety
- **Comprehensive API documentation** with Swagger/OpenAPI
- **Developer-friendly setup** process with Docker

## 🏗️ System architecture

The system follows a **client-server polling architecture** where:
- **Frontend** serves as the user interface
- **Backend** acts as a command broker
- **Robot** polls for commands as a client

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Backend API   │    │   AMI Robot     │
│                 │    │                 │    │                 │
│ Dashboard UI    │───▶│ Command Queue   │◄───│ Polling Client  │
│ AI Chat         │    │ RAG System      │    │ Hardware Ctrl   │
│ Real-time UI    │    │ Vector Storage  │    │ Local Execution │
└─────────────────┘    └─────────────────┘    └─────────────────┘
     localhost:3000         localhost:8000         Tritium OS
```

## 📚 How it works

**Simple explanation:** You have a web app that talks to a robot through a middleman (the backend)

### Step-by-step flow

1. **You click a button** on the website (like "Make robot happy")
2. **Website sends command** to the backend API 
3. **Backend stores the command** in memory (like a sticky note)
4. **Robot checks for new commands** every second (like checking your phone for messages)
5. **Robot sees the command** and does it (shows happy face)
6. **Robot tells backend "I'm done"** so the command gets cleared

### System overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Web App     │    │   Your Computer │    │   AMI Robot     │
│                 │    │   (Backend API) │    │   (Tritium OS)  │
│ • Dashboard     │───▶│ • Stores cmds   │◄───│ • Polls for     │
│ • Send commands │    │ • AI features   │    │   commands      │
│ • User clicks   │    │ • Queue system  │    │ • Executes      │
│                 │    │                 │    │   locally       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
   localhost:3000         localhost:8000          Tritium OS
```

**Key point:** The robot is like a client that constantly asks "Do I have any new tasks?" instead of waiting for you to push tasks to it.

## 🗂️ Project structure

```
ami-gui/
├── frontend/           # Next.js 15 app
│   ├── app/           # App router pages
│   ├── components/    # UI components  
│   └── lib/          # Utilities
├── backend/           # FastAPI server
│   ├── main.py       # API endpoints
│   └── langchain.py  # RAG system
└── docker-compose.yaml
```

## 🚀 Quick start

### Docker (recommended)

```bash
git clone <repo-url>
cd ami-gui
docker compose up
```

### Access points

**Desktop/Laptop:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/docs

**Mobile/Tablet:**
1. Find your computer's IP address:
   - **macOS/Linux:** `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows:** `ipconfig`
2. Open browser on mobile device
3. Go to: `http://[YOUR-IP]:3000`

### Manual setup

**Backend:**
```bash
cd backend
cp .env.example .env # Edit secrets as needed
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Robot setup:**
- Copy and run `tritium_os_script.py` on your robot

## 🛠️ Features

### Dashboard controls
- **Physical actions:** Wave, dance, head movements, expressions
- **System controls:** Emergency stop, status monitoring
- **Real-time feedback:** Live command status and robot responses

### AI-powered RAG system
- **Web scraping:** Paste any URL to extract content
- **Context-aware chat:** Ask questions based on scraped documents
- **Vector storage:** Persistent knowledge base with AstraDB
- **Smart responses:** LangChain + Cohere for intelligent answers

### Developer experience
- **Modern stack:** Next.js 15, FastAPI, TypeScript
- **Component library:** shadcn/ui with dark mode
- **API documentation:** Auto-generated Swagger docs
- **Docker deployment:** One-command setup

## 🔧 Technical stack

**Frontend:**
- Next.js 15 with App Router
- TypeScript & Tailwind CSS
- shadcn/ui component library
- Real-time polling for status updates

**Backend:**
- FastAPI with async Python
- LangChain for document processing
- Cohere for embeddings
- AstraDB for vector storage

**Infrastructure:**
- Docker containerization
- Bearer token authentication
- CORS-enabled API
- Environment-based configuration

## 💡 Usage examples

- **Control robot:** Click dashboard buttons like "Wave" — robot acts instantly
- **Knowledge-powered questions:** Paste a Wikipedia or docs page in "RAG", click "Add", then ask questions drawing on the linked content
- **Stop/Emergency:** Instantly halt robot actions with the stop button

## ✍️ Development

Add a wave button on the frontend:
```typescript
<Button onClick={() => sendCommand("wave")}>Wave</Button>
```

## 🚨 Troubleshooting

| Issue           | Solution                                         |
|-----------------|--------------------------------------------------|
| Env errors      | Create .env, fill in correct API keys/tokens     |
| CORS errors     | Backend not running, or port mismatch            |
| AstraDB errors  | Check network, token, or endpoint correctness    |
| Port conflict   | Kill process: `lsof -ti:8000 \| xargs kill -9`    |
| Import errors   | `pip install -r requirements.txt`                |

## 🔒 Security notes

⚠️ **Development only**
- Do NOT use hardcoded tokens or open CORS in production!
- Add request validation with pydantic, secrets via env vars, and set CORS to your frontend only.

---

## 👨‍💻 Contact

**Aahil Namajee**
- 📧 Email: [aahilnamajee@gmail.com](mailto:aahilnamajee@gmail.com)
- 🐙 GitHub: [@aahiill](https://github.com/aahiill)
- 💼 LinkedIn: [Aahil Namajee](https://linkedin.com/in/aahil-namajee)

*Developed under the **Infosys Living Labs***
