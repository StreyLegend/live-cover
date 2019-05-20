var query = require('../libs/mysql.js').query,
	config = require('../../config');

const fs = require('fs');
var request = require('request');
const VK = require('vk-io'); // https://github.com/negezor/vk-io
const path = require('path');
const stream = require('stream');

var Canvas = require('canvas'),
	 Image = Canvas.Image;

	 
const cluster = require('cluster');


const parse = require('xml-parser');
const rss_parser = require('rss-parser');

const {parallel} = require('async');


const vk = new VK();
// var passThrough = new stream.PassThrough();

// var img_user = path.join(__dirname, '../../public/uploads/user_50.jpg');
// var _avarDir = path.join(__dirname, '../../public/uploads/avatars/');
// var coverDir = path.join(__dirname, '../../public/uploads/cover_image/');
// var _uploadDir = path.join(__dirname, '../../public/uploads/');

var _dirUserCover = path.join(__dirname, '../../public/uploads/cover/');
var _dirCoverForVk = path.join(__dirname, '../../public/uploads/cover_for_vk/');
var _dirPreview = path.join(__dirname, '../../public/uploads/preview/');




const imgGeneration = {
	preview: (data, widgets, callback) => {
		//console.log('-->>', data)

		var img = new Image();
		img.onload = function() {
			var _w = JSON.parse(widgets);
			_w = checkWidgetsData(_w);

			if(img.width >= 1590 && img.height >= 400) {
				widgets = retinaCord(_w);
				var canvas = new Canvas(1590, 400);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 1590, 400);
			} else {
				var canvas = new Canvas(795, 200);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 795, 200);
			}


			var new_data = {file_name: data.image};
			loadNewData([_w, data.group_id, data.token], 0, (_d) => {
				for(var i in _d) {
					new_data[i] = _d[i];
				}

				imgGeneration.loopPreview([canvas, ctx], new_data, _w, 0, callback);
			});

			img = null;
		}

		if(data.image)
			img.src = _dirUserCover + data.image;
		else
			img.src = data.file.data;
		//callback()
	},


	saveImage: (data, widgets, callback) => {
		//console.log('-->>', data)

		var img = new Image();
		img.onload = function() {
			var _w = JSON.parse(widgets);
			_w = checkWidgetsData(_w);

			if(img.width >= 1590 && img.height >= 400) {
				widgets = retinaCord(_w);
				var canvas = new Canvas(1590, 400);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 1590, 400);
			} else {
				var canvas = new Canvas(795, 200);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 795, 200);
			}

		

			var new_data = {file_name: data.image};
			loadNewData([_w, data.group_id, data.token], 0, (_d) => {
				for(var i in _d) {
					new_data[i] = _d[i];
				}

				imgGeneration.loopOnlySave([canvas, ctx], new_data, _w, 0, callback);
			});

			img = null;
		}

		if(data.image)
			img.src = _dirUserCover + data.image;
		else
			img.src = data.file.data;
		//callback()
	},

	createContext: (data, callback, error_func) => {
		var img = new Image();
		img.onerror = function(){
			console.error('Ошибка загрузки изображения' + data.main_image)
			if(error_func) error_func('createContext_error')
		}
		img.onload = function() {
			var widgets = JSON.parse(data.widgets);
			widgets = checkWidgetsData(widgets);

			if(img.width >= 1590 && img.height >= 400) {
				widgets = retinaCord(widgets);
				var canvas = new Canvas(1590, 400);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 1590, 400);
			} else {
				var canvas = new Canvas(795, 200);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 795, 200);
			}


			var new_data = {file_name: data.main_image};
			loadNewData([widgets, data.group_id, data.group_token], 0, (_d) => {
				for(var i in _d) {
					new_data[i] = _d[i];
				}

				imgGeneration.loop([canvas, ctx], new_data, widgets, 0, callback);
			});

			img = null;
		}
		img.src = _dirUserCover + data.main_image;
	},



	loop: (context, data, widgets, _i, callback) => {
		if(widgets.length == _i) {
			// console.log('сохраняем картинку ')
			imgGeneration.save(context[0], data.file_name, callback);

			context = null;
			data = null;
			widgets = null;
 
		} else {
			if(!widgets[_i] || !widgets[_i].name) return imgGeneration.loop(context, data, widgets, _i + 1, callback)

			imgLayouts[widgets[_i].name](context, data, widgets[_i], function(new_context){
				imgGeneration.loop(new_context, data, widgets, _i + 1, callback)
			})
		}
	},



	loopOnlySave: (context, data, widgets, _i, callback) => {
		if(widgets.length == _i) {
			var out = fs.createWriteStream(_dirCoverForVk + data.file_name)
			var stream = context[0].createJPEGStream({
				bufsize: 4096, // old value 2048
				quality: 100
			});
			stream.pipe(out)
			stream.on('end', function(){
				// console.log('save end')
				setTimeout(()=>{
					callback(_dirCoverForVk + data.file_name);
				}, 10)
				
				context[0] = null;
				out = null;
				stream = null;
			});

 
		} else {
			imgLayouts[widgets[_i].name](context, data, widgets[_i], function(new_context){
				imgGeneration.loopOnlySave(new_context, data, widgets, _i + 1, callback)
			})
		}
	},



	loopPreview: (context, data, widgets, _i, callback) => {
		if(widgets.length == _i) {
			var out = fs.createWriteStream(_dirPreview + data.file_name)
			// var test = fs.createWriteStream(path.join(__dirname, '../../public/uploads/test/') + parseInt(new Date().getTime()/1000) + '.jpg')
			var stream = context[0].createJPEGStream({
				bufsize: 4096, // old value 2048
				quality: 100
			});
			stream.pipe(out)
			// stream.pipe(test)
			stream.on('end', function(){
				// console.log('save end')
				setTimeout(()=>{
					callback(data.file_name);
				}, 10)

				setTimeout(()=>{
					fs.stat(_dirPreview + data.file_name, function (err, stats) {
						if(!err)
							fs.unlinkSync(_dirPreview + data.file_name);
					});
				}, 10000)
				context[0] = null;
				out = null;
				stream = null;
			});

 
		} else {
			imgLayouts[widgets[_i].name](context, data, widgets[_i], function(new_context){
				imgGeneration.loopPreview(new_context, data, widgets, _i + 1, callback)
			})
		}
	},


	save: (canvas, name, callback) => {
		var out = fs.createWriteStream(_dirCoverForVk + name)
		var stream = canvas.createJPEGStream({
			bufsize: 4096, // old value 2048
			quality: 100
		});
		stream.pipe(out)
		stream.on('end', function(){
			setTimeout(()=>{
				callback(_dirCoverForVk + name);
			}, 10)
			canvas = null;
			out = null;
			stream = null;
		});
	}
}




// хелперы для рисования часто
// встречающихся элементов
var draw = {
	showTimings: 0,


	avatar: function(ctx, data, widget, avatar) {
		if(this.showTimings) console.time('draw.avatar')

		ctx.save();

		if(!widget.avatarBorderRadius || widget.avatarBorderRadius >= 50) {
			ctx.arc(widget.posX, widget.posY, (widget.avatarW / 2), 0, Math.PI * 2, true); // x y r
			if(widget.avatarBorder > 0) {
				ctx.strokeStyle = widget.avatarBorderColor || "#FFF";
				ctx.lineWidth = widget.avatarBorder * 2 || 2;
				ctx.stroke();
			}

			ctx.clip();
			ctx.beginPath();
		} else {
			let x = widget.posX - (widget.avatarW / 2),
					y = widget.posY - (widget.avatarW / 2),
					radius = widget.avatarW * (widget.avatarBorderRadius / 100),
					width = height = widget.avatarW;
			
			// ctx.lineWidth = 0;
			// ctx.strokeStyle = "rgba(0,0,0,0)";
			// ctx.stroke();

			if(widget.avatarBorderRadius == 0) {
				ctx.rect(x,y,width,height); 

				if(widget.avatarBorder > 0) {
					ctx.strokeStyle = widget.avatarBorderColor || "#FFF";
					ctx.lineWidth = widget.avatarBorder * 2 || 2;
					ctx.stroke();
				}

			} else {
				ctx.beginPath();
				ctx.moveTo(x, y + radius);
				ctx.lineTo(x, y + height - radius);
				ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
				ctx.lineTo(x + width - radius, y + height);
				ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
				ctx.lineTo(x + width, y + radius);
				ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
				ctx.lineTo(x + radius, y);
				ctx.quadraticCurveTo(x, y, x, y + radius);
		


				if(widget.avatarBorder > 0) {
					ctx.strokeStyle = widget.avatarBorderColor || "#FFF";
					ctx.lineWidth = widget.avatarBorder * 2 || 2;
					ctx.stroke();
				}
			}

			

			ctx.clip();
			ctx.beginPath();
		}

		ctx.drawImage(avatar, widget.posX-(widget.avatarW / 2), widget.posY-(widget.avatarW / 2), widget.avatarW, widget.avatarW); // img x y r
		ctx.restore();

		if(this.showTimings) console.timeEnd('draw.avatar')
	},



	count: (ctx, data, widget, count) => {
		if(widget.countShow) {
			let fontWeight = widget.font_bold ? '600' : '200';
			ctx.textAlign = 'left';
			ctx.fillStyle = widget.countColor || '#fff';
			
			let count_size = widget.countSize || widget.font_size;
			ctx.font = fontWeight+" "+count_size+"px "+widget.font_family;

			if(widget.border) {
				ctx.lineJoin = "round"
				ctx.lineWidth = widget.border * 2;
				ctx.strokeStyle = widget.borderColor || '#000';
				
				ctx.strokeText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
			}
			ctx.fillText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
		}
	}
}



const draw_helpers = require('../libs/draw_helpers/');


