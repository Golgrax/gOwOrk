
# Chapter 2: Identified Risks, Assumptions, and Constraints

## 2.1 Identified Risks

The following risks and mitigation strategies have been identified to ensure operational reliability and project stability:

| Risk ID | Risk Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **R-01** | **Ephemeral Server Storage:** On cloud platforms with ephemeral filesystems (e.g., Render Free Tier), the SQLite database file may be wiped upon server restart. | **Backup/Restore Utilities:** The Admin Dashboard includes "Export DB (ZIP)" and "Restore DB" features. Documentation explicitly guides users to mount persistent disks for production use. |
| **R-02** | **Network Dependency:** Unlike the previous local-first iteration, the app now requires a connection to the Node.js backend to fetch data or log actions. | **Offline Graceful Degradation:** The UI displays Toast notifications on API failures. (Future: Implement PWA offline caching for read-only access). |
| **R-03** | **Performance on Low-End Devices:** 3D rendering (Three.js) may drain battery or lag on older mobile phones. | **Low Performance Mode:** A settings toggle disables particle effects, dynamic lighting, and lowers the resolution of the 3D canvas. |
| **R-04** | **Workplace Distraction:** Gamification elements (Arcade, Pet) might distract employees from actual work duties. | **Cooldown Timers:** "Arcade Mode" has a mandatory 2-hour cooldown. "Pet Feeding" costs Gold earned from working, limiting spamming. |
| **R-05** | **Browser Incompatibility:** WebGL or AudioContext API may not be supported in very old browsers. | **Modern Standards Enforcement:** The app detects missing APIs and prompts the user to upgrade to a modern browser (Chrome/Edge/Firefox). |

## 2.2 Assumptions

The successful implementation and deployment of the system rely on the following key assumptions being met:

*   **Server Availability:** The host machine or cloud service running the Node.js backend is operational during business hours.
*   **Browser Support:** Users are operating on modern web browsers that support ES6, WebGL, and Web Audio API.
*   **User Literacy:** Users possess basic digital literacy to navigate a web interface and understand RPG terminologies (XP, HP, Gold).
*   **Data Responsibility:** Administrators understand the need to perform regular backups if not using a managed persistent disk service.

## 2.3 Constraints

The project execution and system design are subject to the following boundaries and limitations:

*   **Runtime Environment:** The application requires a Node.js runtime environment to execute `server.js`. It cannot be hosted on purely static web hosts (e.g., GitHub Pages) without an external API.
*   **Budget:** Zero-cost infrastructure is prioritized, utilizing free-tier compute providers (Render/Glitch) with file-based databases to avoid managed SQL costs.
*   **Time:** Real-time synchronization between users (e.g., chat) is currently limited to polling intervals (Data Refresh) rather than WebSockets.
*   **Storage:** While not limited by LocalStorage (5MB), the system is limited by the disk space allocated to the hosting environment for the SQLite file.
