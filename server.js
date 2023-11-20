const express = require('express')
const app = express()
const cors = require('cors')
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');


app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
})
app.use(express.json({ limit: '10mb' }))

let db = new sqlite3.Database('credentials.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the access database.')
});

app.post('/checkUsername', (req, res) => {
    const { username } = req.body;

    db.get('SELECT * FROM credentials WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            const isUsernameAvailable = !row;
            res.send({ available: isUsernameAvailable });
        }
    });
});

app.post('/validatePassword', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM credentials WHERE username = ?`, [username], (err, row) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        }
        if (row) {
            const storedHashedPassword = row.password;
            const isPasswordValid = bcrypt.compareSync(password, storedHashedPassword);

            if (isPasswordValid) {
                res.send({ validation: true });
            } else {
                res.send({ validation: false });
            }
        } else {
            res.send({ validation: false });
        }
    });
});

app.post('/register', async (req, res) => {
    const { name, username, password } = req.body;

    // Check if the username is already taken
    const isUsernameAvailable = await checkUsernameAvailability(username);

    if (!isUsernameAvailable) {
        // Username is not available
        return res.send({ success: false, message: 'Username is already taken' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert the user into the database (you need to modify this query based on your table structure)
    db.run('INSERT INTO credentials (name, username, password) VALUES (?, ?, ?)', [name, username, hashedPassword], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } 
        //Registration success
        console.log('User registered successfully');
        res.send({ success: true, message: 'User registered succesfully' });
    });
});

async function checkUsernameAvailability(username) {
    return new Promise((resolve) => {
        db.get('SELECT * FROM credentials WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error(err.message);
                resolve(false);
            } else {
                resolve(!row);
            }
        });
    });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM credentials WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        }
        if (row) {
            const storedHashedPassword = row.password;
            const isPasswordValid = bcrypt.compareSync(password, storedHashedPassword);

            if (isPasswordValid) {
                res.send({ validation: true });
            } else {
                res.send({ validation: false });
            }
        } else {
            res.send({ validation: false });
        }
    });
});

app.listen(3001, () => console.log('Listening at port 3001'));
