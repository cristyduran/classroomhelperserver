//authenticationController.js
const jwt = require('jsonwebtoken');

function generateAuthToken(userId) {
    console.log('Generating token for user ID:', userId);
    //Your token generation logic here
    //examples using jsonwebtoken library
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Generated token:', token);
    return token;
}

module.exports = generateAut