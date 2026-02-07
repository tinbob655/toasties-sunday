const express = require('express');
const router = express.Router();
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const upload = multer();
const { authLimiter } = require('../middleware/rateLimit');
const { validateUsername, validatePassword } = require('../utils/validation');



class Account extends Model {};
Account.init({
    username: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
}, {sequelize, modelName: 'account'});


//routes
//query if a user is logged in
router.get('/queryLoggedIn', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username });
    } else {
        res.json({ loggedIn: false });
    };
});


//create a new account
router.post('/createAccount', authLimiter, upload.none(), async (req, res) => {
    const {username, password} = req.body;

    //make sure we have a username, password
    if (!username || !password) {
         return res.status(400).json({message: "Did not receive either a username or password"});
    };

    // Validate username format (alphanumeric, underscores, hyphens only, 3-30 chars)
    if (!validateUsername(username)) {
        return res.status(400).json({
            message: "Invalid username format. Must be 3-30 characters and contain only letters, numbers, underscores, or hyphens."
        });
    }

    //make sure the username provided is unique
    try {
        const duplicates = await Account.findAll({where: {username: username}});
        if (duplicates?.length > 0) {
            return res.status(409).json({message: "An account with that username already exists"});
        };

        //validate password
        if (!validatePassword(password)) {

            //password was invalid
            return res.status(409).json({message: "Password was not valid (must have at least: 5 characters, 1 uppercase character, 1 lowercase character, 1 number and 1 symbol)"});
        };

        //we are good to go, store the username and a hash of the user's password
        const passwordHash = await bcrypt.hash(password, 10);
        await Account.create({
            username: username,
            passwordHash: passwordHash,
        });

        // Log the user in by setting session
        req.session.user = { username };

        res.json({
            loggedIn: true,
            username: username,
        });
    }
    catch (error) {
        res.status(400).json(error);
    };
});


//log a new user in
router.post('/login', authLimiter, async (req, res) => {
    const {username, password} = req.body;

    //make sure we got a username and a password
    if (!username || !password) {
        return res.status(400).json({message: "Did not receive either a username or a password"});
    };

    // Validate username format to prevent injection
    if (!validateUsername(username)) {
        return res.status(401).json({message: "Invalid credentials"});
    }

    const user = await Account.findOne({where: {username}});

    if (!user) {
        return res.status(401).json({message: "No account with that username exists"});
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
        return res.status(401).json({message: "Invalid credentials"});
    };

    req.session.user = {username: user.username};
    res.json({loggedIn: true, username: user.username});
});


//log a user out
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({loggedIn: false});
    });
});


//query if a username exists
router.post('/usernameExists', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ exists: false, message: "No username provided" });
    };
    
    // Validate username format to prevent injection
    if (!validateUsername(username)) {
        return res.status(400).json({ exists: false, message: "Invalid username format" });
    }
    
    const user = await Account.findOne({ where: { username } });
    res.json({ exists: !!user });
});

//note: sudo check is handled client-side via VITE_SUDO_USERS env var to avoid unnecessary API calls

module.exports = router;