const express = require('express');
const router = express.Router();
const SHA1 = require('sha1');
var db = require('../utils/database');
const { generateToken, verifyToken, tokenchecker, adminchecker } = require('../utils/jwt');

// login
router.post('/login', (req, res) => {
    let table = 'users';
    let email = req.body.email;
    let passwd = req.body.passwd;

    if (!email || !passwd){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    db.query(`SELECT * FROM ${table} WHERE email = ? AND passwd = ?`, [email, SHA1(passwd)], (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.length == 0){
            return res.status(400).json({ error: 'Invalid credentilas!' });
        }

        // Logged in -> token generate ...
        const token = generateToken({
            id: results[0].id,
            name: results[0].name,
            email: results[0].email,
            role: results[0].role
            });
        return res.status(200).json({ token });
    });

});

// register
// register
router.post('/register', (req, res) => {
    const { name, email, passwd, confirm } = req.body;

    if (!name || !email || !passwd || !confirm) {
        return res.status(400).json({
            error: 'Missing required fields!'
        });
    }

    if (passwd !== confirm) {
        return res.status(400).json({
            error: "The passwords don't match!"
        });
    }

    db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    error: 'This e-mail already registered!'
                });
            }

            const hashedPassword = SHA1(passwd);

            // IDE KERÜL AZ INSERT
            db.query(
                `INSERT INTO users (name, email, passwd, role)
                 VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, 'user'],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    return res.status(201).json({
                        message: 'User registered successfully!'
                    });
                }
            );
        }
    );
});
// token verification

// isloggedin 

module.exports = router;