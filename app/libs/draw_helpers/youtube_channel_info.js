var request = require('request');
var Canvas = require('canvas'),
Image = Canvas.Image;


exports.youtube_channel_info = function(context, data, _w, callback) {
	var ctx = context[1];
	if(!_w.channel_id ||
		_w.channel_id.indexOf('https') > -1 ||
		_w.channel_id.indexOf('channel') > -1 ||
		_w.channel_id.indexOf('user') > -1 ||
		!data.youtube_channel_info
	) return callback([context[0], ctx]);
	
	let channelId = _w.channel_id;
	let channel_info = data.youtube_channel_info[channelId];

	if(!channel_info) return callback([context[0], ctx]);

	let startDrawData = function(channel_info){
		let img_buf = Buffer('');
		request.get({
			url: channel_info.image,
			gzip: true,
			timeout: 10 * 1000,
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
					// ctx.drawImage(loadImage, _w.posX, _w.posY, _w.image_width, _w.image_width);
					
					ctx.save();

					if(!_w.image_radius || _w.image_radius >= 50) {
						ctx.arc(_w.posX + (_w.image_width / 2), _w.posY + (_w.image_width / 2), (_w.image_width / 2), 0, Math.PI * 2, true);
						ctx.clip();
						ctx.beginPath();
					} else {
						let x = _w.posX,
								y = _w.posY,
								radius = _w.image_width * (_w.image_radius / 100),
								width = height = _w.image_width;
			
						if(_w.image_radius == 0) {
							ctx.rect(x,y,width,height);
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
						}
						
						ctx.clip();
						ctx.beginPath();
					}

					ctx.drawImage(loadImage, _w.posX, _w.posY, _w.image_width, _w.image_width);
					// ctx.drawImage(avatar, _w.posX-(_w.image_width / 2), _w.posY-(_w.image_width / 2), _w.image_width, _w.image_width); // img x y r
					ctx.restore();


					drawAllText(_w, channel_info, ctx);

					loadImage = null;
					img_buf = null;
					callback([context[0], ctx])
				}
				loadImage.src = img_buf; //
			})
		})
		.on('error', function(err) {
			console.error('image_to_link', _w.url)
			return callback([context[0], ctx])
		})
	};


	startDrawData(channel_info);
}



