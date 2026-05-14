//db.js
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initializeDatabase() {
    await client.execute(`CREATE TABLE IF NOT EXISTS credentials (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        hashedpassword VARCHAR(255) NOT NULL
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS classes (
        class_id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name VARCHAR(255) NOT NULL,
        grade_level INTEGER NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES credentials(user_id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS students (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_name VARCHAR(255) NOT NULL,
        class_id INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS assignments (
        assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_name VARCHAR(255) NOT NULL,
        assignment_icon VARCHAR(255) NOT NULL,
        class_id INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(class_id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS student_assignments (
        student_assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        UNIQUE(student_id, class_id, assignment_id),
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (class_id) REFERENCES classes(class_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id)
    )`);

    console.log('Tables created or already exist.');
}

initializeDatabase().catch(console.error);

module.exports = client;