const imgLayouts = {
	youtube_last_video: (context, data, _w, callback) => {
		draw_helpers.youtube_last_video(context, data, _w, callback);
	},

	youtube_video_to_link: (context, data, _w, callback) => {
		draw_helpers.youtube_video_to_link(context, data, _w, callback);
	},

	youtube_channel_info: (context, data, _w, callback) => {
		draw_helpers.youtube_channel_info(context, data, _w, callback);
	},


	donationalerts_donation_goal: (context, data, w, callback) => {
		let ctx = context[1];

		if(w.dataLink == '' || w.dataLink.indexOf('http://www.donationalerts.ru/widget/donation-goal?') === -1) return callback([context[0], ctx]);

		let draw = function(w_data) {
			let done = w_data.raised_amount / w_data.goal_amount;
			let textWeight = "normal";
			if(w.textBold) textWeight = "bold";

	
			ctx.save();
			ctx.beginPath();
			// рисуем фон индикатора
			if(w.barRadius >= 1) {
				let rad = parseInt(w.barRadius);

				if(w.barWidth < 2 * rad) {rad = w.barWidth / 2;}
				if(w.barHeight < 2 * rad) {rad = w.barHeight / 2;}

				ctx.beginPath();
				ctx.moveTo(w.posX+rad, w.posY);
				ctx.arcTo(w.posX+w.barWidth, w.posY, w.posX+w.barWidth, w.posY+w.barHeight, rad);
				ctx.arcTo(w.posX+w.barWidth, w.posY+w.barHeight, w.posX, w.posY+w.barHeight, rad);
				ctx.arcTo(w.posX, w.posY+w.barHeight, w.posX, w.posY, rad);
				ctx.arcTo(w.posX, w.posY, w.posX+w.barWidth, w.posY, rad);

			} else {
				ctx.rect(w.posX, w.posY, w.barWidth, w.barHeight);
			}
			
			let grad = w.barProgressColor;
			if(done < 1) {
				grad = ctx.createLinearGradient(w.posX, w.posY, w.posX+w.barWidth, w.posY);
				grad.addColorStop(0, w.barProgressColor);
				grad.addColorStop(done, w.barProgressColor);
				grad.addColorStop(done, w.barBg);
				grad.addColorStop(1, w.barBg);
			}

			ctx.fillStyle = grad;
			ctx.fill();
			ctx.restore();
			


			// рисуем индикатор
			// ctx.beginPath();
			// if(done >= 1) {
			// 	ctx.rect(w.posX, w.posY, w.barWidth, w.barHeight);
			// } else {
			// 	ctx.rect(w.posX, w.posY, w.barWidth * done, w.barHeight);
			// }
			// ctx.fillStyle = w.barProgressColor;
			// ctx.fill();


			// текст заголовка
			if(w.titleShow != 'none') {
				let title_text = '...';

				if(w.titleShow === 'import')
					title_text = w_data.title;
				else if(w.titleShow === 'my')
					title_text = w.myTitle || '...';

	
				ctx.beginPath();
				ctx.font = textWeight+" "+w.textSize+"px "+w.textFont;
				ctx.fillStyle = w.textColor;
				ctx.textAlign = 'center';
				ctx.textBaseline = "top";

				if(w.textBorder) {
					ctx.lineJoin = "round"
					ctx.lineWidth = w.textBorder * 2;
					ctx.strokeStyle = w.textBorderColor || '#000';
					ctx.strokeText(title_text, w.posX + (w.barWidth / 2), w.posY + (w.textSize * 1.5 * -1));
				}
				ctx.fillText(title_text, w.posX + (w.barWidth / 2), w.posY + (w.textSize * 1.5 * -1));
			}


			// текст границ
			if(w.showGoalBorder === true) {
				ctx.beginPath();
				ctx.font = textWeight+" "+w.textSize * 0.8+"px "+w.textFont;
				ctx.fillStyle = w.textColor;
				ctx.textAlign = 'left';
				ctx.textBaseline = "bottom";

				if(w.textBorder) {
					ctx.lineJoin = "round"
					ctx.lineWidth = w.textBorder * 2;
					ctx.strokeStyle = w.textBorderColor || '#000';
					ctx.strokeText(w_data.min_point_formatted || '0', w.posX, w.posY + (w.barHeight + (w.textSize * 1.15)));
				}
				ctx.fillText(w_data.min_point_formatted || '0', w.posX, w.posY + (w.barHeight + (w.textSize * 1.15)));

				
				ctx.textAlign = 'right';
				if(w.textBorder) {
					ctx.lineJoin = "round"
					ctx.lineWidth = w.textBorder * 2;
					ctx.strokeStyle = w.textBorderColor || '#000';
					ctx.strokeText(w_data.goal_amount_formatted, w.posX + w.barWidth, w.posY + (w.barHeight + (w.textSize * 1.15)));
				}
				ctx.fillText(w_data.goal_amount_formatted, w.posX + w.barWidth, w.posY + (w.barHeight + (w.textSize * 1.15)));
			}


			// текст прогрессбара
			if(w.showProgressText === true) {
				let progressWeight = "normal";
				if(w.progressBold) progressWeight = "bold";

				ctx.beginPath();
				ctx.font = progressWeight+" "+w.progressSize+"px "+w.progressFont;
				ctx.fillStyle = w.progressColor;
				ctx.textAlign = 'center';
				ctx.textBaseline = "middle";

				if(w.progressBorder) {
					ctx.lineJoin = "round"
					ctx.lineWidth = w.progressBorder * 2;
					ctx.strokeStyle = w.progressBorderColor || '#000';
					ctx.strokeText(`${w_data.raised_amount_formatted} ${w_data.goal_currency} (${(done * 100).toFixed(2)}%)`, w.posX + (w.barWidth / 2), w.posY + (w.barHeight / 2));
				}
				ctx.fillText(`${w_data.raised_amount_formatted} ${w_data.goal_currency} (${(done * 100).toFixed(2)}%)`, w.posX + (w.barWidth / 2), w.posY + (w.barHeight / 2));
			}


			if(w.showToDate === true && w_data.strToEnd !== false) {
				ctx.beginPath();
				ctx.font = textWeight+" "+w.textSize * 0.8+"px "+w.textFont;
				ctx.fillStyle = w.textColor;
				ctx.textAlign = 'center';
				ctx.textBaseline = "bottom";

				if(w.textBorder) {
					ctx.lineJoin = "round"
					ctx.lineWidth = w.textBorder * 2;
					ctx.strokeStyle = w.textBorderColor || '#000';
					ctx.strokeText(w_data.strToEnd, w.posX + (w.barWidth / 2), w.posY + (w.barHeight + (w.textSize * 1.15)));
				}
				ctx.fillText(w_data.strToEnd, w.posX + (w.barWidth / 2), w.posY + (w.barHeight + (w.textSize * 1.15)));
			}


			// отдаём изображение дальше
			callback([context[0], ctx]);
		}


		let time_word_arr = {
			day: ["дней", "день", "дня"],
			hour: ["часов", "час", "часа"],
			minute: ["минут", "минута", "минуты"],
			second: ["секунд", "секунда", "секунды"]
		}

		
		let getTimeString = function(c, d) {
			if (c > 10 && c < 19)
					return time_word_arr[d][0];
			a = (c % 10);
			b = (c % 100);
			if (b == 11)
					return time_word_arr[d][0];
			if (a == 1)
					return time_word_arr[d][1];
			if (a == 2 || a == 3 || a == 4)
					return time_word_arr[d][2];
			if (a == 5 || a == 6 || a == 7 || a == 8 || a == 9 || a == 0)
					return time_word_arr[d][0];
		}


		// загрузка данных
		request.get({
			url: `http://www.donationalerts.ru/api/getdgdata?goal_id=${getParameterByName('id', w.dataLink)}&token=${getParameterByName('token', w.dataLink)}`,
			gzip: true,
			headers: {
				'Content-Type': 'application/json',
				"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60"
			}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				let data = parseJsonp(body).goal_data;

				if(data.end_date_UTC != null) {
					if(w.showToDate === true && data.is_active) {
						var h = new Date()
						, i = new Date(h.getUTCFullYear(),h.getUTCMonth(),h.getUTCDate(),h.getUTCHours(),h.getUTCMinutes(),h.getUTCSeconds())
						, m = new Date(data.end_date_UTC.replace(/-/g, "/"))
						, j = m - i;
						j /= 1000;


						var n = Math.round(j % 60);
						j = Math.floor(j / 60);
						var q = Math.round(j % 60);
						j = Math.floor(j / 60);
						var r = Math.round(j % 24);
						j = Math.floor(j / 24);
						var t = j;

						if (t > 0) {
							data.strToEnd = (t % 10 == 1 && t % 100 != 11 ? 'Остался ' : 'Осталось ') + t + ' ' + getTimeString(t, 'day');
						} else if (r > 0) {
							data.strToEnd = (r % 10 == 1 && r % 100 != 11 ? 'Остался ' : 'Осталось ') + r + ' ' + getTimeString(r, 'hour');
						} else if (q > 0) {
							data.strToEnd = (q % 10 == 1 && q % 100 != 11 ? 'Осталась ' : 'Осталось ') + q + ' ' + getTimeString(q, 'minute');
						} else if (n > 0) {
							data.strToEnd = (n % 10 == 1 && n % 100 != 11 ? 'Осталась ' : 'Осталось ') + n + ' ' + getTimeString(n, 'second');
						} else {
							data.strToEnd = 'Сбор завершён!';
						}
					} else {
						data.strToEnd = 'Сбор завершён!';
					}

				} else {
					data.strToEnd = false;
				}


				draw(data);
			} else {
				callback([context[0], ctx]);
			}
		});
	},


	
	donationalerts_instream_stats: (context, data, w, callback) => {
		let ctx = context[1];

		if(w.dataLink == '' || w.dataLink.indexOf('http://www.donationalerts.ru/widget/instream-stats?') === -1) return callback([context[0], ctx]);

		let draw = function(w_data) {
			if(w.viewType == 'list') {
				let font_weight = w.textBold ? 'bold' : 'normal';

				ctx.font = font_weight+" "+w.textSize+"px "+w.textFont;
				ctx.fillStyle = w.textColor;
				ctx.textAlign = w.textAlign;
				ctx.textBaseline = "top";


				for(let j=0; j < w.listCount; j++) {
					if(w_data[j] === undefined) break;

					let textFormated = w.listTextTemplate;

					if(textFormated.indexOf('{username}') >= 0) textFormated = textFormated.replace('{username}', w_data[j].username);
					if(textFormated.indexOf('{amount}') >= 0) textFormated = textFormated.replace('{amount}', w_data[j].amount);
					if(textFormated.indexOf('{currency}') >= 0) textFormated = textFormated.replace('{currency}', w_data[j].currency);
		
					if(w.textCaps) {
						if(textFormated != undefined) textFormated = textFormated.toUpperCase();
					}

					if(w.textBorder) {
						ctx.lineJoin = "round"
						ctx.lineWidth = w.textBorder * 2;
						ctx.strokeStyle = w.textBorderColor || '#000';
						ctx.strokeText(textFormated, w.posX, w.posY + (w.textSize * 1.15 * j) + (w.listPadding * j));
					}
					ctx.fillText(textFormated, w.posX, w.posY + (w.textSize * 1.15 * j) + (w.listPadding * j));
				}


			} else if(w.viewType == 'slider') {
				let slider_data = '';
				
				if(w_data.length === 1) {
					slider_data = w_data[0];
				} else if(w_data.length > 1) {
					slider_data = w_data[rand(0, w_data.length-1)];
				} else {
					callback([context[0], ctx]);
				} 

				let textFormated = w.sliderTextTemplate;

				if(textFormated.indexOf('{username}') >= 0) textFormated = textFormated.replace('{username}', slider_data.username);
				if(textFormated.indexOf('{amount}') >= 0) textFormated = textFormated.replace('{amount}', slider_data.amount);
				if(textFormated.indexOf('{currency}') >= 0) textFormated = textFormated.replace('{currency}', slider_data.currency);


				let font_weight = w.textBold ? 'bold' : 'normal';
				ctx.font = font_weight+" "+w.textSize+"px "+w.textFont;
				ctx.fillStyle = w.textColor;
				ctx.textAlign = w.textAlign;
				ctx.textBaseline = "top";
				if(w.textBorder) {
					ctx.lineJoin = "round"
					ctx.lineWidth = w.textBorder * 2;
					ctx.strokeStyle = w.textBorderColor || '#000';
					ctx.strokeText(textFormated, w.posX, w.posY);
				}
				ctx.fillText(textFormated, w.posX, w.posY);


				if(w.sliderShowSecondText === true && slider_data.message != '') {
					let secondText = slider_data.message;

					if(w.sliderSecondTextMax > 0) {
						if(secondText.length > w.sliderSecondTextMax)
							secondText = secondText.slice(0, w.sliderSecondTextMax)+'...';
					}


					secondText = wordwrap(secondText, w.sliderSecondTextBr);
					secondText = secondText.split('<br>');

					
					let font_weight_2 = w.textSecondBold ? 'bold' : 'normal';
					ctx.font = font_weight_2+" "+w.textSecondSize+"px "+w.textSecondFont;
					ctx.fillStyle = w.textSecondColor;
					ctx.textAlign = w.textSecondAlign;
					ctx.textBaseline = "top";

					for(let i in secondText) {
						if(w.textSecondBorder) {
							ctx.lineJoin = "round"
							ctx.lineWidth = w.textSecondBorder * 2;
							ctx.strokeStyle = w.textSecondBorderColor || '#000';
							ctx.strokeText(secondText[i], w.posX, w.posY + w.textPadding + (w.textSize * 1.15) + (w.textSecondSize * 1.15 * i));
						}
						ctx.fillText(secondText[i], w.posX, w.posY + w.textPadding + (w.textSize * 1.15) + (w.textSecondSize * 1.15 * i));
					}
				}
			}


			


			// отдаём изображение дальше
			callback([context[0], ctx]);
		}


		// загрузка данных
		request.get({
			url: `http://www.donationalerts.ru/api/getisswidgetdata?widget_id=${getParameterByName('id', w.dataLink)}&token=${getParameterByName('token', w.dataLink)}`,
			gzip: true,
			headers: {
				'Content-Type': 'application/json',
				"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60"
			}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				let data = parseJsonp(body);

				if(data.data) {
					if(data.data[0].alert_id === undefined)
						callback([context[0], ctx]);
					else
						draw(data.data);
				} else {
					callback([context[0], ctx]);
				}

			} else {
				callback([context[0], ctx]);
			}
		});
	},



	image_to_link: (context, data, widget, callback) => {
		let ctx = context[1];

		if(widget.url == '') return callback([context[0], ctx]);

		let img_buf = Buffer('');
		request.get({
			url: widget.url,
			gzip: true,
			timeout: 5 * 1000,
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				'referer': 'https://translate.google.ru/',
				"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
			}
		})
		.on('response', function(response) {
			if(response.statusCode != 200) return callback([context[0], ctx])

			this.on('data', function(data) {
				img_buf = Buffer.concat([img_buf,data]); 
			})
			this.on('end', function() {
				let loadImage = new Image();
				loadImage.onload = () => {
					let imgHeight = loadImage.height / (loadImage.width / widget.width)
					ctx.drawImage(loadImage, widget.posX, widget.posY, widget.width, imgHeight);

					loadImage = null;
					img_buf = null;
					callback([context[0], ctx])
				}
				loadImage.src = img_buf; //
			})
		})
		.on('error', function(err) {
			console.error('image_to_link', widget.url)
			return callback([context[0], ctx])
		})

		
		
		// callback([context[0], ctx]);
	},


	online: (context, data, widget, callback) => {
		// console.log('time', widget)
		var ctx = context[1];
		var count = data.online;

		if(widget.delimiter != '0') {
			count = count.toString();
			if(widget.delimiter == '1'){
				var separator = " ";
			} else if(widget.delimiter == '2'){
				var separator = ".";
			} else if(widget.delimiter == '3'){
				var separator = ",";
			}
			count = count.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + separator);
		}

		let font_weight = widget.font_bold ? 'bold' : 'normal';

		let textStr = '';
		if(widget.text.before) textStr+= widget.text.before+' ';
		textStr+= count;
		if(widget.text.after) textStr+= ' '+widget.text.after;

		

		if(widget.caps) {
			textStr = textStr.toUpperCase();
		}

		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textAlign = widget.textAlign;
		ctx.textBaseline = "top";


		if(widget.border) {
			ctx.lineJoin = "round"
			ctx.lineWidth = widget.border * 2;
			ctx.strokeStyle = widget.borderColor || '#000';
			ctx.strokeText(textStr, widget.posX, widget.posY);
		}
		ctx.fillText(textStr, widget.posX, widget.posY);

		callback([context[0], ctx]);
	},



	rates: (context, data, widget, callback) => {
		var ctx = context[1];
		let font_weight = widget.font_bold ? 'bold' : 'normal';

		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textAlign = widget.textAlign;
		ctx.textBaseline = "middle";


		query('SELECT `data` FROM `cover_other_data` WHERE ?', {
			name: 'rates'
		}).then(rows => {
			if(rows.length == 0) {
				callback([context[0], ctx]);

			} else {
				let row = JSON.parse(rows[0].data);

				if(widget.perfix == 'text_code') {
					var text = `${widget.firstCurrency} ${row[widget.firstCurrency + widget.secondCurrency]}`;
				} else if(widget.perfix == 'icon') {
					var text = `${row[widget.firstCurrency + widget.secondCurrency]}`;
				} else {
					var text = `${row[widget.firstCurrency + widget.secondCurrency]}`;
				}


				if(widget.perfix == 'icon') {
					let icon;
					let offset = 0;
					
					if(widget.firstCurrency == 'USD')
						icon = '\uf155';
					else if(widget.firstCurrency == 'EUR')
						icon = '\uf153';
					else if(widget.firstCurrency == 'RUB') {
						icon = '\uf158';
						offset = 0.05;
					} else if(widget.firstCurrency == 'BTC') {
						icon = '\uf15a';
						offset = 0.05;
					} else {
						icon = '\uf101';
						// offset = 0.1;
					}
	

					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText(text, widget.posX + (widget.font_size * 0.95), widget.posY);
					}
					ctx.fillText(text, widget.posX + (widget.font_size * 0.95), widget.posY);


					ctx.font = widget.font_size + 'px FontAwesome';
					// let icon = widget.firstCurrency == 'USD' ? '\uf155' : '\uf153' ;
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText(icon, widget.posX - (widget.font_size * offset), widget.posY + (widget.font_size * 0.05));
					}
					ctx.fillText(icon, widget.posX - (widget.font_size * offset), widget.posY + (widget.font_size * 0.05));
					
				} else {
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText(text, widget.posX, widget.posY);
					}
					ctx.fillText(text, widget.posX, widget.posY);
				}


				callback([context[0], ctx]);
			}

		}).catch(err => {
			console.log(err)
			callback([context[0], ctx]);
		});
	},



	rss: (context, data, widget, callback) => {
		var ctx = context[1];
		let allRss = [];

		if(widget.rssAdress == '') return callback([context[0], ctx]);


		rss_parser.parseURL(widget.rssAdress, function(err, parsed) {
			if(err)  return callback([context[0], ctx]);
			
			parsed.feed.entries.forEach(function(entry) {
				let title = entry.title;
				let str = '';

				let addStrToArray = function(_title) {
					if(_title.length > widget.symbolLimit)
						_title = _title.slice(0, widget.symbolLimit)+'...';

					str += _title;

					allRss.push(str);
				};


				if(widget.showTime == true) {
					let myDateZone = new Date(entry.pubDate).toLocaleString('en-US', { timeZone: 'Europe/Moscow' });
					let _date = new Date(myDateZone);
					let _h = _date.getUTCHours() > 9 ? _date.getUTCHours() : '0'+_date.getUTCHours();
					let _m = _date.getUTCMinutes() > 9 ? _date.getUTCMinutes() : '0'+_date.getUTCMinutes();
					str += _h+':'+_m+' '
				}

				
				let test_stopWords = true;
				if(widget.stopWords != '') {
					let stop = (widget.stopWords.replace(' ', '')).split(',');

					for(let _key of stop) {
						let reg = new RegExp(_key, 'i');
						if(reg.test(title)) {
							test_stopWords = false;
							break;
						}
					}
				}

				
				let test_keys = false;
				if(widget.keys != '') {
					let keys = (widget.keys.replace(' ', '')).split(',');

					for(let _key of keys) {
						let reg = new RegExp(_key, 'i');
						if(reg.test(title)) {
							test_keys = true;
							break;
						}
					}
				} else {
					test_keys = true;
				}
				

				
				if(test_stopWords == true && test_keys == true)
					addStrToArray(title)
			});


			let font_weight = widget.font_bold ? 'bold' : 'normal';
			ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
			ctx.fillStyle = widget.color;
			ctx.textAlign = widget.textAlign;
			ctx.textBaseline = "middle";

			for(var j in allRss) {
				if(widget.caps) {
					allRss[j] = allRss[j].toUpperCase();
				}

				if(widget.border) {
					ctx.lineJoin = "round"
					ctx.lineWidth = widget.border * 2;
					ctx.strokeStyle = widget.borderColor || '#000';
					ctx.strokeText(allRss[j], widget.posX, widget.posY + (widget.font_size * 1.15 * j) + (widget.padding * j));
				}
				ctx.fillText(allRss[j], widget.posX, widget.posY + (widget.font_size * 1.15 * j) + (widget.padding * j));


				if(j >= widget.count - 1) {
					break;
				}
			}
			
			callback([context[0], ctx]);

		})
	},


	text: (context, data, widget, callback) => {
		// console.log('time', widget)
		var ctx = context[1];
		let font_weight = widget.font_bold ? 'bold' : 'normal';


		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textAlign = widget.textAlign;
		ctx.textBaseline = "middle";


		for(var j in widget.text) {
			if(widget.caps) {
				widget.text[j].val = widget.text[j].val.toUpperCase();
			}

			if(widget.border) {
				ctx.lineJoin = "round"
				ctx.lineWidth = widget.border * 2;
				ctx.strokeStyle = widget.borderColor || '#000';
				ctx.strokeText(widget.text[j].val, widget.posX, widget.posY + (widget.font_size * 1.15 * j));
			}
			ctx.fillText(widget.text[j].val, widget.posX, widget.posY + (widget.font_size * 1.15 * j));

			//widget.posY = widget.posY + (widget.font_size * 1.15);
		}
		
		callback([context[0], ctx]);
	},

	


	random_text: (context, data, widget, callback) => {
		// console.log('time', widget)
		var ctx = context[1];
		let font_weight = widget.font_bold ? 'bold' : 'normal';

		let rm_text = new TextRandomizator(widget.text);
		let w_text = rm_text.get_text(true);
		rm_text = null;


		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textAlign = widget.textAlign;
		ctx.textBaseline = "middle";

		let w_text_new = w_text.split('--br ')
		if(w_text_new.length <= 1) w_text_new = w_text.split('--br');
		

		for(var j in w_text_new) {
			if(widget.caps) {
				w_text_new[j] = w_text_new[j].toUpperCase();
			}

			if(widget.border) {
				ctx.lineJoin = "round"
				ctx.lineWidth = widget.border * 2;
				ctx.strokeStyle = widget.borderColor || '#000';
				ctx.strokeText(w_text_new[j], widget.posX, widget.posY + (widget.font_size * 1.15 * j));
			}
			ctx.fillText(w_text_new[j], widget.posX, widget.posY + (widget.font_size * 1.15 * j));

			//widget.posY = widget.posY + (widget.font_size * 1.15);
		}

		// if(widget.border) {
		// 	ctx.lineJoin = "round"
		// 	ctx.lineWidth = widget.border * 2;
		// 	ctx.strokeStyle = widget.borderColor || '#000';
		// 	ctx.strokeText(w_text, widget.posX, widget.posY);
		// }
		// ctx.fillText(w_text, widget.posX, widget.posY);


		callback([context[0], ctx]);
	},

	text_link: (context, data, widget, callback) => {
		var ctx = context[1];

		request.get(widget.pageUrl, function(error, response, body) {
			if(body != undefined) {
				let font_weight = widget.font_bold ? 'bold' : 'normal';
				let textStr = '';

				if(widget.textBefore) textStr += `${widget.textBefore} `;
				if (body.length > 50) {
					body = body.slice(0, 50);
					textStr += body;
				} else {
					textStr += body;
				}
				if(widget.textAfter) textStr += ` ${widget.textAfter}`;

				ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
				ctx.fillStyle = widget.color;
				ctx.textAlign = widget.textAlign;
				ctx.textBaseline = "top";


				if(widget.border) {
					ctx.lineJoin = "round"
					ctx.lineWidth = widget.border * 2;
					ctx.strokeStyle = widget.borderColor || '#000';
					ctx.strokeText(textStr, widget.posX, widget.posY);
				}
				ctx.fillText(textStr, widget.posX, widget.posY);
			}

			callback([context[0], ctx]);
		});
	},


	members_count: (context, data, widget, callback) => {
		var ctx = context[1];
		let count = data.members_count || 1412482;
		
		let font_weight = widget.font_bold ? 'bold' : 'normal';
		let textStr = '';

		if(widget.delimiter != '0') {
			count = count.toString();
			if(widget.delimiter == '1'){
				var separator = " ";
			} else if(widget.delimiter == '2'){
				var separator = ".";
			} else if(widget.delimiter == '3'){
				var separator = ",";
			}
			count = count.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + separator);
		}

		if(widget.textBefore) textStr += `${widget.textBefore} `;
		textStr += count;
		if(widget.textAfter) textStr += ` ${widget.textAfter}`;

		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textAlign = widget.textAlign;
		ctx.textBaseline = "top";


		if(widget.border) {
			ctx.lineJoin = "round"
			ctx.lineWidth = widget.border * 2;
			ctx.strokeStyle = widget.borderColor || '#000';
			ctx.strokeText(textStr, widget.posX, widget.posY);
		}
		ctx.fillText(textStr, widget.posX, widget.posY);


	callback([context[0], ctx]);
			
	},


	time: (context, data, widget, callback) => {
		// console.log('time', widget)
		var ctx = context[1];
		let myDateZone = new Date().toLocaleString('en-US', { timeZone: widget.timezone });
		let myDate = new Date(myDateZone);
		// let hour = myDate.getHours() > 9 ? myDate.getHours() : '0'+myDate.getHours();
		// let minutes = myDate.getMinutes() > 9 ? myDate.getMinutes() : '0'+myDate.getMinutes();
		// let time = hour+':'+minutes;
		// let textStr = widget.text != '' ? widget.text+" "+time : time;

		let textStr = '';
		if(widget.text) textStr += `${widget.text} `;
		textStr += myDate.format(widget.dateFormat || 'H:i');
		if(widget.textEnd) textStr += ` ${widget.textEnd}`;




		let font_weight = widget.font_bold ? 'bold' : 'normal';

		

		if(widget.caps) {
			textStr = textStr.toUpperCase();
		}

		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textAlign = widget.textAlign || "left";
		ctx.textBaseline = "top";


		if(widget.border) {
			ctx.lineJoin = "round"
			ctx.lineWidth = widget.border * 2;
			ctx.strokeStyle = widget.borderColor || '#000';

			ctx.strokeText(textStr, widget.posX, widget.posY);
		}


		ctx.fillText(textStr, widget.posX, widget.posY);
		callback([context[0], ctx]);
	},

	
	timer: (context, data, widget, callback) => {
		// console.log('time', widget)
		var ctx = context[1];
		let myDateZone = new Date().toLocaleString('en-US', { timeZone: widget.timezone });
		let myDate = new Date(myDateZone);
		// let hour = myDate.getHours() > 9 ? myDate.getHours() : '0'+myDate.getHours();
		// let minutes = myDate.getMinutes() > 9 ? myDate.getMinutes() : '0'+myDate.getMinutes();
		// let time = hour+':'+minutes;
		// let textStr = widget.text != '' ? widget.text+" "+time : time;
		let font_weight = widget.font_bold ? 'bold' : 'normal';


		var endDate = widget['toDate'].split(' ')[0].split('-');
		var endTime = widget['toDate'].split(' ')[1].split(':');


		var currentDate = new Date(parseInt(endDate[2]), parseInt(endDate[1]) - 1, parseInt(endDate[0]), parseInt(endTime[0]), parseInt(endTime[1]) + 1);
		var dateDifference = currentDate.getTime() - myDate.getTime();
		var remainsDate = new Date(dateDifference);	

		var remainsSec = (parseInt(remainsDate / 1000));
		var remainsFullDays = (parseInt(remainsSec / (24 * 60 * 60)));
		var secInLastDay = remainsSec - remainsFullDays * 24 * 3600;
		var remainsFullHours = (parseInt(secInLastDay / 3600));
		var secInLastHour = secInLastDay - remainsFullHours * 3600;
		var remainsMinutes = (parseInt(secInLastHour / 60));
		var lastSec = secInLastHour - remainsMinutes * 60;

		if(remainsFullDays < 0) remainsFullDays = 0;
		if(remainsFullHours < 0) remainsFullHours = 0;
		if(remainsMinutes < 0) remainsMinutes = 0;


		let textD = declOfNum(remainsFullDays, ['День','Дня','Дней']);
		let textH = declOfNum(remainsFullHours, ['Час','Часа','Часов'])
		let textM = declOfNum(remainsMinutes, ['Минута','Минуты','Минут'])

		// let textD = 'Дней';
		// let textH = 'Часов';
		// let textM = 'Минут';


		if(remainsSec > 0) {
			if(widget.hideZero != true) {
				if(remainsFullDays < 10) remainsFullDays = '0' + remainsFullDays;
				if(remainsFullHours < 10) remainsFullHours = '0' + remainsFullHours;
				if(remainsMinutes < 10) remainsMinutes = '0' + remainsMinutes;
			}
		} else {
			if(widget.hideZero != true) {
				if(remainsFullDays < 10) remainsFullDays = '0' + remainsFullDays;
				if(remainsFullHours < 10) remainsFullHours = '0' + remainsFullHours;
				if(remainsMinutes < 10) remainsMinutes = '0' + remainsMinutes;
			} else {
				remainsFullDays = '0';
				remainsFullHours = '0';
				remainsMinutes = '0';
			}
		}


		if(widget.caps) {
			textD = textD.toUpperCase()
			textH = textH.toUpperCase()
			textM = textM.toUpperCase()
		}

		ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
		ctx.fillStyle = widget.color;
		ctx.textBaseline = "middle";

		if(widget.style == '3'){
			ctx.textAlign = "left";
		} else {
			ctx.textAlign = "center";
		}


		if(widget.border) {
			ctx.lineJoin = "round"
			ctx.lineWidth = widget.border * 2;
			ctx.strokeStyle = widget.borderColor || '#000';


			ctx.strokeText(remainsFullDays, widget.posX, widget.posY);
			if(widget.style == '1'){
				ctx.strokeText(remainsFullHours, widget.posX + widget.paddingX, widget.posY);
				ctx.strokeText(remainsMinutes, widget.posX + (widget.paddingX * 2), widget.posY);

			} else if(widget.style == '2'){
				ctx.strokeText(remainsFullHours, widget.posX, widget.posY + widget.paddingX);
				ctx.strokeText(remainsMinutes, widget.posX, widget.posY + (widget.paddingX * 2));

			} else if(widget.style == '3'){
				ctx.strokeText(remainsFullHours, widget.posX + (widget.paddingX * 0.95), widget.posY);
				ctx.strokeText(remainsMinutes, widget.posX + widget.paddingX + (widget.paddingX * 0.95), widget.posY);
			} 
		}


		ctx.fillText(remainsFullDays, widget.posX, widget.posY);
		if(widget.style == '1'){
			ctx.fillText(remainsFullHours, widget.posX + widget.paddingX, widget.posY);
			ctx.fillText(remainsMinutes, widget.posX + (widget.paddingX * 2), widget.posY);

		} else if(widget.style == '2'){
			ctx.fillText(remainsFullHours, widget.posX, widget.posY + widget.paddingX);
			ctx.fillText(remainsMinutes, widget.posX, widget.posY + (widget.paddingX * 2));
			
		} else if(widget.style == '3'){
			ctx.fillText(remainsFullHours, widget.posX + (widget.paddingX * 0.95), widget.posY);
			ctx.fillText(remainsMinutes, widget.posX + widget.paddingX + (widget.paddingX * 0.95), widget.posY);
		} 




		ctx.font = font_weight+" "+widget.textSize+"px "+widget.font_family;
		if(widget.border) {
			ctx.lineJoin = "round"
			ctx.lineWidth = widget.border * 2;
			ctx.strokeStyle = widget.borderColor || '#000';

			if(widget.style == '1'){
				ctx.strokeText(textD, widget.posX, widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));
				ctx.strokeText(textH, widget.posX + widget.paddingX, widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));
				ctx.strokeText(textM, widget.posX + (widget.paddingX * 2), widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));

			} else if(widget.style == '2'){
				ctx.strokeText(textD, widget.posX, widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));
				ctx.strokeText(textH, widget.posX, widget.posY + widget.paddingY + ((widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2)) + widget.paddingX);
				ctx.strokeText(textM, widget.posX, widget.posY + widget.paddingY + ((widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2)) + widget.paddingX * 2);
			
		} else if(widget.style == '3'){
				ctx.strokeText(textD,  widget.posX + widget.paddingY, widget.posY + (widget.font_size / 1.2 / 2) - (widget.textSize / 1.2 / 2));
				ctx.strokeText(textH, widget.posX + widget.paddingY + (widget.paddingX * 0.95), widget.posY+ (widget.font_size / 1.2 / 2) - (widget.textSize / 1.2 / 2));
				ctx.strokeText(textM, widget.posX + widget.paddingY + widget.paddingX + (widget.paddingX * 0.95), widget.posY+ (widget.font_size / 1.2 / 2) - (widget.textSize / 1.2 / 2));
			}
		}


		if(widget.style == '1'){
			ctx.fillText(textD, widget.posX, widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));
			ctx.fillText(textH, widget.posX + widget.paddingX, widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));
			ctx.fillText(textM, widget.posX + (widget.paddingX * 2), widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));

		} else if(widget.style == '2'){
			ctx.fillText(textD, widget.posX, widget.posY + widget.paddingY + (widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2));
			ctx.fillText(textH, widget.posX, widget.posY + widget.paddingY + ((widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2)) + widget.paddingX);
			ctx.fillText(textM, widget.posX, widget.posY + widget.paddingY + ((widget.font_size * 1.2 / 2) + (widget.textSize * 1.2 / 2)) + widget.paddingX * 2);
		
		} else if(widget.style == '3'){
			ctx.fillText(textD,  widget.posX + widget.paddingY, widget.posY + (widget.font_size / 1.2 / 2) - (widget.textSize / 1.2 / 2));
			ctx.fillText(textH, widget.posX + widget.paddingY + (widget.paddingX * 0.95), widget.posY+ (widget.font_size / 1.2 / 2) - (widget.textSize / 1.2 / 2));
			ctx.fillText(textM, widget.posX + widget.paddingY + widget.paddingX + (widget.paddingX * 0.95), widget.posY+ (widget.font_size / 1.2 / 2) - (widget.textSize / 1.2 / 2));
		}

		

		callback([context[0], ctx]);
	},


	show_user_to_link: (context, data, widget, callback) => {
		let ctx = context[1];
		let canvas = context[0];
		let last_sub = data.show_user_to_link[widget.link];

		if(last_sub === false || !last_sub || last_sub == null) return callback([context[0], ctx])
		console.log(last_sub)

		let _ava = last_sub.photo_100 || last_sub.photo_50 || path.join(__dirname, '../../public/img/')+'no_photo.png';
		let first_name = last_sub.first_name || last_sub.first_name;
		let last_name = last_sub.last_name || last_sub.last_name;

		if(widget.caps) {
			if(first_name != undefined) first_name = first_name.toUpperCase();
			if(last_name != undefined) last_name = last_name.toUpperCase();
		}
		

		let textX = widget.posX + widget.textPosX;
		let textY = widget.posY + widget.textPosY;
		let textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
		let textAlign = "left";

		if(widget.namePos == "left") {
			textX = widget.posX + widget.textPosX;
			textY = widget.posY + widget.textPosY;
			textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			textAlign = "end";
		}  else if(widget.namePos == "center") {
			textX = widget.posX + widget.textPosX;
			textY = widget.posY + widget.textPosY;
			textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			textAlign = "center";
		}


		let call = (imageUrl) => {
			let avatar = new Image();
			avatar.onload = () => {
				draw.avatar(ctx, data, widget, avatar);


				if(widget.nameFormat != "4") {
					let fontWeight = widget.font_bold ? '600' : '200';

					ctx.font = fontWeight+" "+widget.font_size+"px "+widget.font_family;
					ctx.fillStyle = widget.color;
					ctx.textBaseline = "top";
					ctx.textAlign = textAlign;


					
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';

						if(widget.nameFormat == '1') {
							ctx.strokeText(first_name, textX, textY);
							ctx.strokeText(last_name, textX, textYbr);
						} else if(widget.nameFormat == '2') {
							ctx.strokeText(first_name+' '+last_name, textX, textY);
						} else if(widget.nameFormat == '3') {
							ctx.strokeText(first_name, textX, textY);
						}
					}


					if(widget.nameFormat == '1') {
						ctx.fillText(first_name, textX, textY);
						ctx.fillText(last_name, textX, textYbr);
					} else if(widget.nameFormat == '2') {
						ctx.fillText(first_name+' '+last_name, textX, textY);
					} else if(widget.nameFormat == '3') {
						ctx.fillText(first_name, textX, textY);
					}
				}

				imageUrl = null;
				avatar = null;
				callback(context);
			}
			avatar.src = imageUrl; //
		}


		if(last_sub) {
			loadImagInUrl(_ava, call)
		} else {
			call(_ava);
		}
	},


	last_sub: (context, data, widget, callback) => {
		// console.log('last_sub', widget)
		let ctx = context[1];
		let canvas = context[0];
		let last_sub = data.last_sub;
		//var img_buf = Buffer('');

		if(last_sub[widget.user_pos]) {
			var _ava = last_sub[widget.user_pos].photo_100 || last_sub[0].photo_50 || path.join(__dirname, '../../public/img/')+'no_photo.png';
			var first_name = last_sub[widget.user_pos].first_name || last_sub[0].first_name;
			var last_name = last_sub[widget.user_pos].last_name || last_sub[0].last_name;
		} else {
			var _ava = path.join(__dirname, '../../public/img/')+'no_photo.png';
			if(widget.nameFormat == 1) {
				var first_name = 'Место';
				var last_name = 'свободно';
			} else if(widget.nameFormat == 2) {
				var first_name = 'Место свободно';
				var last_name = '';
			} else if(widget.nameFormat == 3) {
				var first_name = 'Место свободно';
				var last_name = '';
			}
		}

		if(widget.caps) {
			if(first_name != undefined) first_name = first_name.toUpperCase();
			if(last_name != undefined) last_name = last_name.toUpperCase();
		}
		

		if(widget.namePos == "right") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "left";

		} else if(widget.namePos == "left") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "end";

		}  else if(widget.namePos == "center") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "center";
		}


		let call = (imageUrl) => {
			let avatar = new Image();
			avatar.onload = () => {
				draw.avatar(ctx, data, widget, avatar);
				
				


				if(widget.nameFormat != "4") {
					let fontWeight = widget.font_bold ? '600' : '200';

					ctx.font = fontWeight+" "+widget.font_size+"px "+widget.font_family;
					ctx.fillStyle = widget.color;
					ctx.textBaseline = "top";
					ctx.textAlign = textAlign;


					
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';

						if(widget.nameFormat == '1') {
							ctx.strokeText(first_name, textX, textY);
							ctx.strokeText(last_name, textX, textYbr);
						} else if(widget.nameFormat == '2') {
							ctx.strokeText(first_name+' '+last_name, textX, textY);
						} else if(widget.nameFormat == '3') {
							ctx.strokeText(first_name, textX, textY);
						}
					}


					if(widget.nameFormat == '1') {
						ctx.fillText(first_name, textX, textY);
						ctx.fillText(last_name, textX, textYbr);
					} else if(widget.nameFormat == '2') {
						ctx.fillText(first_name+' '+last_name, textX, textY);
					} else if(widget.nameFormat == '3') {
						ctx.fillText(first_name, textX, textY);
					}
				}

				imageUrl = null;
				avatar = null;
				callback(context);
			}
			avatar.src = imageUrl; //
		}


		if(last_sub[widget.user_pos]) {
			loadImagInUrl(_ava, call)
		} else {
			call(_ava);
		}
	},


	birthday: (context, data, widget, callback) => {
		// console.log('last_sub', widget)
		var ctx = context[1];
		var canvas = context[0];
		var last_sub = data.birthday;
		//var img_buf = Buffer('');

		if(last_sub[widget.user_pos]) {
			var _ava = last_sub[widget.user_pos].photo_100 || last_sub[0].photo_50 || path.join(__dirname, '../../public/img/')+'no_photo.png';
			var first_name = last_sub[widget.user_pos].first_name || last_sub[0].first_name;
			var last_name = last_sub[widget.user_pos].last_name || last_sub[0].last_name;
		} else {
			var _ava = path.join(__dirname, '../../public/img/')+'no_photo.png';
			if(widget.nameFormat == 1) {
				var first_name = 'Место';
				var last_name = 'свободно';
			} else if(widget.nameFormat == 2) {
				var first_name = 'Место свободно';
				var last_name = '';
			} else if(widget.nameFormat == 3) {
				var first_name = 'Место свободно';
				var last_name = '';
			}
		}

		if(widget.caps) {
			if(first_name != undefined) first_name = first_name.toUpperCase();
			if(last_name != undefined) last_name = last_name.toUpperCase();
		}
		

		if(widget.namePos == "right") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "left";

		} else if(widget.namePos == "left") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "end";

		}  else if(widget.namePos == "center") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "center";
		}


		var call = (imageUrl) => {
			var avatar = new Image();
			avatar.onload = () => {
				draw.avatar(ctx, data, widget, avatar);
				
				


				if(widget.nameFormat != "4") {
					var fontWeight = widget.font_bold ? '600' : '200';

					ctx.font = fontWeight+" "+widget.font_size+"px "+widget.font_family;
					ctx.fillStyle = widget.color;
					ctx.textBaseline = "top";
					ctx.textAlign = textAlign;


					
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';

						if(widget.nameFormat == '1') {
							ctx.strokeText(first_name, textX, textY);
							ctx.strokeText(last_name, textX, textYbr);
						} else if(widget.nameFormat == '2') {
							ctx.strokeText(first_name+' '+last_name, textX, textY);
						} else if(widget.nameFormat == '3') {
							ctx.strokeText(first_name, textX, textY);
						}
					}


					if(widget.nameFormat == '1') {
						ctx.fillText(first_name, textX, textY);
						ctx.fillText(last_name, textX, textYbr);
					} else if(widget.nameFormat == '2') {
						ctx.fillText(first_name+' '+last_name, textX, textY);
					} else if(widget.nameFormat == '3') {
						ctx.fillText(first_name, textX, textY);
					}
				}

				imageUrl = null;
				avatar = null;
				callback(context);
			}
			avatar.src = imageUrl; //
		}


		if(last_sub[widget.user_pos]) {
			loadImagInUrl(_ava, call)
		} else {
			call(_ava);
		}
	},



	best_comment: (context, data, widget, callback) => {
		var ctx = context[1];
		var canvas = context[0];
		var best_comment = data.best_comment[widget.user_pos];
		//var img_buf = Buffer('');



		if(best_comment) {
			var _ava = best_comment.photo_100 || best_comment.photo_50;
			var first_name = best_comment.first_name;
			var last_name = best_comment.last_name;
			var count = best_comment.count;
		} else {
			var _ava = path.join(__dirname, '../../public/img/')+'no_photo.png';
			if(widget.nameFormat == 1) {
				var first_name = 'Место';
				var last_name = 'свободно';
			} else if(widget.nameFormat == 2) {
				var first_name = 'Место свободно';
				var last_name = '';
			} else if(widget.nameFormat == 3) {
				var first_name = 'Место свободно';
				var last_name = '';
			}
			var count = '-';
		}

		if(widget.caps) {
			if(first_name != undefined) first_name = first_name.toUpperCase();
			if(last_name != undefined) last_name = last_name.toUpperCase();
		}
		

		if(widget.namePos == "right") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "left";

		} else if(widget.namePos == "left") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "end";

		} else if(widget.namePos == "center") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "center";
		}


		var call = (imageUrl) => {
			var avatar = new Image();
			avatar.onload = () => {
				draw.avatar(ctx, data, widget, avatar);


				if(widget.nameFormat != "4") {
					var fontWeight = widget.font_bold ? '600' : '200';

					ctx.font = fontWeight+" "+widget.font_size+"px "+widget.font_family;
					ctx.fillStyle = widget.color;
					ctx.textBaseline = "top";
					ctx.textAlign = textAlign;

					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';

						if(widget.nameFormat == '1') {
							ctx.strokeText(first_name, textX, textY);
							ctx.strokeText(last_name, textX, textYbr);
						} else if(widget.nameFormat == '2') {
							ctx.strokeText(first_name+' '+last_name, textX, textY);
						} else if(widget.nameFormat == '3') {
							ctx.strokeText(first_name, textX, textY);
						}
					}

					if(widget.nameFormat == '1') {
						ctx.fillText(first_name, textX, textY);
						ctx.fillText(last_name, textX, textYbr);
					} else if(widget.nameFormat == '2') {
						ctx.fillText(first_name+' '+last_name, textX, textY);
					} else if(widget.nameFormat == '3') {
						ctx.fillText(first_name, textX, textY);
					}
				}

				
				
				// if(widget.countShow) {
				// 	ctx.textAlign = 'left';
				// 	ctx.fillStyle = widget.countColor || '#fff';
					
				// 	var count_size = widget.countSize || widget.font_size;
				// 	ctx.font = fontWeight+" "+count_size+" "+widget.font_family;

				// 	if(widget.border) {
				// 		ctx.lineJoin = "round"
				// 		ctx.lineWidth = widget.border * 2;
				// 		ctx.strokeStyle = widget.borderColor || '#000';
						
				// 		ctx.strokeText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
				// 	}
				// 	ctx.fillText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
				// }

				if(widget.iconShow) {
					if(widget.iconSize) {
						ctx.font = widget.iconSize + 'px FontAwesome';
					} else {
						if(canvas.width > 795) 
							ctx.font='28px FontAwesome';
						else
							ctx.font='14px FontAwesome';
					}

					ctx.fillStyle = widget.iconColor || '#fff';
					
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText('\uf075', widget.posX + widget.iconPosX, widget.posY + widget.iconPosY);
					}

					ctx.fillText('\uf075', widget.posX + widget.iconPosX, widget.posY + widget.iconPosY);
					draw.count(ctx, data, widget, count)
					imageUrl = null;
					avatar = null;
					callback(context);
					

				} else {
					draw.count(ctx, data, widget, count)
					imageUrl = null;
					avatar = null;
					callback(context);
				}
			}
			avatar.src = imageUrl; //
		}




		if(best_comment) {
			loadImagInUrl(_ava, call)
		} else {
			call(_ava);
		}
	},



	best_share: (context, data, widget, callback) => {
		var ctx = context[1];
		var canvas = context[0];
		var best_share = data.best_share[widget.user_pos];
		//var img_buf = Buffer('');


		if(best_share) {
			var _ava = best_share.photo_100 || best_share.photo_50;
			var first_name = best_share.first_name;
			var last_name = best_share.last_name;
			var count = best_share.count;
		} else {
			var _ava = path.join(__dirname, '../../public/img/')+'no_photo.png';
			if(widget.nameFormat == 1) {
				var first_name = 'Место';
				var last_name = 'свободно';
			} else if(widget.nameFormat == 2) {
				var first_name = 'Место свободно';
				var last_name = '';
			} else if(widget.nameFormat == 3) {
				var first_name = 'Место свободно';
				var last_name = '';
			}

			var count = '-';
		}

		if(widget.caps) {
			if(first_name != undefined) first_name = first_name.toUpperCase();
			if(last_name != undefined) last_name = last_name.toUpperCase();
		}
		

		if(widget.namePos == "right") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "left";

		} else if(widget.namePos == "left") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "end";

		}  else if(widget.namePos == "center") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "center";
		}


		var call = (imageUrl) => {
			var avatar = new Image();
			avatar.onload = () => {
				draw.avatar(ctx, data, widget, avatar);
				// ctx.save();
				// ctx.arc(widget.posX, widget.posY, (widget.avatarW / 2), 0, Math.PI * 2, true); // x y r
				// ctx.clip();
				// ctx.beginPath();

				// ctx.drawImage(avatar, widget.posX-(widget.avatarW / 2), widget.posY-(widget.avatarW / 2), widget.avatarW, widget.avatarW); // img x y r
				// ctx.restore();


				if(widget.nameFormat != "4") {
					var fontWeight = widget.font_bold ? '600' : '200';

					ctx.font = fontWeight+" "+widget.font_size+"px "+widget.font_family;
					ctx.fillStyle = widget.color;
					ctx.textBaseline = "top";
					ctx.textAlign = textAlign;

					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';

						if(widget.nameFormat == '1') {
							ctx.strokeText(first_name, textX, textY);
							ctx.strokeText(last_name, textX, textYbr);
						} else if(widget.nameFormat == '2') {
							ctx.strokeText(first_name+' '+last_name, textX, textY);
						} else if(widget.nameFormat == '3') {
							ctx.strokeText(first_name, textX, textY);
						}
					}

					if(widget.nameFormat == '1') {
						ctx.fillText(first_name, textX, textY);
						ctx.fillText(last_name, textX, textYbr);
					} else if(widget.nameFormat == '2') {
						ctx.fillText(first_name+' '+last_name, textX, textY);
					} else if(widget.nameFormat == '3') {
						ctx.fillText(first_name, textX, textY);
					}
				}

				// if(widget.countShow) {
				// 	ctx.textAlign = 'left';
				// 	ctx.fillStyle = widget.countColor || '#fff';
					
				// 	var count_size = widget.countSize || widget.font_size;
				// 	ctx.font = fontWeight+" "+count_size+" "+widget.font_family;

				// 	if(widget.border) {
				// 		ctx.lineJoin = "round"
				// 		ctx.lineWidth = widget.border * 2;
				// 		ctx.strokeStyle = widget.borderColor || '#000';
						
				// 		ctx.strokeText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
				// 	}
				// 	ctx.fillText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
				// }

				if(widget.iconShow) {
					if(widget.iconSize) {
						ctx.font = widget.iconSize + 'px FontAwesome';
					} else {
						if(canvas.width > 795) 
							ctx.font='28px FontAwesome';
						else
							ctx.font='14px FontAwesome';
					}

					//if(widget.iconBlack) {ctx.fillStyle = '#000'} else {ctx.fillStyle = '#fff'}
					ctx.fillStyle = widget.iconColor || '#fff';
					
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText('\uF0a1', widget.posX + widget.iconPosX, widget.posY + widget.iconPosY);
					}

					ctx.fillText('\uF0a1', widget.posX + widget.iconPosX, widget.posY + widget.iconPosY);
					draw.count(ctx, data, widget, count)
					imageUrl = null;
					avatar = null;
					callback(context);
					
				} else {
					draw.count(ctx, data, widget, count)
					imageUrl = null;
					avatar = null;
					callback(context);
				}
			}
			avatar.src = imageUrl; //
		}


		if(best_share) {
			loadImagInUrl(_ava, call)
		} else {
			call(_ava);
		}
	},



	best_like: (context, data, widget, callback) => {
		var ctx = context[1];
		var canvas = context[0];
		var best_like = data.best_like[widget.user_pos];
		//var img_buf = Buffer('');


		if(best_like) {
			var _ava = best_like.photo_100;
			var first_name = best_like.first_name;
			var last_name = best_like.last_name;
			var count = best_like.count;
		} else {
			var _ava = path.join(__dirname, '../../public/img/')+'no_photo.png';
			if(widget.nameFormat == 1) {
				var first_name = 'Место';
				var last_name = 'свободно';
			} else if(widget.nameFormat == 2) {
				var first_name = 'Место свободно';
				var last_name = '';
			} else if(widget.nameFormat == 3) {
				var first_name = 'Место свободно';
				var last_name = '';
			}
			var count = '-';
		}

		if(widget.caps) {
			if(first_name != undefined) first_name = first_name.toUpperCase();
			if(last_name != undefined) last_name = last_name.toUpperCase();
		}
		

		if(widget.namePos == "right") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "left";

		} else if(widget.namePos == "left") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "end";

		}  else if(widget.namePos == "center") {
			var textX = widget.posX + widget.textPosX;
			var textY = widget.posY + widget.textPosY;
			var textYbr = widget.posY + widget.textPosY + (widget.font_size * 1.15);
			var textAlign = "center";
		}


		var call = (imageUrl) => {
			var avatar = new Image();
			avatar.onload = () => {
				draw.avatar(ctx, data, widget, avatar);
				// ctx.save();
				// ctx.arc(widget.posX, widget.posY, (widget.avatarW / 2), 0, Math.PI * 2, true); // x y r
				// ctx.clip();
				// ctx.beginPath();

				// ctx.drawImage(avatar, widget.posX-(widget.avatarW / 2), widget.posY-(widget.avatarW / 2), widget.avatarW, widget.avatarW); // img x y r
				// ctx.restore();


				if(widget.nameFormat != "4") {
					var fontWeight = widget.font_bold ? '600' : '200';

					ctx.font = fontWeight+" "+widget.font_size+"px "+widget.font_family;
					ctx.fillStyle = widget.color;
					ctx.textBaseline = "top";
					ctx.textAlign = textAlign;

					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';

						if(widget.nameFormat == '1') {
							ctx.strokeText(first_name, textX, textY);
							ctx.strokeText(last_name, textX, textYbr);
						} else if(widget.nameFormat == '2') {
							ctx.strokeText(first_name+' '+last_name, textX, textY);
						} else if(widget.nameFormat == '3') {
							ctx.strokeText(first_name, textX, textY);
						}
					}

					if(widget.nameFormat == '1') {
						ctx.fillText(first_name, textX, textY);
						ctx.fillText(last_name, textX, textYbr);
					} else if(widget.nameFormat == '2') {
						ctx.fillText(first_name+' '+last_name, textX, textY);
					} else if(widget.nameFormat == '3') {
						ctx.fillText(first_name, textX, textY);
					}
				}

				// if(widget.countShow) {
				// 	ctx.textAlign = 'left';
				// 	ctx.fillStyle = widget.countColor || '#fff';
					
				// 	var count_size = widget.countSize || widget.font_size;
				// 	ctx.font = fontWeight+" "+count_size+" "+widget.font_family;

				// 	if(widget.border) {
				// 		ctx.lineJoin = "round"
				// 		ctx.lineWidth = widget.border * 2;
				// 		ctx.strokeStyle = widget.borderColor || '#000';
						
				// 		ctx.strokeText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
				// 	}
				// 	ctx.fillText(count, widget.posX + widget.countPosX, widget.posY + widget.countPosY);
				// }

				if(widget.iconShow) {
					if(widget.iconSize) {
						ctx.font = widget.iconSize + 'px FontAwesome';
					} else {
						if(canvas.width > 795) 
							ctx.font='28px FontAwesome';
						else
							ctx.font='14px FontAwesome';
					}

					//if(widget.iconBlack) {ctx.fillStyle = '#000'} else {ctx.fillStyle = '#fff'}
					ctx.fillStyle = widget.iconColor || '#fff';
					
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText('\uf004', widget.posX + widget.iconPosX, widget.posY + widget.iconPosY);
					}

					ctx.fillText('\uf004', widget.posX + widget.iconPosX, widget.posY + widget.iconPosY);
					draw.count(ctx, data, widget, count)
					imageUrl = null;
					avatar = null;
					callback(context);

				} else {
					draw.count(ctx, data, widget, count)
					imageUrl = null;
					avatar = null;
					callback(context);
				}
			}
			avatar.src = imageUrl; //
		}


		if(best_like) {
			loadImagInUrl(_ava, call)
		} else {
			call(_ava);
		}
	},



	weather: (context, data, widget, callback) => {
		var ctx = context[1];

		getWeather(widget.city, (temp, weather) => {
			if(temp === false) return callback([context[0], ctx]);

			let moreInfo = widget.only_temp ? '' : weather+' ';
			let _c = widget.show_c ? 'C' : '';
			let textStr = widget.before_text != '' ? widget.before_text+" "+moreInfo+temp+"°"+_c : moreInfo+" "+temp+"°"+_c;
			let font_weight = widget.font_bold ? 'bold' : 'normal';

			if(widget.caps) {
				textStr = textStr.toUpperCase();
			}


			ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
			ctx.fillStyle = widget.color;
			ctx.textAlign = widget.textAlign || "left";
			ctx.textBaseline = "top";


			if(widget.border) {
				ctx.lineJoin = "round"
				ctx.lineWidth = widget.border * 2;
				ctx.strokeStyle = widget.borderColor || '#000';

				ctx.strokeText(textStr, widget.posX, widget.posY);
			}

			ctx.fillText(textStr, widget.posX, widget.posY);

			callback([context[0], ctx]);
		})
	},


	weather_icon: (context, data, widget, callback) => {
		var ctx = context[1];
		var iconPath = path.join(__dirname, `../../public/img/weather_icons/${widget.iconPack}/`);

		getWeather(widget.city, (temp, weather, icon) => {
			if(temp === false) return callback([context[0], ctx]);

			//console.log(weather, icon)
			let _c = widget.show_c ? 'C' : '';
			let text_1 = temp+"°"+_c;
			let font_weight = widget.font_bold ? 'bold' : 'normal';

			if(widget.caps) {
				weather = weather.toUpperCase();
			}


			var draw_text = function() {
				ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
				ctx.fillStyle = widget.color;
				ctx.textAlign = "left";
				ctx.textBaseline = "top";


				if(widget.border) {
					ctx.lineJoin = "round"
					ctx.lineWidth = widget.border * 2;
					ctx.strokeStyle = widget.borderColor || '#000';
					ctx.strokeText(text_1, widget.posX, widget.posY);
				}
				ctx.fillText(text_1, widget.posX, widget.posY);


				if(widget.textShow) {
					ctx.font = font_weight+" "+widget.textSize+"px "+widget.font_family;
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText(weather, widget.posX + widget.textPosX, widget.posY + widget.textPosY);
					}
					ctx.fillText(weather, widget.posX + widget.textPosX, widget.posY + widget.textPosY);
				}
			}


			if(widget.iconShow) {
				var iconImage = new Image();
				iconImage.onload = () => {
					ctx.drawImage(iconImage, widget.posX + widget.iconPosX - (widget.iconSize / 2), widget.posY + widget.iconPosY - (widget.iconSize / 2), widget.iconSize, widget.iconSize); // img x y r
					draw_text();
					callback([context[0], ctx]);
					iconImage = null;
				}
				iconImage.src = iconPath+icon+'.png';
			} else {
				draw_text();
				callback([context[0], ctx]);
			}
		})
	},


	probki: (context, data, widget, callback) => {
		var ctx = context[1];
		var iconPath = path.join(__dirname, `../../public/img/probki_icons/${widget.iconPack}/`);


		getTrafic(widget.cityId, function(level, hint, icon) {
			if(level === false) return callback([context[0], ctx]);


			let text_1 = level;
			if(widget.show_bale_text) {
				let ball_text;

				if(level == 1)
					ball_text = 'балл';
				else if(level == 5 || level == 6 || level == 7 || level == 8 || level == 9 || level == 10)
					ball_text = 'баллов';
				else
					ball_text = 'балла';

				text_1 += ` ${ball_text}`;
			}

			let font_weight = widget.font_bold ? 'bold' : 'normal';

			if(widget.caps) {
				text_1 = text_1.toUpperCase();
				hint = hint.toUpperCase();
			}


			var draw_text = function(){
				ctx.font = font_weight+" "+widget.font_size+"px "+widget.font_family;
				ctx.fillStyle = widget.color;
				ctx.textAlign = "left";
				ctx.textBaseline = "top";

				if(widget.border) {
					ctx.lineJoin = "round"
					ctx.lineWidth = widget.border * 2;
					ctx.strokeStyle = widget.borderColor || '#000';
					ctx.strokeText(text_1, widget.posX, widget.posY);
				}
				ctx.fillText(text_1, widget.posX, widget.posY);


				if(widget.textShow) {
					ctx.font = font_weight+" "+widget.textSize+"px "+widget.font_family;
					if(widget.border) {
						ctx.lineJoin = "round"
						ctx.lineWidth = widget.border * 2;
						ctx.strokeStyle = widget.borderColor || '#000';
						ctx.strokeText(hint, widget.posX + widget.textPosX, widget.posY + widget.textPosY);
					}
					ctx.fillText(hint, widget.posX + widget.textPosX, widget.posY + widget.textPosY);
				}
			}


			if(widget.iconShow) {
				var iconImage = new Image();
				iconImage.onload = () => {
					ctx.drawImage(iconImage, widget.posX + widget.iconPosX - (widget.iconSize / 2), widget.posY + widget.iconPosY - (widget.iconSize / 2), widget.iconSize, widget.iconSize); // img x y r
					draw_text();
					callback([context[0], ctx]);
					iconImage = null;
				}
				iconImage.src = iconPath+icon+'.png';
			} else {
				draw_text()
				callback([context[0], ctx]);
			}
		})
	}


}