function drawAllText(_w, channel_info, ctx){
	let text_offset = 0;

	if(!_w.text_align || (_w.text_align != 'left' && _w.text_align != 'center' && _w.text_align != 'right')) _w.text_align = 'left';

	if(_w.title_show) {
		let text = channel_info.title;
		let fontSize = _w.title_fontSize;
		let fontWeight = 400;

		if(_w.title_bold) fontWeight = 900;
		if(_w.title_caps && text != undefined) text = text.toUpperCase();

		ctx.font = fontWeight +" "+ fontSize +" Arial";
		ctx.fillStyle = _w.title_color;
		ctx.textAlign = _w.text_align;
		ctx.textBaseline = "top";

		if(_w.text_align == 'left') {
			ctx.fillText(
				text,
				_w.posX + _w.image_width + _w.text_offsetX,
				_w.posY + _w.text_offsetY
			);
		} else if(_w.text_align == 'right') {
			ctx.fillText(
				text,
				_w.posX - _w.text_offsetX,
				_w.posY + _w.text_offsetY
			);
		} else if(_w.text_align == 'center') {
			ctx.fillText(
				text,
				_w.posX + _w.text_offsetX + (_w.image_width / 2),
				_w.posY + _w.text_offsetY + _w.image_width
			);
		}
		

		text_offset += (_w.title_fontSize * 1.2) + _w.title_paddingY;
	}

	/*

		if(_w.text_align == 'left') {
		
		} else if(_w.text_align == 'right') {
			
		} else if(_w.text_align == 'center') {
			
		}
	*/


	let fontSize = _w.text_fontSize;
	let fontWeight = 400;
	let iconOffsetX = 0;
	
	if(_w.text_bold) fontWeight = 900;
	if(_w.show_icons) iconOffsetX = _w.text_fontSize * 1.4;

	ctx.font = fontWeight +" "+ fontSize +" Arial";
	ctx.fillStyle = _w.text_color;
	ctx.textAlign = _w.text_align;
	ctx.textBaseline = "top";

	if(_w.subs_show) { // рисуем подписчиков
		let text = formatCounterText(channel_info.subs);
		if(_w.show_icons == false) text = 'Подписчики: ' + text;

		if(_w.text_align == 'left') {
			ctx.fillText(
				text,
				_w.posX + _w.image_width + _w.text_offsetX + iconOffsetX,
				_w.posY + _w.text_offsetY + text_offset
			);
		} else if(_w.text_align == 'right') {
			ctx.fillText(
				text,
				_w.posX - _w.text_offsetX,
				_w.posY + _w.text_offsetY + text_offset
			);
		} else if(_w.text_align == 'center') {

			ctx.fillText(
				text,
				_w.posX + _w.text_offsetX + (_w.image_width / 2) + (iconOffsetX / 2),
				_w.posY + _w.text_offsetY + _w.image_width + text_offset
			);
			
		}

		
		text_offset += _w.text_fontSize * 1.2;
	}

	if(_w.view_show) { // рисуем просмотры
		let text = formatCounterText(channel_info.view);
		if(_w.show_icons == false) text = 'Просмотры: ' + text;
		
		if(_w.text_align == 'left') {
			ctx.fillText(
				text,
				_w.posX + _w.image_width + _w.text_offsetX + iconOffsetX,
				_w.posY + _w.text_offsetY + text_offset
			);
		} else if(_w.text_align == 'right') {
			ctx.fillText(
				text,
				_w.posX - _w.text_offsetX,
				_w.posY + _w.text_offsetY + text_offset
			);
		} else if(_w.text_align == 'center') {

			ctx.fillText(
				text,
				_w.posX + _w.text_offsetX + (_w.image_width / 2) + (iconOffsetX / 2),
				_w.posY + _w.text_offsetY + _w.image_width + text_offset
			);
			
		}
		text_offset += _w.text_fontSize * 1.2;
	}

	if(_w.videos_show) { // рисуем кол-во видосов
		let text = formatCounterText(channel_info.videos);
		if(_w.show_icons == false) text = 'Видео: ' + text;
		
		if(_w.text_align == 'left') {
			ctx.fillText(
				text,
				_w.posX + _w.image_width + _w.text_offsetX + iconOffsetX,
				_w.posY + _w.text_offsetY + text_offset
			);
		} else if(_w.text_align == 'right') {
			ctx.fillText(
				text,
				_w.posX - _w.text_offsetX,
				_w.posY + _w.text_offsetY + text_offset
			);
		} else if(_w.text_align == 'center') {

			ctx.fillText(
				text,
				_w.posX + _w.text_offsetX + (_w.image_width / 2) + (iconOffsetX / 2),
				_w.posY + _w.text_offsetY + _w.image_width + text_offset
			);
			
		}
	}

	// рисуем иконки
	if(_w.show_icons) {
		if(_w.title_show) text_offset = (_w.title_fontSize * 1.2) + _w.title_paddingY;
		else text_offset = 0;

		ctx.font = "400 "+ fontSize +" FontAwesome";
		ctx.textAlign = 'left';

		if(_w.subs_show) { // подписчики
			if(_w.text_align == 'left') {
				ctx.fillText(
					'\uf0c0',
					_w.posX + _w.image_width + _w.text_offsetX,
					_w.posY + _w.text_offsetY + text_offset
				);
			} else if(_w.text_align == 'right') {
				let icon_offset = iconOffset(formatCounterText(channel_info.subs), fontSize);
				ctx.fillText(
					'\uf0c0',
					_w.posX - _w.text_offsetX - icon_offset - iconOffsetX,
					_w.posY + _w.text_offsetY + text_offset
				);
			} else if(_w.text_align == 'center') {
				let icon_offset = iconOffset(formatCounterText(channel_info.subs), fontSize) / 2;
				ctx.fillText(
					'\uf0c0',
					_w.posX + _w.text_offsetX + (_w.image_width / 2) - icon_offset - (iconOffsetX / 2),
					_w.posY + _w.text_offsetY + _w.image_width + text_offset
				);
				
			}

			text_offset += _w.text_fontSize * 1.2;
		}
		
		if(_w.view_show) { // просмотры

			if(_w.text_align == 'left') {
				ctx.fillText(
					'\uf06e',
					_w.posX + _w.image_width + _w.text_offsetX,
					_w.posY + _w.text_offsetY + text_offset
				);
			} else if(_w.text_align == 'right') {
				let icon_offset = iconOffset(formatCounterText(channel_info.view), fontSize);
				ctx.fillText(
					'\uf06e',
					_w.posX - _w.text_offsetX - icon_offset - iconOffsetX,
					_w.posY + _w.text_offsetY + text_offset
				);
			} else if(_w.text_align == 'center') {
				let icon_offset = iconOffset(formatCounterText(channel_info.view), fontSize) / 2;
				ctx.fillText(
					'\uf06e',
					_w.posX + _w.text_offsetX + (_w.image_width / 2) - icon_offset - (iconOffsetX / 2),
					_w.posY + _w.text_offsetY + _w.image_width + text_offset
				);
				
			}

			text_offset += _w.text_fontSize * 1.2;
		}

		if(_w.videos_show) { // кол-во видосов
			
			if(_w.text_align == 'left') {
				ctx.fillText(
					'\uf008',
					_w.posX + _w.image_width + _w.text_offsetX,
					_w.posY + _w.text_offsetY + text_offset
				);
			} else if(_w.text_align == 'right') {
				let icon_offset = iconOffset(formatCounterText(channel_info.videos), fontSize);
				ctx.fillText(
					'\uf008',
					_w.posX - _w.text_offsetX - icon_offset - iconOffsetX,
					_w.posY + _w.text_offsetY + text_offset
				);
			} else if(_w.text_align == 'center') {
				let icon_offset = iconOffset(formatCounterText(channel_info.videos), fontSize) / 2;
				ctx.fillText(
					'\uf008',
					_w.posX + _w.text_offsetX + (_w.image_width / 2) - icon_offset - (iconOffsetX / 2),
					_w.posY + _w.text_offsetY + _w.image_width + text_offset
				);
				
			}
		}	
	}
	
}



