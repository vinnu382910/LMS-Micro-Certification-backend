# 🧠 Micro-Certifications Backend

A complete **Node.js + Express + MongoDB** backend for the **Micro-Certifications App**, which allows users to:

* Register and log in securely
* Browse and start quizzes
* Generate unique **examSessionId** when starting a quiz
* Submit answers and get scores
* Track results and download certificates

---
## 🔗 Useful Links

- ✅ **Frontend GitHub Repository:** [LMS Micro Certification Frontend](https://github.com/vinnu382910/LMS-Micro-Certification-frontend)
- ✅ **Deployed Frontend:** [https://lms-micro-certification-frontend.vercel.app/](https://lms-micro-certification-frontend.vercel.app/)
- ✅ **Backend GitHub Repository:** [LMS Micro Certification Backend](https://github.com/vinnu382910/LMS-Micro-Certification-backend)
- ✅ **Deployed Backend:** [https://lms-micro-certification-backend.onrender.com](https://lms-micro-certification-backend.onrender.com)

---
## 🚀 Tech Stack

* **Node.js** – Server environment
* **Express.js** – Web framework
* **MongoDB + Mongoose** – Database & ODM
* **JWT** – Authentication
* **Bcrypt.js** – Password hashing
* **PDFKit** – Certificate generation
* **UUID** – For unique exam session IDs
* **dotenv** – Environment configuration

---

## ⚙️ Project Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/micro-certifications-backend.git
cd micro-certifications-backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env` file

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4️⃣ Start the server

```bash
npm start
```

The backend will run at:

```
http://localhost:5000
```

---

## 🧩 Folder Structure

```
backend/
│
├── controllers/
│   ├── authController.js
│   ├── quizController.js
│   ├── resultController.js
│   ├── certificateController.js
│
├── models/
│   ├── User.js
│   ├── Question.js
│   ├── Result.js
│   ├── ExamSession.js
│
├── routes/
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   ├── resultRoutes.js
│   ├── certificateRoutes.js
│
├── middleware/
│   └── authMiddleware.js
│
├── server.js
└── .env
```

---

## 🧠 Core Feature Highlight — Exam Session System

When a user starts a quiz, the backend **creates a unique `examSessionId`** (using `uuidv4()`) that:

* Is stored in the `ExamSession` collection
* Prevents multiple submissions or re-entry after expiry
* Is verified before fetching quiz questions or submitting answers

🔹 Implemented in `quizController.js` → `exports.startExam`

```js
// POST /quiz/start/:quizId
exports.startExam = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;

  const quiz = await QuestionSet.findOne({ quizId });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  const existingSession = await ExamSession.findOne({ userId, quizId, isSubmitted: false });
  if (existingSession) {
    return res.status(200).json({
      success: true,
      message: "Existing active session found",
      examSessionId: existingSession.examSessionId,
    });
  }

  const examSessionId = uuidv4();
  const expiresAt = new Date(Date.now() + quiz.timeLimit * 60 * 1000);

  await ExamSession.create({ userId, quizId, examSessionId, expiresAt });

  res.status(201).json({
    success: true,
    message: "Exam started successfully",
    examSessionId,
    expiresAt,
  });
};
```

---

## 📡 API Endpoints Overview

### 🔐 Authentication

| Method | Endpoint         | Description                 | Protected |
| ------ | ---------------- | --------------------------- | --------- |
| POST   | `/auth/register` | Register a new user         | ❌         |
| POST   | `/auth/login`    | Login and receive JWT token | ❌         |

---

### 🧭 Quiz APIs

| Method | Endpoint              | Description                                      | Protected |
| ------ | --------------------- | ------------------------------------------------ | --------- |
| GET    | `/quiz/list`          | Fetch all available quizzes (with filters)       | ❌         |
| GET    | `/quiz/info/:quizId`  | Fetch quiz details (without questions)           | ✅         |
| POST   | `/quiz/start/:quizId` | Start a new exam session (creates examSessionId) | ✅         |
| GET    | `/quiz/:quizId`       | Get quiz questions (requires valid session)      | ✅         |
| POST   | `/quiz/submit`        | Submit quiz answers                              | ✅         |

#### 🧾 Example — Start Exam

**Request:**

```http
POST /quiz/start/pythonEasy
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "message": "Exam started successfully",
  "examSessionId": "9c2210f0-4f85-4d0f-9e83-2ad90a2325f1",
  "expiresAt": "2025-10-22T14:55:00.000Z"
}
```

---

### 🏁 Submit Quiz

**Request:**

```http
POST /quiz/submit
Authorization: Bearer <JWT_TOKEN>

{
  "quizId": "pythonEasy",
  "examSessionId": "9c2210f0-4f85-4d0f-9e83-2ad90a2325f1",
  "answers": ["A", "C", "B", "D", "A"]
}
```

**Response:**

```json
{
  "success": true,
  "score": 4,
  "pass": true,
  "resultId": "6717f9c223b52f63dce3d2f1",
  "totalQuestions": 5,
  "correctCount": 4,
  "wrongCount": 1,
  "technologies": ["Python", "Basics"]
}
```

---

### 📜 Certificates

| Method | Endpoint                | Description                                             | Protected |
| ------ | ----------------------- | ------------------------------------------------------- | --------- |
| POST   | `/certificate/download` | Generate and download PDF certificate for passed result | ✅         |

**Request:**

```http
POST /certificate/download
Authorization: Bearer <JWT_TOKEN>

{
  "resultId": "6717f9c223b52f63dce3d2f1"
}
```

---

### 📊 Results

| Method | Endpoint               | Description                                       | Protected |
| ------ | ---------------------- | ------------------------------------------------- | --------- |
| GET    | `/user/passed-results` | Fetch user quiz history with filters & pagination | ✅         |

**Query Params Supported:**

```
pass=true&level=Easy&minScore=3&maxScore=10&page=1&limit=10
```

---

## 🗂️ Mongoose Models Overview

### 🧍 User

```js
{
  name: String,
  email: String,
  password: String
}
```

### 🧾 QuestionSet

```js
{
  quizId: String,
  title: String,
  description: String,
  level: String,
  timeLimit: Number,
  passMarks: Number,
  totalQuestions: Number,
  technologies: [String],
  questions: [
    { questionText, options, correctAnswer }
  ]
}
```

### 🧩 ExamSession

```js
{
  userId: ObjectId,
  quizId: String,
  examSessionId: String,
  startedAt: Date,
  expiresAt: Date,
  isSubmitted: Boolean
}
```

### 📈 Result

```js
{
  userId: ObjectId,
  userName: String,
  quizId: String,
  quizTitle: String,
  level: String,
  score: Number,
  pass: Boolean,
  technologies: [String],
  correctCount: Number,
  wrongCount: Number,
  totalQuestions: Number,
  date: Date
}
```

---

## 🧰 Utility

* **JWT Auth Middleware:**
  Protects routes with `verifyToken()`
* **Password Encryption:**
  `bcrypt.hash()` and `bcrypt.compare()` used
* **Certificate Generation:**
  Uses `pdfkit` with logos and dynamic user data

---

## 🧹 To Update Model Fields in MongoDB

If you added new fields to your Mongoose models:

```bash
npm run shell
```

Then inside the Mongo shell:

```js
db.questionsets.updateMany({}, { $set: { technologies: ["General"] } })
db.results.updateMany({}, { $set: { wrongCount: 0, correctCount: 0 } })
```

Restart your server after schema update:

```bash
npm restart
```

---

## 🏁 Author

👤 **Vinay Kalva**
Full Stack Developer | Cybersecurity Enthusiast
📧 [vinaykalva712@gmail.com](mailto:vinaykalva712@gmail.com)
🌐 GitHub: [vinaykalva712](https://github.com/vinaykalva712)

---
