var request = require('request');
var Canvas = require('canvas'),
Image = Canvas.Image;


exports.youtube_last_video = function(context, data, _w, callback) {
	var ctx = context[1];
	if(!_w.channel_id ||
		_w.channel_id.indexOf('https') > -1 ||
		_w.channel_id.indexOf('channel') > -1 ||
		_w.channel_id.indexOf('user') > -1 ||
		!data.youtube_last_video
	) return callback([context[0], ctx]);

	
	let channelId = _w.channel_id;
	if(!data.youtube_last_video[channelId]) return callback([context[0], ctx]);
	let channel_info = data.youtube_last_video[channelId];


	let startDrawData = function(last_video){
		let img_buf = Buffer('');
		request.get({
			url: last_video.image,
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
			ctx.save();

			this.on('data', function(data) {
				img_buf = Buffer.concat([img_buf,data]); 
			})
			this.on('end', function() {
				let loadImage = new Image();
				loadImage.onload = () => {
					let imgHeight = _w.imgWidth / 16 * 9;
					let imgHeight_2 = _w.imgWidth / 4 * 3;
					let yOffset = ((loadImage.width / 4 * 3) - (loadImage.width / 16 * 9)) / 2;
					
					ctx.drawImage(loadImage, _w.posX, _w.posY, _w.imgWidth, imgHeight);

					if(_w.styleWidget == '2') {
						style_2(_w, last_video, imgHeight, ctx);
					} else if(_w.styleWidget == '3') {
						style_3(_w, last_video, imgHeight, ctx);
					} else {
						style_1(_w, last_video, imgHeight, ctx);
					}

					if(last_video.live == 'live' && _w.show_live_label && _w.show_live) drawLiveLabel(ctx, _w);

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

	startDrawData(channel_info)
}



function style_1(_w, last_video, imgHeight, ctx){
	if(_w.show_likes_bar) {
		let grad = '#2693e6';
		let liheHeigth = 4;
		if(ctx.canvas.width == 1590) liheHeigth *= 2;

		ctx.save();
		ctx.beginPath();
		ctx.rect(_w.posX, _w.posY + imgHeight, _w.imgWidth, liheHeigth);
		
		if(last_video.done < 1) {
			grad = ctx.createLinearGradient(
				_w.posX, _w.posY,
				_w.posX+_w.imgWidth, _w.posY
			);
			grad.addColorStop(0, '#2693e6');
			grad.addColorStop(last_video.done, '#2693e6');
			grad.addColorStop(last_video.done, '#ddd');
			grad.addColorStop(1, '#ddd');
		}
		ctx.fillStyle = grad;
		ctx.fill();
		ctx.restore();
	}

	// рисуем лайки
	if(_w.show_likes) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		ctx.fillText(
			formatCounterText(last_video.likes),
			_w.posX + fontSize * 1.3,
			_w.posY + _w.likes_offset + imgHeight
		);

		// иконки
		ctx.font = "400 "+ fontSize +" FontAwesome";
		ctx.textAlign = 'left';
		ctx.fillText('\uf164',
			_w.posX,
			_w.posY + _w.likes_offset + imgHeight
		);
	}

	// рисуем дизлайки
	if(_w.show_dislikes) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textBaseline = "top";
		ctx.textAlign = 'right';

		let disCount = formatCounterText(last_video.dislikes);
		let disOffsetX = 0;
		if(disCount.indexOf('.') > -1) disOffsetX = 2;

		ctx.fillText(disCount,
			_w.posX + _w.imgWidth + disOffsetX,
			_w.posY + _w.likes_offset + imgHeight
		);

		// иконки
		ctx.font = "400 "+ fontSize +" FontAwesome";
		ctx.fillText('\uf165 ',
			_w.posX + _w.imgWidth - iconOffset(disCount, fontSize),
			_w.posY + _w.likes_offset + imgHeight
		);
	}
}


function style_2(_w, last_video, imgHeight, ctx){
	// рисуем лайки
	if(_w.show_likes) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		ctx.fillText(
			formatCounterText(last_video.likes),
			_w.posX + fontSize * 1.3,
			_w.posY + _w.likes_offset + imgHeight
		);

		// иконки
		ctx.font = "400 "+ fontSize +" FontAwesome";
		ctx.textAlign = 'left';
		ctx.fillText('\uf164',
			_w.posX,
			_w.posY + _w.likes_offset + imgHeight
		);
	}

	// рисуем просмотры
	if(_w.show_view) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textBaseline = "top";
		ctx.textAlign = 'right';

		let disCount = formatCounterText(last_video.view);
		let disOffsetX = 0;
		if(disCount.indexOf('.') > -1) disOffsetX = 2;

		ctx.fillText(disCount,
			_w.posX + _w.imgWidth + disOffsetX,
			_w.posY + _w.likes_offset + imgHeight
		);

		// иконки
		ctx.font = "400 "+ fontSize +" FontAwesome";
		ctx.fillText('\uf06e ',
			_w.posX + _w.imgWidth - iconOffset(disCount, fontSize),
			_w.posY + _w.likes_offset + imgHeight
		);
	}
}


function style_3(_w, last_video, imgHeight, ctx){
	let icon_offset = 0;

	// рисуем лайки
	if(_w.show_likes) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		ctx.fillText(
			formatCounterText(last_video.likes),
			_w.posX + _w.imgWidth + _w.likes_offset + (fontSize * 1.3),
			_w.posY + _w.likes_offsetY
		);

		// иконки
		let iconSize = parseInt(fontSize);
		ctx.font = "400 "+ iconSize +" FontAwesome";
		ctx.textAlign = 'left';
		ctx.fillText('\uf164',
			_w.posX + _w.imgWidth + _w.likes_offset,
			_w.posY + _w.likes_offsetY
		);
		icon_offset++;
	}

	// рисуем ДИЗлайки
	if(_w.show_dislikes) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		ctx.fillText(
			formatCounterText(last_video.dislikes),
			_w.posX + _w.imgWidth + _w.likes_offset + (fontSize * 1.3),
			_w.posY + _w.likes_offsetY + (icon_offset * _w.likes_fontSize * 1.2)
		);

		// иконки
		let iconSize = parseInt(fontSize);
		ctx.font = "400 "+ iconSize +" FontAwesome";
		ctx.textAlign = 'left';
		ctx.fillText('\uf165 ',
			_w.posX + _w.imgWidth + _w.likes_offset,
			_w.posY + _w.likes_offsetY + (icon_offset * _w.likes_fontSize * 1.2)
		);
		icon_offset++;
	}
	
	// рисуем просмотры
	if(_w.show_view) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		ctx.fillText(
			formatCounterText(last_video.view),
			_w.posX + _w.imgWidth + _w.likes_offset + (fontSize * 1.3),
			_w.posY + _w.likes_offsetY + (icon_offset * _w.likes_fontSize * 1.2)
		);

		// иконки
		let iconSize = parseInt(fontSize);
		ctx.font = "400 "+ iconSize +" FontAwesome";
		ctx.textAlign = 'left';
		ctx.fillText('\uf06e',
			_w.posX + _w.imgWidth + _w.likes_offset,
			_w.posY + _w.likes_offsetY + (icon_offset * _w.likes_fontSize * 1.2)
		);
		icon_offset++;
	}
	
	// рисуем комментарии
	if(_w.show_comments) {
		let fontSize = _w.likes_fontSize;
		ctx.font = "400 "+ fontSize +" Arial";
		ctx.fillStyle = _w.likes_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		ctx.fillText(
			formatCounterText(last_video.comments),
			_w.posX + _w.imgWidth + _w.likes_offset + (fontSize * 1.3),
			_w.posY + _w.likes_offsetY + (icon_offset * _w.likes_fontSize * 1.2)
		);

		// иконки
		let iconSize = parseInt(fontSize);
		ctx.font = "400 "+ iconSize +" FontAwesome";
		ctx.textAlign = 'left';
		ctx.fillText('\uf075',
			_w.posX + _w.imgWidth + _w.likes_offset,
			_w.posY + _w.likes_offsetY + (icon_offset * _w.likes_fontSize * 1.2)
		);
		icon_offset++;
	}

	// рисуем заголовок видео
	if(_w.show_title) {
		let title = last_video.title;
		let new_title = [];
		
		if(_w.title_maxLength < 15) _w.title_maxLength = 15;
		if(_w.title_maxLines <= 0) _w.title_maxLines = 1;
		if(_w.title_maxLines > 5) _w.title_maxLines = 5;


		
		if(title.length > _w.title_maxLength) {
			for(var i = 0; i < _w.title_maxLines; i++) {
				if(title == '' || !title || title.length <= 0) break;
				
				var _title = title.substring(0, _w.title_maxLength);
				var j = _title.lastIndexOf(' ');

				if(j <= 0) j = title.indexOf(' ');
				if(j <= 0) j = title.length - 1;

				j++;

				new_title.push(title.substring(0, j));
				title = title.substring(j);
			}

			if(title.length > 0) {new_title[new_title.length - 1] += '...';}
		} else {
			new_title = [title];
		}

		let fontSize = _w.title_fontSize;
		let fontWeight = 400;

		if(_w.title_bold) fontWeight = 900;

		ctx.font = fontWeight +" "+ fontSize +" Arial";
		ctx.fillStyle = _w.title_color;
		ctx.textAlign = 'left';
		ctx.textBaseline = "top";

		for(let i in new_title) {
			let text = new_title[i];
			if(_w.title_caps && text != undefined) text = text.toUpperCase();

			ctx.fillText(
				text,
				_w.posX + _w.imgWidth + _w.likes_offset,
				_w.posY + _w.title_offsetY + (fontSize * 1.2 * i)
			);
		}
	}
	
}



