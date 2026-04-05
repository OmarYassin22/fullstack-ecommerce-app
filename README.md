# 🛒 Fullstack E-commerce Application

A production-ready fullstack e-commerce application built using ASP.NET Core Web API and React.js.
The system supports authentication, product management, order processing, and online payment integration.

---

## 🚀 Live Demo

Frontend: https://bright-minds-kids.vercel.app/

---

## 🛠 Tech Stack

### Backend

* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* JWT Authentication
* Clean Architecture

### Frontend

* React.js
* Axios
* CSS / Tailwind

### Other

* Stripe (Payment Integration)
* RESTful APIs

---

## ✨ Features

* User Authentication (JWT)
* Role-based Authorization (Admin / User)
* Product Management
* Shopping Cart
* Order Management
* Payment Integration (Stripe)
* Admin Dashboard

---

## 🧠 Architecture

* Clean Architecture (Backend)
* Component-based architecture (Frontend)
* RESTful communication between frontend and backend

---

## 📂 Project Structure

```
fullstack-ecommerce-app/
│
├── backend/        # ASP.NET Core API
├── frontend/       # React App
└── README.md
```

---

## ⚙️ Setup & Run

### Backend

```
cd backend
dotnet restore
dotnet run
```

---

### Frontend

```
cd frontend
npm install
npm start
```

---

## 🔐 Environment Variables

Create `.env` or config file:

```
JWT_SECRET=
DB_CONNECTION=
STRIPE_KEY=
```

---

## 📸 Screenshots

### 🖥️ Home Page

<img width="1808" height="904" alt="image" src="https://github.com/user-attachments/assets/99a317a6-5a3a-4197-b0ce-0c5c4c44a7e5" />

### 🔐 Login Page

<img width="1811" height="887" alt="image" src="https://github.com/user-attachments/assets/d9e927fb-c134-4295-b01b-876e071a945e" />

### 🛍️ Products Page

<img width="1770" height="892" alt="image" src="https://github.com/user-attachments/assets/42cb9d7e-78ff-4e89-ac22-02d73aaa396e" />

### 🛒 Cart Page

<img width="1781" height="922" alt="image" src="https://github.com/user-attachments/assets/123e7ff4-5b4e-49ba-83ed-57a7b957bed3" />

### 📊 Admin Dashboard

<img width="1781" height="889" alt="image" src="https://github.com/user-attachments/assets/8b33bdc4-587c-433d-8b9f-f25f5e8eb590" />

---
## 📬 API Testing

You can test all API endpoints using Postman:

- Import the collection from the `postman` folder
- Set the `jwt_token` variable after login
### Collection Overview
<img width="455" height="305" alt="image" src="https://github.com/user-attachments/assets/ecb9f7c0-622e-495a-acda-7f514c235aed" />

### Sample Request
<img width="1081" height="689" alt="image" src="https://github.com/user-attachments/assets/e6bc16c8-8579-4ab2-9a92-b2e4dbe984aa" />

  
---

## 📌 Notes

* All sensitive data removed
* Uses environment variables for secrets
* Designed as a real-world fullstack system

---

## 👨‍💻 Author

Omar Yassin Sleem
.NET Backend Developer
