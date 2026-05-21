// classController.js
const db = require('../db/db');

async function createClass(req, res) {
    const { className, gradeLevel, students, assignments } = req.body;
    console.log('Request Body:', req.body);

    const userId = req.user ? req.user.userId : null;
    console.log('Received request with userId:', userId);

    try {
        const result = await db.execute({
            sql: 'INSERT INTO classes (class_name, grade_level, user_id) VALUES (?, ?, (SELECT user_id FROM credentials WHERE username = ?))',
            args: [className, gradeLevel, userId]
        });

        if (result.rowsAffected > 0) {
            const classId = Number(result.lastInsertRowid);
            console.log('Class ID:', classId);

            const studentsWithNames = students.filter(studentName => studentName.trim() !== '');

            for (const studentName of studentsWithNames) {
                await db.execute({
                    sql: 'INSERT INTO students (student_name, class_id) VALUES (?, ?)',
                    args: [studentName, classId]
                });
            }

            for (const assignment of assignments) {
                await db.execute({
                    sql: 'INSERT INTO assignments (assignment_name, assignment_icon, class_id) VALUES (?, ?, ?)',
                    args: [assignment.assignment, assignment.icon, classId]
                });
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
    const userId = req.user.userId;
    console.log('Received request to fetch class data for user ID:', userId);

    try {
        const result = await db.execute({
            sql: 'SELECT class_id, class_name, grade_level FROM classes JOIN credentials ON classes.user_id = credentials.user_id WHERE credentials.username = ?',
            args: [userId]
        });
        console.log('Fetched class data:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching class data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getSingleClassData(req, res) {
    const { classId } = req.params;
    console.log('Fetching data for class ID:', classId);

    try {
        const result = await db.execute({
            sql: 'SELECT class_id, class_name, grade_level FROM classes WHERE class_id = ?',
            args: [classId]
        });
        const row = result.rows[0];
        if (!row) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(row);
    } catch (err) {
        console.error('Error fetching single class data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getClassRosterAndAssignments(req, res) {
    const { classId } = req.params;
    console.log('Running student-data query for classId:', classId);

    try {
        const studentsResult = await db.execute({
            sql: 'SELECT student_id, student_name FROM students WHERE class_id = ?',
            args: [classId]
        });

        const assignmentsResult = await db.execute({
            sql: 'SELECT assignment_id, assignment_name, assignment_icon FROM assignments WHERE class_id = ?',
            args: [classId]
        });

        const completionsResult = await db.execute({
            sql: 'SELECT student_id, assignment_id, completed FROM student_assignments WHERE class_id = ?',
            args: [classId]
        });

        console.log('Fetched students:', studentsResult.rows);
        console.log('Fetched assignments:', assignmentsResult.rows);
        console.log('Fetched completions:', completionsResult.rows);

        res.json({
            students: studentsResult.rows,
            assignments: assignmentsResult.rows,
            completions: completionsResult.rows
        });
    } catch (error) {
        console.error('Error fetching class data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function saveCompletion(req, res) {
    const { classId } = req.params;
    const { student_id, assignment_id, completed } = req.body;

    try {
        await db.execute({
            sql: `INSERT INTO student_assignments (student_id, class_id, assignment_id, completed)
                  VALUES (?, ?, ?, ?)
                  ON CONFLICT(student_id, assignment_id, class_id)
                  DO UPDATE SET completed = excluded.completed`,
            args: [student_id, classId, assignment_id, completed ? 1 : 0]
        });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update assignment' });
    }
}

async function updateClass(req, res) {
    const { classId } = req.params;
    const { className, gradeLevel, students, assignments } = req.body;

    try {
        await db.execute({
            sql: `UPDATE classes SET class_name = ?, grade_level = ? WHERE class_id = ?`,
            args: [className, gradeLevel, classId]

        });

        await db.execute({
            sql: `DELETE FROM students WHERE class_id = ? `,
            args: [classId]
        })

        for (const student of students) {
            await db.execute({
                sql: 'INSERT INTO students (student_name, class_id) VALUES (?, ?)',
                args: [student, classId]
            })
        }

        await db.execute({
            sql: `DELETE FROM assignments WHERE class_id = ? `,
            args: [classId]
        })

        for (const assignment of assignments) {
            await db.execute({
                sql: 'INSERT INTO assignments (assignment_name, assignment_icon, class_id) VALUES (?, ?, ?)',
                args: [assignment.assignment, assignment.icon, classId]
            })
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update assignment' });
    }


}

module.exports = { createClass, getClassData, getSingleClassData, getClassRosterAndAssignments, saveCompletion, updateClass };



