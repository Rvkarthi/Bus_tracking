const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // In prod, use process.env.JWT_SECRET
        if (decoded.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied: Admin only' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const verifyOrg = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        if (decoded.role !== 'organization') {
            return res.status(403).json({ msg: 'Access denied: Organization only' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = { verifyAdmin, verifyOrg };
