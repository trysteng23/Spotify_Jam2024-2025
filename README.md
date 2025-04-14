
# 🎵 Better Spotify Jam – Final Design Report

## 📘 Table of Contents
1. [Project Description & Abstract](#1-project-description--abstract)
2. [User Interface Specification](#2-user-interface-specification)
3. [Test Plan and Results](#3-test-plan-and-results)
4. [User Manual](#4-user-manual)
5. [Spring Final PPT Presentation](#5-spring-final-ppt-presentation)
6. [Final Expo Poster](#6-final-expo-poster)
7. [Assessments](#7-assessments)
8. [Summary of Hours and Justification](#8-summary-of-hours-and-justification)
9. [Summary of Expenses](#9-summary-of-expenses)
10. [Appendix](#10-appendix)

---

## 1. Project Description & Abstract

**Team Member**: Trysten Giorgione  
**Advisor**: Dr. Fred Annexstein  

**Abstract**  
> Better Spotify Jam is a full-stack web application that improves Spotify’s group listening experience by implementing a fair queue system that rotates song selection between users. With session-based management and host controls, it ensures no user can dominate playback, offering balanced participation and added features like playlist saving and fallback playback.

**Final Description**  
> Spotify’s current Jam feature favors users who add multiple songs quickly. This app introduces a rotation-based queue algorithm that gives each user equal play opportunity. Hosts control sessions using Spotify login, manage playback and fallback playlists, and can save played songs as a session playlist. Guests join from their devices without needing a Spotify account and can search and queue songs. The application emphasizes fairness, simplicity, and session memorability.

---

## 2. User Interface Specification

- UI mockups and diagrams were brainstormed and implemented during development.
- See [UI Sketches](UI_Brainstorming.png) and [Queue Logic Brainstorming](Queue_Logic_Brainstorming.png) for the visual inspiration and design flow.
- Frontend built in React for responsive, dynamic UI with simple user flow.

---

## 3. Test Plan and Results

- See detailed [Test Plan and Matrix](Test_Plan.md)
- Testing includes normal, abnormal, blackbox, and functional test cases.
- Example tests:
  - Host login and session creation
  - Guest joining and song queueing
  - Fair queue rotation
  - Fallback playlist triggering
  - Save playlist functionality

---

## 4. User Manual

- See [User Manual & Documentation](User_Documentation_Better_Spotify_Jam.md)
- Includes setup guide, screenshots, usage instructions, and FAQ

---

## 5. Spring Final PPT Presentation

- [View Final Presentation Slides](Final_Deliverables/Better_Spotify_Jam_Presentation.pptx)

---

## 6. Final Expo Poster

- [🖼️ Final Poster](Final_Deliverables/Fair-Spotify-Jam-Poster-IV.pdf)

---

## 7. Assessments

### ✅ Initial Self-Assessment (Fall)
> Included under "Self-Assessment Essays" in previous report version

### ✅ Final Self-Assessment (Spring)
> See [Individual Final Assessment](Final_Deliverables/Assignmment_6_Individual_Assessment.pdf) – Includes reflection on contribution, learning outcomes, and obstacles overcome

---

## 8. Summary of Hours and Justification

| Semester     | Hours | Description |
|--------------|-------|-------------|
| Fall 2024    | 20    | Research, backend structure, Spotify API integration |
| Spring 2025  | 35    | Frontend design, full-stack integration, testing, UI/UX |
| **Total**    | **55**| Exceeds 45-hour requirement |

**Justification**:  
Time was tracked via Notion and Git commits. This solo project required effort across backend, frontend, Spotify integration, testing, and final documentation. A great deal of time was also spent debugging authentication and queue fairness logic. Presentation and preparation efforts added to total commitment.

---

## 9. Summary of Expenses

- Spotify Premium (4 months): $11.99 x 4 = **$47.96**

---

## 10. Appendix

- [UI Brainstorming](UI_Brainstorming.png)
- [Queue Logic Sketch](Queue_Logic_Brainstorming.png)
- [Current Research Notes](Research.md)
- [Feature Brainstorm List](Ideas.md)
- [Design Diagrams](Design_Diagrams_MkII.png)
- [Timeline](Task_Timeline_MkII.png)
- [Effort Matrix](Task_effort_matrix_mkII.png)
- [Tasks](TaskList.md)

---

*© 2025 – Trysten Giorgione | University of Cincinnati – CS5002 Senior Design*
