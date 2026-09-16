const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Re-validate role against Postgres to prevent stale tokens (PRD 4.3 Rule 1)
        const user = await prisma.user.findUnique({ where: { id: decoded.uid } });
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        if (user.role !== decoded.role) {
            return res.status(403).json({ error: 'Role mismatch. Token invalidated.' });
        }

        req.user = decoded; // { uid, role }
        req.dbUser = user; // Avoid re-fetching in controllers if needed
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
