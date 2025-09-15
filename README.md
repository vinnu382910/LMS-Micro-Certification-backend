
# 📚 LMS Micro Certification Backend

This is the **LMS Micro Certification Backend**, a RESTful API built with Node.js, Express, and MongoDB to support an online learning platform where users can register, log in, take quizzes, and download certificates. The backend handles authentication, quiz data management, and secure result submission.

---

## 🔗 Useful Links

- ✅ **Frontend GitHub Repository:** [LMS Micro Certification Frontend](https://github.com/vinnu382910/LMS-Micro-Certification-frontend)
- ✅ **Deployed Frontend:** [https://lms-micro-certification-frontend.vercel.app/](https://lms-micro-certification-frontend.vercel.app/)
- ✅ **Deployed Backend:** [https://lms-micro-certification-backend.onrender.com](https://lms-micro-certification-backend.onrender.com)

---

## 🚀 Features

- ✅ User registration and login with JWT authentication
- ✅ Secure routes for submitting quiz answers
- ✅ Fetch quiz questions without authentication
- ✅ Generate PDF certificates upon quiz completion
- ✅ Role-based access management
- ✅ Well-structured code with MVC architecture and middleware

---

## 📦 Technologies Used

- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- PDFKit for certificate generation
- Environment variables using dotenv
- CORS handling and error management

---

## 📁 Folder Structure

```

backend/
├── controllers/
│   ├── authController.js
│   ├── quizController.js
│   └── certificateController.js
├── middlewares/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   ├── Question.js
│   └── Result.js
├── routes/
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   └── certificateRoutes.js
├── utils/
│   └── pdfGenerator.js
├── .env
├── server.js
└── README.md

````

---

## 🔑 Environment Variables (.env)

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
````

---

## 📖 API Documentation

### ✅ **1. Register User**

**Endpoint:** `POST /api/auth/register`
**Description:** Register a new user.
**Request Body Example:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Example:**

```json
{
  "message": "User registered successfully"
}
```

---

### ✅ **2. Login User**

**Endpoint:** `POST /api/auth/login`
**Description:** Login an existing user and receive a JWT token.
**Request Body Example:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Example:**

```json
{
  "user": {
    "_id": "123456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

---

### ✅ **3. Get Quiz Questions (Public)**

**Endpoint:** `GET /api/quiz/:quizId`
**Description:** Fetch questions for a quiz without authentication.
**Example Request:**
`GET /api/quiz/quiz1`

**Response Example:**

```json
[
  {
    "_id": "q1",
    "quizId": "quiz1",
    "questionText": "What is JavaScript?",
    "options": ["Programming language", "Coffee", "Game", "Library"]
  },
  ...
]
```

---

### ✅ **4. Submit Quiz (Protected)**

**Endpoint:** `POST /api/quiz/submit`
**Description:** Submit quiz answers (requires authentication).
**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Request Body Example:**

```json
{
  "quizId": "quiz1",
  "answers": ["Programming language", "Option2", "Option3"]
}
```

**Response Example:**

```json
{
  "success": true,
  "score": 3,
  "pass": true,
  "resultId": "result_id_here"
}
```

---

### ✅ **5. Generate Certificate**

**Endpoint:** `POST /api/certificate`
**Description:** Generate and download a PDF certificate.
**Request Body Example:**

```json
{
  "name": "John Doe",
  "quizTitle": "JavaScript Basics",
  "score": 8
}
```

**Response:**
A downloadable PDF file will be returned as an attachment.

---

## 📜 Authentication Middleware

All protected routes use `verifyToken`, which checks for a valid JWT in the request headers:

```javascript
Authorization: Bearer <jwt_token>
```

If missing or invalid, the API responds with:

```json
{
  "message": "Access Denied"
}
```

or

```json
{
  "message": "Invalid Token"
}
```

---

## 🛠 Running the Project Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/vinnu382910/LMS-Micro-Certification-backend.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables.

4. Run the server:

   ```bash
   npm start
   ```

The backend will start on the port defined in `.env` (default is `5000`).

---

## 📂 Postman Testing Collection

You can create requests in Postman for:

* **Register** → `POST /api/auth/register`
* **Login** → `POST /api/auth/login`
* **Get Quiz Questions** → `GET /api/quiz/:quizId`
* **Submit Quiz** → `POST /api/quiz/submit` (with Bearer token)
* **Download Certificate** → `POST /api/certificate` (file download)

---

## 📢 Notes

* Ensure MongoDB is running and properly connected.
* JWT tokens are required for all protected routes.
* Quiz questions are public, but submitting answers and downloading certificates are secured.
* CORS issues can occur if the frontend and backend domains differ—configure CORS or proxy as needed.
* Environment variables are essential for security and should not be exposed.

---

## 💻 License

This project is open-source and free to use.

---
Happy learning and coding! 🚀📚
