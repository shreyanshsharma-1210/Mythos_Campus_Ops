# CampusOS (EduSaarthi) System Overview

## What is the Current System?
**CampusOS** (also referred to as *EduSaarthi*) is a production-ready, AI-powered educational platform that gamifies the student experience. It blends modern learning management system (LMS) capabilities with an RPG (Role-Playing Game) mechanic, transforming academic and extracurricular tasks into "quests" that reward students with XP and attribute growth. The system incorporates an AI proctoring layer to maintain academic integrity during online assessments and provides an immersive visual environment, such as a 3D Hunter's Hub.

## What Does it Do?
CampusOS bridges the gap between traditional education and student engagement. It actively solves problems like "The Academic Void" (lack of immediate feedback) and "The Solo Grind" (isolation) by offering:
1. **Gamified Learning**: Students earn XP and rank up (E to S Rank) across different attributes ([STR], [INT], [WIL], [SOC]) by completing study sessions, networking, and taking care of their health.
2. **AI Proctoring**: Monitors students during tests using computer vision (face detection, eye gaze tracking, object detection) to detect anomalies and flag cheating.
3. **Immersive Dashboards for Teachers & Students**: A central hub to manage courses, track real-time analytics, review student progress, and schedule assignments.
4. **AI-Powered Content Creation**: Features an AI video generator and lesson studio that can create dynamic educational content, convert PDFs to interactive videos, and generate tests using large language models.
5. **Community & Wellness Integration**: Incorporates geofencing ("Danger Zones") and integrates with health APIs to monitor burnout and require "Mana Recovery" (mental wellness breaks).

## Technology Stack Architecture
* **Frontend Layer:** React SPA (Vite + TypeScript), React Router, Tanstack Query (Server State), TailwindCSS, and Radix UI. Data visualization is powered by Recharts and D3.js, with 3D/AR modules utilizing Three.js and Google Model Viewer.
* **Backend Layer:** Node.js, Express.js (with TypeScript), and Firebase for database operations, authentication, and secure storage.
* **AI/ML Layer:** A dedicated Python backend driving the AI Proctoring with OpenCV, MediaPipe, YOLO, and Dlib. Generative AI components integrate Gemini LLMs and VAPI for NLP and voice tasks.

## Frontend Modules & Features

The frontend application (`client/`) is built with a feature-rich routing system. Below is a breakdown of the primary modules that the user interface consists of:

### 1. Dashboard Modules
* **Student Dashboard (`Dashboard.tsx`, `Dashboard2.tsx`)**: The "Hunter's Hub" where students view their 3D anime character, track their Hunter Rank, and see their Radar Stat Chart. It offers a portal to all ongoing quests, learning modules, and recent notifications.
* **Classroom Dashboard (`ClassroomDashboard.tsx`)**: A high-level overview for managing classrooms, viewing student enrollment, and subject-wise organization.
* **Teacher Quiz Analytics (`TeacherQuizAnalytics.tsx`)**: Detailed metrics and analytics for teachers to review classroom performance, assessment accuracy, and individual student insights.

### 2. Assessment & Proctoring
* **AI Test Arena (`AITestArena.tsx`, `TestArena.tsx`)**: The primary interface for students to take interactive, gamified tests (with streak bonuses and multipliers).
* **Test Taking & Code Testing (`TestTaking.tsx`, `CodeTest.tsx`)**: Secure environments for standard assessments and coding challenges (integrated with Monaco Editor for syntax highlighting).
* **Test Management (`TestManagement.tsx`)**: An advanced test builder for teachers to construct timed assessments, randomize questions, and set up auto-grading.
* **Computer Vision (`ComputerVision.tsx`)**: Frontend integration for the AI proctoring, capturing real-time camera feeds for the backend to run face/gaze/object tracking.

### 3. AI-Powered Content Creation
* **AI Lesson Studio (`AILessonStudio.tsx`, `AILessonStudioNew.tsx`)**: A workspace for educators to generate curriculum-aligned interactive lessons, adaptive learning paths, and rich media content using AI.
* **AI Video Generator (`AIVideoGenerator.tsx`)**: A studio that transforms scripts and PDFs into engaging educational videos with custom animations and AI voiceovers.
* **AI Chatbot (`Chatbot.tsx`)**: The "System Oracle", a Gemini-powered mentor that provides personalized learning assistance, study help, and instant answers to student queries.

### 4. Progression & Student Development
* **Career Assessment (`CareerAssessment.tsx`)**: Incorporates personality assessments and physical health data to provide career path recommendations and industry insights.
* **Achievements (`AchievementsPage.tsx`)**: The "Hunter's Vault" where students review unlocked skills, "Artifacts," and their overall Skill Tree.
* **Analytics (`Analytics.tsx`)**: A deep dive into the student's personal performance, time efficiency, and subject-wise progression.

### 5. Community & Organization
* **Community (`Community.tsx`)**: Discussion forums, peer-to-peer learning spaces, and a "Bounty Board" where students can complete campus tasks for Karma Points.
* **Classrooms (`ClassroomsPage.tsx`, `ClassView.tsx`)**: Detailed views for specific courses, including material access, discussion spaces, and assignment tracking.
* **Calendar (`Calendar.tsx`)**: A smart calendar for intelligent scheduling, automated assignment reminders, and synchronization of deadlines.

### 6. Authentication & Onboarding
* **Login & Signup (`Login.tsx`, `Signup.tsx`)**: Secure entry points integrated with Firebase Authentication to onboard new students and educators.

---
*Generated by Antigravity AI*
