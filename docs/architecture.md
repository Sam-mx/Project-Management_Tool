# Project Architecture: Samwise PM Platform

## 1. Executive Summary

[cite_start]Samwise is an AI-enhanced, open-source project management tool designed to bridge the gap between simple, visual Kanban tools and complex enterprise-grade systems[cite: 115, 129, 138]. [cite_start]By integrating Generative AI (Google Gemini) directly into a MERN-stack environment, Samwise automates routine tasks and provides proactive decision-making support[cite: 116, 120, 130].

## 2. Technical Stack & Justification

| Layer            | Technology            | Justification                                                                                                  |
| :--------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Frontend**     | React.js (TypeScript) | [cite_start]Modular, component-based UI with type safety for maintainability[cite: 147, 163, 256].             |
| **Backend**      | Node.js / Express     | [cite_start]Non-blocking, event-driven I/O model handles real-time concurrent requests[cite: 253].             |
| **Database**     | MongoDB               | [cite_start]Document-oriented NoSQL; ideal for hierarchical Kanban data (Board > List > Card)[cite: 247, 248]. |
| **Real-time**    | Socket.io             | [cite_start]Facilitates full-duplex, low-latency collaboration for synchronized team views[cite: 257, 259].    |
| **Intelligence** | Google Gemini API     | [cite_start]Provides contextual project analysis and generative text to automate PM workflows[cite: 153, 173]. |
| **DevOps**       | Docker                | [cite_start]Ensures environment consistency across development and production[cite: 261, 263].                 |

## 3. System Architecture Flow

[cite_start]The system utilizes a client-server architecture[cite: 395]. [cite_start]The React frontend manages state via Redux, communicating with the Express backend via REST APIs and WebSockets[cite: 398, 401].

![System Architecture Flow](./diagrams/architecture_flow.png)

## 4. Database Schema (ERD)

[cite_start]I designed a logical data model enforced by Mongoose schemas to map the hierarchy between Users, Spaces, Boards, Lists, and Cards[cite: 387, 409].

![Entity Relationship Diagram](./diagrams/erd.png)

## 5. Agile/Management Workflow

[cite_start]The project followed the **Project Management Life Cycle (PMLC)** to ensure academic rigor and phased milestones[cite: 158, 289].

- [cite_start]**Planning:** Utilized a Work Breakdown Structure (WBS) to decompose the system into distinct modules: System Core, Frontend, Real-time Service, AI Services, and Documentation[cite: 296, 297].
- [cite_start]**Agile Integration:** Iterative modularity and rapid prototyping ensured that development remained responsive to requirements[cite: 198, 201].
- [cite_start]**Quality Assurance:** A multi-tier testing strategy (Unit, Integration, System, UAT) validated the system against functional requirements[cite: 156, 520].

## 6. Project Artifacts

- [Work Breakdown Structure (WBS)](./diagrams/wbs.png)
- [System Sequence Diagram](./diagrams/sequence.png)
- [Project Gantt Chart](./diagrams/gantt.png)
