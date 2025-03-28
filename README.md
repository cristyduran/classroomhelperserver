# Classroom Helper Server
#### Video Demo:  <URL HERE>

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [File and Directory Structure](#file-and-directory-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Security](#security)
- [Design Choices & Challenges](#design-choices--challenges)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contacts](#contacts)

## Description

Classroom Helper Server is the backend of a web application designed for music teachers to manage their classes, students, and assignments efficiently. The backend handles user authentication, class creation, and data storage using SQLite. It provides a set of RESTful API endpoints that the frontend interacts with to retrieve and store information.

##### Key Use Cases
- Teachers can register and log in securely.

- Teachers can create, edit, and delete classes.

- Each class can have a list of students.

- Assignments can be assigned and tracked.

## Features
- User authentication (registration, login) with **JWT authentication**
- Class and student management
- Secure password storage with **bcrypt hashing**
- SQLite database for lightweight storage
- API endpoints for managing classroom-related operations

## Tech Stack 
- **Backend:** Node.js, Express.js  
- **Database:** SQLite  
- **Authentication:** JWT (JSON Web Tokens), bcrypt  
- **Version Control:** Git, GitHub  

## Getting Started 
### **1️⃣ Prerequisites**  
Ensure you have the following installed:  
- **Node.js**: [Download & Install](https://nodejs.org/)  
- **SQLite**: [Download & Install](https://www.sqlite.org/download.html) 

### **2️⃣ Installation**  

1. Clone this repository:  
   ```bash
   git clone https://github.com/your-username/classroom-helper-server.git
   cd classroom-helper-server
2. Install Dependencies:
    ```bash
    npm install
3. Setup Environment Variables
    - Create a `.env` file in the root directory and add:
    ```env
    PORT=3001
    JWT_SECRET=your_secret_key
4. Initialize the database:
    ```bash
    node db/init.js
5. Start the Server:
    ```bash
    node server.js
The server will be running at http://localhost:3001

## File & Directory Structure
1. Controllers - 
- `authenticationController.js`
    - Handles user registration, login, and password encryption
    - uses bcrypt to hash passwords
    - Generates JWT tokens for authentication
- `classController.js`
    - Manages class-related operations (creating, updating, deleting classes)
    - Fetches class data for logged-in users
    - Uses SQL queries to interact with the database
2. Database (`/db`) - Manages database connection
- `db.js`
    - Establishes connection to SQLite
    - Provides helper functions for querying the database
3. Middleware (`/middleware`) - Protects routes
- `authenticationMiddleware.js`
    - Middleware function that verifies JWT tokes
    - Ensures that only authneticated users can access protected routes
4. Routes (`/routes`) - Define API endpoints
- `classRoutes.js`
    - Maps HTTP requests to the correct controller functions
    - Defines routes such as:
        - `POST /class` → Create a new class
        - `GET /class/:id` → Get a class by ID
        - `DELETE /class/:id` → Delete a class
5. Other Important Files
- `server.js`
    - The main entry point of the application
    - Initializes Express.js, loads middleware, and connects routes
- `.gitignore`
    - Ensures sensitive files (e.g., database, node_modules) aren’t committed to Git
- `package.json`
    - Defines project dependencies and scripts
- `credentials.db`
    - SQLite database file storing user credentials and class information

## API Endpoints 📡
### 1️⃣ Check Username Availability

- **Endpoint:** ``/checkUsername``

- **Method:** ``POST``

- **Request Body:**
    ```json
    { "username": "johndoe" } 
- **Response:**
    ```json
    { "available": true }

### 2️⃣ User Registration

- **Endpoint:** ``/register``

- **Method:** ``POST``

- **Request Body:**
    ```json
    { 
  "name": "John Doe", 
  "username": "johndoe", 
  "password": "securepassword" 
    }
- **Response:**
    ```json
    { "message": "User registered successfully!" }

### 3️⃣ User Login

- **Endpoint:** ``/login``

- **Method:** ``POST``

- **Request Body:**
    ```json
    { 
  "username": "johndoe", 
  "password": "securepassword" 
    }
- **Response:**
    ```json
    { 
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
## Database Schema
This project uses **SQLite** as the database. The main tables include:
### Users Table (credentials.db)
```
    CREATE TABLE credentials (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
    );
```
### Classes Table
```
CREATE TABLE classes (
    class_id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES credentials(user_id)
);
```
## Security
- Passwords are **hashed using bcrypt** before storage.

- JWT (JSON Web Token) is used for authentication.

- Basic validation to prevent SQL Injection and unauthorized access.

## Design Choices & Challenges
1️⃣ Choosing SQLite for the Database
Why SQLite? It is lightweight and easy to set up for small-scale applications.

Alternative Considered: PostgreSQL for better scalability, but SQLite was chosen for simplicity.

2️⃣ Using JWT for Authentication
Why JWT? It allows token-based authentication, making API requests secure.

Alternative Considered: Session-based authentication, but JWT allows stateless authentication.

3️⃣ Structuring the API Endpoints
Why separate controllers? Keeps logic modular and reusable.

Alternative Considered: Placing all logic inside routes, but that would make the code harder to maintain.

4️⃣ Error Handling Strategy
Why structured JSON responses? It ensures frontend can handle different error cases properly.

Alternative Considered: Sending raw error messages, but structured JSON responses improve debugging.

## Future Improvements
- Add **role-based access control** (e.g., Admin, Teacher, Student).

- Implement **real-time updates** using WebSockets.

- Convert from SQLite to PostgreSQL/MySQL for scalability.

## License
This project is licensed under the MIT License.

## Acknowledgements
- CS50’s Introduction to Computer Science – For inspiring this project.

- Express.js & SQLite Documentation – For backend guidance.

- Peers & Instructors – For support and feedback.

## Contacts




