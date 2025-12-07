
# Chapter 1: Introduction

## 1.1 Purpose
The purpose of this system is to provide a detailed and structured description of the system architecture, requirements, and design for the **gOwOrk** system. This document serves as a guide for understanding how the system will operate, the technologies it will utilize, and how it intends to revolutionize the traditional employee attendance and engagement process in shift-based work environments.

The main goal of the system is to transform mundane administrative tasks into engaging, rewarding interactions by integrating gamification mechanics—such as experience points (XP), virtual currency (Gold), and RPG-style progression—into standard workplace tools. It serves as both a utility for precise time-tracking and a morale-boosting platform for staff.

## 1.2 Project Background
The **gOwOrk** system was conceived in response to the current landscape of shift management, where attendance tracking is often viewed as a punitive or purely administrative necessity. Previously, businesses relied on traditional punch clocks or spreadsheet logs, which offered no intrinsic motivation for punctuality or high performance. This lack of engagement often leads to low morale, high turnover, and the phenomenon known as "quiet quitting."

**gOwOrk** proposes a digital solution that recontextualizes the workplace as a Role-Playing Game (RPG). Instead of simply "clocking in," employees "Start Shift" to earn XP; instead of performing tasks, they complete "Quests." This shift in perspective leverages the psychology of gamification to incentivize positive employee behavior intrinsically, contrasting sharply with the manual, uninspired methods currently in use.

## 1.3 Business Objectives
The core business objectives for the gOwOrk system are defined to address current operational inefficiencies regarding staff motivation and management oversight.

1.  **Increase Punctuality:** By incentivizing on-time arrival through "Critical Hit" bonuses and "Early Bird" rewards, the system aims to drastically reduce tardiness.
2.  **Boost Employee Morale:** By fostering a sense of achievement and progression through a leveling system and cosmetic rewards, the system aims to improve overall job satisfaction.
3.  **Enhance Team Cohesion:** By utilizing features like "Kudos" and "Party Quests," the system aims to build better rapport and teamwork among staff members.
4.  **Simplify Management:** By providing managers with an intuitive dashboard for analytics, payroll estimation (Gold circulation), and staff oversight, the system aims to reduce the complexity of administrative tasks without requiring expensive enterprise software.

## 1.4 Project Scope

### In-Scope
1.  **Attendance Tracking:** Precise logging of time-in/time-out with automated logic for lateness and punctuality modifiers.
2.  **Gamification Engine:** Core logic for Experience Points (XP), Gold currency, Leveling, Health Points (HP), and Streak tracking.
3.  **User Profiles:** 3D Voxel Avatar customization and persistent user statistics.
4.  **Economy System:** A virtual shop for purchasing cosmetic items and consumables using earned Gold.
5.  **Interactive Gameplay:** Inclusion of Minigames (e.g., Coffee Rush), Boss Raids, and interactive 3D environments to maintain engagement.
6.  **Admin Dashboard:** Tools for user management, disciplinary actions ("Smite/Ban"), data export (CSV), and global event management.

### Out-of-Scope
*   **Real-world Payroll Processing:** The system exports data but does not handle direct bank transfers, tax calculations, or payslip generation.
*   **Hardware Integration:** The system is software-only and does not integrate with biometric scanners or physical punch cards.
*   **Native Mobile App:** The project is a Progressive Web Application (PWA) / Responsive Web App, not a native iOS/Android binary.
*   **External Database Hosting:** The current iteration utilizes a local-first architecture (LocalStorage/SQLite WASM) for portability and privacy, rather than a centralized cloud SQL database.

## 1.5 Project Objectives and KPIs

The gOwOrk system is intended to meet the following specific, measurable, achievable, relevant, and time-bound (SMART) objectives:

| Business Objectives | Project Objectives | Key Performance Indicator (KPI) |
| :--- | :--- | :--- |
| **Increase Punctuality** | Reduce average employee lateness by 20% within the first month of adoption via gamified penalties and rewards. | • Average minutes of lateness per employee<br>• Ratio of "Early Bird" bonuses vs. "Late" penalties triggered |
| **Boost Employee Morale** | Achieve a daily active user rate of 100% for scheduled staff through engaging mechanics. | • Daily Active Users (DAU) relative to scheduled shifts<br>• Number of optional "Quests" completed per week |
| **Ensure High Performance** | Ensure the application load time is under 2 seconds and the 3D scene renders at 60 FPS on standard devices. | • Average application load time (Time to Interactive)<br>• Average Frames Per Second (FPS) recorded during active sessions |
| **Ensure Accessibility** | Provide a fully responsive interface that functions seamlessly across desktop and mobile browsers. | • Successful logins across different device types (Mobile vs. Desktop)<br>• User interface responsiveness on varying screen sizes |
