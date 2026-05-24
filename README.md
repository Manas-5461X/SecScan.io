<div align="center">

```text
  ____            ____                  
 / ___|  ___  ___/ ___|  ___ __ _ _ __  
 \___ \ / _ \/ __\___ \ / __/ _` | '_ \ 
  ___) |  __/ (__ ___) | (_| (_| | | | |
 |____/ \___|\___|____/ \___\__,_|_| |_|
```

**[ SEC-SCAN v1.0.4-STABLE ]**

<br />

![React](https://img.shields.io/badge/REACT-19.0-3b82f6?style=for-the-badge&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/FIREBASE-V11.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind](https://img.shields.io/badge/TAILWIND--V4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/GEMINI--3.0-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Monaco](https://img.shields.io/badge/MONACO--CORE-007ACC?style=for-the-badge)

<br />

**SecScan** is a high-performance, enterprise-grade security orchestration platform. It is engineered to "Shift Security Left," providing a multi-layered static analysis engine (Heuristics) paired with advanced detection logic to identify, remediate, and track critical code vulnerabilities in real-time.

</div>

<hr />

## 🌟 Table of Contents
1. [Core Features](#-core-features)
2. [Deep Dive into Security Modules](#-deep-dive-into-security-modules)
3. [Architecture Overview](#-architecture-overview)
4. [Enterprise-Grade Tech Stack](#-enterprise-grade-tech-stack)
5. [Local Development & Setup](#-local-development--setup)
6. [Docker Deployment](#-docker-deployment)
7. [API Integration](#-api-integration)
8. [Threat Modeling](#-threat-modeling)
9. [Development Roadmap](#-development-roadmap)
10. [Contributing Guidelines](#-contributing-guidelines)
11. [Security Disclaimer](#-security-disclaimer)
12. [License](#-license)

<hr />

## 🛡️ Core Features

- **Heuristic Secret Detection**: Utilizes advanced regex engines and pattern matching algorithms to instantly identify exposed cryptographic keys, including AWS IAM tokens, Stripe API keys, Google Cloud JSON files, Firebase configurations, hardcoded JWTs, and RSA private keys within public repositories.
- **Dependency Vulnerability Auditing**: Parses standard package manifests (such as `package.json`) and queries the open **OSV.dev (Open Source Vulnerability)** database. It cross-references dependency trees to detect malicious packages, zero-day CVEs, and outdated libraries in real-time.
- **Aggressive Configuration Analysis**: Conducts structural analysis to detect inadvertently exposed internal configurations, including `.git` directories, hardcoded IPv4/IPv6 addresses, dangerous `Dockerfile` root executions (`USER root`), and overly permissive CORS policies (`Access-Control-Allow-Origin: *`).
- **Quantifiable Risk Scoring Engine**: An advanced, granular mathematical algorithm that weighs individual findings by impact and exploitability, producing an aggregate risk score (e.g., 0-100) and an overall severity rating (Clean, Low, Medium, High, Critical).
- **Cybersecurity Orchestration Dashboard**: An ultra-premium, dark-themed, glassmorphic React dashboard. It leverages real-time state management and visual statistics (severity color-coding, animated metrics) to deliver an unparalleled User Experience (UX) for security engineers.

---

## 🔍 Deep Dive into Security Modules

### 1. Static Application Security Testing (SAST)
SecScan analyzes raw code text (source code files) without attempting to execute them. By statically parsing files retrieved via the GitHub API, it bypasses complex build processes, ensuring scanning times are kept under a few seconds regardless of the project's size. 

### 2. Software Composition Analysis (SCA)
Third-party dependencies represent the largest attack surface in modern software supply chains. SecScan's SCA engine fetches dependency lockfiles and cross-references their exact versions against public intelligence feeds. The system is designed to alert on transitive dependencies that contain Remote Code Execution (RCE) or Cross-Site Scripting (XSS) vulnerabilities.

### 3. Threat Modeling & Prioritization
Not all vulnerabilities carry the same weight. SecScan applies a weighted threat model:
- **Exposed AWS Keys:** Instant `+50` Critical Risk.
- **Exposed Git Folders:** `+30` High Risk.
- **Vulnerable Packages:** `+15` per occurrence.
The cumulative score dictates the overall security posture, allowing DevSecOps teams to prioritize remediation effectively.

---

## 🏗️ Architecture Overview

The system operates on a decoupled client-server architecture, ensuring that heavy pattern matching and external API requests (GitHub, OSV) are securely orchestrated on the backend, protecting the client from CORS issues and API key exposure.

```text
    [ Premium React Dashboard ] <---(REST JSON)---> [ Node.js API Controller ]
    ( Vite + TailwindCSS + Lucide)                  ( Express + TypeScript )
                                                              |
                 +-----------------------+--------------------+-----------------------+
                 |                       |                    |                       |
       [ Secret Scanner ]    [ Dependency Scanner ]  [ Config Scanner ]    [ Risk Assessment ]
                 |                       |                    |                       |
          (Regex Engine)           (OSV.dev API)        (Regex Engine)        (Scoring Algorithm)
                 \                       |                    /                       /
                  \----------------------+-------------------/-----------------------/
                                         |
                                ( GitHub REST API )
```

---

## 🚀 Enterprise-Grade Tech Stack

### Frontend Architecture
- **React 19.0**: Leveraging the latest concurrent rendering features and hooks for unparalleled UI performance.
- **Tailwind CSS V4**: Utility-first CSS framework providing glassmorphism effects, advanced background blurs, and responsive design natively without heavy CSS files.
- **Lucide React**: Clean, lightweight, highly customizable SVG iconography for security badges and UI elements.
- **Vite**: Next-generation frontend tooling providing Instant Server Start and Lightning Fast HMR (Hot Module Replacement).

### Backend Services
- **Node.js (v20 LTS)**: High-throughput, event-driven JavaScript runtime handling thousands of asynchronous API requests concurrently.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js, managing routing and middleware integration.
- **TypeScript**: Ensuring strict type safety across the entire stack, minimizing runtime exceptions and bridging interface contracts between frontend and backend.
- **Zod**: Schema declaration and validation library to strictly sanitize all incoming user input (e.g., repository URLs), preventing injection attacks against the scanner itself.
- **Winston**: Advanced logging framework for maintaining audit trails of all scans performed by the system.

*(Note: While the badges in the header reference Firebase, Gemini, and Monaco-Core to match specific design requirements, the core logic relies on the React/Node stack described above. Future integrations may leverage these extended tools.)*

---

## 🛠️ Local Development & Setup

Follow these instructions to run the application securely on your local development machine without Docker.

### Prerequisites
- **Node.js**: Version 18.x or higher is strictly required.
- **Git**: For cloning the repository.
- **GitHub Personal Access Token (PAT)**: Highly recommended to bypass GitHub's aggressive unauthenticated rate limits (60 requests/hour vs 5000 requests/hour).

### Step 1: Environment Configuration
Clone the repository and create your localized `.env` file at the root of the project.

```bash
git clone https://github.com/your-org/SecScan.git
cd SecScan
```

Create the `.env` file:
```bash
# Add your GitHub PAT here
GITHUB_TOKEN=ghp_your_personal_access_token_here
```

### Step 2: Initialize the Backend
The backend utilizes `ts-node-dev` for rapid development cycles.

```bash
cd backend
npm install
npm run dev
```
*The API will boot and listen securely on `http://localhost:3000/api`.*

### Step 3: Initialize the Frontend
The frontend requires its own terminal instance to run the Vite development server.

```bash
# In a new terminal window
cd frontend
npm install
npm run dev
```
*The Dashboard will be compiled and hosted at `http://localhost:5173` (or your nearest available port).*

---

## 🐳 Docker Deployment

For production-ready environments, SecScan is fully containerized. Utilizing Docker Compose, the entire stack (including isolated networking and volume mounting) is spun up seamlessly.

### Running via Docker Compose

From the root directory of the project, execute:

```bash
docker-compose up --build -d
```

#### Container Details:
- **`backend` service**: Runs on port `3000`. Injects the `GITHUB_TOKEN` directly from your `.env` file.
- **`frontend` service**: Built using an optimized multi-stage `Dockerfile`. First, it compiles the TypeScript React app via Node.js, then serves the static assets via a lightweight **Nginx** Alpine container on port `80`.

To view the dashboard, simply navigate to `http://localhost` in your web browser.

---

## 📡 API Integration

SecScan provides a stateless RESTful API that can be integrated into CI/CD pipelines (e.g., GitHub Actions, Jenkins, GitLab CI).

### Endpoint: `POST /api/scan`

Initiates a comprehensive security audit of a target repository.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/octocat/Spoon-Knife"
}
```

**Response Payload:**
```json
{
  "repository": "octocat/Spoon-Knife",
  "risk": {
    "totalScore": 0,
    "riskLevel": "Clean",
    "breakdown": []
  },
  "secrets": [],
  "vulnerabilities": [],
  "misconfigurations": []
}
```

The API is secured utilizing **Helmet.js** to inject secure HTTP headers and **Express Rate Limit** to mitigate denial-of-service (DoS) abuse.

---

## 🎯 Threat Modeling

SecScan actively hunts for the following threat vectors:

1. **Authentication Bypass & Data Breaches**
   - High-entropy strings that match AWS AKIA keys.
   - Begin/End blocks matching RSA/PGP private keys.
   - Base64 encoded JSON Web Tokens (JWT).

2. **Supply Chain Compromise**
   - Identifying known vulnerable NPM packages through OSV mapping.
   - Flagging deprecated libraries that no longer receive security patches.

3. **Infrastructure & Network Misconfigurations**
   - `0.0.0.0` or wide-open IP bindings.
   - Wide-open CORS (`*`) enabling Cross-Site Request Forgery.
   - Presence of `.env` files mistakenly tracked by git.

---

## 📈 Development Roadmap

While `v1.0.4-STABLE` provides robust baseline scanning, the following features are actively under development:

- [ ] **Gemini 3.0 Integration**: Utilizing LLMs to intelligently reduce false positives in regex matching by analyzing code context natively.
- [ ] **Monaco Editor Support**: Providing an in-browser IDE experience to highlight exact line numbers and vulnerability vectors directly in the dashboard.
- [ ] **Firebase Authentication**: Securing the dashboard with enterprise SSO, allowing teams to save historical scan reports to cloud firestore.
- [ ] **GitLab & Bitbucket Support**: Extending the API parser beyond GitHub's ecosystem.
- [ ] **Automated PR Remediation**: Automatically generating Pull Requests to bump vulnerable dependencies natively via the GitHub API.

---

## 🤝 Contributing Guidelines

We welcome contributions from security researchers and open-source developers!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Adhere to strict TypeScript rules. Ensure `npm run build` succeeds without `any` type violations.
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

Please note that all regex additions to the `SecretScanner` must include corresponding test cases to prevent catastrophic backtracking (ReDoS) vulnerabilities.

---

## ⚠️ Security Disclaimer

**Educational and Demonstrational Use Only.**

SecScan is designed to showcase modern Full-Stack development and fundamental static analysis concepts. 
- Do **not** use this tool maliciously.
- Do **not** run this scanner against repositories or organizations where you lack explicit authorization.
- The regex engines used here are heuristic ("naive") approaches suitable for MVP demonstrations. They do not replace deeply contextual, data-flow-analyzing enterprise SAST tools (e.g., Checkmarx, Fortify, Semgrep) required for actual production compliance. 

The authors and contributors assume no liability for the misuse of this tool or the data it uncovers.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  <p>Built with ❤️ by the Open Source Security Community</p>
</div>
