require('dotenv').config({url: __dirname + '/../.env'});

const logger = require('./logger');

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit:     process.env.DB_CONN_LIMIT,
    multipleStatements:  process.env.DB_MULTI_QUERY,
    host:                process.env.DB_HOST,
    user:                process.env.DB_USER,
    password:            process.env.DB_PASS,
    port:                process.env.DB_PORT,
    database:            process.env.DB_NAME,
    timezone:            process.env.DB_TIMEZONE,
});

function query(sql, params, callback) {
    
    const DEBUG = process.env.APP_DEBUG_MODE === 'true';
 
    const startTime = Date.now();
  
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    pool.query(sql, params, (err, results) => {
        if (err) {
            if (DEBUG) {
                logger.error(`DB query error: ${err.message}`);
            }
            return callback(err, null);
        }
        
        if (DEBUG) {
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            const count = Array.isArray(results) ? results.length : results.affectedRows;
            const txt = Array.isArray(results) ? 'record(s) sent' : 'record(s) affected';
            logger.info(`DB query successful: ${sql} -> ${count} ${txt} (${executionTime} ms)`);
        }

        return callback(null, results);
    });

}

module.exports = { query };