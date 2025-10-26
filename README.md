# 🧠 Micro-Certifications Backend

A **Node.js + Express + MongoDB** backend that powers the **Micro-Certifications App** — a platform for users to take online quizzes, track results, and download digital certificates for passed tests.

---

## 🚀 Features

✅ User authentication (Register/Login) with JWT
✅ Secure token-based quiz participation
✅ Dynamic quiz listing and filtering (by level, tech, search)
✅ Exam session management with auto-expiry
✅ Score calculation and detailed result saving
✅ Certificate generation (PDF format) for passed quizzes
✅ Result filtering and pagination

---

## 🧩 Tech Stack

| Layer                  | Technology                  |
| ---------------------- | --------------------------- |
| Backend Framework      | **Node.js**, **Express.js** |
| Database               | **MongoDB + Mongoose**      |
| Authentication         | **JWT (JSON Web Token)**    |
| Password Security      | **bcrypt.js**               |
| Certificate Generation | **PDFKit**                  |
| Environment Management | **dotenv**                  |

---

## 🏗️ Project Structure

```
micro-certifications-backend/
│
├── models/
│   ├── User.js
│   ├── Question.js
│   ├── Result.js
│   └── ExamSession.js
│
├── controllers/
│   ├── authController.js
│   ├── quizController.js
│   ├── resultController.js
│   └── certificateController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   ├── certificateRoutes.js
│   └── resultRoutes.js
│
├── middleware/
│   └── authMiddleware.js
│
├── server.js
├── .env
└── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/micro-certifications-backend.git
cd micro-certifications-backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup `.env` file

Create a `.env` file in the root folder and add:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/microcert
JWT_SECRET=your_jwt_secret_key
```

### 4️⃣ Run Server

```bash
npm start
```

Server runs on `http://localhost:5000`

---

## 📚 API Endpoints

### 🔐 **Auth Routes** (`/auth`)

| Method | Endpoint    | Description                     |
| ------ | ----------- | ------------------------------- |
| POST   | `/register` | Register new user               |
| POST   | `/login`    | Login user and return JWT token |

**Register Request**

```json
{
  "name": "Vinay",
  "email": "vinay@example.com",
  "password": "123456"
}
```

**Register Response**

```json
{
  "success": true,
  "user": {
    "_id": "6717a3f59efdb8c6c4a82a91",
    "name": "Vinay",
    "email": "vinay@example.com"
  }
}
```

---

### 🧾 **Quiz Routes** (`/quiz`)

| Method | Endpoint         | Description                         |
| ------ | ---------------- | ----------------------------------- |
| GET    | `/list`          | Get all quizzes (with filters)      |
| GET    | `/info/:quizId`  | Get quiz info before starting       |
| POST   | `/start/:quizId` | Start new exam session              |
| GET    | `/:quizId`       | Fetch quiz questions (with session) |
| POST   | `/submit`        | Submit quiz answers                 |

**Start Exam Request**

```http
POST /quiz/start/pythonEasy
Authorization: Bearer <jwt-token>
```

**Response**

```json
{
  "success": true,
  "message": "Exam started successfully",
  "examSessionId": "2d7b5ab3-3f7b-4f9d-92a8-77e89cd37e1c",
  "expiresAt": "2025-10-23T14:30:00.000Z"
}
```

---

### 🧠 **Submit Quiz**

```http
POST /quiz/submit
Authorization: Bearer <jwt-token>
```

**Body:**

```json
{
  "quizId": "webDevQuiz",
  "examSessionId": "2d7b5ab3-3f7b-4f9d-92a8-77e89cd37e1c",
  "answers": ["<style>", "font-size", "console.log()"]
}
```

**Response:**

```json
{
  "success": true,
  "score": 3,
  "pass": true,
  "resultId": "6718f77c9fcb2f97d18b4a12",
  "correctCount": 3,
  "wrongCount": 0,
  "totalQuestions": 3
}
```

---

### 🎓 **Certificate Routes** (`/certificate`)

| Method | Endpoint    | Description                |
| ------ | ----------- | -------------------------- |
| POST   | `/download` | Download certificate (PDF) |

**Body:**

```json
{ "resultId": "6718f77c9fcb2f97d18b4a12" }
```

**Response:**
⬇️ Returns downloadable **PDF certificate** file.

---

### 📊 **Results Routes** (`/user`)

| Method | Endpoint          | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| GET    | `/passed-results` | Get all quiz results (with filters & pagination) |

**Filters Supported**

| Query Param         | Description           |
| ------------------- | --------------------- |
| pass                | `true` / `false`      |
| quizId              | Filter by quiz        |
| level               | Filter by quiz level  |
| startDate / endDate | Filter by date range  |
| minScore / maxScore | Filter by score range |
| page / limit        | Pagination            |

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalAttempts": 10,
    "passedCount": 7,
    "failedCount": 3
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalResults": 7
  },
  "results": [
    {
      "quizId": "webDevQuiz",
      "quizTitle": "Web Development Fundamentals",
      "level": "Easy",
      "score": 9,
      "pass": true,
      "date": "2025-10-22T07:18:00.000Z"
    }
  ]
}
```

---

## 🧱 MongoDB Models

### 🧍‍♂️ `User`

```js
{
  name: String,
  email: String,
  password: String
}
```

### ❓ `QuestionSet`

```js
{
  quizId: "webDevQuiz",
  title: "Web Development Fundamentals",
  level: "Easy",
  timeLimit: 15,
  passMarks: 5,
  technologies: ["HTML", "CSS", "JavaScript"],
  questions: [
    { questionText, options, correctAnswer }
  ]
}
```

### 🧩 `ExamSession`

```js
{
  userId,
  quizId,
  examSessionId,
  startedAt,
  expiresAt,
  isSubmitted
}
```

### 🏁 `Result`

```js
{
  userId,
  userName,
  quizId,
  quizTitle,
  level,
  score,
  pass,
  correctCount,
  wrongCount,
  totalQuestions,
  technologies,
  date
}
```

---

## 🧾 Example Certificate Output

* Certificate auto-generates as **PDF**
* Includes:

  * Candidate Name
  * Quiz Title
  * Technologies Covered
  * Date of Issue
  * Signature & Organization Logo

---

## 🛠️ Developer Notes

* Update MongoDB Models → existing documents can be updated manually using MongoDB Compass → “Update Many” option
* Use JWT middleware (`authMiddleware.js`) to protect sensitive routes
* Use Postman to test endpoints easily

---

## 👨‍💻 Author

**Vinay Kalva**
📧 [vinaykalva712@gmail.com](mailto:vinaykalva712@gmail.com)
💼 MERN Stack Developer
🌍 Hyderabad, India

---
