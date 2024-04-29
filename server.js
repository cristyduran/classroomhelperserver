//server.js
const express = require('express');
const session = require('express-session');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authenticateToken = require('./middleware/authenticationMiddleware');
const classRoutes = require('./routes/classRoutes'); 
const generateAuthToken = require('./controllers/authenticationController'); // Adjust the path accordingly


const db = require('./db/db');

async function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM credentials WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}
// Passport Configuration
passport.use(new LocalStrategy(
    // ... (your LocalStrategy configuration)
    async (username, password, done) => {

        // Find user by username in the database
        const user = await findUserByUsername(username);

        if (!user) {
            return done(null, false, { message: 'Invalid username' });
        }

        // Check if the provided password matches the stored hashed password
        const isPasswordValid = bcrypt.compareSync(password, user.hashedpassword);

        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid password' });
        }

        // Authentication successful, pass the user object to the next middleware or route handler
        return done(null, user);
    }
));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser(async (username, done) => {
    // Retrieve user from the database using the provided username
    const user = await findUserByUsername(username);
    done(null, user);
});

app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
})
app.use(express.json({ limit: '10mb' }))
app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

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
    db.run('INSERT INTO credentials (name, username, password, hashedpassword) VALUES (?, ?, ?, ?)', [name, username, password, hashedPassword], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        }
        //Registration success
        console.log('User registered successfully');
        res.send({ success: true, message: 'User registered succesfully' });
    });
});



app.post('/login', passport.authenticate('local'), (req, res) => {
    // Authentication successful
    const userId = req.user.username;
    const token = generateAuthToken(userId);
    res.send({ validation: true, authToken: token });
  });



// Apply the authentication middleware to specific routes or globally
app.use('/authenticatedRoute', authenticateToken);

// Use class-related routes
app.use('/classes', authenticateToken, classRoutes);

module.exports = {
    app,
    db,
};
console.log(module)

app.listen(3001, () => console.log('Listening at port 3001'));