function drawLiveLabel(ctx, _w){
	let offsetX = 4;
	let offsetY = 4;
	let labelWidth = 35;
	let labelHeight = 18;
	let labelOffsetX = 5;
	let labelOffsetY = 2;
	let fontSize = 12;


	if(ctx.canvas.width == 1590) {
		offsetX *= 2;
		offsetY *= 2;
		labelWidth *= 2;
		labelHeight *= 2;
		labelOffsetX *= 2;
		labelOffsetY *= 2;
		fontSize *= 2;
	}

	ctx.save()
	ctx.beginPath();
	ctx.rect(
		_w.posX + offsetX, _w.posY + offsetY,
		labelWidth, labelHeight
	)
	ctx.fillStyle = '#d33';
	ctx.fill();
	ctx.restore();

	ctx.font = "900 "+ fontSize +" Arial";
	ctx.fillStyle = _w.likes_color;
	ctx.textBaseline = "top";
	ctx.textAlign = 'left';

	ctx.fillText('LIVE',
		_w.posX + labelOffsetX + offsetX,
		_w.posY + labelOffsetY + offsetY
	);
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
function iconOffset(string, fontSize){
	let simholCount = string.length;
	if(string.indexOf('.') > -1) simholCount -= 0.9;
	return simholCount * (fontSize * 0.55);
}