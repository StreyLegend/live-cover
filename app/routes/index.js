const VK = require('vk-io');
const vk = new VK();
const query = require('../libs/mysql.js').query;
const fs = require('fs');
const config = require('../../config');
const request = require('request');

const sha1 = require('sha1');
const sha256 = require('sha256');
const md5 = require('js-md5');




module.exports = app => {
	app.use(function(req,res,next){
		//res.locals.user = req.user; // так можно передать user'a во все запросы

		if(req.user) {
			if(req.user.balance >= 10000) {
				res.locals.show_feed_back = 1;
			} else {
				res.locals.show_feed_back = 0;
			}
		}


		var vk_info = req.session.vk_info;
		if(!vk_info || (vk_info.full_name == null)) {
			if (req.isAuthenticated()) {
				vk.setToken(req.user['token']);
				vk.api.users.get({
					fields: 'photo_50'
				}).then(_r=>{
					req.session.vk_info = {
						full_name: _r[0].first_name+' '+_r[0].last_name,
						photo: _r[0].photo_50
					};
					
					res.locals.session = req.session;
				}).catch(err => {
					console.error(err);

					req.session.vk_info = {
						full_name: null,
						photo: null
					};
					res.locals.session = req.session;
				});

			} else {
				req.session.vk_info = {
					full_name: null,
					photo: null
				};
				res.locals.session = req.session;
			}

		} else {
			res.locals.session = req.session;
		}

		
		next();
	});



	app.get('/show_all_cover_data', isLoggedIn, isAdmin, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE 1 ORDER BY `id` DESC").then(function(rows) {
			res.send({count: rows.length, data: rows})
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});





	app.get('/start_tester', (req, res) => {
		req.session.tester = true;
		res.send('Вы получили доступ к тестированию нововведений.')
	});



	app.get('/cover_count', (req, res) => {
		query("SELECT COUNT(*) FROM `cover_users`;").then(function(rows) {
			let r = rows[0]['COUNT(*)']+'';
			res.send(r)
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});


	function asdsad(arr){
		if(arr.length == 0) return false;

		query("UPDATE `cover_users` SET `role` = 'user_pro' WHERE ?", {
			vk_id: arr[0].vk_id
		}).then(res => {
			arr.splice(0, 1);
			asdsad(arr)
		});
	}


	app.get('/fix_db', (req, res) => {
		query("SELECT `vk_id` FROM `cover_payments` WHERE 1").then(function (rows) {
			asdsad(rows)
			res.send('ok');
		}).catch(function (err) {
			console.log('баланс Error', err);
		});
	});




	app.get('/', (req, res) => {
		res.render('other/land.ejs', {user: req.user});
	});


	app.get('/cabinet', isLoggedIn, (req, res) => {
		let response = (_count) => {
			let hours = 0;
			if(req.user.role == 'user') {
				let regDate = new Date(req.user.date);
				let nowDate = new Date();
				// endDate.setHours(endDate.getHours()+(24*5))

				let dateDifference = nowDate.getTime() - regDate.getTime();
				let remainsDate = new Date(dateDifference)

				hours = Math.floor(72 - (dateDifference / 1000 / (60 * 60)));
			}

			res.render('index.ejs', {user: req.user, cover_count: _count, hours: hours});
		}


		query("SELECT * FROM `cover_covers` WHERE ?", {
			uid: req.user.id
		}).then(resp => {
			response(resp.length);
		}).catch(err =>{
			response(0);
		})
	});
	app.get('/cabinet/groups', isLoggedIn, getGroups);


	
	app.get('/cabinet/buy/', isLoggedIn, (req, res) => {
		var id = req.params.id;
		res.render('pages/buy.ejs', {user: req.user, other_user: null});
	});
	
	app.get('/cabinet/buy/:uid', isLoggedIn, (req, res) => {
		var id = req.params.uid;
		
		query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {"vk_id": id}).then(function(rows) {
			if(rows == '') return res.send('Этот пользователь у нас не зареристрирован.<br><a href="/cabinet/buy/">Вернутся назад</a>');

			vk.setToken(req.user['token']);
			vk.api.users.get({
				user_ids: id,
				fields: 'photo_50'
			}).then(_r=> {
				res.render('pages/buy.ejs', {user: req.user, other_user: _r[0]});

			}).catch(err => {
				console.error(err);
				res.send('Произошла ошибка при получении информации о пользователи. Попробуйте обновить страницу через несколько секунд.');
			});

		}).catch(function (err) {
			res.send('Этот пользователь у нас не <b>зареристрирован</b>.')
		});
	});


	app.get('/session/', (req, res) => {
		res.send(req.session)
	});


	app.get('/ref/:refname', function (req, res) {
		req.session.ref = req.params.refname;
		res.redirect('/?ref='+req.params.refname);
	})

	app.get('/cabinet/partner/', isLoggedIn, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {"ref": req.user.vk_id}).then(function(rows) {
			// console.log(rows)
			query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {"vk_id": req.user.vk_id}).then(function(rows_2) {
				query("SELECT * FROM `"+config.get('db_perfix')+"partner_balance` WHERE ? ORDER BY `id` DESC", {
					partner_vk_id: req.user.vk_id
				}).then(function(rows_3) {
					res.render('pages/partner.ejs', {user: req.user, referrals: rows, ref_balance: rows_2[0].ref_balance, history: rows_3});
				});
			});

		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});




	app.get('/cabinet/cover', isLoggedIn, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {"uid": req.user.id}).then(function(rows) {

			if(rows != '') {
				var groups = [];
				for(var v of rows) {
					if(groups.indexOf(v.group_id) == -1) {
						groups.push(v.group_id);
					}
				}

				vk.setToken(req.user['token']);
				vk.api.groups.getById({
					group_ids: groups.join(',')
				}).then(_groups=>{
					var u_groups = {};
					for(var i in _groups) {
						u_groups[_groups[i].id] = {
							photo: _groups[i].photo_50,
							name: _groups[i].name
						};
					}

					res.render('pages/cover.ejs', {covers: rows, user: req.user, userGroups: u_groups});
				}).catch(err => {
					res.send(`Ошибка VK API<br>${err}`)
				});
			} else {
				res.render('pages/cover.ejs', {covers: rows, user: req.user, userGroups: {}});
			}
			
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});


	app.get('/cabinet/create_cover/', isLoggedIn, (req, res) => {
		var id = req.params.id;
		res.render('pages/create_cover.ejs', {user: req.user});
	});


	app.get('/cabinet/create_cover/:id', isLoggedIn, (req, res) => {
		var id = req.params.id;
		res.render('pages/create_cover.ejs', {gid: id, user: req.user, cover: false});
	});


	app.get('/cabinet/edit_cover/:id', isLoggedIn, (req, res) => {
		var id = req.params.id;

		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {"secret_key": id}).then(function(rows) {
			var r = rows[0]
			var __uid = r['uid'];
			
			if(req.user.id != __uid && (req.user.id != 2 && req.user.id != 4)){
				return res.redirect('/cabinet/cover/');
			}

			vk.setToken(req.user['token']);
			vk.api.groups.get({
				filter: 'editor',
				extended: 1
			}).then(uGroups=>{
				var _u_groups = {};
				var _ug = uGroups.items;
				for(var i in _ug) {
					_u_groups[_ug[i].id] = {
						photo: _ug[i].photo_50,
						name: _ug[i].name
					};
				}

				res.render('pages/edit_cover.ejs', {cover: rows[0], user: req.user, userGroups: JSON.stringify(_u_groups)});
			}).catch(err => {
				res.send(`Ошибка VK API<br>${err}`)
			});


			if(rows != '') {
			} else {
				
			}
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});


	app.get('/cabinet/faq/:id', isLoggedIn, (req, res) => {
		var id = req.params.id;

		if(id == 'editor')
			res.render('pages/faq_editor.ejs', {user: req.user});
	});





	// app.get('/users', isLoggedIn, isAdmin, (req, res) => {
	// 	query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE 1").then(function(rows) {
	// 		// console.log(rows);
	// 		res.render('pages/admin/users.ejs', {users: rows, user: req.user});
	// 	}).catch(function (err) {
	// 		console.log('Error');
	// 		console.log(err);
	// 	});
	// });

	app.get('/balance_up/:uid/:summ', isAdmin, (req, res) => {
		var uid = req.params.uid;
		var summ = req.params.summ;

		query("UPDATE `cover_users` SET `balance` = `balance` + "+summ+" WHERE `id` = "+ uid+"").then(function (rows) {
			res.redirect('/users');
		}).catch(function (err) {
			console.log('баланс Error', err);
		});
	});


	app.get('/users', isLoggedIn, isAdmin, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE 1 ORDER BY `id` DESC").then(function(rows) {

			query("SELECT `ref` FROM `cover_users` WHERE `date` >= CURDATE()").then(function(date_1) {
				query("SELECT `ref` FROM `cover_users` WHERE `date` >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)").then(function(date_2) {
					query("SELECT `ref` FROM `cover_users` WHERE `date` >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)").then(function(date_3) {
						query("SELECT `ref` FROM `cover_users` WHERE `date` >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)").then(function(date_4) {
							let metriki = [
								[date_1.length, 0],
								[date_2.length, 0],
								[date_3.length, 0],
								[date_4.length, 0]
							];

							for(let v of date_1)
								if(v.ref != null) metriki[0][1] += 1;

							for(let v of date_2)
								if(v.ref != null) metriki[1][1] += 1;

							for(let v of date_3)
								if(v.ref != null) metriki[2][1] += 1;

							for(let v of date_4)
								if(v.ref != null) metriki[3][1] += 1;

							res.render('pages/admin/users.ejs', {users: rows, user: req.user, metriki: metriki});
						})
					})
				})
			})


		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});


	app.get('/top_partner', isLoggedIn, isAdmin, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE `ref` != ''").then(function(rows) {
			// console.log(rows)

			query("SELECT `vk_id`, `ref_balance` FROM `"+config.get('db_perfix')+"users` WHERE `ref_balance` > 0").then(function(_p) {
				var partners = {};
				for(var u of rows) {
					var ref = u.ref;

					if(!partners[ref]) {
						partners[ref] = 1;
					} else {
						partners[ref] = partners[ref] + 1;
					}
				}

				var uids = [];
				for(var i in partners) {
					uids.push(i);
				}


				
				vk.setToken(req.user['token']);
				vk.api.users.get({
					user_ids: uids.join(),
					fields: 'photo_50'
				}).then(response=>{
					//console.log(response)
					var new_partners = [];
					for(var i in response) {
						var uInfo = {};

						for(var j in partners) {
							var _id = +j;
							if(response[i].id == _id) {
								uInfo = {
									id: +j,
									name: response[i].first_name+' '+response[i].last_name,
									photo: response[i].photo_50,
									count: partners[j],
									ref_balance: 0
								};
								// new_partners.push({
								// 	id: +j,
								// 	name: response[i].first_name+' '+response[i].last_name,
								// 	photo: response[i].photo_50,
								// 	count: partners[j]
								// });
							}
						}

						for(var k in _p) {
							if(response[i].id == _p[k].vk_id) {
								uInfo.ref_balance = _p[k].ref_balance;
							}
						}

						new_partners.push(uInfo)
					}


					//var sort_result = [];
					new_partners.sort(function(a, b) {
						return b.count - a.count;
					});
					//console.log(sort_result)

					res.render('pages/admin/top_partner.ejs', {user: req.user, partners: new_partners});

				}).catch(function (err) {
					res.send('VK API error!<br>'+ err)
				});

			});

			
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});




	app.get('/partner_balance', isLoggedIn, isAdmin, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"partner_balance` WHERE 1 ORDER BY `id` DESC").then(function(rows) {
			// console.log(rows)
			res.render('pages/admin/partner_balance.ejs', {user: req.user, part_balance: rows});
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});



	app.get('/dashboard', isLoggedIn, isAdmin, (req, res) => {
		res.render('pages/admin/dashboard.ejs', {user: req.user});
	});



	





	// app.get('/covers', isLoggedIn, isAdmin, (req, res) => {
	// });

	app.get('/covers', isLoggedIn, isAdmin, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE 1 ORDER BY `id` DESC").then(function(rows) {
			//console.log(rows);
			var groups = [];

			for(var v of rows) {
				if(groups.indexOf(v.group_id) == -1) {
					groups.push(v.group_id);
				}
			}

			var executes_groups = [{group_ids: ''}, {group_ids: ''}];
			for(var i in groups) {
				if(i < 500) {
					if(executes_groups[0].group_ids == '') {
						executes_groups[0].group_ids += `${groups[i]}`
					} else {
						executes_groups[0].group_ids += `,${groups[i]}`
					}
				} else {
					if(executes_groups[1].group_ids == '') {
						executes_groups[1].group_ids += `${groups[i]}`
					} else {
						executes_groups[1].group_ids += `,${groups[i]}`
					}
				}
			}


			vk.setToken(req.user['token']);
			vk.executes('groups.getById', executes_groups).then(_groups => {
				var u_groups = {};

				for(var _gro of _groups) {
					for(var i in _gro) {
						u_groups[_gro[i].id] = {
							photo: _gro[i].photo_50,
							name: _gro[i].name,
							group_url: 'https://vk.com/'+_gro[i].screen_name
						};
					}
				}

				res.render('pages/admin/covers.ejs', {covers: rows, user: req.user, userGroups: u_groups});
			}).catch(err => {
				res.send(`Ошибка VK API<br>${err}`)
			});


		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	});











	app.get('/login', (req, res) => {
		res.render('pages/login.ejs');
	});



	app.post('/partners/write_off/', isLoggedIn, isAdmin, (req, res) => {
		var data = req.body;

		query("INSERT INTO `cover_partner_balance` SET ?", {
			partner_vk_id: data.vk_id,
			from_id: null,
			sum: data.sum * -1
		}).then(function(rows) {
			if(data.add_res == 'true') {
				var add_resurces = Math.floor(calcSum(data.sum) * 1.3);
				query('SELECT `id` FROM `cover_users` WHERE ?', {
					vk_id: data.vk_id
				}).then(_user => {
					if(_user != '')
						query("UPDATE `cover_covers` SET `freeze_status` = NULL WHERE `uid` = "+_user[0].id+" AND `freeze_status` = 2");
				});

			} else {
				var add_resurces = 0;
			}
			console.log(data.add_res, add_resurces, data.sum, calcSum(data.sum) * 1.3)

			query("UPDATE `cover_users` SET `balance` = `balance` + "+add_resurces+", `ref_balance` = `ref_balance` - "+ data.sum +" WHERE ?", {
				vk_id: data.vk_id
			}).then(function (rows_2) {
				res.send('OK')
			}).catch(function (err) {
				console.log('Error', err);
				res.send('error')
				// console.log(err);
			});
		});
	});



	app.post('/partners/get_resurce/', isLoggedIn, (req, res) => {
		let sum = req.body.sum;
		let user_session_balance = req.user.ref_balance;
		let user_vk_id = req.user.vk_id;
		let user_id = req.user.id;

		if(sum <= 0) return res.send('error')
		if(sum > user_session_balance) sum = user_session_balance;

		// console.log(sum, user_session_balance)
		telegram_alert(`Обмен партнёрских (${sum} руб.) на ресурсы.\nПользователь: vk.com/id${user_vk_id}`);

		query("INSERT INTO `cover_partner_balance` SET ?", {
			partner_vk_id: user_vk_id,
			from_id: null,
			sum: sum * -1
		}).then(function(rows) {
			var add_resurces = Math.floor(calcSum(sum) * 1.3);

			query("UPDATE `cover_users` SET `balance` = `balance` + "+add_resurces+", `ref_balance` = `ref_balance` - "+ sum +" WHERE ?", {
				vk_id: user_vk_id
			}).then(function (rows_2) {
				query("UPDATE `cover_covers` SET `freeze_status` = NULL WHERE `uid` = "+user_id+" AND `freeze_status` = 2");
				res.send('OK')
			}).catch(function (err) {
				console.log('Error', err);
				res.send('error')
				// console.log(err);
			});
		});
	});



	app.post('/youtube_channel_id', isLoggedIn, (req, res) => {
		let link = req.body.link;
		let channelId = '';

		if(!link || link.indexOf('youtube.com/') == -1) return res.send('nope!');

		// получайем ID из нормальной ссылки
		// пример: https://www.youtube.com/channel/UCtLYK_-VrW2v2jyH5IMkTuA/channels
		if(link.indexOf('youtube.com/channel/') > -1) {

			channelId = link.replace(/.+channel\//, '');
			channelId = channelId.replace(/\/.+/, '');
			res.send(channelId);

		} else if(link.indexOf('youtube.com/user') > -1) {

			let userName = '';
			userName = link.replace(/.+user\//, '');
			userName = userName.replace(/\/.+/, '');

			let apiKey = config.get('youtube_api_key');
			let ytbApiVideoStatistics = `https://www.googleapis.com/youtube/v3/channels?forUsername=${userName}&part=id&key=${apiKey}`;
			request.get(ytbApiVideoStatistics, function(error, response, body){
				if(error) return res.send('nope!');
		
				let items = JSON.parse(body).items;
				if(items.length == 0 || !items[0].id) return res.send('nope!');

				res.send(items[0].id)
			});

		}
	});



	// обработка платежей
	app.get('/payments', isLoggedIn, isAdmin, (req, res) => {
		query("SELECT * FROM `"+config.get('db_perfix')+"payments` WHERE 1 ORDER BY `id` DESC").then(function(rows) {

			query("SELECT `sum` FROM `cover_payments` WHERE `date` >= CURDATE()").then(function(pay_1) {
				query("SELECT `sum` FROM `cover_payments` WHERE `date` >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)").then(function(pay_2) {
					query("SELECT `sum` FROM `cover_payments` WHERE `date` >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)").then(function(pay_3) {
						query("SELECT `sum` FROM `cover_payments` WHERE `date` >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)").then(function(pay_4) {
							let metriki = [
								[pay_1.length, 0],
								[pay_2.length, 0],
								[pay_3.length, 0],
								[pay_4.length, 0]
							];

							for(let v of pay_1)
								metriki[0][1] += v.sum;

							for(let v of pay_2)
								metriki[1][1] += v.sum;

							for(let v of pay_3)
								metriki[2][1] += v.sum;

							for(let v of pay_4)
								metriki[3][1] += v.sum;

							// res.render('pages/admin/users.ejs', {users: rows, user: req.user, metriki: metriki});
							res.render('pages/admin/payments.ejs', {payments: rows, user: req.user, metriki: metriki});
						})
					})
				})
			})



			// res.render('pages/admin/payments.ejs', {payments: rows, user: req.user});
		});
	});
	app.post('/payments/yandex/', getPayment.yandex);
	app.post('/payments/wm/', getPayment.wm);
	app.post('/payments/free_kassa/', getPayment.free_kassa); //a32pyxuh  xrratwr5
	app.post('/payments/cryptonator/', getPayment.cryptonator);
	app.get('/fk_redirect/:vk_id/:sum', getPayment.free_kassa_redirect); //a32pyxuh  xrratwr5

	app.post('/payments/direct/', isLoggedIn, isAdmin, getPayment.direct); // прямой платёж
	app.post('/payments/remove_pay/', isLoggedIn, isAdmin, getPayment.removePay); // прямой платёж
}



const getPayment = {
	refill: (_vk_id, sum, datetime) => {
		// созраняем платёж в базу
		query("INSERT INTO `cover_payments` SET ?", {
			vk_id: _vk_id,
			sum: sum,
			resources: calcSum(sum) // нужна функция для расчёта кол-ва ресурсов получаемых за н-ую сумму
		}).then(function (rows) {
			console.log('платёж добавлен в базу')

			// пополняем баланс
			query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {
				vk_id: _vk_id
			}).then(function(rows) {
				if(rows != '') {
					query("UPDATE `cover_users` SET `balance` = `balance` + "+calcSum(sum)+" WHERE `vk_id` = '"+_vk_id+"'").then(function (rows_2) {
						if(rows[0].role == 'user' || rows[0].role == 'user_end')
							query("UPDATE `cover_users` SET `role` = 'user_pro' WHERE `vk_id` = '"+_vk_id+"'");


						query("UPDATE `cover_covers` SET `freeze_status` = NULL WHERE `uid` = "+rows[0].id+" AND `freeze_status` = 2");
						// telegram_alert('баланс пополнен')

					}).catch(function (err) {
						console.log('Error', err);
						telegram_alert('ошибка в пополнении баланса')
						// console.log(err);
					});

					//проверяем наличие партнёра зарегистрировшего его
					if(rows[0].ref != null) {
						// telegram_alert('плательщик является чьимте рефералом')
						
						let partners_015 = [ 1, 2, 3 ]; // id партнеров с увеличенной ставкой

						let procent = 0.1;
						if(partners_015.indexOf(rows[0].ref) != -1) procent = 0.15;

						query("UPDATE `cover_users` SET `ref_balance` = `ref_balance` + "+sum * procent +" WHERE `vk_id` = '"+rows[0].ref+"'").then(function (rows_3) {
							// telegram_alert(`Начислены ${sum * 0.1} рублей комиссионных для vk.com/id${rows[0].ref}`)

							query("INSERT INTO `cover_partner_balance` SET ?", {
								partner_vk_id: rows[0].ref,
								from_id: _vk_id,
								sum: sum * procent
							});

						}).catch(function (err) {
							console.log('Error', err);
							telegram_alert('ошибка при начислении комиссии')
							// console.log(err);
						});
					}
				}
			});

		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	},
	
	
	
	cryptonator: (req, res) => {
		// telegram_alert('Запрос с яндекс денег')
		let data = req.body;
		console.log(data)

		if(data.invoice_status != 'paid') return res.send('OK');

		let _vk_id = data.label;

		telegram_alert(`💰 ${data.invoice_amount} RUB (крипта)`);
		getPayment.refill(_vk_id, data.invoice_amount);

		res.send('OK')
	},




	yandex: (req, res) => {
		// telegram_alert('Запрос с яндекс денег')
		let data = req.body;

		if(data.unaccepted == true && data.codepro == true) // data.label == ''
			return res.send('OK');

		if(data.label == '')
			return res.send('OK');

		
		let secret = config.get('yandex_money_secret');
		let _vk_id = data.label;
		let sha1_string = sha1(`${data.notification_type}&${data.operation_id}&${data.amount}&${data.currency}&${data.datetime}&${data.sender}&${data.codepro}&${secret}&${data.label}`);


		if(sha1_string != data.sha1_hash) {
			// хеши не совпали
			console.log('хеши не совпали')
			telegram_alert('хеши не совпали')

		} else {
			telegram_alert(`💰 ${data.amount} RUB (Яндекс.Деньги)`);
			getPayment.refill(_vk_id, data.amount);
		}

		res.send('OK')
	},


	wm: (req, res) => {
		// telegram_alert('Запрос от WebMoney')
		let data = req.body;

		if(data.LMI_HOLD) {
			telegram_alert('Ошибка! Платёж с протекцией')
			return res.send('OK');
		}



		let secret = config.get('webmoney_secret');
		let _vk_id = data.FIELD_1;
		let sha256_string = sha256(`${data.LMI_PAYEE_PURSE}${data.LMI_PAYMENT_AMOUNT}${data.LMI_PAYMENT_NO}${data.LMI_MODE}${data.LMI_SYS_INVS_NO}${data.LMI_SYS_TRANS_NO}${data.LMI_SYS_TRANS_DATE}${secret}${data.LMI_PAYER_PURSE}${data.LMI_PAYER_WM}`);
		sha256_string = sha256_string.toUpperCase();
		
		if(sha256_string != data.LMI_HASH) {
			// хеши не совпали
			console.log('хеши не совпали')
			// telegram_alert('хеши не совпали')
		} else {
			telegram_alert(`💰 ${data.LMI_PAYMENT_AMOUNT} RUB (WebMoney)`);
			getPayment.refill(_vk_id, data.LMI_PAYMENT_AMOUNT);
		}

		res.send('OK')
	},


	free_kassa: (req, res) => {
		let data = req.body;

		console.log(data)

		let sign = md5(`${config.get('free_kassa_id')}:${data.AMOUNT}:${config.get('free_kassa_secret_1')}:${data.MERCHANT_ORDER_ID}`);
		if(sign != data.SIGN) {
			telegram_alert('хеши не совпали')
		} else {
			telegram_alert(`💰 ${data.AMOUNT} RUB (Free-kassa)`);
			getPayment.refill(data.MERCHANT_ORDER_ID, data.AMOUNT);
		}

		res.send('YES')
	},


	free_kassa_redirect: (req, res) => {
		let vk_id = req.params.vk_id;
		let sum = req.params.sum;

		let sign = md5(`${config.get('free_kassa_id')}:${sum}:${config.get('free_kassa_secret_2')}:${vk_id}`);
		let payUrl = `https://www.free-kassa.ru/merchant/cash.php?m=${config.get('free_kassa_id')}&oa=${sum}&o=${vk_id}&s=${sign}&lang=ru`;

		res.redirect(payUrl)
	},



	direct: (req, res) => {
		telegram_alert('регистрация прямого платежа')
		let data = req.body;
		getPayment.refill(data.vk_id, data.sum);
		res.send('OK')
	},



	removePay: (req, res) => {
		query("DELETE FROM `cover_payments` WHERE ?", {
			id: req.body.id
		})
		res.send('OK')
	}
}



function telegram_alert(mes) {
	return false;

	let text = `*\[live-cover.ru\]*\n${encodeURIComponent(mes)}`;
	let url = "https://api.telegram.org/bot_BOT_TOKEN_/sendmessage?chat_id=_CHAT_ID_&text="+text+"&parse_mode=Markdown";
	request.get(url)
}



function calcSum(sum) {
	var answer = Math.floor(sum * 288);
	var sale = 0;

	if(sum > 4000) {
		sale = 0.25;
	} else if(sum >= 3000) {
		sale = 0.2;
	} else if(sum >= 2000) {
		sale = 0.15;
	} else if(sum >= 1000) {
		sale = 0.1;
	} else if(sum >= 500) {
		sale = 0.05;
	} else {
		sale = 0;
	}


	return answer + (Math.floor(answer * sale));
}



const getGroups = (req, res) => {
	vk.setToken(req.user['token']);

	vk.api.groups.get({
		filter: 'editor',
		extended: 1
	}).then(response=>{
		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {"uid": req.user.id}).then(function(rows) {
			for(var val of rows) {
				for(var i in response.items) {
					if(val.group_id == response.items[i].id){
						response.items[i].status = val.status;
						response.items[i].freeze_status = val.freeze_status;
						response.items[i].secret_key = val.secret_key;
					}
				}
			}
			// console.log(response)
			

			res.render('pages/groups.ejs', {groups: response, user: req.user});

			// if(rows != '') {
			// } else {
				
			// }
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
	}).catch(err => {
		console.error(err);
	});
}






function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else
		res.redirect('/login');
}


function isAdmin(req, res, next) {
	if(req.user.vk_id == 234395370)
		return next();

	res.redirect('/cabinet');
}


function randomString(len, charSet) {
	charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
}

// function isAdmin(req, res, next) {
// 	if(req.user.role == 'admin') {
// 		return next();
// 	} else {
// 		res.redirect('/');
// 	}
// }