/**
 * Authentication middleware to protect API routes
 */

// Checks if user is logged in (has valid session)
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
}

// Checks if user is logged in AND is the owner of the resource (or is admin)
function requireOwnerOrAdmin(usernameParam = 'username') {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }

        const resourceUsername = req.params[usernameParam] || req.body[usernameParam];
        const sessionUsername = req.session.user.username;

        // Check if user owns the resource or is an admin
        const adminUsers = (process.env.SUDO_USERS || '').split(',').map(u => u.trim());
        const isAdmin = adminUsers.includes(sessionUsername);
        const isOwner = resourceUsername === sessionUsername;

        if (isOwner || isAdmin) {
            req.isAdmin = isAdmin;
            return next();
        }

        return res.status(403).json({ error: 'Forbidden - You do not have access to this resource' });
    };
}

// Checks if user is an admin
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized - Please log in' });
    }

    const adminUsers = (process.env.SUDO_USERS || '').split(',').map(u => u.trim());
    const isAdmin = adminUsers.includes(req.session.user.username);

    if (isAdmin) {
        return next();
    }

    return res.status(403).json({ error: 'Forbidden - Admin access required' });
}

module.exports = {
    requireAuth,
    requireOwnerOrAdmin,
    requireAdmin
};
