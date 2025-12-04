
# Chapter 1: Introduction

## 1.1 Purpose
The purpose of the **gOwOrk** system is to revolutionize the traditional employee attendance and engagement process in shift-based work environments (e.g., cafes, retail). By integrating gamification mechanics—such as experience points (XP), virtual currency (Gold), and RPG-style progression—into standard workplace tools, the system aims to transform mundane administrative tasks into engaging, rewarding interactions. It serves as both a utility for time-tracking and a morale-boosting platform for staff.

## 1.2 Project Background
In the current landscape of shift management, attendance tracking is often viewed as a punitive or purely administrative necessity. Traditional punch clocks or spreadsheet logs offer no intrinsic motivation for punctuality or high performance. This lack of engagement can lead to low morale, high turnover, and "quiet quitting."

**gOwOrk** proposes a digital solution that recontextualizes the workplace as an RPG (Role-Playing Game). Instead of simply "clocking in," employees "Start Shift" to earn XP. Instead of tasks, they complete "Quests." This shift in perspective leverages the psychology of gamification to incentivize positive employee behavior intrinsically, contrasting sharply with the manual, uninspired methods currently in use.

## 1.3 Business Objectives
The implementation of gOwOrk aims to achieve the following business goals:
*   **Increase Punctuality:** Incentivize on-time arrival through "Critical Hit" bonuses and "Early Bird" rewards.
*   **Boost Employee Morale:** Foster a sense of achievement and progression through leveling and cosmetic rewards.
*   **Enhance Team Cohesion:** utilize features like "Kudos" and "Party Quests" to build rapport among staff.
*   **Simplify Management:** Provide managers with an intuitive dashboard for analytics, payroll estimation (Gold circulation), and staff oversight without complex enterprise software.

## 1.4 Project Scope

### In-Scope
*   **Attendance Tracking:** precise logging of time-in/time-out with logic for lateness and punctuality.
*   **Gamification Engine:** Logic for XP, Gold, Leveling, Health Points (HP), and Streak tracking.
*   **User Profiles:** 3D Voxel Avatar customization and persistent user stats.
*   **Economy System:** A virtual shop for purchasing cosmetic items and consumables.
*   **Interactive Gameplay:** Minigames (e.g., Coffee Rush), Boss Raids, and interactive 3D environments.
*   **Admin Dashboard:** Tools for user management, disciplinary actions ("Smite/Ban"), data export (CSV), and global event management.

### Out-of-Scope
*   **Real-world Payroll Processing:** The system exports data but does not handle direct bank transfers or tax calculations.
*   **Hardware Integration:** The system is software-only and does not integrate with biometric scanners or physical punch cards.
*   **Native Mobile App:** The project is a Progressive Web Application (PWA) / Responsive Web App, not a native iOS/Android binary.
*   **External Database Hosting:** The current iteration utilizes a local-first architecture (LocalStorage) for portability and privacy, rather than a centralized cloud SQL database.

## 1.5 Project Objectives
1.  **Reduce Lateness:** Reduce average employee lateness by 20% within the first month of adoption via gamified penalties and rewards.
2.  **User Engagement:** Achieve a daily active user rate of 100% for scheduled staff.
3.  **Performance:** Ensure the application load time is under 2 seconds and the 3D scene renders at 60 FPS on standard devices.
4.  **Accessibility:** Provide a fully responsive interface that functions across desktop and mobile browsers.
