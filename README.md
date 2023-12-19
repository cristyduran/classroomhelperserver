# classroomhelperserver
Classroom Helper Server
=======================

This is the backend server for the Classroom Helper application. It provides APIs for user registration, login, and other functionalities required for managing user authentication and authorization.

Getting Started
---------------

Follow these instructions to set up and run the Classroom Helper Server on your local machine.

### Prerequisites

*   Node.js: [Download and install Node.js](https://nodejs.org/)
*   SQLite: [Download and install SQLite](https://www.sqlite.org/download.html)

### Installation

1.  Clone the repository:
    
    bashCopy code
    
    `git clone https://github.com/your-username/classroom-helper-server.git cd classroom-helper-server`
    
2.  Install dependencies:
    
    bashCopy code
    
    `npm install`
    
3.  Run the server:
    
    bashCopy code
    
    `node server.js`
    
    The server will be running at [http://localhost:3001](http://localhost:3001).
    

Endpoints
---------

### 1\. Check Username Availability

*   **Endpoint:** `/checkUsername`
*   **Method:** `POST`
*   **Parameters:**
    *   `username` (string): Username to check for availability.

### 2\. Validate Password

*   **Endpoint:** `/validatePassword`
*   **Method:** `POST`
*   **Parameters:**
    *   `username` (string): Username to validate.
    *   `password` (string): Password to validate.

### 3\. User Registration

*   **Endpoint:** `/register`
*   **Method:** `POST`
*   **Parameters:**
    *   `name` (string): User's name.
    *   `username` (string): Desired username.
    *   `password` (string): User's password.

### 4\. User Login

*   **Endpoint:** `/login`
*   **Method:** `POST`
*   **Parameters:**
    *   `username` (string): User's username.
    *   `password` (string): User's password.

Database
--------

The server uses SQLite as the database. The database file is named `credentials.db`, and it contains a table named `credentials` for storing user information.

Security
--------

*   Passwords are hashed using bcrypt before being stored in the database.
*   JSON Web Tokens (JWT) are used for user authentication.






