const config = require('config')
const mysql = require('mysql');

const state = {
    pool: null
};

exports.connect = (done) => {

    state.pool = mysql.createPool({
        connectionLimit: 100, //important
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        port: config.database.port
    });

    return new Promise((resolve, reject) => {
        let conn = execute("Select version()", []);
        conn.then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
};

exports.get = (callback) => {
    return state.pool;
};

function execute(sql, param) {
    return new Promise((resolve, reject) => {
        state.pool.getConnection(function (error, connection) {
            if (error) {
                reject(error);
            } else {
                connection.query(sql, param, function (err, rows) {
                    connection.release();
                    if (!err) {
                        resolve(rows);
                    }
                    else {
                        reject(err);
                    }
                });

                connection.on('error', function (err) {
                    connection.release();
                    reject(err);
                });
            }
        });
    });
};

exports.execute = execute;