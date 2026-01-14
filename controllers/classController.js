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

async function getClassData(req, res) {
    //Fetch class data from the database based on the user Id
    const userId = req.user.userId;
    console.log('Received request to fetch class data for user ID:', userId); // Add logging here

    //const sql = 'SELECT class_id, class_name, grade_level FROM classes WHERE user_id = ?';
    const sql = 'SELECT class_id, class_name, grade_level FROM classes JOIN credentials ON classes.user_id = credentials.user_id WHERE credentials.username = ?;'

    console.log('Fetching class data for user ID:', userId);

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching class data:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log('Fetched class data:', rows);
        res.json(rows); //Send the fetched class data as JSON response
    });
}

async function getSingleClassData(req, res) {
    const { classId } = req.params; //capture classId from route parameters
    console.log('Fetching data for class ID:', classId); // Debugging

    const sql = 'SELECT class_id, class_name, grade_level FROM classes WHERE class_id =?';
    db.get(sql, [classId], (err, row) => {
        if (err) {
            console.error('Error fetching single class data:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(row);
    });
}

async function getClassRosterAndAssignments(req, res) {
    const { classId } = req.params;

    const studentsQuery = 'SELECT student_id, student_name FROM students WHERE class_id =?';
    const assignmentsQuery = 'SELECT assignment_id, assignment_name, assignment_icon FROM assignments WHERE class_id = ?';

    try {
        const students = await new Promise((resolve, reject) => {
            db.all(studentsQuery, [classId], (err, rows) => err ? reject(err) : resolve(rows));
        });

        const assignments = await new Promise((resolve, reject) => {
            db.all(assignmentsQuery, [classId], (err, rows) => err ? reject(err) : resolve(rows));
        });

        const completions = await new Promise ((resolve, reject) =>{
            db.all(
                `SELECT student_id, assignment_id, completed
                FROM student_assignments
                WHERE class_id =?`,
                [classId],
            (err, rows) => (err ? reject(err) : resolve(rows))
            );
        });
        console.log('Fetched students:', students);
        console.log('Fetched assignments:', assignments);

        res.json({ students, assignments, completions });

    } catch (error) {
        console.error('Error fetching class data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//new function to save student assignment completion
async function saveCompletion(req, res) {

}

module.exports = { createClass, getClassData, getSingleClassData, getClassRosterAndAssignments };



