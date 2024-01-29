const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Extract the token from the Authorization header
        console.log('Authentication Middleware is running...');
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        console.log('Received token:', token);
    
        if (!token) {
            // Token not provided
            console.log('Token not provided. Unauthorized request.');
            return res.status(401).json({ error: 'Unauthorized' });
        }
    
        try {
            // Verify and decode the token
            const decoded = jwt.verify(token, 'yourSecretKey');
    
            // Attach the decoded information to the request object
            req.user = decoded;
            console.log('Decoded user information:', decoded);
    
            // Continue to the next middleware or route handler
            next();
        } catch (error) {
            // Token verification failed
            console.error('Token verification failed:', error);
    
            return res.status(403).json({ error: 'Forbidden' });
        }
};

module.exports = authenticateToken;