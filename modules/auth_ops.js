const express = require('express');
const router = express.Router();
const SHA1 = require('sha1');
var db = require('../utils/database');

// login
router.post('/login', (req, res) => {
    let table = 'users';
    let email = req.body.email;
    let passwd = req.body.passwd;

    if (!email || !passwd){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    db.query(`SELECT * FROM ${table} WHERE email = ? AND passwd = ?`, [email, SHA1(passwd)], ()=>{
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.length == 0){
            return res.status(400).json({ error: 'Invalid credentilas!' });
        }

        // Logged in -> token generate ...
    });

});

// register
router.post('/register', (req, res) => {
    let table = 'users';
    let data = req.body;

    let fields = Object.keys(data);
    let values = Object.values(data);

    let namedIdx = fields.indexOf('name');
    let emailIdx = fields.indexOf('email');
    let passwdIdx = fields.indexOf('passwd');
    let confirmIdx = fields.indexOf('confirm');

    if (namedIdx < 0 || emailIdx < 0 || passwdIdx < 0 || confirmIdx < 0 ){
        return res.status(400).json({ error: 'Missing required fields!' });
    }

    if (values[passwdIdx] != values[confirmIdx]) {
        return res.status(400).json({ error: `The passwords does't match!` });
    }
    
    db.query(`SELECT * FROM ${table} WHERE email=?`, [values[emailIdx]], (err, results) => {
        if (err){
            return res.status(500).json({ error: err.error });
        }

        if (results.length > 0){
            return res.status(400).json({ error: 'This e-mail already registered!' });
        }

        if (passwdIdx > 0){
            values[passwdIdx] = SHA1(values[passwdIdx]);
        }

        fields.splice(confirmIdx, 1);
        values.splice(confirmIdx, 1);

        fields = fields.join(', ');
        values =  "'" + values.join("', '") + "'";

        db.query(`INSERT INTO ${table} (${fields}) VALUES(${values})`, (err, _results) => {
            if (err){
                return res.status(500).json({ error: err.error });
            }

            return res.status(201).json({ message: 'User registered successfully!' });
        });

    });

});

// token verification

// isloggedin 

module.exports = router;