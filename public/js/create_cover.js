var cover_file = null;
var cover_widgets = [
	{
		name: "last_sub",
		user_pos: "0",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	}
];
var cover_opt = {
	interval: '1',
	schedule: {
		days: [true, true, true, true, true, true, true],
		time: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
	},
	group_id: '',
	status: true,
	group_token: '',
	resetType: 'cron'
};

var w_tmp = {
	image_to_link: {
		name: "image_to_link",
		posX: 50,
		posY: 150,
		width: 60,
		url: ''
	},
	text: {
		name: "text",
		posX: 50,
		posY: 150,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		text: [{val: 'Тестовый текст'}, {val: 'вторая строка текста'}],
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	random_text: {
		name: "random_text",
		posX: 150,
		posY: 150,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		text: '{Приветствуем новичков|Новые подписчики|Наши новички}',
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	text_link: {
		name: "text_link",
		posX: 50,
		posY: 150,
		pageUrl: '',
		textBefore: '',
		textAfter: '',
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	members_count: {
		name: "members_count",
		posX: 50,
		posY: 150,
		textBefore: '',
		textAfter: '',
		delimiter: '1',
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	rates: {
		name: "rates",
		posX: 50,
		posY: 150,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000',
		firstCurrency: 'USD',
		secondCurrency: 'RUB',
		perfix: 'text_code'
	},
	// online: {
	// 	name: "online",
	// 	posX: 50,
	// 	posY: 150,
	// 	color: '#fff',
	// 	font_size: 14,
	// 	font_family: 'Arial',
	// 	text: {before: 'Online в группе:', after: ''},
	// 	delimiter: '1',
	// 	textAlign: 'left',
	// 	font_bold: false,
	// 	caps: false,
	// 	border: 0,
	// 	borderColor: '#000'
	// },
	time: {
		name: "time",
		posX: 50,
		posY: 150,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		timezone: 'Europe/Moscow',
		dateFormat: 'l, d F Y H:i',
		text: '',
		textEnd: '',
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	last_sub: {
		name: "last_sub",
		user_pos: "0",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	show_user_to_link: {
		name: "show_user_to_link",
		link: "durov",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	weather: {
		name: "weather",
		posX: 50,
		posY: 50,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		font_weight: "200",
		city: 'Moscow',
		before_text: 'Погода в Москве: ',
		textAlign: 'left',
		only_temp: true,
		show_c: true,
		border: 0,
		borderColor: '#000'
	},
	weather_icon: {
		name: "weather_icon",
		posX: 78,
		posY: 20,
		color: '#fff',
		font_size: 26,
		font_family: 'Arial',
		font_weight: "200",
		city: 'Moscow',
		show_c: true,
		iconShow: true,
		iconPosX: -35,
		iconPosY: 17,
		iconSize: 50,
		iconPack: '1',
		textShow: true,
		textPosX: 0,
		textPosY: 25,
		textSize: 13,
		border: 0,
		borderColor: '#000'
	},
	best_comment: {
		name: "best_comment",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		iconShow: true,
		iconPosX: -14,
		iconPosY: 30,
		iconColor: '#fff',
		iconSize: 14,
		countShow: true,
		countPosX: 5,
		countPosY: 30,
		countColor: '#fff',
		countSize: 14,
		user_pos: "0",
		border: 0,
		borderColor: '#000'
	},
	best_like: {
		name: "best_like",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		iconShow: true,
		iconPosX: -14,
		iconPosY: 30,
		iconColor: '#fff',
		iconSize: 14,
		countShow: true,
		countPosX: 5,
		countPosY: 30,
		countColor: '#fff',
		countSize: 14,
		user_pos: "0",
		border: 0,
		borderColor: '#000'
	},
	best_share: {
		name: "best_share",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		iconShow: true,
		iconPosX: -14,
		iconPosY: 30,
		iconColor: '#fff',
		iconSize: 14,
		countShow: true,
		countPosX: 5,
		countPosY: 30,
		countColor: '#fff',
		countSize: 14,
		user_pos: "0",
		border: 0,
		borderColor: '#000'
	},
	timer: {
		name: "timer",
		posX: 350,
		posY: 100,
		// format: 'dhm',
		style: '1',
		paddingX: 55,
		paddingY: -4,
		timezone: 'Europe/Moscow',
		toDate: '01.01.2019 00:00',
		textSize: 10,
		color: '#fff',
		font_size: 34,
		font_family: 'Arial',
		font_bold: true,
		caps: false,
		border: 0,
		borderColor: '#000',
		hideZero: false
	},
	birthday: {
		name: "birthday",
		user_pos: "0",
		posX: 400,
		posY: 100,
		avatarW: 50,
		avatarBorderRadius: 50,
		avatarBorder: 0,
		avatarBorderColor: '#fff',
		nameFormat: "1",
		namePos: "right",
		textPosX: 32,
		textPosY: -16,
		color: "#fff",
		font_size: 14,
		font_family: "Arial",
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	probki: {
		name: "probki",
		posX: 78,
		posY: 20,
		color: '#fff',
		font_size: 16,
		font_family: 'Arial',
		font_weight: "200",
		city: 'Москва',
		cityId: 213,
		show_bale_text: true,
		iconShow: true,
		iconPosX: -22,
		iconPosY: 16,
		iconSize: 32,
		iconPack: '1',
		textShow: true,
		textPosX: 0,
		textPosY: 17,
		textSize: 12,
		border: 0,
		borderColor: '#000'
	},
	rss: {
		name: "rss",
		posX: 65,
		posY: 65,
		rssAdress: '',
		count: '4',
		symbolLimit: 65,
		padding: 10,
		showTime: false,
		keys: '',
		stopWords: '',
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		textAlign: 'left',
		font_bold: false,
		caps: false,
		border: 0,
		borderColor: '#000'
	},
	youtube_last_video: {
		name: "youtube_last_video",
		posX: 65,
		posY: 65,
		imgWidth: 180,
		channel_id: '',
		styleWidget: '1',

		show_live: false,
		show_live_label: false,

		show_title: true,
		show_likes: true,
		show_dislikes: true,
		show_likes_bar: true,
		show_comments: false,
		show_view: true,

		likes_offset: 6,
		likes_offsetY: 58,
		likes_fontSize: 12,
		likes_color: '#fff',

		title_fontSize: 13,
		title_offsetY: -2,
		title_maxLines: 3,
		title_maxLength: 30,
		title_color: '#fff',
		title_bold: false,
		title_caps: false
	},
	youtube_video_to_link: {
		name: "youtube_video_to_link",
		posX: 65,
		posY: 65,
		imgWidth: 180,
		video_url: '',
		styleWidget: '1',

		show_title: true,
		show_likes: true,
		show_dislikes: true,
		show_likes_bar: true,
		show_comments: false,
		show_view: true,

		likes_offset: 6,
		likes_offsetY: 58,
		likes_fontSize: 12,
		likes_color: '#fff',

		title_fontSize: 13,
		title_offsetY: -2,
		title_maxLines: 3,
		title_maxLength: 30,
		title_color: '#fff',
		title_bold: false,
		title_caps: false
	},
	youtube_channel_info: {
		name: "youtube_channel_info",
		posX: 65,
		posY: 65,
		channel_id: '',

		title_show: true,
		subs_show: true,
		view_show: true,
		videos_show: true,
		show_icons: true,
		text_align: 'left',

		image_width: 72,
		image_radius: '0',
		text_offsetX: 10,
		text_offsetY: 5,
		title_paddingY: 5,

		title_fontSize: 13,
		title_color: '#fff',
		title_bold: true,
		title_caps: false,
		
		text_fontSize: 11,
		text_color: '#fff',
		text_bold: false
	},
	donationalerts_donation_goal: {
		name: "donationalerts_donation_goal",
		posX: 65,
		posY: 65,
		dataLink: '',

		showGoalBorder: true,
		showProgressText: true,
		showToDate: true,
		titleShow: 'import',
		myTitle: '',

		barWidth: 250,
		barHeight: 28,
		barBg: '#CCCCCC',
		barProgressColor: '#FB8C2B',
		barRadius: 0,
	
		textColor: '#fff',
		textSize: 13,
		textFont: 'Arial',
		textBorder: 0,
		textBorderColor: '#000',
		textBold: true,
	
		progressColor: '#202020',
		progressSize: 13,
		progressFont: 'Arial',
		progressBorder: 0,
		progressBorderColor: '#000',
		progressBold: true
	},
	donationalerts_instream_stats: {
		name: 'donationalerts_instream_stats',
		posX: 457,
		posY: 65,
		dataLink: '',
		viewType: 'list',

		listCount: 4,
		listTextTemplate: '{username} - {amount} {currency}',
		listPadding: 5,

		sliderShowSecondText: false,
		sliderSecondTextBr: 50,
		sliderSecondTextMax: 240,
		textPadding: 5,
		sliderTextTemplate: '{username} - {amount} {currency}',

		textAlign: 'center',
		textColor: '#FB8C2B',
		textSize: 13,
		textFont: 'Arial',
		textBorder: 2,
		textBorderColor: '#000',
		textBold: true,

		textSecondColor: '#FFE4CC',
		textSecondSize: 11,
		textSecondFont: 'Arial',
		textSecondBorder: 0,
		textSecondBorderColor: '#000',
		textSecondBold: false
	}
};




$(document).ready(function () {
	$('#load_image').change(function(event) {
		event.preventDefault();
		// event.stopPropagation();
		// $(this).removeClass('hover');

		f = event.target.files[0];
		// console.log(f);
		var types = ["image/jpeg", "image/gif", "image/png"];

		if(types.indexOf(f.type) >= 0) {
			if(f.type=='image/jpeg') {var format = 'jpg';}
			else if(f.type=='image/gif') {var format = 'gif';}
			else if(f.type=='image/png') {var format = 'png';}

			$('.loading_img').show();


			var reader = new FileReader();
			reader.onload = function(event) {
				var result = event.target.result;

				var imgTest = new Image();
				imgTest.src = result;
				imgTest.onload = function(){
					$('.loading_img').hide();

					if(imgTest.width > 1600 || imgTest.height > 420) {
						return alert('Разрешение изображения слишком большое!\n\nРекомендуемые разрешения: 795x200 или 1590x400 (разрешение для Retina)')
					}

					if(f.size > 3145728) {
						return alert('Размер файла превышает допустимые 3Мб! Пожалуйста оптимизируйте изображение, т.к. его "вес" напрямую влияет на скорость генерации вашей обложки.')
					}

					
					cover_file = f;
					$('.cover_panel').css('background-image', 'url('+result+')');
					$('#load_bg').modal('hide');
				}
			};
		
			reader.onerror = function(event) {
				$('.loading_img').hide();
				alert('Ошибка загрузки! Возможно вы используете устаревший браузер!');
			};
			reader.readAsDataURL(f);
		} else {
			alert('Неподходящий формат! Доступны: gif, png, jpg');
		}
	});

	var dropZone = $('.drop_cover');
	dropZone[0].ondragover = function(event) {
		event.preventDefault();
		// event.stopPropagation();
		$(this).addClass('hover');
	};

	dropZone[0].ondragleave = function(event) {
		event.preventDefault();
		// event.stopPropagation();
		$(this).removeClass('hover');
	};

	dropZone[0].ondrop = function(event) {
		event.preventDefault();
		// event.stopPropagation();
		$(this).removeClass('hover');

		f = event.dataTransfer.files[0];
		var types = ["image/jpeg", "image/gif", "image/png"];

		if(types.indexOf(f.type) >= 0) {
			if(f.type=='image/jpeg') {var format = 'jpg';}
			else if(f.type=='image/gif') {var format = 'gif';}
			else if(f.type=='image/png') {var format = 'png';}

			$('.loading_img').show();


			var reader = new FileReader();
			reader.onload = function(event) {
				var result = event.target.result;

				var imgTest = new Image();
				imgTest.src = result;
				imgTest.onload = function(){
					$('.loading_img').hide();

					if(imgTest.width > 1600 || imgTest.height > 420) {
						return alert('Разрешение изображения слишком большое!\n\nРекомендуемые разрешения: 795x200 или 1590x400')
					}

					if(f.size > 3145728) {
						return alert('Размер файла превышает допустимые 3Мб! Пожалуйста оптимизируйте изображение, т.к. его "вес" напрямую влияет на скорость генерации вашей обложки.')
					}

					
					cover_file = f;
					$('.cover_panel').css('background-image', 'url('+result+')');
					$('#load_bg').modal('hide');
				}
			};
		
			reader.onerror = function(event) {
				$('.loading_img').hide();
				alert('Ошибка загрузки! Возможно вы используете устаревший браузер!');
			};
			reader.readAsDataURL(f);
		} else {
			alert('Неподходящий формат! Доступны: gif, png, jpg');
		}
	};

});


function main_controler($scope, $http, $timeout, $interval, $window, $sce) {
	$scope.widgets = cover_widgets;
	$scope.cover_opt = cover_opt;
	$scope.cover_panel = {};
	$scope.showOpt = 0;

	$scope.setActiveWidget = function(i){
		$scope.showOpt = i;
	}



	$scope.userGroups = {};
	$scope.load_user_groups = function() {
		var data = $window.userGroupsData;
		$scope.userGroups = angular.fromJson(data);
	}


	$scope.get_channel_id = function(w) {
		var link = prompt('Вставьте ссылку на канал:', '');
		if(link) {
			w.channel_id = '';
			$scope.show_loader = true;

			$http.post('/youtube_channel_id', {
				link: link
			}).success(function(answer) {
				if(!answer || answer == 'nope!') return alert('Произошла ошибка, Пожалуйста повторите попытку позже!');

				w.channel_id = answer;

				delete $scope.show_loader;
			}).error(function(){
				alert('Произошла ошибка, Пожалуйста повторите попытку позже!')
			});
		}
	}


	// функция для позиционирования текста
	// в виджете "youtube_channel_info"
	$scope.youtube_channel_info_pos = function(w){
		var styles = {
			'font-size': w.text_fontSize,
			'color': w.text_color,
			'text-align': w.text_align
		};

		if(!w.text_align || w.text_align == 'left') {

			styles['top'] = w.text_offsetY;
			styles['left'] = w.image_width + w.text_offsetX;

		} else if(w.text_align == 'right') {

			styles['top'] = w.text_offsetY;
			styles['left'] = (w.text_offsetX) * -1;
			styles['transform'] = 'translate(-100%, 0px)';

		} else if(w.text_align == 'center') {
			
			styles['top'] = w.text_offsetY + (w.image_width);
			styles['left'] = w.text_offsetX + w.image_width / 2;
			styles['transform'] = 'translate(-50%, 0px)';
			// styles['text-align'] = 'left';

		}

		return styles;
	}



	$scope.textLimit = function(text, limit) {
		if(text.length > limit)
			return text.slice(0, limit)+'...';
		else
			return text;
	}


	$scope.formatYoutubeTitle = function(w) {
		// var title = 'Очень-очень длинное длинноедлинноедлинноедлинное длинноедлинноедлинное'
		var title = 'Очень-очень длинное название видео, а длинное оно для того чтобы можно было настроить перенос текста'
		var new_title = [];

		if(w.title_maxLength < 15) w.title_maxLength = 15;
		if(w.title_maxLines <= 0) w.title_maxLines = 1;
		if(w.title_maxLines > 5) w.title_maxLines = 5;


		
		if(title.length > w.title_maxLength) {
			for(var i = 0; i < w.title_maxLines; i++) {
				if(title == '' || !title || title.length <= 0) break;
				
				var _title = title.substring(0, w.title_maxLength);
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

		return $sce.trustAsHtml(new_title.join('<br>'));
	}



	// $scope.edit_group = function(){
		
	// }


	$scope.week_days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
	$scope.range = function(min, max, step) {
		step = step || 1;
		var input = [];
		for (var i = min; i <= max; i += step) {
			input.push(i);
		}
		return input;
	};
	$scope.show_time = function(val) {
		var secondVal = val + 1;
		if(secondVal <= 9) {
			secondVal = '0'+secondVal;
		} else if(secondVal == 24) {
			secondVal = '00';
		} else {
			secondVal = ''+secondVal;
		}

		if(val <= 9) {
			val = '0'+val;
		} else {
			val = ''+val;
		}

		return val + ' - ' + secondVal;
	}


	$scope.timeZones = {
		"Asia/Irkutsk": "",
		"Asia/Yakutsk": "",
		"Asia/Vladivostok": "",
		"America/New_York": "",
		"Europe/Kaliningrad": "",
		"Europe/Kiev": "",
		"Europe/Moscow": "",
		"Europe/Samara": "",
		"Asia/Yekaterinburg": "",
		"Asia/Omsk": "",
		"Asia/Novosibirsk": "",
		"Asia/Krasnoyarsk": ""
	};
	function setAllTime(){
		try {

			var old_val = $scope.timeZones['Europe/Moscow'];
			for(var i in $scope.timeZones) {
				var myDateZone = new Date().toLocaleString('en-US', { timeZone: i });
				var myDate = new Date(myDateZone);
				var hour = myDate.getHours() > 9 ? myDate.getHours() : '0'+myDate.getHours();
				var minutes = myDate.getMinutes() > 9 ? myDate.getMinutes() : '0'+myDate.getMinutes();
				$scope.timeZones[i] = hour+':'+minutes;
			}

		} catch (error) {

			var old_val = $scope.timeZones['Europe/Moscow'];
			for(var i in $scope.timeZones) {
				var myDate = new Date();
				var hour = myDate.getHours() > 9 ? myDate.getHours() : '0'+myDate.getHours();
				var minutes = myDate.getMinutes() > 9 ? myDate.getMinutes() : '0'+myDate.getMinutes();
				$scope.timeZones[i] = hour+':'+minutes;
			}

		}
				
		// var old_val = $scope.timeZones['Europe/Moscow'];
		// for(var i in $scope.timeZones) {
		// 	var myDateZone = new Date().toLocaleString('en-US', { timeZone: i });
		// 	var myDate = new Date(myDateZone);
		// 	var hour = myDate.getHours() > 9 ? myDate.getHours() : '0'+myDate.getHours();
		// 	var minutes = myDate.getMinutes() > 9 ? myDate.getMinutes() : '0'+myDate.getMinutes();
		// 	$scope.timeZones[i] = hour+':'+minutes;
		// }
	}
	$interval(setAllTime, 5*1000);
	setAllTime()


	$scope.showFormatedTime = function(_timezone, _format) {
		if(_format == '' || _format === undefined) {
			_format = 'H:i';
		}
		var myDateZone = new Date().toLocaleString('en-US', { timeZone: _timezone });
		var myDate = new Date(myDateZone);
		return myDate.format(_format);
	}




	$scope.checkToken = function(callback) {
		$scope.checkTokenProgress = 'load';
		$http.post('/api/check_token', {
			group_token: $scope.cover_opt.group_token,
			gid: $scope.cover_opt.group_id
		}).success(function(param) {
			$scope.checkTokenProgress = false;

			if(param.code) {
				if(callback) {
					callback();
				} else {
					$scope.checkTokenProgress = 'good';

					$timeout(function(){
						$('#set_token').modal('hide');
						$scope.checkTokenProgress = false;
					}, 2000);
				}
			} else {
				if(param.error == 5) {
					$('#load_progress').modal('hide');
					alert('Указаный ключ не подходит!')
				} else if(param.error == 15) {
					$('#load_progress').modal('hide');
					alert('У ключа недостаточно прав.\nТребуются следующие права: управление сообществом, фотографии')
				} else {
					$('#load_progress').modal('hide');
					alert('Неизвестная ошибка с кодом "'+param.error+'" на стадии "установки ключа".\nПовторите попытку немного позже или обратитесь к администрации.')
				}
			}
		}).error(function(param){console.log(param)});
	}


	
	$scope.show_all_standart_images = function(w) {
		$('#all_standart_images').modal('show');
		$scope.wEdit = w;
	};
	$scope.editImageUrl = function(url) {
		$scope.wEdit.url = 'http://live-cover.ru'+url;
		$('#all_standart_images').modal('hide');
	}



	$scope.ya_regions = $window.ya_regions;
	$scope.searchCity = function(w) {
		$('#search_city').modal('show');
		$scope.w_city_edit = w;
	};
	$scope.setTrafficCity = function(val, w) {
		$('#search_city').modal('hide');
		$scope.city_filter = null;

		w.city = val.city;
		w.cityId = val.id;
	};
	$scope.checkTrafficData = function(cityId) {
		$http.post('/api/check_traffic/', {
			region: cityId
		}).success(function(param) {
			if(param == 'ok')
				alert('Данные о пробках для данного города найдены!')
			else
				alert('Данные о пробках для данного города НЕ найдены!\nДанный виджет не будет выводится на обложку.')
		}).error(function(param){console.error(param)});
	};





	$scope.loadBg = function() {
		$('#load_bg').modal('show');
	}


	$scope.donationalerts_instream_stats_lorem = function(w){
		var text = 'Сегодня я расскажу вам об интересном и довольно действенном способе повышения активности в группе. Более того, данный способ не потребует от вас никаких действий, кроме первоначальной настройки всего необходимого, что занимает не более получаса, при условии обладания навыками работы в фотошопе или наличия дизайнера под рукой.';
		if(w.sliderSecondTextMax > 0) {
			if(text.length > w.sliderSecondTextMax)
				text = text.slice(0, w.sliderSecondTextMax)+'...';
		}
		text = wordwrap(text, w.sliderSecondTextBr);

		return $sce.trustAsHtml(text);
	}


	$scope.donationalerts_instream_stats_styles_2 = function(w){
		var opt = {
			'font-size': w.textSecondSize,
			'font-family': '\''+w.textSecondFont+'\'',
			'font-weight': 'normal',
			'color': w.textSecondColor,
			'text-align': 'center',
			'margin-top': w.textPadding
		};

		if(w.textSecondBorder && w.textSecondBorder > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.textSecondBorderColor+', 0 -2px 0 '+w.textSecondBorderColor+', 2px 0 0 '+w.textSecondBorderColor+', -2px 0 0 '+w.textSecondBorderColor;
		}
		if(w.textSecondBold) {
			opt['font-weight'] = 'bold';
		}

		if(w.textAlign == 'left') {
			opt['text-align'] = 'left';

		} else if(w.textAlign == 'right') {
			opt['text-align'] = 'right';
			opt['transform'] = 'translate(-100%, 0px)';

		} else if(w.textAlign == 'center') {
			opt['text-align'] = 'center';
			opt['transform'] = 'translate(-50%, 0px)';
		}


		return opt;
	}


	$scope.donationalerts_instream_stats_styles = function(w){
		var opt = {
			'font-size': w.textSize,
			'font-family': '\''+w.textFont+'\'',
			'font-weight': 'normal',
			'color': w.textColor,
			'text-align': 'center'
		};

		if(w.textBorder && w.textBorder > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.textBorderColor+', 0 -2px 0 '+w.textBorderColor+', 2px 0 0 '+w.textBorderColor+', -2px 0 0 '+w.textBorderColor;
		}
		if(w.textBold) {
			opt['font-weight'] = 'bold';
		}

		if(w.textAlign == 'left') {
			opt['text-align'] = 'left';

		} else if(w.textAlign == 'right') {
			opt['text-align'] = 'right';
			opt['transform'] = 'translate(-100%, 0px)';

		} else if(w.textAlign == 'center') {
			opt['text-align'] = 'center';
			opt['transform'] = 'translate(-50%, 0px)';
		}


		return opt;
	}



	$scope.progressBarText1 = function(w, opt, small){
		opt['font-size'] = w.textSize;
		opt['font-family'] = '\''+w.textFont+'\'';
		opt['font-weight'] = 'normal';
		opt['color'] = w.textColor;


		if(w.textBold) {opt['font-weight'] = 'bold';}
		if(w.textBorder && w.textBorder > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.textBorderColor+', 0 -2px 0 '+w.textBorderColor+', 2px 0 0 '+w.textBorderColor+', -2px 0 0 '+w.textBorderColor;
		}

		if(small === true) {
			opt['font-size'] = w.textSize * 0.8;
		}


		return opt;
	}


	$scope.progressBarText2 = function(w, opt){
		opt['font-size'] = w.progressSize;
		opt['font-family'] = '\''+w.progressFont+'\'';
		opt['font-weight'] = 'normal';
		opt['color'] = w.progressColor;


		if(w.progressBold) {opt['font-weight'] = 'bold';}
		if(w.progressBorder && w.progressBorder > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.progressBorderColor+', 0 -2px 0 '+w.progressBorderColor+', 2px 0 0 '+w.progressBorderColor+', -2px 0 0 '+w.progressBorderColor;
		}


		return opt;
	}



	
	$scope.avatarStyle = function(w) {
		var opt = {
			'width': w.avatarW,
			'margin-bottom': (w.avatarW / 2) * -1,
			'margin-left': (w.avatarW / 2) * -1,
			'border-radius': '50%'
		}
		if(w.avatarBorderRadius) {opt['border-radius'] = w.avatarBorderRadius+'%';}

		if(w.avatarBorder > 0) {
			opt['box-shadow'] = "0 0 0 "+w.avatarBorder+"px "+w.avatarBorderColor+" ";
			opt['background-color'] = w.avatarBorderColor;
			if(w.avatarBorderRadius == 0) {
				opt['border-radius'] = 1;
			}
		}

		return opt;
	};



	$scope.textStyle = function(w) {
		var opt = {
			'font-size': w.font_size,
			'font-family': '\''+w.font_family+'\'',
			'font-weight': 'normal',
			'color': w.color,
			'text-align': 'center',
			'left': w.posX,
			'top': w.posY - (w.font_size * 1.2 / 2)
		};

		if(w.border && w.border > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.borderColor+', 0 -2px 0 '+w.borderColor+', 2px 0 0 '+w.borderColor+', -2px 0 0 '+w.borderColor;
		}
		if(w.font_bold) {
			opt['font-weight'] = 'bold';
		}


		if(w.textAlign == 'left') {
			opt['text-align'] = 'left';

		} else if(w.textAlign == 'right') {
			opt['text-align'] = 'right';
			opt['transform'] = 'translate(-100%, 0px)';

		} else if(w.textAlign == 'center') {
			opt['text-align'] = 'center';
			opt['transform'] = 'translate(-50%, 0px)';
		}


		return opt;
	};





	$scope.timerLabelStyle = function(w) {
		var opt = {
			'font-size': w.textSize,
		};

		if(w.style == '1' || w.style == '2') {
			opt['margin-top'] = w.paddingY;
		} else if(w.style == '3') {
			opt['position'] = 'absolute';
			opt['top'] = w.font_size - w.textSize;
			opt['left'] = w.paddingY;
			// if(el === 'h'){
			// 	opt['margin-top'] = w.paddingX;
			// } else if(el === 'm'){
			// 	opt['margin-top'] = w.paddingX;
			// }
		}

		return opt;
	}


	$scope.timerStyle = function(w) {
		var opt = {
			'font-size': w.font_size,
			'font-family': '\''+w.font_family+'\'',
			'font-weight': 'normal',
			'color': w.color,
			'text-align': 'center',
			'left': w.posX,
			'top': w.posY - (w.font_size * 1.2 / 2)
		};

		if(w.border && w.border > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.borderColor+', 0 -2px 0 '+w.borderColor+', 2px 0 0 '+w.borderColor+', -2px 0 0 '+w.borderColor;
		}

		if(w.font_bold) {
			opt['font-weight'] = 'bold';
		}
		return opt;
	};


	$scope.timerIntStyle = function(w, el){
		var opt = {
			//'position': 'static',
			'width': 'auto',
			'top': 0
		};

		if(w.style == '1') {
			opt['display'] = 'inline-block';
			opt['transform'] = 'translate(-50%, 0px)';
			if(el == 'h'){
				opt['left'] = w.paddingX;
			} else if(el == 'm'){
				opt['left'] = w.paddingX * 2;
			}

		} else if(w.style == '2') {
			opt['display'] = 'block';
			opt['transform'] = 'translate(-50%, 0px)';
			if(el == 'h'){
				opt['top'] = w.paddingX;
			} else if(el == 'm'){
				opt['top'] = w.paddingX * 2;
			}
		} else if(w.style == '3') {
			//opt['display'] = 'inline-block';
			opt['vertical-align'] = 'bottom';
			opt['text-align'] = 'left';
			if(el == 'h'){
				opt['left'] = w.paddingX * 0.95;
			} else if(el == 'm'){
				opt['left'] = w.paddingX + (w.paddingX * 0.95);
			}
		}

		return opt;
	};


	


	$scope.styleSmallElem = function(w, el) {
		var opt = {
			'font-size': w.font_size,
			'font-family': '\''+w.font_family+'\'',
			'font-weight': 'normal',
			'color': w.color
		};

		if(w.font_bold) {
			opt['font-weight'] = 'bold';
		}


		if(el == 'icon') {
			opt.left = w.posX + w.iconPosX;
			opt.top = w.posY + w.iconPosY;
			if(!w.iconColor) {
				opt.color = '#fff';
			} else {
				opt.color = w.iconColor;
			}

			if(w.iconSize) {
				opt['font-size'] = w.iconSize;
			} else {
				opt['font-size'] = '14';
			}
		} else if(el == 'count') {
			opt.left = w.posX + w.countPosX;
			opt.top = w.posY + w.countPosY;
			if(!w.countColor) {
				opt.color = '#fff';
			} else {
				opt.color = w.countColor;
			}

			if(w.countSize) {
				opt['font-size'] = w.countSize;
			}
		}

		if(w.border && w.border > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.borderColor+', 0 -2px 0 '+w.borderColor+', 2px 0 0 '+w.borderColor+', -2px 0 0 '+w.borderColor;
		}


		return opt
	}



	$scope.styleLastSubName = function(w) {
		var opt = {
			'font-size': w.font_size,
			'font-family': '\''+w.font_family+'\'',
			'font-weight': 'normal',
			'color': w.color
		};

		if(w.font_bold) {
			opt['font-weight'] = 'bold';
		}

		if(w.border && w.border > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.borderColor+', 0 -2px 0 '+w.borderColor+', 2px 0 0 '+w.borderColor+', -2px 0 0 '+w.borderColor;
		}

		if(w.namePos == "right") {
			opt.left = w.posX + w.textPosX;
			opt.top = w.posY + w.textPosY;

		} else if(w.namePos == "left") {
			opt.left = w.posX + w.textPosX;
			opt.top = w.posY + w.textPosY;
			opt['-webkit-transform'] = 'translate(-100%, 0)';
			opt['-ms-transform'] = 'translate(-100%, 0)';
			opt['transform'] = 'translate(-100%, 0)';
			
		} else if(w.namePos == "center") {
			opt.left = w.posX + w.textPosX;
			opt.top = w.posY + w.textPosY;
			opt['-webkit-transform'] = 'translate(-50%, 0)';
			opt['-ms-transform'] = 'translate(-50%, 0)';
			opt['transform'] = 'translate(-50%, 0)';
		}

		return opt;
	};



	$scope.cover_panel.style = function(w){
		var opt = {
			"color": w.color,
			"top": w.posY,
			"left": w.posX,
			"font-size": w.font_size,
			"font-family": '\''+w.font_family+'\'',
			'font-weight': 'normal',
			'text-aclign': 'left'
		};

		if(w.font_bold) {
			opt['font-weight'] = 'bold';
		}
		if(w.border && w.border > 0) {
			opt['text-shadow'] = '0 2px 0 '+w.borderColor+', 0 -2px 0 '+w.borderColor+', 2px 0 0 '+w.borderColor+', -2px 0 0 '+w.borderColor;
		}

		if(w.textAlign == 'left' || !w.textAlign) {
			opt['text-align'] = 'left';

		} else if(w.textAlign == 'right') {
			opt['text-align'] = 'right';
			opt['transform'] = 'translate(-100%, 0px)';

		} else if(w.textAlign == 'center') {
			opt['text-align'] = 'center';
			opt['transform'] = 'translate(-50%, 0px)';
		}

		return opt;
	}

	$scope.w_name = function(name) {
		var names = {
			time: "Дата и время",
			last_sub: "Последний подписчик",
			weather: "Погода (текст)",
			weather_icon:"Погода (с иконкой)",
			best_comment: "Активный комментатор",
			best_like: "Активный лайкер",
			best_share: "Активный репостер",
			show_user_to_link: "Пользователь по ID",
			timer: "Таймер",
			text: "Произвольный текст",
			online: "Текущий онлайн в группе",
			rates: "Курс валют",
			text_link: "Текст по ссылке",
			members_count: "Кол-во подписчиков",
			birthday: "Именинники сегодня",
			probki: "Пробки",
			rss: "Последние новости",
			image_to_link: "Картинка по ссылке",
			donationalerts_donation_goal: "Сбор средств",
			donationalerts_instream_stats: "Статистика донатов",
			random_text: "Случайный текст",
			youtube_last_video: "Посл. видео на YouTube",
			youtube_video_to_link: "Видео по ссылке",
			youtube_channel_info: "Информация о канале"
		};

		return names[name];
	}

	$scope.w_opts = function(val){
		var name = val.name;

		switch (name) {
			case "time":
				var _inputns = "<input ng-model='val.x'>"
				return _inputns;
				break;
		
			default:
				break;
		}
	};





	$scope.save_cover_loader = 0;
	$scope.save_cover = function() {
		if($scope.save_cover_loader == 1) return false;
		if(!cover_file) {
			alert('Вы забыли указать фон обложки.\nСделать это можно нажав на кнопку "Загрузить обложку" в блоке предпросмотра');
			return false;
		}
		$scope.save_cover_loader = 1;


		var call = function(code) {
			$('#load_progress p').text('Сохранение данных');
			var _widgets = angular.toJson($scope.widgets);
			var _schedule = angular.toJson($scope.cover_opt.schedule);
			var fd = new FormData();
			fd.append('widgets', _widgets);
			fd.append('group_id', $scope.cover_opt.group_id);
			fd.append('group_token', $scope.cover_opt.group_token);
			fd.append('interval', $scope.cover_opt.interval);
			fd.append('status', $scope.cover_opt.status);
			fd.append('reset_type', $scope.cover_opt.resetType);
			fd.append('schedule', _schedule);
			fd.append('file', cover_file);

			$http.post('/api/save_cover', fd, {
				withCredentials: true,
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			}).success(function(param) {
				//console.log(param);
				window.location = '/cabinet/edit_cover/'+param+'#success';
				
			}).error(function(param) {console.log(param)});
		};



		if($scope.cover_opt.resetType == 'callback') {
			if($scope.cover_opt.group_token == '') {
				alert('Пожалуйста, укажите "Ключ доступа группы"');
				return false;
			} else {
				$('#load_progress').modal('show');
				$('#load_progress p').text('Проверка "Ключа доступа группы"');

				$scope.checkToken(call)
			}
		} else {
			// if($scope.cover_opt.group_token != '') {
			// 	$('#load_progress').modal('show');
			// 	$('#load_progress p').text('Проверка "Ключа доступа группы"');
			// 	$scope.checkToken(call)
			// } else {
				call()
			// }
		}
	};



	$scope.preview = function() {
		if(!cover_file && !$scope.imageUrl) {
			alert('Вы забыли указать фон обложки.\nСделать это можно нажав на кнопку "Загрузить обложку" в блоке предпросмотра');
			return false;
		}
		
		
		var _widgets = angular.toJson($scope.widgets);

		var fd = new FormData();
		fd.append('widgets', _widgets);
		fd.append('group_id', $scope.cover_opt.group_id);
		if(cover_file != null) {
			fd.append('file', cover_file);
		} else {
			fd.append('image', $scope.imageUrl);
		}



		$('#preview_cover').modal('show');


		$http.post('/api/preview', fd, {
			withCredentials: true,
			headers: {'Content-Type': undefined },
			transformRequest: angular.identity
		}).success(function(param) {
			//if(param.url) {
				var img = '/uploads/preview/'+param.url+'?'+Math.ceil(Math.random() * 1000);
				$('.preview_cover_full').html('<img src="'+img+'">')
				$('.preview_cover_phone').css('background-image', 'url('+img+')')

				$('.show_preview').show()
				$('.load_preview').hide()
			// } else {
			// 	$('#preview_cover').modal('hide');
			// 	alert('Вы забыли указать фон обложки.\nСделать это можно нажав на кнопку "Загрузить обложку" в блоке предпросмотра');
			// }
		}).error(function(param) {console.error(param)});
	};



	$scope.edit_cover = function() {
		console.log('send cover info');
		var _widgets = angular.toJson($scope.widgets);
		var _schedule = angular.toJson($scope.cover_opt.schedule);

		var call = function() {
			var fd = new FormData();
			fd.append('cover_id', $scope.cover_id);
			fd.append('widgets', _widgets);
			fd.append('interval', $scope.cover_opt.interval);
			fd.append('group_token', $scope.cover_opt.group_token);
			fd.append('reset_type', $scope.cover_opt.resetType);
			fd.append('schedule', _schedule);
			fd.append('status', $scope.cover_opt.status);
			fd.append('group_id', $scope.cover_opt.group_id);
			if(cover_file != null) {fd.append('file', cover_file);}

			$http.post('/api/edit_cover', fd, {
				withCredentials: true,
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			}).success(function(param) {
				console.log(param);
				window.location.reload();
			}).error(function(param) {console.log(param)});
		}


		if($scope.cover_opt.resetType == 'callback') {
			if($scope.cover_opt.group_token == '') {
				alert('Пожалуйста, укажите "Ключ доступа группы"');
				return false;
			} else {
				$('#load_progress').modal('show');
				$('#load_progress p').text('Проверка "Ключа доступа группы"');

				$scope.checkToken(call)
			}
		} else {
			// if($scope.cover_opt.group_token != '') {
			// 	$('#load_progress').modal('show');
			// 	$('#load_progress p').text('Проверка "Ключа доступа группы"');
			// 	$scope.checkToken(call)
			// } else {
				call()
			// }
		}
	};


	$scope.remove_cover = function() {
		console.log('send cover info');
		var _widgets = angular.toJson($scope.widgets);

		var test = confirm('Вы действительно хотите удалить данную обложку?\nПосле этого действия её не возможно будет востановить!')
		if(test) {
			var fd = new FormData();
			fd.append('cover_id', $scope.cover_id);

			$http.post('/api/remove_cover', fd, {
				withCredentials: true,
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			}).success(function(param) {
				console.log(param);
				window.location = '/cabinet/cover';
			}).error(function(param) {console.log(param)});
		}
	};



	$scope.load_data = function(data) {
		$scope.widgets = angular.fromJson($window.widgetsData);
	}

	$scope.load_schedule = function(data) {
		$scope.cover_opt.schedule = angular.fromJson($window.scheduleData);
	}




	$scope.widgets_modal = function(){
		$('#w_modal').modal('show');
	}




	$scope.addWidget = function(data) {
		console.log(typeof data, data);
		if(typeof data == 'string') {
			$scope.widgets.push(angular.copy(w_tmp[data]));
			$('#w_modal').modal('hide');
		} else if(typeof data == 'object') {
			$scope.widgets.push(angular.copy(data));
		}
	}


	$scope.moveWidget = function(i, to) {
		if((i == 0 && to == 'down') || (i == $scope.widgets.length - 1 && to == 'up')) {
			// return false;
		} else {
			var obj = $scope.widgets.splice(i, 1)[0];

			if(to == 'up'){
				$scope.widgets.splice(i+1, 0, obj);
				$scope.showOpt = i+1;
			} else if(to == 'down'){
				$scope.widgets.splice(i-1, 0, obj)
				$scope.showOpt = i-1;
			}
		}
	}


	
	$scope.options = {
		format: 'hex'
	};


	$scope.newlines = function(text) {
		var rm_text = new TextRandomizator(text);
		var rand_text = rm_text.get_text(false);

		var text_br = rand_text.replace(/--br/g, '<br>');
		return $sce.trustAsHtml(text_br);
	}
}





var app = angular.module('create_cover', ['color.picker', 'moment-picker']);
app.controller("main_controler", main_controler);


app.directive('myDraggable', ['$document', function($document) {
	return {
		link: function(scope, element, attr) {
			var w = scope.w;
			//console.log(attr)


			var startX = 0, startY = 0,
				 x = 0, y = 0,
				 start_wX = w.posX, start_wY = w.posY;

			element.on('mousedown', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				if(attr.class.indexOf('avatar') != -1 || attr.class.indexOf('w_text') != -1) {
					start_wX = w.posX, start_wY = w.posY;
				} else if(attr.class.indexOf('name') != -1) {
					start_wX = w.textPosX, start_wY = w.textPosY;
				} else if(attr.class.indexOf('count') != -1) {
					start_wX = w.countPosX, start_wY = w.countPosY;
				} else if(attr.class.indexOf('icon') != -1) {
					start_wX = w.iconPosX, start_wY = w.iconPosY;
				}
				
				startX = event.pageX;
				startY = event.pageY;
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});

			function mousemove(event) {
				y = event.pageY - startY;
				x = event.pageX - startX;

				if(attr.class.indexOf('avatar') != -1 || attr.class.indexOf('w_text') != -1) {
					if(start_wX + x >= 0 && start_wX + x <= 795) w.posX = start_wX + x;
					if(start_wY + y >= 0 && start_wY + y <= 200) w.posY = start_wY + y;
				} else if(attr.class.indexOf('name') != -1) {
					w.textPosX = start_wX + x;
					w.textPosY = start_wY + y;
				} else if(attr.class.indexOf('count') != -1) {
					w.countPosX = start_wX + x;
					w.countPosY = start_wY + y;
				} else if(attr.class.indexOf('icon') != -1) {
					w.iconPosX = start_wX + x;
					w.iconPosY = start_wY + y;
				}
				
				scope.$apply()
			}

			function mouseup() {
				$document.off('mousemove', mousemove);
				$document.off('mouseup', mouseup);
			}
		}
	};
}]);



// app.controller("group_list", group_list_f);
// app.factory("dataList", function(){
// 	return {
// 		user_groups: [],
// 		group_info: false
// 	};
// });





$(document).ready(function () {
	if(location.hash == '#success') {
		$('#load_progress').modal('show');
		$('#load_progress p').html('<b>Обложка успешно создана и уже установлена в выбраной группе.</b><br>Дальнейшие обновления будут происходить согласно заданным "настройкам публикации".');
		location.hash = '';
	}


	$('#preview_cover').on('hidden.bs.modal', function (e) {		
		$('.preview_cover_full').html(' ')
		$('.preview_cover_phone').css('background-image', 'url( )')

		$('.show_preview').hide()
		$('.load_preview').show()
	})


	/*$(document).scroll(function (e) {
		if($(this).scrollTop() >= 201) {
			$('#prev_cover_panel')
				.css('position', 'relative')
				.css('z-index', '99999')
				.css('box-shadow', '0px 0px 0px 20px #ECEFF1')
				.css('top', $(this).scrollTop() - 201);
		} else {
			$('#prev_cover_panel').removeAttr('style')
		}
	});*/
});




















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