function time(){
	return parseInt(new Date().getTime()/1000)
}


function translateStr(str, cb, err){
	let translate_url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key='+config.get('yandex_translate_api')+'&lang=ru-en&text='+encodeURIComponent(str);

	request.get({
		url: translate_url,
		gzip: true,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
			'referer': 'https://translate.google.ru/',
			"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36"
		}
	}, function(error, response, body){
		if(error || !body) return err()

		let answer = JSON.parse(body)

		if(answer.code != 200) return err()
		
		cb(answer.text[0])
	})
}


function getWeather(city, callback) {
	let rus_name_test = /[а-яА-Я]/i.test(city);
	if(city.indexOf('"')) city = city.replace(/"/g, '');
	if(city.indexOf('\'')) city = city.replace(/'/g, '');

	if(city.toLowerCase() == 'moscow' || city.toLowerCase() == 'москва') {
		city += ', RU';
	}

	let load_and_save_data = (en_city, cb, wInfo) => {
		let _url = 'http://api.openweathermap.org/data/2.5/find?q='+encodeURIComponent(en_city)+'&type=like&lang=ru&APPID=' + config.get('openweathermap_appid');

		request.get(_url, function(error, response, body){
			try {
				body = JSON.parse(body);
			} catch (error) {
				return callback(false, false);
			}

			if(body['list'] && body['list'].length > 0) {
				var item = body.list[0];
				var temp = Math.floor(item.main.temp - 273);
				var weather = item.weather[0].description;
				var icon = item.weather[0].icon;

				var weatherInfo = {
					temp: temp,
					weather: weather,
					icon: icon,
					time: time()
				}

				cb(weatherInfo)

				callback(temp, weather, icon)
			} else {
				if(wInfo) {
					callback(wInfo.temp, wInfo.weather, wInfo.icon)
				} else {
					callback(false, false)
				}
			}
		});
	};


	query("SELECT * FROM `"+config.get('db_perfix')+"weather` WHERE ?", {
			city: city
		}).then(function(rows) {

			if(rows.length > 0) {
				var wInfo = JSON.parse(rows[0].weather_info);

				if((time() - wInfo.time) <= 600 && wInfo.icon) {
					callback(wInfo.temp, wInfo.weather, wInfo.icon)
				} else {
					if(rus_name_test) {
						translateStr(city, (translate) => {
							load_and_save_data(translate, (weatherInfo)=>{
								query('UPDATE `cover_weather` SET ? WHERE `city` = "'+city+'"', {
									city: city,
									weather_info: JSON.stringify(weatherInfo)
								});
							}, wInfo)
						}, () => {
							callback(false, false)
						})
					} else {
						load_and_save_data(city, (weatherInfo)=>{
							query('UPDATE `cover_weather` SET ? WHERE `city` = "'+city+'"', {
								city: city,
								weather_info: JSON.stringify(weatherInfo)
							});
						}, wInfo)
					}

				}


			} else {
				if(rus_name_test) {
					translateStr(city, (translate) => {
						load_and_save_data(translate, (weatherInfo)=>{
							query('INSERT INTO `cover_weather` SET ?', {
								city: city,
								weather_info: JSON.stringify(weatherInfo)
							});
						})
					}, () => {
						callback(false, false)
					})
				} else {
					load_and_save_data(city, (weatherInfo)=>{
						query('INSERT INTO `cover_weather` SET ?', {
							city: city,
							weather_info: JSON.stringify(weatherInfo)
						});
					})
				}
			}
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
}


function getTrafic(cityId, callback) {
	query("SELECT * FROM `"+config.get('db_perfix')+"traffic` WHERE ?", {
		city_id: cityId
	}).then(function(rows) {
		var _url = "https://export.yandex.ru/bar/reginfo.xml?region="+cityId;

		if(rows.length > 0) {
			var traffic_info = JSON.parse(rows[0].traffic_info);

			if((time() - traffic_info.time) <= 600) {
				callback(traffic_info.level, traffic_info.hint, traffic_info.icon)
			} else {
				request.get(_url, function(error, response, body){
					let obj = parse(body);
					let trafic = obj.root.children[1];
					let traffic_info;

					if(trafic.name != 'traffic') {
						traffic_info = {
							level: false,
							hint: false,
							icon: false,
							time: time()+600
						};
					} else {
						let region = trafic.children[0];

						if(region != undefined) {
							let level = region.children[1].content;
							let icon = region.children[2].content;
							let hint = region.children[5].content;
							
							traffic_info = {
								level: level,
								hint: hint,
								icon: icon,
								time: time()
							};
						} else {
							traffic_info = {
								level: false,
								hint: false,
								icon: false,
								time: time()+600
							};
						}
					}


					query('UPDATE `cover_traffic` SET ? WHERE `city_id` = "'+cityId+'"', {
						city_id: cityId,
						traffic_info: JSON.stringify(traffic_info)
					});

					callback(traffic_info.level, traffic_info.hint, traffic_info.icon)
				});
			}


		} else {
			request.get(_url, function(error, response, body){
				let obj = parse(body);
				let trafic = obj.root.children[1];
				let traffic_info;

				if(trafic.name != 'traffic') {
					traffic_info = {
						level: false,
						hint: false,
						icon: false,
						time: time()+6000
					};
				} else {
					let region = trafic.children[0];

					if(region != undefined) {
						let level = region.children[1].content;
						let icon = region.children[2].content;
						let hint = region.children[5].content;
						
						traffic_info = {
							level: level,
							hint: hint,
							icon: icon,
							time: time()
						};
					} else {
						traffic_info = {
							level: false,
							hint: false,
							icon: false,
							time: time()+6000
						};
					}
				}


				query('INSERT INTO `cover_traffic` SET ?', {
					city_id: cityId,
					traffic_info: JSON.stringify(traffic_info)
				});

				callback(traffic_info.level, traffic_info.hint, traffic_info.icon)
			});
		}
	}).catch(function (err) {
		console.log('Error');
		console.log(err);
	});
}




function loadGroupData(secretKey, callback) {
	let sql = `SELECT
					C.*,
					U.token
				FROM
					${config.get('db_perfix')}covers AS C
				JOIN
					${config.get('db_perfix')}users AS U ON U.id = C.uid 
				WHERE
					C.secret_key = ?`;

	query(sql, [secretKey]).then(rows=>{
		rows[0].group_token = rows[0].token;
		callback(rows);
	})


	// query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?",
	// 	{"secret_key": secretKey})
	// .then(function(rows) {
	// 	if(rows[0]) {
	// 		query("SELECT `token` FROM `cover_users` WHERE ?", {
	// 			id: rows[0].uid
	// 		}).then(users => {
	// 			var userToken = users[0].token;
	// 			rows[0].group_token = userToken;
	// 			callback(rows);
	// 		}).catch(function (err) {
	// 			console.log('баланс Error', err);
	// 		})
	// 		// if(!rows[0].group_token) {
	// 		// 	query("SELECT `token` FROM `cover_users` WHERE ?", {
	// 		// 		id: rows[0].uid
	// 		// 	}).then(users => {
	// 		// 		var userToken = users[0].token;
	// 		// 		rows[0].group_token = userToken;
	// 		// 		callback(rows);
	// 		// 	}).catch(function (err) {
	// 		// 		console.log('баланс Error', err);
	// 		// 	})
	// 		// } else {
	// 		// 	callback(rows);
	// 		// }
	// 	}
	// }).catch(function (err) {
	// 	console.log('Error');
	// 	console.error(err);
	// });
}



function retinaCord(widgets) {
	for(var i in widgets) {
		if(widgets[i].name === 'donationalerts_instream_stats') {
			for(var j in widgets[i]) {
				if(typeof widgets[i][j] == "number") {
					if(j != 'listCount' 
						&& j != 'sliderSecondTextBr' 
						&& j != 'sliderSecondTextMax') {
						widgets[i][j] *= 2;
					}
				}
			}

		} else if(widgets[i].name === 'donationalerts_donation_goal') {
			for(var j in widgets[i]) {
				if(typeof widgets[i][j] == "number") {
					if(j != 'barRadius') {
						widgets[i][j] *= 2;
					}
				}
				
				if(j === 'barRadius') {
					widgets[i][j] = parseInt(widgets[i][j]) * 2;
				}
			}

		} else if(widgets[i].name === 'youtube_last_video' || widgets[i].name === 'youtube_video_to_link') {
			for(var j in widgets[i]) {
				if(typeof widgets[i][j] == "number") {
					if(j != 'title_maxLines' && j != 'title_maxLength') {
						widgets[i][j] *= 2;
					}
				}
			}

		} else {
			for(var j in widgets[i]) {
				if(typeof widgets[i][j] == "number") {
					if(j != 'cityId') {
						widgets[i][j] *= 2;
					}
				}
			}
		}
	}
	return widgets;
}


function checkWidgetsData(widgets) {
	var timezones = [
		"Asia/Irkutsk",
		"Asia/Yakutsk",
		"Asia/Vladivostok",
		"America/New_York",
		"Europe/Kaliningrad",
		"Europe/Kiev",
		"Europe/Moscow",
		"Europe/Samara",
		"Asia/Yekaterinburg",
		"Asia/Novosibirsk",
		"Asia/Krasnoyarsk",
		"Asia/Omsk"
	];
	for(var i in widgets) {
		for(var j in widgets[i]) {
			if(j == 'timezone')
				if(timezones.indexOf(widgets[i][j]) == -1)
					widgets[i][j] = 'Europe/Moscow';
		}
	}
	return widgets;
}






function vkCover(gid, img, token, callback, error_func) {
	// var vk_api = new VK({'token': token});
	var vk_api = new VK();
	vk_api.setToken(token);

	vk_api.upload.cover({
		group_id: gid,
		source: fs.createReadStream(img),
		crop_x2: 1590,
		crop_y2: 400
	}).then(res=>{
		// console.log(res);
		// console.log('Обложка загружена '+img+' ('+gid+')');
		if(callback) callback();
	}).catch(err => {
		if(error_func) error_func('vkCover_error')
		vkErrorHandler(err, token, gid)
	});
}



function getLastUsers(id, token, callback) {
	var vk_api = new VK({'token': token});

	vk_api.api.groups.getMembers({
		group_id: id,
		sort: 'time_desc',
		count: 3,
		fields: "photo_100"
	}).then(res=>{
		callback(res.items);
		// res.render('pages/groups.ejs', {groups: response});
	}).catch(err => {
		vkErrorHandler(err, token, id)
	});
}


function getBestLike(id, token, callback) {
	var vk_api = new VK({token: token});
	
	vk_api.api.wall.get({
		owner_id: id * -1,
		count: 25
	}).then(res=>{
		
		var todayPosts = [];

		for(var item of res.items){
			if(item.likes.count > 0) {
				todayPosts.push({
					type: 'post',
					owner_id: item.owner_id,
					item_id: item.id,
					filter: 'likes',
					count: 300 //только 100 лайков
					,skip_own: 1 // не учитывать ваши лайки
				});
			}
			
		}

		
		if(todayPosts.length == 0) {
			callback(false);
			return false;
		}

		
		vk_api.executes('likes.getList', todayPosts).then(res_2 => {
			var profiles = {};
			//console.log(res_2)

			for(var item of res_2) {
				for(var prof of item.items) {
					if(profiles[prof]) {
						profiles[prof] += 1;
					} else {
						profiles[prof] = 1;
					}
				}
			}

			//console.log(profiles, Object.keys(profiles).length)


			if(Object.keys(profiles).length == 0) {
				callback(false);
				return false;
			}

			//console.log(profiles)


			var topUsers = [
				{id: null, count: 0},
				{id: null, count: 0},
				{id: null, count: 0}
			];
			var userStr = '';
			for(var i=0; i<=2; i++) {
				for(var _i in profiles) {
					if(profiles[_i] >= topUsers[i].count) {
						topUsers[i].id = _i;
						topUsers[i].count = profiles[_i];
					}
				}
				delete profiles[topUsers[i].id];

				if(topUsers[i].id === null) {
					topUsers[i] = false;
				} else {
					if(userStr == '')
						userStr = topUsers[i].id;
					else
						userStr += ','+topUsers[i].id;
				}
			}

			//console.log(topUsers, userStr)
			



			vk_api.api.users.get({
				user_ids: userStr,
				fields: "photo_100"
			}).then(res=>{
				for(var i=0; i<=2; i++) {
					if(res[i])
						res[i].count = topUsers[i].count;
					else
						res[i] = false;
				}
				
				callback(res);
			}).catch(err => {
				console.error(err);
			});

		}).catch(err => {
			console.error(err);
		});

	}).catch(err => {
		vkErrorHandler(err, token, id)
	});
}




function getBestShare(id, token, callback) {
	var vk_api = new VK({token: token});
	
	vk_api.api.wall.get({
		owner_id: id * -1,
		count: 25
	}).then(res=>{
		var todayPosts = [];



		for(var item of res.items){
			if(item.reposts.count > 0) {
				todayPosts.push({
					type: 'post',
					owner_id: item.owner_id,
					item_id: item.id,
					filter: 'copies',
					count: 300 //только 100 лайков
					,skip_own: 1 // не учитывать ваши лайки
				});
			}
			
		}

		
		if(todayPosts.length == 0) {
			callback(false);
			return false;
		}

		
		vk_api.executes('likes.getList', todayPosts).then(res_2 => {
			var profiles = {};
			//console.log(res_2)

			for(var item of res_2) {
				for(var prof of item.items) {
					if(prof > 0) {
						if(profiles[prof]) {
							profiles[prof] += 1;
						} else {
							profiles[prof] = 1;
						}
					}
				}
			}

			//console.log(profiles)


			if(Object.keys(profiles).length == 0) {
				callback(false);
				return false;
			}

			//console.log(profiles)


			var topUsers = [
				{id: null, count: 0},
				{id: null, count: 0},
				{id: null, count: 0}
			];
			var userStr = '';
			for(var i=0; i<=2; i++) {
				for(var _i in profiles) {
					if(profiles[_i] >= topUsers[i].count) {
						topUsers[i].id = _i;
						topUsers[i].count = profiles[_i];
					}
				}
				delete profiles[topUsers[i].id];

				if(topUsers[i].id === null) {
					topUsers[i] = false;
				} else {
					if(userStr == '')
						userStr = topUsers[i].id;
					else
						userStr += ','+topUsers[i].id;
				}
			}



			vk_api.api.users.get({
				user_ids: userStr,
				fields: "photo_100"
			}).then(res=>{
				for(var i=0; i<=2; i++) {
					if(res[i])
						res[i].count = topUsers[i].count;
					else
						res[i] = false;
				}

				
				callback(res);
			}).catch(err => {
				console.error(err);
			});

		}).catch(err => {
			console.error(err);
		});




	}).catch(err => {
		vkErrorHandler(err, token, id)
	});
}



function getBestCommenter(id, token, callback) {
	var vk_api = new VK({token: token});

	vk_api.api.wall.get({
		owner_id: id * -1,
		count: 25
	}).then(res=>{
		var todayPosts = [];

		for(var item of res.items){
			if(item.comments.count > 0) {
				todayPosts.push({
					owner_id: item.owner_id,
					post_id: item.id,
					count: 300 //только 100 комментов
				});
			}
		}

		if(todayPosts.length == 0) {
			callback(false)
			return false;
		}

		
		vk_api.executes('wall.getComments', todayPosts).then(res_2 => {
			var profiles = {};

			for(var item of res_2) {
				if(item.items) {
					for(var item of item.items) {
						if(item.from_id > 0 && !item.is_pinned) {
							if(profiles[item.from_id]) {
								profiles[item.from_id] += 1;
							} else {
								profiles[item.from_id] = 1;
							}
						}
					}
				}
			}



			var topUsers = [
				{id: null, count: 0},
				{id: null, count: 0},
				{id: null, count: 0}
			];
			var userStr = '';
			for(var i=0; i<=2; i++) {
				for(var _i in profiles) {
					if(profiles[_i] >= topUsers[i].count) {
						topUsers[i] = {
							id: _i,
							count: profiles[_i]
						};
					}
				}
				delete profiles[topUsers[i].id];

				

				if(topUsers[i].id === null) {
					topUsers[i] = false;
				} else {
					if(userStr == '')
						userStr = topUsers[i].id;
					else
						userStr += ','+topUsers[i].id;
				}
			}
			profiles = null;


			vk_api.api.users.get({
				user_ids: userStr,
				fields: "photo_100"
			}).then(res=>{
				for(var i=0; i<=2; i++) {
					if(res[i])
						res[i].count = topUsers[i].count;
					else
						res[i] = false;
				}
			
				
				callback(res);
			}).catch(err => {
				console.error(err);
			});


		}).catch(err => {
			console.error(err);
		});
	}).catch(err => {
		vkErrorHandler(err, token, id)
	});
}


function getMembersCount(id, token, callback) {
	let vk_api = new VK({token: token});
	vk_api.api.groups.getById({
		group_id: id,
		fields: "members_count"
	}).then(res=>{	
		callback(res[0].members_count);
	}).catch(err => {
		vkErrorHandler(err, token, id)
	});
}



function getBirthday(id, token, callback) {	
	let myDateZone = new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' });
	let myDate = new Date(myDateZone);
	let day = myDate.getUTCDate();
	let month = myDate.getUTCMonth() + 1;

	let vk_api = new VK({token: token});
	vk_api.api.users.search({
		count: 100,
		fields: "photo_100",
		group_id: id,
		birth_day: day,
		birth_month: month
	}).then(res=>{
		let _b = res.items;
		let _answer = [];

		if(_b.length >= 3) {
			for(let i = 0; i<3; i++) {
				let j = Math.floor(Math.random() * _b.length);
				_answer.push(_b[j]);
				_b.splice(j, 1)
			}
		} else  {
			_answer = _b;
		}
		
		callback(_answer);
	}).catch(err => {
		console.error(err);
	});
}



function getUsersByLink(data, token, callback) {
	let answer = {};
	let ids = [];
	for(let v of data[0]) {
		if(v.name === 'show_user_to_link') {
			let link = v.link;
			answer[link] = false;
			if(link.indexOf('/')) {
				let _id = link.split('/')
				ids.push(_id[_id.length-1]);
			} else {
				ids.push(link);
			}
		}
	}


	let vk_api = new VK({token: token});
	vk_api.api.users.get({
		user_ids: ids.join(','),
		fields: "domain,photo_100"
	}).then(users=>{
		if(users.length == ids.length) {
			let j = 0;
			for(let i in answer) {
				answer[i] = users[j]
				j++;
			}
		} else {
			for(let i in answer) {
				for(let user of users) {
					if(i == user.id || i == user.domain) {
						answer[i] = user;
					}
				}
			}
		}

		callback(answer);
	}).catch(err => {
		console.error(err);
		callback({});
	});
}


function getYouTubeChannelInfo(data, token, callback) {
	let answer = {};
	let channelsId = [];

	for(let v of data[0]) {
		if(v.name === 'youtube_channel_info') {
			let channel_id = v.channel_id;
			answer[channel_id] = false;
			channelsId.push(channel_id);
		}
	}

	let apiKey = config.get('youtube_api_key');
	let ytbApiVideoStatistics = `https://www.googleapis.com/youtube/v3/channels?id=${channelsId.join(',')}&part=statistics,snippet&key=${apiKey}`;
	request.get(ytbApiVideoStatistics, function(error, response, body){
		if(error) return callback({});;

		body = JSON.parse(body);
		let items = body.items;

		for(let val of items) {
			let channel_info = {};
			let stats = val.statistics;
			let snippet = val.snippet;
	
			channel_info.title = snippet.title;
			channel_info.image = snippet.thumbnails.medium.url;
			channel_info.subs = stats.subscriberCount;
			channel_info.view = stats.viewCount;
			channel_info.videos = stats.videoCount;

			answer[val.id] = channel_info;
		}

		callback(answer);
	});
}


function getYouTubeVideoToLink(data, token, callback) {
	let answer = {};
	let videosId = [];

	for(let v of data[0]) {
		if(v.name === 'youtube_video_to_link') {
			if(v.video_url.indexOf('www.youtube.com/watch?v=') > -1 || v.video_url.indexOf('youtu.be/') > -1) {
				let video_url = v.video_url;

				if(video_url.indexOf('youtube.com/watch?v=') > -1) {
					video_url = getParameterByName('v', video_url)
				} else {
					video_url = video_url.replace(/.+\.be\//, '');
				}

				answer[video_url] = false;
				videosId.push(video_url);
			}
		}
	}


	let apiKey = config.get('youtube_api_key');
	let ytbApiVideoStatistics = `https://www.googleapis.com/youtube/v3/videos?id=${videosId.join(',')}&part=statistics,snippet&key=${apiKey}`;


	request.get(ytbApiVideoStatistics, function(error, response, body){
		if(error) return callback({});

		body = JSON.parse(body);
		let items = body.items;

		for(let val of items) {
			let last_video = {};
			let stats = val.statistics;
			let snippet = val.snippet;

			// if(!snippet.thumbnails.medium.url || !snippet.title) return callback([context[0], ctx]);

			last_video.image = snippet.thumbnails.medium.url;
			last_video.title = snippet.title;
			last_video.live = snippet.liveBroadcastContent;

			last_video.likes = stats.likeCount;
			last_video.dislikes = stats.dislikeCount;
			last_video.view = stats.viewCount;
			last_video.comments = stats.commentCount;
			last_video.done = stats.likeCount / (+stats.likeCount + +stats.dislikeCount);

			answer[val.id] = last_video;
		}

		callback(answer);
	});
}


function getLastVideoYtb(channelId, _w, cb) {
	let apiKey = config.get('youtube_api_key');
	let ytbApiLastVideo = `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&part=snippet,id&order=date&key=${apiKey}`;

	
	request.get(ytbApiLastVideo, function(error, response, body){
		if(error) return cb(null, {});
		
		body = JSON.parse(body);
      let items = body.items;
      // console.log(items)
		if(!items || items.length == 0) return cb(null, {});

		let data = body.items[0];
		let last_video = {};

		if(!_w.show_live && data.snippet.liveBroadcastContent == 'live') {
			data = body.items[1];
		}

		if(data.snippet.thumbnails.medium.url) {
			last_video.image = data.snippet.thumbnails.medium.url;
		}
		last_video.title = data.snippet.title;
		last_video.live = data.snippet.liveBroadcastContent; // содержит 'live' если это трансляция

		if(_w.show_likes_bar || _w.show_likes) {
			let ytbApiVideoStatistics = `https://www.googleapis.com/youtube/v3/videos?id=${data.id.videoId}&part=statistics&key=${apiKey}`;
			request.get(ytbApiVideoStatistics, function(error_2, response_2, body_2){
				if(error_2) return cb(null, {});

				body_2 = JSON.parse(body_2);
				if(!body_2.items || !body_2.items[0] || !body_2.items[0].statistics) return cb(null, {});
				let stats = body_2.items[0].statistics;

				last_video.likes = stats.likeCount;
				last_video.dislikes = stats.dislikeCount;
				last_video.view = stats.viewCount;
				last_video.comments = stats.commentCount;
				last_video.done = stats.likeCount / (+stats.likeCount + +stats.dislikeCount);
				last_video.id = channelId;

				cb(null, last_video)
			});

		} else {
			cb(null, last_video)
		}
	});
}


function getLastVideoInYoutubeChannel(data, token, callback) {
	let answer = {};
	let channelsId = [];
	let todo = [];

	for(let v of data[0]) {
		if(v.name === 'youtube_last_video') {
			let channel_id = v.channel_id;
			if(!channel_id) continue;
			
			answer[channel_id] = false;

			todo.push(function(cb){
				getLastVideoYtb(channel_id, v, function(err, channel_data){
					cb(err, channel_data);
				})
			})
		}
	}

	parallel(todo, function(err, results){
		if(err) return callback({});

		for(let _val of results) {
			if(_val.id) answer[_val.id] = _val;
		}

		callback(answer)
	})
}




function loadNewData(data, _i, callback, newInfo) {
	var newInfo = newInfo || {};

	if(_i == data[0].length) {
		callback(newInfo)
	} else {
		var widget = data[0][_i];

		if(!widget || !widget.name) return loadNewData(data, _i+1, callback, newInfo);

		if(widget.name == 'last_sub') {
			if(newInfo.last_sub) return loadNewData(data, _i+1, callback, newInfo);

			getLastUsers(data[1], data[2], (info)=>{
				newInfo.last_sub = info;
				loadNewData(data, _i+1, callback, newInfo);
			})

		} else if(widget.name == 'best_comment') {
			if(newInfo.best_comment) return loadNewData(data, _i+1, callback, newInfo);

			getBestCommenter(data[1], data[2], (info)=>{
				newInfo.best_comment = info;
				loadNewData(data, _i+1, callback, newInfo);
			})

		} else if(widget.name == 'best_share') {
			if(newInfo.best_share) return loadNewData(data, _i+1, callback, newInfo);

			getBestShare(data[1], data[2], (info)=>{
				newInfo.best_share = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'best_like') {
			if(newInfo.best_like) return loadNewData(data, _i+1, callback, newInfo);

			getBestLike(data[1], data[2], (info)=>{
				newInfo.best_like = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'members_count') {
			if(newInfo.members_count) return loadNewData(data, _i+1, callback, newInfo);

			getMembersCount(data[1], data[2], (info)=>{
				newInfo.members_count = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'birthday') {
			if(newInfo.birthday) return loadNewData(data, _i+1, callback, newInfo);

			getBirthday(data[1], data[2], (info)=>{
				newInfo.birthday = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'show_user_to_link') {
			if(newInfo.show_user_to_link) return loadNewData(data, _i+1, callback, newInfo);

			getUsersByLink(data, data[2], (info)=>{
				newInfo.show_user_to_link = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'youtube_channel_info') {
			if(newInfo.youtube_channel_info) return loadNewData(data, _i+1, callback, newInfo);

			getYouTubeChannelInfo(data, data[2], (info)=>{
				newInfo.youtube_channel_info = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'youtube_video_to_link') {
			if(newInfo.youtube_video_to_link) return loadNewData(data, _i+1, callback, newInfo);

			getYouTubeVideoToLink(data, data[2], (info)=>{
				newInfo.youtube_video_to_link = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else if(widget.name == 'youtube_last_video') {
			if(newInfo.youtube_last_video) return loadNewData(data, _i+1, callback, newInfo);

			getLastVideoInYoutubeChannel(data, data[2], (info)=>{
				newInfo.youtube_last_video = info;
				loadNewData(data, _i+1, callback, newInfo);
			})
		} else {
			loadNewData(data, _i+1, callback, newInfo);
		}
	}
}



function vkErrorHandler(err, token, gid) {
	// https://vk.com/dev/errors
	if(err.code == 5) {
		freezeCovers(token, 1)
	} else if(err.code == 7 || err.code == 15 || err.code == 203) {
		//freezeCovers(token, 1) // временная обработка ошибки

		query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {
			token: token
		}).then(function(user) {
			query("UPDATE `"+config.get('db_perfix')+"covers` SET `status` = 0 WHERE `uid` = "+user[0].id+" AND `group_id` = "+gid+"");


			vk.setToken(config.get('vk_group_token'));
			vk.api.messages.send({
				user_id: user[0].vk_id,
				message: '[Системное сообщение]\nНедостаточно прав для обновления обложки. Требуются права "редактора" или выше.\n\nМы временно отключили вашу обложку. После получения необходимых полномочий в группе, вы можете включить её в своём кабинете: http://live-cover.ru/cabinet/cover/'
			});
		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});
		
	} else if(err.code == 14) {
		query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {
			token: token
		}).then(function(user) {
			//, {
			//	uid: user[0].id,
			//	group_id: gid
			//}
			let newTime = time() + 120;
			query("UPDATE `cover_covers` SET `last_update` = "+newTime+" WHERE `uid` = "+user[0].id+" AND `group_id` = "+gid+"").then(result => {
				//console.log(result)
			}).catch(function (err) {
				console.error(err);
			});

		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});

		// telegram_alert(`Запрос капчи у группы (${gid})! Поставил задердку 2 мин!`)
		console.error('->>', gid || 'хз', err.code || 'хз')
	} else {
		console.error('->>', gid || 'хз', err.code || 'хз')
	}
}


function freezeCovers(old_token, error_code) {
	console.error('Устаревший token')

	query("SELECT * FROM `"+config.get('db_perfix')+"users` WHERE ?", {
		token: old_token
	}).then(function(user) {
		query("UPDATE `"+config.get('db_perfix')+"covers` SET `freeze_status` = "+error_code+" WHERE ?", {
			uid: user[0].id,
		});

		vk.setToken(config.get('vk_group_token'));
		vk.api.messages.send({
			user_id: user[0].vk_id,
			message: '[Системное сообщение]\nВконтакте аннулировал ваш "ключ доступа".\nБез ключа мы не можем обновлять обложки, поэтому все ваши обложки заморожены. Чтобы их разморозить вам нужно повторно авторизироваться на нашем сайте: https://vk.cc/6LQmPN\n\n------------\nЧаще всего причина аннулирования "ключа доступа" это смена пароля Вконтакте или "выход со всех устройств".'
		});
	}).catch(function (err) {
		console.log('Error');
		console.log(err);
	});
}



function searchInName(w, name) {
	for(var i in w) {
		if(w[i].name == name) return true;
	}
	return false;
}




module.exports = function (app) {
	app.get('/test/:id', function(req, res){
		// тут ещё можно проверять token посредством вызова vk api
		// а то, при не активном токене первый раз отдаётся ответ без ошибки

		var id = req.params.id;
		query("SELECT `freeze_status` FROM `cover_covers` WHERE ?", {
			secret_key: id
		})
		.then(covers => {
			if(covers[0].freeze_status == null) {
				setCoverGroup(id, () => {
					res.send({error: null, response: 'ok'})
				});
			} else if(covers[0].freeze_status == 1) {
				res.send({error: 'token', response: null})
			} else if(covers[0].freeze_status == 2) {
				res.send({error: 'balance', response: null})
			}
		})
	});



	app.get('/copy/:id', isLoggedIn, function(req, res){
		// тут ещё можно проверять token посредством вызова vk api
		// а то, при не активном токене первый раз отдаётся ответ без ошибки

		var id = req.params.id;
		query("SELECT * FROM `cover_covers` WHERE ?", {
			secret_key: id
		})
		.then(covers => {
			if(req.user.id != covers[0].uid) return res.send({error: 'user_error', response: null});

			var cover = covers[0];
			var newFileName = cover.group_id +'_'+ randomString(14) +'.jpg';
			var secret_key = randomString(15);


			var stream = fs.createReadStream('public/uploads/cover/'+cover.main_image).pipe(fs.createWriteStream('public/uploads/cover/'+newFileName))

			stream.on('finish', ()=>{
				query("INSERT INTO `cover_covers` SET ?", {
					main_image: newFileName,
					widgets: cover.widgets,
					uid: cover.uid,
					group_id: cover.group_id,
					group_token: cover.group_token,
					interval_d: cover.interval_d,
					reset_type: cover.reset_type,
					schedule: cover.schedule,
					secret_key: secret_key,
					status: 0
				}).then(function (rows) {
					imgGeneration.saveImage({
						group_id: cover.group_id,
						token: req.user.token,
						image: newFileName
					}, cover.widgets, (url) => res.send({error: null, response: 'ok'}));

				}).catch(function (err) {
					console.log('Error');
					console.log(err);
				});
				stream = null;
			});
				
		})
	});



	app.post('/api/check_traffic', isLoggedIn, function(req, res){
		let data = req.body;
		getTrafic(data.region, (result) => {
			if(result == false)
				res.send('error')
			else
				res.send('ok')
		})
	});


	//предпросмотр результата
	app.post('/api/preview', function(req, res){
		var data = req.body;
		
		if(req.files != null) {
			let sampleFile = req.files['file'];
			imgGeneration.preview({
				group_id: data.group_id,
				token: req.user.token,
				file: sampleFile
			}, data.widgets, (url) => res.send({'url': url}));


		} else {
			imgGeneration.preview({
				group_id: data.group_id,
				token: req.user.token,
				image: data.image
			}, data.widgets, (url) => res.send({'url': url}));
		}
	});
	

	app.post('/api/check_token', (req, res) => {
		var data = req.body;
		// console.log(data)

		vk.setToken(data.group_token);
		vk.api.groups.getCallbackConfirmationCode({
			group_id: data.gid
		}).then(resp => {
			// console.log(resp);
			res.send(resp);
			// res.render('pages/groups.ejs', {groups: response});
		}).catch(err => {
			res.send({error: err.code});
		});
		
	});


	app.post('/api/save_cover', isLoggedIn, (req, res) => {
		// console.log(req.user);
		var data = req.body;
		var fileName = data.group_id +'_'+ randomString(14) +'.jpg';
		var secret_key = randomString(15);
		// console.log(data);
		// console.log(req.files);


		if(req.files != null) {
			let sampleFile = req.files['file'];
 
			sampleFile.mv('public/uploads/cover/'+fileName, function(err) {
				// console.log('TODO >> нужна проверка на ошибки');

				query("INSERT INTO `cover_covers` SET ?", {
					main_image: fileName,
					widgets: data.widgets,
					uid: req.user.id,
					group_id: data.group_id,
					group_token: data.group_token,
					interval_d: data.interval,
					reset_type: data.reset_type,
					schedule: data.schedule,
					secret_key: secret_key,
					status: data.status == 'true' ? 1 : 0
				}).then(function (rows) {
					setCoverGroup(secret_key);
					res.send(secret_key);

					if(data.reset_type == 'callback') {
						setCallbackSetting(data.group_token, data.group_id, secret_key)
					}


				}).catch(function (err) {
					console.log('Error');
					console.log(err);
				});


				// if (err)
				// 	return res.status(500).send(err);
			
				// res.send('File uploaded!');
			});
		}
	});




	app.post('/api/edit_cover', isLoggedIn, (req, res) => {
		var data = req.body;
		var fileName = data.group_id +'_'+ randomString(14) +'.jpg';
		//console.log(req.user);
		// console.log(req.files);



		if(req.files != null) {
			let sampleFile = req.files['file'];
 
			sampleFile.mv('public/uploads/cover/'+fileName, function(err) {
				// console.log('TODO >> нужна проверка на ошибки');

				query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {
					secret_key: data.cover_id
				}).then(function(rows_2) {
					var row = rows_2[0];

					if(req.user.id != row.uid && (req.user.id != 2 && req.user.id != 105)){
						return res.send('error');
					}

					fs.stat(_dirUserCover + row.main_image, function (err, stats) {
						if(!err)
							fs.unlinkSync(_dirUserCover + row.main_image);
					});
					fs.stat(_dirCoverForVk + row.main_image, function (err, stats) {
						if(!err)
							fs.unlinkSync(_dirCoverForVk + row.main_image);
					});


					query("UPDATE `cover_covers` SET ? WHERE `secret_key` = '"+data.cover_id+"'", {
						main_image: fileName,
						widgets: data.widgets,
						interval_d: data.interval,
						group_id: data.group_id,
						status: data.status == 'true' ? 1 : 0,
						group_token: data.group_token,
						reset_type: data.reset_type,
						schedule: data.schedule
					}).then(function (rows) {
						if(data.reset_type == 'callback') {
							setCallbackSetting(data.group_token, data.group_id, data.cover_id)
						}

					}).catch(function (err) {
						console.log('Error', err);
						// console.log(err);
					});

				});

				

				// if (err)
				// 	return res.status(500).send(err);
			
				// res.send('File uploaded!');
			});
		} else {
			query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {
					secret_key: data.cover_id
				}).then(function(rows_2) {
					if(req.user.id != rows_2[0].uid && (req.user.id != 2 && req.user.id != 105)){
						return res.send('error');
					}

				query("UPDATE `cover_covers` SET ? WHERE `secret_key` = '"+data.cover_id+"'", {
					widgets: data.widgets,
					interval_d: data.interval,
					group_id: data.group_id,
					status: data.status == 'true' ? 1 : 0,
					group_token: data.group_token,
					reset_type: data.reset_type,
					schedule: data.schedule
				}).then(function (rows) {
					// console.log('good');
					if(data.reset_type == 'callback') {
						setCallbackSetting(data.group_token, data.group_id, data.cover_id)
					}

				}).catch(function (err) {
					console.log('Error', err);
					// console.log(err);
				});


			}).catch(function (err) {
				console.log('Error', err);
				// console.log(err);
			});
		}

		// console.log('TODO >> сюда нужно передавать токен');
		res.send('ok');
	});


	

	app.post('/api/remove_cover', isLoggedIn, (req, res) => {
		var data = req.body;
		// console.log(data);
		// console.log(req.files);


		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {
			secret_key: data.cover_id
		}).then(function(rows) {
			var row = rows[0];
			
			if(req.user.id != row.uid && (req.user.id != 2 && req.user.id != 105)){
				return res.send('error');
			}

			fs.stat(_dirUserCover + row.main_image, function (err, stats) {
				if(!err)
					fs.unlinkSync(_dirUserCover + row.main_image);
			});
			fs.stat(_dirCoverForVk + row.main_image, function (err, stats) {
				if(!err)
					fs.unlinkSync(_dirCoverForVk + row.main_image);
			});

			query("DELETE FROM `cover_covers` WHERE ?", {
				secret_key: data.cover_id
			}).then(function (rows) {
				// console.log('good', rows);

			}).catch(function (err) {
				console.log('Error');
				console.log(err);
			});

		}).catch(function (err) {
			console.log('Error');
			console.log(err);
		});

		// console.log('TODO >> сюда нужно передавать токен');
		res.send('ok');
	});


	

	app.post('/api/pass_cover', isLoggedIn, (req, res) => {
		var data = req.body;


		query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {
			secret_key: data.secret_key
		}).then((res_1) => {
			if(res_1 != '') {
				if(res_1[0].uid == req.user.id) { // проверяем что пользователь передаёт свою обложку


					query("SELECT `id` FROM `"+config.get('db_perfix')+"users` WHERE ?", {
						vk_id: data.vk_id
					}).then((res_2) => {
						if(res != '') { // проверяем наличие пользователя с таким id
							query("UPDATE `"+config.get('db_perfix')+"covers` SET ? WHERE `id` = "+res_1[0].id+"", {
								uid: res_2[0].id,
								status: 0
							}).then((res_3) => {

							}).catch((err) => {
								
							})
							
							res.send('ok')
						} else {
							res.send('error')
						}
					}).catch((err) => {
						res.send('error')
					})


				} else {
					res.send('error')
				}
			} else {
				res.send('error')
			}
		}).catch((err) => {
			res.send('error')
		})
	});




	
	app.post('/callback/:id', (req, res) => {
		var id = req.params.id;
		var data = req.body;
		// console.log(data);

		if(data.type == 'confirmation') {
			query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE ?", {"secret_key": id}).then(function(rows) {
				var row = rows[0];
				// console.log('row.group_code', row.group_code);
				// res.send(row.group_code);


				vk.setToken(row.group_token);
				vk.api.groups.getCallbackConfirmationCode({
					group_id: data.group_id
				}).then(resp => {
					// console.log('resp', resp)
					res.send(resp.code);
					// res.render('pages/groups.ejs', {groups: response});
				}).catch(err => {
					console.log('error', err)
					// res.send({error: err.code});
				});

				if(rows != '') {

				} else {
					
				}
			}).catch(function (err) {
				console.log('Error');
				console.log(err);
			});

		} else if(data.type == 'group_join' || data.type == 'group_leave') {
			query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE `group_id` = "+data.group_id+" AND `reset_type` = 'callback' AND `status` = 1 AND `freeze_status` IS NULL").then(function(rows) {
				if(rows != '') {
					rows = timeFilter(rows);


					// console.log(time() - rows[0].last_update)
					if(rows[0].last_update == null || (time() - rows[0].last_update) >= 17) {
						// console.log('Событие сработало')
						let newTime = time();
						query("UPDATE `cover_covers` SET `last_update` = "+newTime+" WHERE ?", {
							id: rows[0].id
						});

						setCoverGroup(rows[0].secret_key);
					} else {
						// console.log('Слишком быстрое событие')
					}

				}
			}).catch(function (err) {
				console.log('Error');
				console.log(err);
			});



			// console.log('asdasdasdasd')
			// setCoverGroup(id);

			res.send('ok');
		} else {
			// console.log(data);
			res.send('ok');
		}
	});


	
	app.post('/callback/v2/', (req, res) => {
		let data = req.body;

		if(data.type == 'group_join' || data.type == 'group_leave') {
			query("SELECT * FROM `"+config.get('db_perfix')+"covers` WHERE `group_id` = "+data.group_id+" AND `reset_type` = 'callback' AND `status` = 1 AND `freeze_status` IS NULL").then(function(rows) {
				if(rows != '') {
					rows = timeFilter(rows);

					if(rows[0].last_update == null || (time() - rows[0].last_update) >= 17) {
						let newTime = time();
						query("UPDATE `cover_covers` SET `last_update` = "+newTime+" WHERE ?", {
							id: rows[0].id
						});

						setCoverGroup(rows[0].secret_key);
					} else {
						// console.log('Слишком быстрое событие')
					}

				}
			}).catch(function (err) {
				console.log('Error');
				console.log(err);
			});

			res.send('ok');
		} else {
			res.send('ok');
		}
	});



};




function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else
		res.send('error');
}



function randomString(len, callback) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}

	return randomString;
}


function setCoverGroup(id, callback) {
	loadGroupData(id, function(data) {
		imgGeneration.createContext(data[0], function(img_url) {
			// перенесена в функцию ниже
			// if(callback) callback()

			vkCover(data[0].group_id, img_url, data[0].group_token, ()=>{
				if(callback) callback()

				// console.log('обложка установленна', data[0].group_id);
				query("UPDATE `cover_users` SET `balance` = `balance` - 1 WHERE `id` = "+ data[0].uid+"")
				.then(function (rows) {
					// проверяем баланс
					query("SELECT `id`, `vk_id`, `balance` FROM `cover_users` WHERE `id` = "+ data[0].uid+"")
					.then(function (rows) {
						checkUserBalance(rows[0]); // отдаём инфу в функ-ю обработчик
					})

				}).catch(function (err) {
					console.log('баланс Error', err);
				});
			}, function(err){
				if(callback) callback(err)
			});

		}, function(err){
			if(callback) callback(err)
		})
	});
}



function checkUserBalance(row) {
	let id = row.id,
		 vk_id = row.vk_id,
		 balance = row.balance;

	if(balance == 2880) {
		sendVkMes(vk_id, '[Системное сообщение]\nУ вас осталось 2880 обновлений обложки. Этого кол-ва хватит ещё на двое суток, для обновления одной обложки каждую минуту. \nКупить ещё обновления можно тут: https://vk.cc/6QOaBx')
	} else if(balance == 1440) {
		sendVkMes(vk_id, '[Системное сообщение]\nУ вас осталось 1440 обновлений обложки. Этого кол-ва хватит ещё на сутки, для обновления одной обложки каждую минуту. \nКупить ещё обновления можно тут: https://vk.cc/6QOaBx')
	} else if(balance == 500) {
		sendVkMes(vk_id, '[Системное сообщение]\nУ вас осталось 500 обновлений обложки.\nКупить ещё обновления можно тут: https://vk.cc/6QOaBx')
	} else if(balance <= 0) {
		sendVkMes(vk_id, '[Системное сообщение]\nВы использовали все доступные "ресурсы" для генерации "динамической обложки". Обновление ваших обложек временно приостановленно.\n\nКупить ещё обновлений можно тут: https://vk.cc/6QOaBx')
		query("UPDATE `"+config.get('db_perfix')+"covers` SET `freeze_status` = 2 WHERE ?", {
			uid: id,
		});
	} 

}

function sendVkMes(id, mes) {
	vk.setToken(config.get('vk_group_token'));
	vk.api.messages.send({
		user_id: id,
		message: mes
	});
}




function setCallbackSetting(token, group_id, secret_key) {
	vk.setToken(token);
	var successCallback = (resp) => {
		// console.log('resp1', resp)
		
		if(resp.state === 'wait') {
			setTimeout(() => {
				vk.api.groups.setCallbackServer({
					group_id: group_id,
					server_url: 'http://live-cover.ru/callback/'+secret_key
				}).then(successCallback)
				.catch(err => {
					console.log('erroro', err)
					// res.send({error: err.code});
				});
			}, 1000);
		}
	}

	vk.api.groups.setCallbackServer({
		group_id: group_id,
		server_url: 'http://live-cover.ru/callback/'+secret_key
	}).then(successCallback)
	.catch(err => {
		console.log('erroro', err)
		// res.send({error: err.code});
	});


	vk.api.groups.setCallbackServerSettings({
		group_id: group_id,
		secret_key: secret_key
	});
	vk.api.groups.setCallbackSettings({
		group_id: group_id,
		group_join: 1,
		group_leave: 1
	});
}





function loadImagInUrl(url, callback) {
	var img_buf = Buffer('');

	request.get(url)
	.on('data', function(data) {
		img_buf = Buffer.concat([img_buf,data]); 
	})
	.on('end', function() {
		callback(img_buf);
		img_buf = null;
	})
}


function parseJsonp(jsonpData) {
	let json;
	try {
		json = JSON.parse(jsonpData);
	}
	catch(e) {
		var startPos = jsonpData.indexOf('({');
		var endPos = jsonpData.indexOf('})');
		var jsonString = jsonpData.substring(startPos+1, endPos+1);
		json = JSON.parse(jsonString);
	}
	return json;
}


function getParameterByName(name, url) {
	// if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function krat(v1, v2) {
	if(v1%v2 == 0)
		return true
	
	return false;
}


function getKratValues(min){
	var answer = [];
	if(krat(min, 1)) answer.push(1);
	if(krat(min, 5)) answer.push(5);
	if(krat(min, 15)) answer.push(15);
	if(krat(min, 30)) answer.push(30);
	// if(krat(min, 60)) answer.push(60);
	answer.push(60);

	return answer;
}






function getActiveCovers(intervals, _process, min_now){
	console.log(intervals, min_now)
	query("SELECT `id`, `secret_key`, `schedule`, `group_id`, `interval_d` FROM `cover_covers` WHERE `interval_d` IN ("+intervals.join()+") AND `reset_type` = 'cron' AND `status` = 1 AND `freeze_status` IS NULL")
	.then(covers => {
		// if(intervals.indexOf(60) != -1) {
		// 	console.log('>>>>>>>>>>  test_cron  <<<<<<<<<<');
			let _60 = [];
			
			covers = timeFilter(covers);
			covers = covers.filter(function(val, i) {
				if(val.interval_d == '60') {
					let _test = val.id / 6000 * 60 | 0;
					if(_test > 60) _test -= 60;
					if(_test > 60) _test = 60;

					if(_test == min_now) _60.push(val.group_id);

					return _test == min_now;
				} else {
					return true;
				}
			})


			let _data = [];

			for(var i in covers) {
				if(_process == 2) {
					if(covers[i].id % 2 == 0) {
						_data.push(covers[i])
					}
				} else {
					if(covers[i].id % 2 != 0) {
						_data.push(covers[i])
					}
				}
			}

			// console.log(`TEST START 1 | count: ${_data.length} | all: ${covers.length}`);
			// if(_60) console.log(`обложек с обновлением раз в час: ${_60}`)
			// return false;
		// }



		// covers = timeFilter(covers);
		// let _data = [];

		// for(var i in covers) {
		// 	if(_process == 2) {
		// 		if(covers[i].id % 2 == 0) {
		// 			_data.push(covers[i])
		// 		}
		// 	} else {
		// 		if(covers[i].id % 2 != 0) {
		// 			_data.push(covers[i])
		// 		}
		// 	}
		// }

		
		// cronLoop(_data);
		// setCoverGroup(data[0].secret_key);

		
		// console.log(_data);
		console.log(`Start worker #${_process} | count: ${_data.length} | all: ${covers.length}`);
		console.log(`обложек с обновлением раз в час: ${_60.length}`)
		console.log(_60)
		console.log('===========')

		

		let todo = [];
		let count = 1;

		console.time('worker_time')
		for(let i in _data) {
			todo.push(function(cb){
				setCoverGroup(_data[i].secret_key, (err)=>{
					if(err) console.error(err)
					
					cb(null, _data[i].group_id)
				})
			})
		}
		// PARALLEL or EACH
		parallel(todo, function(err, results){
			console.log('----------------------');
			console.log('\x1b[33m%s\x1b[0m', `End worker #${_process} | count: ${results.length}`);
			console.timeEnd('worker_time');
			console.log('----------------------');
		})
		covers = null;
	})
}


function timeFilter(covers) {
	var _data = covers;
	let myDateZone = new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' });
	let myDate = new Date(myDateZone);
	var hour = myDate.getHours();
	let day = myDate.getDay() == 0 ? 6 : myDate.getDay() - 1;


	var new_data = [];
	for(let i in _data) {
		var _err = false;
		try {
			var schedule = JSON.parse(_data[i].schedule);
		} catch (error) {
			_err = true;
		}
		if(_err === false && schedule.days[day] == true) {
			if(schedule.time[hour] == true) {
				// _data.splice(i, 1);
				new_data.push(_data[i])
			}
		}
	}
	var _data = null;

	// for(let i in _data) {
	// 	var schedule = JSON.parse(_data[i].schedule);
	// 	if(schedule.days[day] != true) {
	// 		_data.splice(i, 1);
	// 	} else {
	// 		if(schedule.time[hour] == true) {
	// 			_data.splice(i, 1);
	// 		}
	// 	}
	// }


	// удаляем повторы `group_id`
	for(let i in new_data) {
		for(let j in new_data) {
			if(i != j && new_data[i].group_id == new_data[j].group_id) {
				new_data.splice(j, 1);
			}
		}
	}


	return new_data;
}

//cron()
function cronLoop(data) {
	// console.log('cronLoop');
	if(data.length == 0) {
		// console.log('все задания запущены')
	} else {
		setCoverGroup(data[0].secret_key);

		setTimeout(function() {
			data.splice(0, 1);
			cronLoop(data)
		}, 30) // было 100 потом 15
	}
}


// function cron() {
// 	let myDate = new Date();
// 	let min = myDate.getMinutes();
// 	// let min = 45;
// 	if(min == 0) min = 60

// 	var activeIntervals = getKratValues(min)
// 	getActiveCovers(activeIntervals)
// }
// //setInterval(() => cron(), 1000 * 60);


// function cronStarter() {
// 	let myDate = new Date();
// 	let sec = myDate.getSeconds();
	
// 	if(sec == 0 || sec == 1) {
// 		console.log('start cron');
// 		setInterval(() => cron(), 1000 * 60);
// 		cron()
// 	} else {
// 		setTimeout(cronStarter, 500);
// 	}
// }
// cronStarter()

process.on('message', (msg) => {
	var activeIntervals = getKratValues(msg[0])
	// var activeIntervals = [1, 5, 15, 30, 60]
	getActiveCovers(activeIntervals, msg[1], msg[0])
});




function wordwrap(str, maxWidth) {
	var newLineStr = "<br>"; done = false; res = '';
	do {
		found = false;
		// Inserts new line at first whitespace of the line
		for (i = maxWidth - 1; i >= 0; i--) {
			if (testWhite(str.charAt(i))) {
					res = res + [str.slice(0, i), newLineStr].join('');
					str = str.slice(i + 1);
					found = true;
					break;
			}
		}
		// Inserts new line at maxWidth position, the word is too long to wrap
		if (!found) {
			res += [str.slice(0, maxWidth), newLineStr].join('');
			str = str.slice(maxWidth);
		}

		if (str.length < maxWidth)
			done = true;
	} while (!done);

	res += str;

	return res;
}


function testWhite(x) {
	var white = new RegExp(/^\s$/);
	return white.test(x.charAt(0));
}



function declOfNum(number, titles) {
	cases = [2, 0, 1, 1, 1, 2];
	return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}


function rand(min, max) {
	let rand = min + Math.random() * (max + 1 - min);
	rand = Math.floor(rand);
	return rand;
}





(function() {

    Date.shortMonths = ['Янв.', 'Фев.', 'Мар.', 'Апр.', 'Май.', 'Июн.', 'Июл.', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.'];
    Date.longMonths = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    Date.shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    Date.longDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

    // defining patterns
    var replaceChars = {
        // Day
        d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
        D: function() { return Date.shortDays[this.getDay()]; },
        j: function() { return this.getDate(); },
        l: function() { return Date.longDays[this.getDay()]; },
        N: function() { return (this.getDay() == 0 ? 7 : this.getDay()); },
        S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
        w: function() { return this.getDay(); },
        z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
        // Week
        W: function() {
            var target = new Date(this.valueOf());
            var dayNr = (this.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            var firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
                target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
            }
            var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);
          
            return (retVal < 10 ? '0' + retVal : retVal);
        },
        // Month
        F: function() { return Date.longMonths[this.getMonth()]; },
        m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
        M: function() { return Date.shortMonths[this.getMonth()]; },
        n: function() { return this.getMonth() + 1; },
        t: function() {
            var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
            if (nextMonth === 12) {
                year = year++;
                nextMonth = 0;
            }
            return new Date(year, nextMonth, 0).getDate();
        },
        // Year
        L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
        o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() { return this.getFullYear(); },
        y: function() { return ('' + this.getFullYear()).substr(2); },
        // Time
        a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
        A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
        B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
        g: function() { return this.getHours() % 12 || 12; },
        G: function() { return this.getHours(); },
        h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
        H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
        i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
        s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
        u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
    '0' : '')) + m; },
        // Timezone
        e: function() { return /\((.*)\)/.exec(new Date().toString())[1]; },
        I: function() {
            var DST = null;
                for (var i = 0; i < 12; ++i) {
                        var d = new Date(this.getFullYear(), i, 1);
                        var offset = d.getTimezoneOffset();

                        if (DST === null) DST = offset;
                        else if (offset < DST) { DST = offset; break; }                     else if (offset > DST) break;
                }
                return (this.getTimezoneOffset() == DST) | 0;
            },
        O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math.abs(this.getTimezoneOffset() % 60))); },
        P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math.abs(this.getTimezoneOffset() % 60))); }, // Fixed now
        T: function() { return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); },
        Z: function() { return -this.getTimezoneOffset() * 60; },
        // Full Date/Time
        c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
        r: function() { return this.toString(); },
        U: function() { return this.getTime() / 1000; }
    };

    // Simulates PHP's date function
    Date.prototype.format = function(format) {
        var date = this;
        return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
            return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
        });
    };

}).call(this);



