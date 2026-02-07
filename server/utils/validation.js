// Shared validation utilities

function validateUsername(username) {
    // Username must be 3-30 characters, alphanumeric with underscores and hyphens
    const regex = /^[a-zA-Z0-9_-]{3,30}$/;
    return ((typeof username === 'string') && (regex.test(username)));
}

function validatePassword(password) {
    // Min 5 chars, one uppercase, one lowercase, one number, one symbol
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/;
    return ((typeof password === 'string') && (regex.test(password)));
}

module.exports = {
    validateUsername,
    validatePassword
};
