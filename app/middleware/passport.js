var query = require('../libs/mysql.js').query,
	passport = require('passport'),
	VKontakteStrategy = require('passport-vkontakte').Strategy,
	config = require('../../config'),
	cookieParser  = require('cookie-parser'),
	session = require('express-session');
	MySQLSessionStore = require('express-mysql-session');
	// flash = require('connect-flash');




module.exports = function (app) {
	app.use(cookieParser()); // read cookies (needed for auth)
	app.use(session({
		secret: 'dsfsdf2fsdfFdsafd9sd34adkasjd',
		resave: true,
		saveUninitialized: true,
		cookie: { maxAge: 1000 * 60 * 60 * 24 * 30},
		store: new MySQLSessionStore({
			host: config.get('db_host'),
			user: config.get('db_user'),
			password: config.get('db_password'),
			database: config.get('db_name')
		})
	}));


	app.use(passport.initialize());
	app.use(passport.session());

	// app.use(flash());

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done) {
		query("SELECT * FROM `cover_users` WHERE `id` = '"+id+"'", function(err, rows, fields) {
			done(err, rows[0]);
		});
	});






	passport.use(new VKontakteStrategy({
			clientID:				config.get('vk_clientID'),
			clientSecret:			config.get('vk_clientSecret'),
			callbackURL:			"/auth/vk/callback",
			scope:					['groups', 'photos', 'offline'],
			passReqToCallback: 	true
		},
		function myVerifyCallbackFn(req, accessToken, refreshToken, params, profile, callback) {
			query("SELECT * FROM `cover_users` WHERE ?", {"vk_id": profile.id}).then(function(rows) {
				if(rows != '') {
					req.session.vk_info = {
						full_name: profile.displayName,
						photo: profile.photos[0].value
					};
					query("UPDATE `cover_users` SET `token` = '"+accessToken+"' WHERE `id` = "+rows[0].id+"");
					query("UPDATE `cover_covers` SET `freeze_status` = NULL WHERE `uid` = "+rows[0].id+" AND `freeze_status` = 1");
					callback(null, rows[0]);
				} else {
					var newUser = {
						vk_id: profile.id,
						token: accessToken,
						balance: 3600,
						ref_balance: 0,
						role: "user"
					};

					if(req.session.ref) {
						if(req.session.ref != profile.id)
							newUser.ref = req.session.ref;
					}

					query("INSERT INTO `cover_users` SET ?", newUser).then(function (rows) {
						var answ = newUser;
						answ.id = rows.insertId;
						// return callback(null, answ);
						callback(null, answ);

					}).catch(function (err) {
						console.log('Error');
						console.log(err);
					});
				}
			}).catch(function (err) {
				console.log('Error');
				console.log(err);
			});
		}
	));



	app.get('/auth/vk', passport.authenticate('vkontakte'));
	app.get('/auth/vk/callback', passport.authenticate('vkontakte', {failureRedirect: '/login'}),
	function(req, res) {
		res.redirect('/cabinet/groups/');
	});


	app.get('/logout', function(req, res){
		delete req.session.vk_info;
		req.logout();
		res.redirect('/');
	});
};