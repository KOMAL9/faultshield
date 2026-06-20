# FaultShield

**Criticality-Aware Adaptive Scheduling with Resilient Fault Recovery in Distributed Systems**

FaultShield is a fault-tolerant distributed job orchestration framework built around a novel scheduling algorithm — **CAAS (Criticality-Aware Adaptive Scheduling)** — that dynamically assesses job criticality at runtime and adapts both worker selection and fault recovery strategy accordingly.


---

## The Problem

Most distributed job schedulers — FIFO, Round Robin — treat every job the same way, regardless of how important it is. A routine background task and a mission-critical job get identical resource allocation and identical fault recovery treatment. This leads to wasted resources on low-priority jobs and inadequate protection for high-priority ones.

## The Idea

FaultShield introduces **CAAS**, an algorithm that computes a composite criticality score for every job in real time — based on priority, deadline urgency, dependency complexity, and current worker load — and uses that score to decide:

- **Which worker node** should run the job
- **How aggressively** the system should recover from failure

High-criticality jobs get the healthiest available worker and an instant **FAILOVER** strategy. Standard jobs get load-balanced placement and a lightweight **RETRY with exponential backoff** — so recovery effort is always proportional to how much a job actually matters.

---

## Features

- **Intelligent Scheduling** — runtime criticality scoring drives every scheduling decision
- **Adaptive Fault Tolerance** — FAILOVER for critical jobs, RETRY for standard jobs
- **Heartbeat-Based Health Monitoring** — automatic failure detection and recovery, no manual intervention
- **Event-Driven Architecture** — fully asynchronous, decoupled microservices
- **Live Monitoring Dashboard** — real-time visibility into jobs, workers, and scheduling decisions
- **Built-in Experimentation** — compare CAAS against FIFO and Round Robin from the UI

---

## Architecture

FaultShield is composed of four independently deployable microservices communicating asynchronously through Apache Kafka:

| Service | Responsibility |
|---|---|
| **API Gateway** | Single entry point, request routing |
| **Job Service** | Job submission, lifecycle tracking, live updates |
| **Scheduler Service** | Runs the CAAS algorithm, monitors worker health |
| **Worker Node** | Executes jobs, reports heartbeats |

Supporting infrastructure: **Apache Kafka** (event backbone), **PostgreSQL** (persistent storage), **Redis** (real-time worker health state).

A React-based dashboard provides live visibility into the entire system via WebSocket.


---

## Tech Stack

**Backend:** Java 17 · Spring Boot · Apache Kafka · Redis · PostgreSQL
**Frontend:** React · Recharts · WebSocket (STOMP)
**Infrastructure:** Docker · Docker Compose

---

## Getting Started

### Prerequisites
- Java 17+
- Maven
- Docker & Docker Compose
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/faultshield.git
git clone https://github.com/<your-username>/faultshield-ui.git
```

### 2. Start the infrastructure
```bash
cd faultshield
docker-compose up -d
```
This spins up Kafka, Zookeeper, PostgreSQL, and Redis.

### 3. Start the backend services
Run each in a separate terminal:
```bash
java -jar job-service/target/job-service-1.0-SNAPSHOT.jar
java -jar scheduler-service/target/scheduler-service-1.0-SNAPSHOT.jar
java -Dworker.id=worker-1 -Dserver.port=8083 -jar worker-node/target/worker-node-1.0-SNAPSHOT.jar
java -Dworker.id=worker-2 -Dserver.port=8084 -jar worker-node/target/worker-node-1.0-SNAPSHOT.jar
java -Dworker.id=worker-3 -Dserver.port=8085 -jar worker-node/target/worker-node-1.0-SNAPSHOT.jar
```

### 4. Start the dashboard
```bash
cd faultshield-ui
npm install
npm start
```

The dashboard will be available at **http://localhost:3000**

---

## Project Structure

```
faultshield/
├── api-gateway/
├── job-service/
├── scheduler-service/
├── worker-node/
└── docker-compose.yml

faultshield-ui/
└── src/
    ├── pages/
    ├── services/
    └── hooks/
```

---

## License

This project was developed as part of an academic major project and is shared for educational purposes.

---

## Author

**Komal**
M.Tech Software Engineering, RV College of Engineering
[LinkedIn](https://linkedin.com/in/komal9singh)
