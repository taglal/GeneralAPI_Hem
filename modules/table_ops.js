const express = require('express');
const router = express.Router();
const { tokenchecker } = require('../utils/jwt');

var db = require('../utils/database');

const publicTables = process.env.PUBLIC_TABLES ? process.env.PUBLIC_TABLES.split(',').map(table => table.trim()) : [];

//public endpoints

//all record from public tables
router.get('/public/:table', (req, res) => {
    let table = req.params.table;
    
    if (!publicTables.includes(table)) {
        return res.status(403).json({ error: 'Access denied to this table' });
    }
    db.query(`SELECT * FROM ${table}`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

//specific record from public tables
router.get('/public/:table/:id', (req, res) => {
    let table = req.params.table;
    let id = req.params.id;

    if (!publicTables.includes(table)) {
        return res.status(403).json({ error: 'Access denied to this table' });
    }
    db.query(`SELECT * FROM ${table} WHERE ID = ?`, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

//specific record from public tables by field and value
router.get('/public/:table/:field/:value', (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let value = req.params.value;

    if (!publicTables.includes(table)) {
        return res.status(403).json({ error: 'Access denied to this table' });
    }
    db.query(`SELECT * FROM ${table} WHERE ${field} = ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

//specific record from public tables by field and value with operator
router.get('/public/:table/:field/:operator/:value', (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let operator = getOps(req.params.operator);
    let value = req.params.value;
    if (!publicTables.includes(table)) {
        return res.status(403).json({ error: 'Access denied to this table' });
    }
    if (operator === 'LIKE' || operator === 'NOT LIKE') {
        value = '%' + req.params.value + '%';
    }

    db.query(`SELECT * FROM ${table} WHERE ${field} ${operator} ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

//private endpoints
router.use('/private', tokenchecker); // Apply the tokenchecker middleware to all routes under /private

// SELECT ALL RECORDS FROM A TABLE
router.get('/:table', tokenchecker, (req, res) => {
    let table = req.params.table;

    db.query(`SELECT * FROM ${table}`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
    
});

// SELECT A SPECIFIC RECORD BY ID FROM A TABLE
router.get('/:table/:id', tokenchecker, (req, res) => {
    let table = req.params.table;
    let id = req.params.id;

    db.query(`SELECT * FROM ${table} WHERE ID = ?`, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
    
});

// SELECT RECORDS FROM A TABLE WHERE A SPECIFIC FIELD MATCHES A VALUE
router.get('/:table/:field/:value', tokenchecker, (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let value = req.params.value;

    db.query(`SELECT * FROM ${table} WHERE ${field} = ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

// SELECT RECORDS FROM A TABLE WHERE A SPECIFIC FIELD MATCHES A VALUE WITH AN OPERATOR
router.get('/:table/:field/:operator/:value', tokenchecker, (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let operator = getOps(req.params.operator);
    let value = req.params.value;
    if (operator === 'LIKE' || operator === 'NOT LIKE') {
        value = '%' + req.params.value + '%';
    }

    db.query(`SELECT * FROM ${table} WHERE ${field} ${operator} ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

// ADD NEW RECORD TO A TABLE
router.post('/:table', (req, res) => {
    let table = req.params.table;
    let data = req.body;

    let fields = Object.keys(data).join(', ');
    let values = "'" + Object.values(data).join("', '") + "'";

    db.query(`INSERT INTO ${table} (${fields}) VALUES (${values})`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(201).json({ message: 'Record added successfully', id: results.insertId });
        }
    });

});

// UPDATE A SPECIFIC RECORD BY ID IN A TABLE
router.patch('/:table/:id', (req, res) => {
    let table = req.params.table;
    let id = req.params.id;
    let data = req.body;

    let updates = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');

    db.query(`UPDATE ${table} SET ${updates} WHERE ID = ?`, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json({ message: 'Record updated successfully' });
        }
    });

});

// UPDATE RECORDS IN A TABLE WHERE A SPECIFIC FIELD MATCHES A VALUE
router.patch('/:table/:field/:value', (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let value = req.params.value;
    let data = req.body;

    let updates = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');

    db.query(`UPDATE ${table} SET ${updates} WHERE ${field} = ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

// UPDATE RECORDS IN A TABLE WHERE A SPECIFIC FIELD MATCHES A VALUE WITH AN OPERATOR
router.patch('/:table/:field/:operator/:value', (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let operator = getOps(req.params.operator);
    let value = req.params.value;
    if (operator === 'LIKE' || operator === 'NOT LIKE') {
        value = '%' + req.params.value + '%';
    }
    let data = req.body;

    let updates = Object.entries(data).map(([key, value]) => `${key} = '${value}'`).join(', ');

    db.query(`UPDATE ${table} SET ${updates} WHERE ${field} ${operator} ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

// DELETE ALL RECORDS FROM A TABLE
router.delete('/:table', (req, res) => {
    let table = req.params.table;

    db.query(`DELETE FROM ${table}`, (err, _results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json({ message: 'All records deleted successfully' });
        }
    });

});

// DELETE A SPECIFIC RECORD BY ID FROM A TABLE
router.delete('/:table/:id', (req, res) => {
    let table = req.params.table;
    let id = req.params.id;

    db.query(`DELETE FROM ${table} WHERE ID = ?`, [id], (err, _results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json({ message: 'Record deleted successfully' });
        }
    });

});

// DELETE RECORDS FROM A TABLE WHERE A SPECIFIC FIELD MATCHES A VALUE
router.delete('/:table/:field/:value', (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let value = req.params.value;

    db.query(`DELETE FROM ${table} WHERE ${field} = ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

// DELETE RECORDS FROM A TABLE WHERE A SPECIFIC FIELD MATCHES A VALUE WITH AN OPERATOR
router.delete('/:table/:field/:operator/:value', (req, res) => {
    let table = req.params.table;
    let field = req.params.field;
    let operator = getOps(req.params.operator);
    let value = req.params.value;
    if (operator === 'LIKE' || operator === 'NOT LIKE') {
        value = '%' + req.params.value + '%';
    }

    db.query(`DELETE FROM ${table} WHERE ${field} ${operator} ?`, [value], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        } else {
            return res.status(200).json(results);
        }
    });
});

function getOps(op) {
    switch (op) {
        case 'eq':
            return '=';
        case 'lt':
            return '<';                     
        case 'gt':
            return '>';
        case 'lte':
            return '<=';        
        case 'gte':
            return '>=';        
        case 'ne':
            return '<>';                            
        case 'lk':
            return 'LIKE'; 
        case 'nlk':
            return 'NOT LIKE';        
        case 'nt':
            return 'NOT';
        default:
            throw new Error('Invalid operator');
    }
}

module.exports = router;