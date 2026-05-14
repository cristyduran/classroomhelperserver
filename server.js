//server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authenticateToken = require('./middleware/authenticationMiddleware');
const classRoutes = require('./routes/classRoutes'); 
const generateAuthToken = require('./controllers/authenticationController');
const Anthropic = require('@anthropic-ai/sdk');

const db = require('./db/db');

async function findUserByUsername(username) {
    const result = await db.execute({
        sql: 'SELECT * FROM credentials WHERE username = ?',
        args: [username]
    });
    return result.rows[0] || null;
}

// Passport Configuration
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await findUserByUsername(username);

            if (!user) {
                return done(null, false, { message: 'Invalid username' });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.hashedpassword);

            if (!isPasswordValid) {
                return done(null, false, { message: 'Invalid password' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser(async (username, done) => {
    try {
        const user = await findUserByUsername(username);
        done(null, user);
    } catch (err) {
        done(err);
    }
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

app.post('/checkUsername', async (req, res) => {
    const { username } = req.body;
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM credentials WHERE username = ?',
            args: [username]
        });
        const isUsernameAvailable = result.rows.length === 0;
        res.send({ available: isUsernameAvailable });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

app.post('/validatePassword', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM credentials WHERE username = ?',
            args: [username]
        });
        const row = result.rows[0];
        if (row) {
            const isPasswordValid = bcrypt.compareSync(password, row.password);
            res.send({ validation: isPasswordValid });
        } else {
            res.send({ validation: false });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

async function checkUsernameAvailability(username) {
    try {
        const result = await db.execute({
            sql: 'SELECT * FROM credentials WHERE username = ?',
            args: [username]
        });
        return result.rows.length === 0;
    } catch (err) {
        console.error(err.message);
        return false;
    }
}

app.post('/register', async (req, res) => {
    const { name, username, password } = req.body;

    const isUsernameAvailable = await checkUsernameAvailability(username);

    if (!isUsernameAvailable) {
        return res.send({ success: false, message: 'Username is already taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        await db.execute({
            sql: 'INSERT INTO credentials (name, username, password, hashedpassword) VALUES (?, ?, ?, ?)',
            args: [name, username, password, hashedPassword]
        });
        console.log('User registered successfully');
        res.send({ success: true, message: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', passport.authenticate('local'), (req, res) => {
    const userId = req.user.username;
    const token = generateAuthToken(userId);
    res.send({ validation: true, authToken: token });
});

app.use('/authenticatedRoute', authenticateToken);
app.use('/classes', authenticateToken, classRoutes);

module.exports = { app, db };

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening at port ${PORT}`));
