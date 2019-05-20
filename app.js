const express		= require('express'),
		fs				= require('fs'),
		bodyParser	= require('body-parser'),
		path			= require('path'),
		config		= require('./config');

const fileUpload = require('express-fileupload');
const cluster = require('cluster');

var query = require('./app/libs/mysql.js').query;
const request = require('request');


if (cluster.isMaster) {
	for (var i = 0; i < 2; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {  
		console.log('Worker %d died with code/signal %s. Restarting worker...', worker.process.pid, signal || code);
		cluster.fork();
	});



	// загрузка данных которые не нужно обновлять очень часто
	loadOtherData()
	setInterval(() => loadOtherData(), 1000 * 60 * 10); //обновление раз в 10 минут

	loadFinance()
	setInterval(() => loadFinance(), 1000 * 60 * 60); //обновление раз в 10 минут


	// настройки 'cron'
	function cron() {
		let myDate = new Date();
		let min = myDate.getMinutes();
		// let min = 45;
		if(min == 0) min = 60

		let _process = 1;
		for (var id in cluster.workers) {
			cluster.workers[id].send([min, _process]);
			_process++;
		}
	}
	function cronStarter() {
		let myDate = new Date();
		let sec = myDate.getSeconds();
		
		if(sec == 0 || sec == 1) {
			// console.log('start cron');
			setInterval(() => cron(), 1000 * 60);
			cron()
		} else {
			setTimeout(cronStarter, 500);
		}
	}
	cronStarter()
	// cron()

	// setTimeout(()=> {
	// 	let _process = 1;
	// 	for (var id in cluster.workers) {
	// 		cluster.workers[id].send([60, _process]);
	// 		_process++;
	// 	}
	// }, 5000)


} else {
	//console.log(`${cluster.worker.id}:${cluster.worker.process.pid}`)

	const app = express();
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.urlencoded( {extended: true} ) );
	app.use(bodyParser.json());
	app.use(fileUpload());

	require('./app/middleware/passport.js')(app);
	require('./app/middleware/cron.js')(app);
	require('./app/routes')(app);

	
	// =================
	//  Очистка памяти
	// =================
	var gcInterval;

	function init() {
		if(global.gc) gcInterval = setInterval(function() { gcDo(); }, 1000 * 60 * 10);
	}

	function gcDo() {
		console.log('>> Очистка памяти')
		global.gc();
		clearInterval(gcInterval);
		init();
	}
	init();

	app.listen(config.get('port'), function () {
		var myDate = new Date();
		let hour = myDate.getHours() > 9 ? myDate.getHours() : '0'+myDate.getHours();
		let minutes = myDate.getMinutes() > 9 ? myDate.getMinutes() : '0'+myDate.getMinutes();

		console.log(hour+':'+minutes, 'Example app listening on port '+config.get('port'));
	});
}




function loadFinance() {
	let _money = [
		'USD',
		'EUR',
		'RUB',
		'UAH',
		'BYN',
		'THB',
		'BTC',
		'LTC',
		'ETH'
	];

	let rate_url = `https://openexchangerates.org/api/latest.json?app_id=${config.get('openexchangerates_app_id')}&symbols=${_money.join(',')}&show_alternative=1`;

	request.get(rate_url, (error, response, body) => {
		body = JSON.parse(body)
		let quotes = body.rates;
		let my_data = {};

		// "разворачиваем" значения
		for(let i in quotes) {
			// let _i = i.replace('USD', '');
			let _i = i;
			for(let j in quotes) {
				// let _j = j.replace('USD', '');
				let _j = j;
				let price = quotes[i] / quotes[j]
				if(price > 0.01) {
					price = price.toFixed(2)
				} else {
					price = price.toFixed(8)
				}
				my_data[_j + _i] = price;
			}
		}

		// console.log(my_data)


		query('SELECT `name` FROM `cover_other_data` WHERE ?', {
			name: 'rates'
		}).then(rows => {
			if(rows.length == 0) {
				query('INSERT INTO `cover_other_data` SET ?', {
					name: 'rates',
					data: JSON.stringify(my_data)
				});
			} else {
				query("UPDATE `cover_other_data` SET ? WHERE `name` = 'rates'", {
					data: JSON.stringify(my_data)
				});
			}

		}).catch(err => {
			console.log(err)
		});
	});
}




function loadOtherData(){
	// проверка пробных периодов (120 часов)
	query("UPDATE `cover_users` SET ? WHERE `date`<NOW()-INTERVAL 72 HOUR AND `role` = 'user'", {
		role: 'user_end',
		balance: 0
	}).then(res => {
		// console.log(res)
	}).catch(err => {
		console.error(err)
	})
}