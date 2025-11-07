# Face Recognition Attendance System

This is a modern, web-based attendance system that uses face recognition to verify user identity and record attendance. It's built with React, TypeScript, and Vite for the frontend, Supabase for the backend and database, and `face-api.js` for the core machine learning functionality.

## Features

*   **User Registration:** New users can register their profile, including their name, email, and a face model.
*   **Face-Powered Attendance:** Users can mark their attendance by simply looking at their camera.
*   **Attendance Dashboard:** View a history of all attendance records.
*   **Secure:** Uses Supabase for database and authentication, with row-level security policies.
*   **Real-time Feedback:** Provides instant feedback on whether a face is recognized.



## Project Structure

```
.
├── public/
│   └── models/         # Pre-trained face-api.js models
├── src/
│   ├── components/
│   │   ├── AttendanceDashboard.tsx # Shows attendance history
│   │   ├── AttendanceMarker.tsx    # Component for marking attendance
│   │   ├── Camera.tsx              # Reusable camera component
│   │   └── UserRegistration.tsx    # Component for user registration
│   ├── services/
│   │   └── faceRecognition.ts # Core service for loading models and face detection
│   ├── lib/
│   │   └── supabase.ts       # Supabase client initialization
│   ├── App.tsx             # Main application component and routing
│   └── main.tsx            # Entry point of the React application
├── supabase/
│   └── migrations/
│       └── ..._create_attendance_system.sql # Database schema
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Technologies Used

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend & Database:** Supabase
*   **Face Recognition:** `face-api.js`
*   **Icons:** `lucide-react`

## Database Schema

## How It Works: A Deep Dive into the Face Recognition Pipeline

The magic behind this project is `face-api.js`, a JavaScript library that runs powerful neural networks directly in the browser. The process is a multi-stage pipeline:

### Stage 1: Loading the Pre-trained Models

Before any analysis, the application loads several pre-trained models into the user's browser. These models are the "brains" of the operation:

*   **`tinyFaceDetector`**: This is a highly optimized and lightweight model based on the **Single Shot Detector (SSD)** architecture. Its job is to scan an image and draw a bounding box around any face it finds. It's designed to be fast, making it suitable for real-time video analysis.
*   **`faceLandmark68Net`**: After a face is detected, this model identifies 68 specific points (landmarks) on it—the contour of the jaw, eyes, eyebrows, nose, and mouth. This step is crucial for **face alignment**, ensuring that the face is centered and oriented correctly before the final recognition step.
*   **`faceRecognitionNet`**: This is the core model for recognition. It's a deep **Residual Network (ResNet)**, specifically a variant with 34 layers, which has been trained on a massive dataset of labeled faces. Its primary function is not to classify a face, but to compute a unique **face descriptor** (also known as an embedding).

### Stage 2: User Registration - Generating a Face Descriptor

When a new user registers, the following happens:

1.  The `Camera` component captures a snapshot from the user's video feed.
2.  The `tinyFaceDetector` model finds the user's face in the image.
3.  The `faceLandmark68Net` model maps the 68 facial landmarks.
4.  The image is warped and aligned based on the landmarks.
5.  The aligned face is fed into the `faceRecognitionNet` model.
6.  The model outputs a **128-dimensional vector** (an array of 128 numbers). This is the **face descriptor**. This vector is a mathematical representation of the unique features of that face. It doesn't make sense to a human, but it captures the essence of the face in a way that can be compared with others.
7.  This descriptor is saved as a JSONB array in the `users` table in our Supabase database, linked to the user's profile.

### Stage 3: Attendance - Matching Faces

When a user marks their attendance, the system needs to verify their identity:

1.  A new face descriptor is generated from the live camera feed, following the exact same process as in Stage 2.
2.  The system fetches the list of all registered users and their stored face descriptors from the database.
3.  The new descriptor is compared to every stored descriptor using the **Euclidean Distance** formula. This is essentially a measurement of the straight-line distance between two points in the 128-dimensional space. 
    *   A **small distance** means the two face descriptors are very similar, indicating a likely match.
    *   A **large distance** means the faces are very different.
4.  The system checks if this distance is below a pre-defined **matching threshold** (e.g., 0.6 is a common starting point for `face-api.js`). If the distance to a stored descriptor is below this threshold, the system declares a match. 
5.  The confidence of the match is calculated (often as `1 - distance`), and a new record is inserted into the `attendance_records` table.

The database is managed by Supabase and the schema is defined in `supabase/migrations`.

*   **`users` table:**
    *   `id`: UUID, Primary Key
    *   `name`: TEXT
    *   `email`: TEXT, Unique
    *   `face_descriptor`: JSONB - Stores the 128-dimensional face descriptor from `face-api.js`.
    *   `created_at`: TIMESTAMPTZ

*   **`attendance_records` table:**
    *   `id`: UUID, Primary Key
    *   `user_id`: UUID, Foreign Key to `users.id`
    *   `check_in_time`: TIMESTAMPTZ
    *   `face_match_confidence`: NUMERIC - The confidence score of the face match.
    *   `created_at`: TIMESTAMPTZ

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn
*   A Supabase account (you will need a project URL and anon key)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chetakk/face-attendance-system.git
    cd face-attendance-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Go to the SQL Editor and run the script from `supabase/migrations/20251106110205_create_attendance_system.sql` to create the tables.
    *   In your project settings, find your Project URL and `anon` public key.
    *   Create a `.env.local` file in the root of the project and add your Supabase credentials:
        ```
        VITE_SUPABASE_URL=your-supabase-project-url
        VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```
    *   The application code in `src/lib/supabase.ts` uses these environment variables to connect to Supabase.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally.


*fixed
