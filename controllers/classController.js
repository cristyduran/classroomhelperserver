// classController.js
const db = require('../db/db');

async function createClass(req, res) {
    const { className, gradeLevel, students, assignments } = req.body;
    console.log('Request Body:', req.body);

    const userId = req.user ? req.user.userId : null;
    console.log('Received request with userId:', userId);

    try {
        console.log('SQL Statement:', 'INSERT INTO classes (class_name, grade_level, user_id) VALUES (?, ?, ?)', [className, gradeLevel, userId]);

        // Insert data into the 'classes' table
        console.log('Inserting data into the classes table...');
        const result = await new Promise((resolve, reject) => {
            db.run('INSERT INTO classes (class_name, grade_level, user_id) VALUES (?, ?, (SELECT user_id FROM credentials WHERE username = ?))', [className, gradeLevel, userId], function (err) {
                if (err) {
                    console.error('Error inserting into classes table:', err);
                    reject(err);
                } else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });

        // Check if the insertion was successful
        if (result.changes > 0) {
            const classId = result.lastID;
            console.log('Class ID:', classId);

            // Filter the students array to remove empty strings
            const studentsWithNames = students.filter(studentName => studentName.trim() !== '');
            // Insert students into the 'students' table
            console.log('Inserting students into the students table...');
            for (const studentName of studentsWithNames) {
                await db.run('INSERT INTO students (student_name, class_id) VALUES (?, ?)', [studentName, classId]);
            }

            // Insert assignments into the 'assignments' table
            console.log('Inserting assignments into the assignments table...');
            for (const assignment of assignments) {
                await db.run('INSERT INTO assignments (assignment_name, assignment_icon, class_id) VALUES (?, ?, ?)', [assignment.assignment, assignment.icon, classId]);
            }

            res.send({ success: true, message: 'Class created successfully' });
        } else {
            res.send({ success: false, message: 'Failed to create class' });
        }
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = createClass;


