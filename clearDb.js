var mysql      = require('mysql');
const config		= require('./config');

var connection = mysql.createConnection({
	host     : config.get('db_host'),
	user     : config.get('db_user'),
	password : config.get('db_password'),
	database : config.get('db_name')
});
var perfix = config.get('db_perfix');

connection.connect();

connection.query("CREATE TABLE "+perfix+"users ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"token varchar(100), "+
	"vk_id INT (11), "+
	"balance INT (11), "+
	"role varchar(100), "+
	"ref INT( 11 ), "+
	"ref_balance FLOAT, "+
	"date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});


connection.query("CREATE TABLE "+perfix+"site_setting ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"option_name varchar(100) NOT NULL, "+
	"option_value text, "+
	"PRIMARY KEY (id) )", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});



connection.query("CREATE TABLE "+perfix+"other_data ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"name varchar(100), "+
	"data TEXT, "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});


connection.query("CREATE TABLE "+perfix+"payments ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"vk_id INT (11), "+
	"sum FLOAT, "+
	"resources INT (11), "+
	"date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});
connection.query("CREATE TABLE "+perfix+"partner_balance ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"partner_vk_id INT (11), "+
	"from_id INT (11), "+
	"sum FLOAT, "+
	"date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});

connection.query("CREATE TABLE "+perfix+"covers ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"uid INT (11), "+
	"main_image varchar(100), "+
	"widgets text, "+
	"interval_d INT (11), "+
	"group_id INT (11), "+
	"reset_type varchar(100), "+
	"group_token varchar(100), "+
	"secret_key varchar(100), "+
	"status INT (11), "+
	"freeze_status INT (11), "+
	"schedule text, "+
	"last_update INT(11), "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});


connection.query("CREATE TABLE "+perfix+"weather ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"city varchar(100), "+
	"weather_info text, "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});

connection.query("CREATE TABLE "+perfix+"traffic ( "+
	"id INT (11) NOT NULL AUTO_INCREMENT, "+
	"city_id INT (11), "+
	"traffic_info text, "+
	"PRIMARY KEY (id) ) DEFAULT CHARSET=utf8mb4", function(err, rows, fields) {
	if(err) {console.log('Ошибка');}
	else {console.log('База создана!');}
});

// var sql2 = "CREATE TABLE "+perfix+"vk_tasks (id INT (11) NOT NULL AUTO_INCREMENT, author_id INT (11) NOT NULL, prise INT (11) NOT NULL, prise_for_users INT (11) NOT NULL, n_count INT (11) NOT NULL, d_count INT (11), type varchar(100), status varchar(100), info text, PRIMARY KEY (id) )";
// connection.query(sql2, function(err, rows, fields) {
// 	if(err) {console.log('Ошибка');}
// 	else {console.log('База создана!');}
// });


connection.end();