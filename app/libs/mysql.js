var db = require('mysql');
config = require('../../config');

var pool = db.createPool({
	connectionLimit: config.get('connectionLimit'),
	host     : config.get('db_host'),
	user     : config.get('db_user'),
	password : config.get('db_password'),
	database : config.get('db_name'),
    acquireTimeout:  config.get('acquireTimeout')
});

exports.query = function (sql, props) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(
                sql, props,
                function (err, res) {
                    if (err) reject(err);
                    else resolve(res);
                }
            );
            connection.release();
        });
    });
};