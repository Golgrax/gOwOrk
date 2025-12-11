
# Chapter 2

## 2. Identified Risks, Assumptions and Constraints

### 2.1 Identified Risks

After researching and brainstorming intensively, we found several risks that could harm this project; to eliminate them, we offered strategies that follow:

1.  **Ephemeral Server Storage:** On cloud platforms with ephemeral filesystems (e.g., Render Free Tier), the SQLite database file may be wiped upon server restart or inactivity.
    *   *Mitigation:* The Admin Dashboard includes "Export DB (ZIP)" and "Restore DB" features. Documentation explicitly guides users to mount persistent disks for production use or perform manual backups at the end of shifts.
2.  **Network Dependency:** Unlike the previous local-first iteration, the app now requires a connection to the Node.js backend to fetch data or log actions. Network failure stops functionality.
    *   *Mitigation:* The UI displays graceful Toast notifications on API failures. Future iterations will implement PWA offline caching for read-only access.
3.  **Performance on Low-End Devices:** The integration of 3D rendering (Three.js) may drain the battery or cause lag on older mobile phones.
    *   *Mitigation:* A "Low Performance Mode" toggle is available in Settings, which disables particle effects, dynamic lighting, and lowers the resolution of the 3D canvas.
4.  **Workplace Distraction:** Gamification elements (Arcade, Pet) might distract employees from actual work duties.
    *   *Mitigation:* "Arcade Mode" has a mandatory 2-hour cooldown. "Pet Feeding" costs Gold earned from working, limiting spamming.
5.  **Browser Incompatibility:** WebGL or AudioContext API may not be supported in very old browsers.
    *   *Mitigation:* The app detects missing APIs and prompts the user to upgrade to a modern browser (Chrome/Edge/Firefox).

### 2.2 Assumptions

The successful implementation and deployment of the system rely on the following key assumptions being met:

1.  **Device Availability:** All cafe or retail locations utilizing the system have at least one stable device (tablet or PC) designated as the "Kiosk," or employees agree to use personal devices for attendance.
2.  **Modern Browsers:** Users are operating on modern web browsers that support ES6 standards, WebGL, and the Web Audio API.
3.  **Digital Literacy:** Users possess basic digital literacy required to navigate a web interface and understand common RPG terminologies (e.g., XP, HP, Gold).
4.  **Community Support:** The staff supports the aim of gamifying the workplace and encourages the rest of the locals to take action regarding participation in quests and events.

### 2.3 Constraints

The project execution and system design are subject to the following boundaries and limitations:

1.  **Runtime Environment:** The application requires a Node.js runtime environment to execute the backend. It cannot be hosted on purely static web hosts (e.g., GitHub Pages) without an external API.
2.  **Budget:** Zero-cost infrastructure is prioritized, utilizing free-tier compute providers (Render/Glitch) with file-based databases (SQLite) to avoid managed SQL costs.
3.  **Time:** Real-time synchronization between users (e.g., updates) is currently limited to polling intervals rather than WebSockets to reduce complexity.
4.  **Hardware Limitations:** The 3D Voxel rendering is constrained by the client device's GPU capabilities.