function telegram_alert(mes) {
	return false;

	var url = "https://api.telegram.org/bot_BOT_TOKEN_sendmessage?chat_id=_CHAT_ID_&text="+encodeURIComponent(mes);
	request.get(url)
}



















/* Библиотека для обработки текста рандомизатором http://gsgen.ru/ */
/* Поддерживаемые шаблоны и директивы */
/*
{текст 1|текст 2|текст 3} - перебор вариантов
[текст 1|текст 2|текст 3] - перестановки
[+разделитель+текст 1|текст 2|текст 3] - перестановки с разделителем
\{ \} \| \[ \] \+ \\ - экранизация спецсимволов
*/
function TextRandomizator_Node($parent) {
	$parent = (typeof $parent !== 'undefined') ? $parent : null;
	var $this = this;
	//$this.$_parent = null;
	$this.$_str = '';
	$this.$_type = 'mixing';
	$this.$_subNodes = [];
	$this.$_usedKeys_s = [];
	$this.$_usedKeys_m = [];
	$this.var_num_m = 0;
	$this.$pset_arr = [];
	$this.$_separator = '';
	$this.$_isSeparator = false;
	$this.$_parent = $parent;
	if($parent) {
		$this.$_parent.$_subNodes.push($this);
	}
// Перемешать элементы массива в случайном порядке
	function shuffle($arr) {
		function compareRandom(a, b) {
			return Math.random() - 0.5;
		}
		return $arr.sort(compareRandom);
	}
// Сортировка элементов массива по заданному массиву ключей
	function sort_arr_arr($arr, $key_arr) {
		var output = [];
		for(var $i=0; $i<$key_arr.length; $i++) {
			output.push($arr[$key_arr[$i]]);
		}
		return output;
	}
// Получение список ключей массива	
	function array_keys(myObject) {
		var output = [];
		for(var key in myObject) {
			output.push(key);
		}
		return output;
	}
// Поменять местами элементы массива
	function swap($i, $j, $arr) {
		if($i != $j) {
			var $temp = $arr[$i];
			$arr[$i] = $arr[$j];
			$arr[$j] = $temp;
		}
		return $arr;
	}
// Расстановка элементов в обратном порядке от заданной позиции
	function reverse_arr($k, $arr) {
		var $i = 0;
		var $j = $k;
		while($i < $j) {
			$arr = swap($i, $j, $arr);
			$i++;
			$j--;
		}
		return $arr;
	}
// Генерация массива с перестановками
	function gen_mset($arr, $k) {	
		if ($k == 0) {
			$this.$pset_arr.push($arr.slice());
		} else {
			for(var $i = 0; $i <= $k; $i++) {
				gen_pvar($k-1, $arr);
				if($i < $k) {
					$arr = swap($i, $k, $arr);
					$arr = reverse_arr($k - 1, $arr);
				}
			}
		}
	}
// Генерация следующей перестановки
	function next_mset($arr, $n) {
		var $j = $n - 2;
		while($j != -1 && $arr[$j] >= $arr[$j + 1]) $j--;
		if ($j == -1)
			return false; // больше перестановок нет
		var $k = $n - 1;
		while ($arr[$j] >= $arr[$k]) $k--;
		$arr = swap($j, $k, $arr);
		var $l = $j + 1, $r = $n - 1; // сортируем оставшуюся часть последовательности
		while ($l<$r)
			$arr = swap($l++, $r--, $arr);
		return $arr;
	}
	
    $this.get_text = function($rand) {
		$rand = (typeof $rand !== 'undefined') ? $rand : false;
        var $result = '';
        switch ($this.$_type) {
            case 'synonyms':
				if ($this.$_usedKeys_s.length == 0) {
                    $this.$_usedKeys_s = array_keys($this.$_subNodes);
				}
				if($rand == true) {
					var $random_key = Math.floor(Math.random() * ($this.$_usedKeys_s.length));
					var $key = $this.$_usedKeys_s[$random_key];
					$result = $this.$_subNodes[$key].get_text($rand);
					$this.$_usedKeys_s.splice($random_key, 1);				
				} else {
					var $key_s = $this.$_usedKeys_s[0];
					$result = $this.$_subNodes[$key_s].get_text($rand);
					$this.$_usedKeys_s.splice(0, 1);
				}
				break;
            case 'mixing':
				var $_subNodes_m = $this.$_subNodes;
				if($this.$_usedKeys_m.length == 0 && $this.$_subNodes.length > 1) {
					if($rand == true) {
						$this.$_subNodes = shuffle($this.$_subNodes);
					}
					$_subNodes_m = $this.$_subNodes;
					$this.$_usedKeys_m = array_keys($this.$_subNodes);
				}
				if($this.$_usedKeys_m.length > 1) {
					$this.$_usedKeys_m = next_mset($this.$_usedKeys_m, $this.$_usedKeys_m.length);
					if($this.$_usedKeys_m == false) {
						$this.$_usedKeys_m = array_keys($this.$_subNodes);
					}
					$_subNodes_m = sort_arr_arr($this.$_subNodes, $this.$_usedKeys_m);
				}
                $_subNodes_m.forEach(function($item, $i, $arr) {
                    if($result) {
                        $result += '' + $this.$_separator;
                    }
                    $result += '' + $item.get_text($rand);
                });
                break;
            case 'series':
                $this.$_subNodes.forEach(function($item, $i, $arr) {
                    $result += '' + $item.get_text($rand);
                });
                break;
            default:
                $result = $this.$_str;
		}
		//$result = $result.trim();
        $result = $result.replace(new RegExp('\\s+', 'g'), ' ');
        $result = $result.replace(' ,', ',');
        $result = $result.replace(' .', '.');
        $result = $result.replace(' !', '!');
        $result = $result.replace(' ?', '?');
        return $result;
    }

    $this.num_variant = function() {
        var $result = 1;
        switch ($this.$_type) {
            case 'synonyms':
                $result = 0;
                $this.$_subNodes.forEach(function($item, $i, $arr) {
                    $result += $item.num_variant();
                });
                break;
            case 'mixing':
                for (var $i=2, $kol=$this.$_subNodes.length; $i<=$kol; ++$i) {
                    $result *= $i;
                }
                $this.$_subNodes.forEach(function($item, $i, $arr) {
                    $result *= $item.num_variant();
                });
                break;
            case 'series':
               $this.$_subNodes.forEach(function($item, $i, $arr) {
                    $result *= $item.num_variant();
                });
                break;
        }
        return $result;
    }

    $this.concat = function($str) {
        $str = String($str);
        if ($this.$_isSeparator) {
            $this.$_separator += $str;
            return $this;
        }
        if ('string' == $this.$_type) {
            $this.$_str += $str;
            return $this;
        }
        $currentNode = new TextRandomizator_Node($this);
        $currentNode.set_type('string');
        return $currentNode.concat($str);
    }

    $this.set_type = function ($type) {
        switch (String($type)) {
            case 'string':
                $this.$_type = 'string';
                break;
            case 'synonyms':
                $this.$_type = 'synonyms';
                break;
            case 'series':
                $this.$_type = 'series';
                break;
            default:
                $this.$_type = 'mixing';
        }
    }

    $this.get = function($var) {
        $var = $var.toLowerCase();
        switch (String($var)) {
            case 'isseparator':
                return $this.$_isSeparator;
                break;
            case 'parent':
                return $this.$_parent;
                break;
            case 'type':
                return $this.$_type;
                break;
            default:
                return null;
        }
    }

    $this.set = function($var, $value) {
        $var = $var.toLowerCase();
        switch (String($var)) {
            case 'isseparator':
                $this.$_isSeparator = $value;
        }
    }
}

