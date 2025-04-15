
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

- The frontend was built in React for a responsive, dynamic UI with simple user flow.
- The current implementation is rough and unpolished but completely functional.
- Host Dashboard Example
- ![Host Dashboard](screenshots/host_dashboard.png)

---

## 3. Test Plan and Results
### 🧪 Testing Strategy Summary
The testing conducted for Better Spotify Jam focused primarily on blackbox and functional testing. Tests were designed to validate the normal expected behavior of key features, such as Spotify login, session creation, song queue rotation, and playlist saving. Additional abnormal tests were conducted to ensure the app responded properly to invalid inputs, like incorrect login credentials. Most tests were carried out manually by interacting with the user interface and verifying that the application behaved as intended. While formal unit and automated tests were not used, manual integration tests confirmed that the backend, frontend, and Spotify API were working together smoothly. This level of testing was appropriate for the scope and timeline of a solo-developed capstone project.
- See detailed [Test Plan](Final_Deliverables/Updated_Test_Plan.md)
- See [Test Results](Final_Deliverables/Test_Results.md)
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
> See [Fall Self Assessment](HomeworkFiles/individual_assessment.pdf)

### ✅ Final Self-Assessment (Spring)
> See [Individual Final Assessment](Final_Deliverables/Assignmment_6_Individual_Assessment.pdf) – Includes reflection on contribution, learning outcomes, and obstacles overcome

---

## 8. Summary of Hours and Justification

| Semester     | Hours | Description |
|--------------|-------|-------------|
| Fall 2024    | 35    | Research, backend structure, Spotify API integration |
| Spring 2025  | 58    | Frontend design, full-stack integration, testing, UI/UX |
| **Total**    | **93**|

**Justification**:  
Time was tracked via allotting specific amounts of time per week for each 1 week or 2 week sprint and Git commits. This solo project required effort across backend, frontend, Spotify integration, testing, final documentation, and class assignments. A great deal of time was also spent debugging authentication and queue fairness logic. Presentation and preparation efforts added to total commitment as well.

---

## 9. Summary of Expenses

- Spotify Premium (4 months): $11.99 x 4 = **$47.96**

---

## 10. Appendix

The appendix includes supplementary planning and documentation that supported the design and development of the Better Spotify Jam application.

### 📐 Design and Planning Materials
- [🎨 Host UI Brainstorming/Login Path Sketches](Final_Deliverables/Host_login_view_path.pdf)
- [🔁 Queue Logic Brainstorming](Final_Deliverables/Queue_Logic_Brainstorming.png)
- [📊 Task Effort Matrix](Task_effort_matrix_mkII.png)
- [🗓️ Project Timeline](Task_Timeline_MkII.png)
- [✅ Final Task List](TaskList.md)

### 📄 Research and Idea Development
- [📚 Research Notes](Research.md)

### 🧪 Testing Artifacts
- [✅ Test Plan](Final_Deliverables/Updated_Test_Plan.md)
- [📋 Test Results Summary](Final_Deliverables/Test_Results.md)

### 🧑‍🏫 Self Assessments
- [📝 Fall Individual Assessment](HomeworkFiles/individual_assessment.pdf)
- [📝 Spring Individual Assessment](Final_Deliverables/Assignmment_6_Individual_Assessment.pdf)

---

*© 2025 – Trysten Giorgione | University of Cincinnati – CS5002 Senior Design*
