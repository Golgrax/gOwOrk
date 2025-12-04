
# Chapter 2: Identified Risks, Assumptions, and Constraints

## 2.1 Identified Risks

| Risk ID | Risk Description | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Data Loss (Local Storage):** Since the app uses browser LocalStorage, clearing the cache or switching devices results in progress loss. | High | High | Implement a "Data Export/Import" string feature or warn users. Future roadmap includes cloud sync. |
| **R-02** | **System Manipulation (Cheating):** Tech-savvy users might manipulate local time or storage values to farm Gold/XP. | Medium | Medium | Implement server-side validation logic (simulated in GameService) and "Anti-Cheat" checks on time offsets. |
| **R-03** | **Performance on Low-End Devices:** 3D rendering (Three.js) may drain battery or lag on older mobile phones. | Medium | Medium | Include a "Low Performance Mode" in settings to disable particles/shaders and lower resolution. |
| **R-04** | **Browser Incompatibility:** WebGL or AudioContext API may not be supported in very old browsers. | Low | Low | Enforce modern browser requirements (Chrome/Firefox/Edge/Safari latest versions). |

## 2.2 Assumptions
*   **Device Availability:** It is assumed that the workplace provides a shared tablet/computer, or employees are willing to use personal smartphones.
*   **Browser Support:** Users are operating on modern web browsers that support ES6, WebGL, and Web Audio API.
*   **User Literacy:** Users possess basic digital literacy to navigate a web interface.
*   **Single Device Usage:** Given the LocalStorage architecture, it is assumed users primarily stick to one device per shift unless data is manually migrated.

## 2.3 Constraints
*   **Technological Constraint:** The application must run entirely client-side without a mandatory backend server requirement for the MVP (Minimum Viable Product).
*   **Budget:** Zero-cost infrastructure is prioritized (hosting on static platforms like Vercel, GitHub Pages).
*   **Time:** Real-time synchronization between users (e.g., chat) is limited by the lack of WebSockets in the current architecture.
*   **Storage:** Browser LocalStorage is limited (typically 5MB), restricting the infinite growth of log history.