function TextRandomizator($text) {
	$text = (typeof $text !== 'undefined') ? $text : '';
	var $text = String($text);
	var $match = [];
	var $this = this;
	$this.$_tree = null;
	$this.$_text = $text;
	$this.$_tree = new TextRandomizator_Node();
	var regexp_str ='\\\\\\\\|\\\\\\[|\\\\\\]|\\\\\\{|\\\\\\}|\\\\\\+|\\\\\\||\\[\\+|\\+|\\{|\\}|\\[|\\]|\\||[^\\\\\\+\\{\\}\[\\]\\|]+';
	var $regexp = new RegExp(regexp_str, '');
        $currentNode = $this.$_tree;
        $currentNode = new TextRandomizator_Node($currentNode);
        $currentNode.set_type('series');
        $currentNode = $currentNode.concat('');
		//while(($match = /\\\\|\\\[|\\\]|\\\{|\\\}|\\\+|\\\||\[\+|\+|\{|\}|\[|\]|\||[^\\\+\{\}\[\]\|]+/.exec($text)) != null) {
		while(($match =  $regexp.exec($text)) != null) {
			switch ($match[0]) {
				case '\\\\':
				case '\\':
					$currentNode = $currentNode.concat('\\');
					break;
				case '\\+':
					$currentNode = $currentNode.concat('+');
					break;
				case '\\{':
					$currentNode = $currentNode.concat('{');
					break;
				case '\\}':
					$currentNode = $currentNode.concat('}');
					break;
				case '\\[':
					$currentNode = $currentNode.concat('[');
					break;
				case '\\]':
					$currentNode = $currentNode.concat(']');
					break;
				case '\\|':
					$currentNode = $currentNode.concat('|');
					break;
				case '[+':
					if('string' == $currentNode.get('type')) {
						$currentNode = new TextRandomizator_Node($currentNode.get('parent'));
					} else {
						$currentNode = new TextRandomizator_Node($currentNode);
					}
					$currentNode.set('isSeparator', true);
					break;
				case '+':
					if ($currentNode.get('isSeparator') == true) {
						$currentNode.set('isSeparator', false);
						$currentNode = new TextRandomizator_Node($currentNode);
						$currentNode.set_type('series');
						$currentNode = $currentNode.concat('');
					} else {
						$currentNode = $currentNode.concat('+');
					}
					break;
				case '{':
					if ('string' == $currentNode.get('type')) {
						$currentNode = new TextRandomizator_Node($currentNode.get('parent'));
					} else {
						$currentNode = new TextRandomizator_Node($currentNode);
					}
					$currentNode.set_type('synonyms');
					$currentNode = new TextRandomizator_Node($currentNode);
					$currentNode.set_type('series');
					$currentNode = $currentNode.concat('');
					break;
				case '}':
					var $is = $currentNode.get('parent').get('parent');
					if ($is && 'synonyms' == $is.get('type')) {
						$currentNode = $is.get('parent');
						$currentNode = $currentNode.concat('');
					} else {
						$currentNode = $currentNode.concat('}');
					}
					break;
				case '[':
					if ('string' == $currentNode.get('type')) {
						$currentNode = new TextRandomizator_Node($currentNode.get('parent'));
					} else {
						$currentNode = new TextRandomizator_Node($currentNode);
					}
					$currentNode = new TextRandomizator_Node($currentNode);
					$currentNode.set_type('series');
					$currentNode = $currentNode.concat('');
					break;
				case ']':
					var $is = $currentNode.get('parent').get('parent');
					if ($is && 'mixing' == $is.get('type') && $is.get('parent')) {
						$currentNode = $is.get('parent');
						$currentNode = $currentNode.concat('');
					} else {
						$currentNode = $currentNode.concat(']');
					}
					break;
				case '|':
					var $is = $currentNode.get('parent');
					if ($is && 'series' == $is.get('type')) {
						$currentNode = $is.get('parent');
						$currentNode = new TextRandomizator_Node($currentNode);
						$currentNode.set_type('series');
						$currentNode = $currentNode.concat('');
					} else {
						$currentNode = $currentNode.concat('|');
					}
					break;
				default:
					$currentNode = $currentNode.concat($match[0]);
			}
			$text = $text.substr($match[0].length);
		}
		
	$this.get_text = function($rand) {
		return $this.$_tree.get_text($rand);
	}

	$this.num_variant = function() {
		return $this.$_tree.num_variant();
	}
}
/* Примеры использования js библиотеки рандомизатора */
/*
var text_data = '{текст 1|текст 2|текст 3} или [текст 1|текст 2|текст 3]';	// Строка с шаблоном и директивами
var rm_text = new TextRandomizator(text_data);											// Объект рандомизатора, параметр text_data - текстовая строка с командами
console.log(rm_text.num_variant());															// Общее количество возможных вариантов
var rm_text_random = true;																		// Задаём случайный порядок выдачи результатов рандомизатора
console.log(rm_text.get_text(rm_text_random));											// Получаем очередной вариант текста
*/