function drawLiveLabel(ctx, _w){
	let offsetX = 4;
	let offsetY = 4;

	ctx.save()
	ctx.beginPath();
	ctx.rect(
		_w.posX + offsetX, _w.posY + offsetY,
		35, 18
	)
	ctx.fillStyle = '#d33';
	ctx.fill();
	ctx.restore();

	let fontSize = 12;
	ctx.font = "900 "+ fontSize +" Arial";
	ctx.fillStyle = _w.likes_color;
	ctx.textBaseline = "top";
	ctx.textAlign = 'left';

	ctx.fillText('LIVE',
		_w.posX + 5 + offsetX,
		_w.posY + 2 + offsetY
	);
}


function iconOffset(string, fontSize){
	let simholCount = string.length;
	if(string.indexOf('.') > -1) simholCount -= 0.9;
	return simholCount * (fontSize * 0.55);
}
function formatCounterText(val) {
	if(parseInt(val) >= 1000000000) {
		val = parseInt(val) / 1000000000;
		val = val.toFixed(1).toString();
		if(val.indexOf('.0') > -1) val = val.replace('.0', '');
		val += ' млрд';
	} else if(parseInt(val) >= 1000000) {
		// val = val.replace(/[0-9]{6}$/, ' млн');
		val = parseInt(val) / 1000000;
		val = val.toFixed(1).toString();
		if(val.indexOf('.0') > -1) val = val.replace('.0', '');
		val += ' млн';
	} else if(parseInt(val) >= 1000) {
		val = val.replace(/[0-9]{3}$/, ' тыс.');
	}
	return val.toString();
}
function getParameterByName(name, url) {
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		 results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}