
# Chapter 2: Identified Risks, Assumptions, and Constraints

## 2.1 Identified Risks

The following risks and mitigation strategies have been identified to ensure operational reliability and project stability:

| Risk ID | Risk Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **R-01** | **Data Loss (Local Storage):** Since the app uses browser LocalStorage, clearing the cache or switching devices results in progress loss. | **Export/Import Feature:** Implement a manual JSON/CSV export feature allowing users to back up their data. Future iterations will implement cloud syncing. |
| **R-02** | **System Manipulation (Cheating):** Tech-savvy users might manipulate local time or storage values to farm Gold/XP. | **Server-Side Validation (Simulated):** The GameService logic validates timestamps against previous logs to prevent "time travel" cheating. |
| **R-03** | **Performance on Low-End Devices:** 3D rendering (Three.js) may drain battery or lag on older mobile phones. | **Low Performance Mode:** A settings toggle disables particle effects, dynamic lighting, and lowers the resolution of the 3D canvas. |
| **R-04** | **Workplace Distraction:** Gamification elements (Arcade, Pet) might distract employees from actual work duties. | **Cooldown Timers:** "Arcade Mode" has a mandatory 2-hour cooldown. "Pet Feeding" costs Gold earned from working, limiting spamming. |
| **R-05** | **Browser Incompatibility:** WebGL or AudioContext API may not be supported in very old browsers. | **Modern Standards Enforcement:** The app detects missing APIs and prompts the user to upgrade to a modern browser (Chrome/Edge/Firefox). |

## 2.2 Assumptions

The successful implementation and deployment of the system rely on the following key assumptions being met:

*   **Device Availability:** All cafe/retail locations have a stable device (tablet or PC) designated as the "Kiosk" or employees agree to use personal devices.
*   **Browser Support:** Users are operating on modern web browsers that support ES6, WebGL, and Web Audio API.
*   **User Literacy:** Users possess basic digital literacy to navigate a web interface and understand RPG terminologies (XP, HP, Gold).
*   **Single Device Usage:** Given the LocalStorage architecture, it is assumed users primarily stick to one device per shift unless data is manually migrated.

## 2.3 Constraints

The project execution and system design are subject to the following boundaries and limitations:

*   **Technological Constraint:** The application must run entirely client-side without a mandatory backend server requirement for the MVP (Minimum Viable Product) to ensure zero hosting costs.
*   **Budget:** Zero-cost infrastructure is prioritized (hosting on static platforms like Vercel, GitHub Pages).
*   **Time:** Real-time synchronization between users (e.g., chat) is limited by the lack of WebSockets in the current architecture.
*   **Storage:** Browser LocalStorage is limited (typically 5MB), restricting the infinite growth of log history.
