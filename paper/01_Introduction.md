
# Chapter 1

## 1. Introduction

### 1.1 Purpose

The purpose of this system is to provide a detailed and structured description of the system architecture, requirements, and design for the **gOwOrk** system. This document serves as a guide for understanding how the system will operate, the technologies it will utilize, and how it intends to revolutionize the traditional employee attendance and engagement process in shift-based work environments.

The main goal of the system is to transform mundane administrative tasks into engaging, rewarding interactions by integrating gamification mechanics—such as experience points (XP), virtual currency (Gold), and RPG-style progression—into standard workplace tools. It serves as both a utility for precise time-tracking and a morale-boosting platform for staff.

### 1.2 Background of the Project

The **gOwOrk** system was conceived in response to the current landscape of shift management, where attendance tracking is often viewed as a punitive or purely administrative necessity. Previously, businesses relied on traditional punch clocks or spreadsheet logs, which offered no intrinsic motivation for punctuality or high performance. This lack of engagement often leads to low morale, high turnover, and the phenomenon known as "quiet quitting."

**gOwOrk** proposes a digital solution that recontextualizes the workplace as a Role-Playing Game (RPG). Instead of simply "clocking in," employees "Start Shift" to earn XP; instead of performing tasks, they complete "Quests." This shift in perspective leverages the psychology of gamification to incentivize positive employee behavior intrinsically, contrasting sharply with the manual, uninspired methods currently in use.

### 1.3 Business Objectives

The core business objectives for the gOwOrk system are defined to address current operational inefficiencies regarding staff motivation and management oversight.

1.  **Increase Punctuality:** By incentivizing on-time arrival through "Critical Hit" bonuses (exact time arrival) and "Early Bird" rewards, the system aims to drastically reduce tardiness.
2.  **Boost Employee Morale:** By fostering a sense of achievement and progression through a leveling system, skill trees, and cosmetic rewards, the system aims to improve overall job satisfaction.
3.  **Enhance Team Cohesion:** By utilizing features like "Kudos" and community-based "Boss Raids," the system aims to build better rapport and teamwork among staff members.
4.  **Simplify Management:** By providing managers with an intuitive dashboard for analytics, payroll estimation (Gold circulation), and staff oversight, the system aims to reduce the complexity of administrative tasks without requiring expensive enterprise software.

### 1.4 Project Scope

The project creates a gamified attendance mechanism; research has focused on gathering insights from employees regarding motivation and engagement.

**In-Scope:**
1.  **Attendance Tracking:** Precise logging of time-in/time-out with automated logic for lateness and punctuality modifiers based on Server Time.
2.  **Gamification Engine:** Core logic for Experience Points (XP), Gold currency, Leveling, Health Points (HP), and Streak tracking.
3.  **User Profiles:** 3D Voxel Avatar customization (Three.js) and persistent user statistics.
4.  **Economy System:** A virtual shop for purchasing cosmetic items, pets, and consumables using earned Gold.
5.  **Interactive Gameplay:** Inclusion of Minigames (e.g., Coffee Rush), Boss Raids, and interactive 3D environments to maintain engagement.
6.  **Admin Dashboard:** Tools for user management, disciplinary actions ("Smite/Ban"), data export (CSV/ZIP), and global event management.
7.  **Security Monitoring:** A dashboard for Managers to visualize local video and audio inputs (simulating security feeds) within the application context.

**Out-of-Scope:**
*   **Real-world Payroll Processing:** The system exports data but does not handle direct bank transfers, tax calculations, or payslip generation.
*   **Hardware Integration:** The system is software-only and does not integrate with biometric scanners or physical punch cards.
*   **Native Mobile App:** The project is a Progressive Web Application (PWA) / Responsive Web App, not a native iOS/Android binary.

### 1.5 Project Objectives

The **gOwOrk** system is intended to meet the following specific, measurable, achievable, relevant, and time-bound (SMART) objectives:

1.  **Reduce Lateness:** Reduce average employee lateness by 20% within the first month of adoption via gamified penalties and rewards.
2.  **User Engagement:** Achieve a daily active user rate of 100% for scheduled staff.
3.  **Performance:** Ensure the application load time is under 2 seconds and the 3D scene renders at 60 FPS on standard devices.
4.  **Accessibility:** Provide a fully responsive interface that functions seamlessly across desktop and mobile browsers.
