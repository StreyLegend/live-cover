var cover_file = null;
var cover_widgets = [
	{
		name: "time",
		x: 10,
		y: 188,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		font_weight: "200",
		timezone: 'Europe/Moscow',
		text: 'Последнее обновление: '
	},
	{
		name: "last_sub",
		user_pos: "0",
		avatar_x: 642,
		avatar_y: 24,
		avatar_w: 50,
		color: '#000',
		text_br: true,
		only_name: false,
		text_align: 'left',
		text_pos_x: 675,
		text_pos_y: 23,
		font_size: 14,
		font_family: 'Arial',
		font_weight: "200"
	}
];
var cover_opt = {
	interval: '15',
	group_id: '',
	status: true,
	group_token: '',
	resetType: 'cron'
};

var w_tmp = {
	time: {
		name: "time",
		x: 10,
		y: 188,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		font_weight: "200",
		timezone: 'Europe/Moscow',
		text: 'Последнее обновление: '
	},
	last_sub: {
		name: "last_sub",
		user_pos: "0",
		avatar_x: 642,
		avatar_y: 24,
		avatar_w: 50,
		color: '#000',
		text_br: true,
		only_name: false,
		text_align: 'left',
		text_pos_x: 675,
		text_pos_y: 23,
		font_size: 14,
		font_family: 'Arial',
		font_weight: "200"
	},
	weather: {
		name: "weather",
		x: 10,
		y: 188,
		color: '#fff',
		font_size: 14,
		font_family: 'Arial',
		font_weight: "200",
		city: 'Москва',
		before_text: 'Погода в Москве: ',
		only_temp: true,
		show_c: true
	},
};



$(document).ready(function () {
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
		console.log(f);
		var types = ["image/jpeg", "image/gif", "image/png"];

		if(types.indexOf(f.type) >= 0) {
			if(f.type=='image/jpeg') {var format = 'jpg';}
			else if(f.type=='image/gif') {var format = 'gif';}
			else if(f.type=='image/png') {var format = 'png';}

			cover_file = f;
			// fileName = sites_list[0].replace(/\./, '_')+'.'+format;
			var reader = new FileReader();
			reader.onload = function(event) {
				var result = event.target.result;
				$('.cover_panel').css('background-image', 'url('+result+')');
				$('#load_bg').modal('hide');
			};
			reader.onerror = function(event) {
				alert('Ошибка загрузки! Возможно вы используете устаревший браузер!');
			};
			reader.readAsDataURL(f);
		} else {
			alert('Неподходящий формат! Доступны: gif, png, jpg');
		}
	};

});


function main_controler($scope, $http, $timeout) {
	$scope.widgets = cover_widgets;
	$scope.cover_opt = cover_opt;
	$scope.cover_panel = {};



	$scope.checkToken = function(callback) {
		$scope.checkTokenProgress = 'load';
		$http.post('/api/check_token', {
			group_token: $scope.cover_opt.group_token,
			gid: $scope.cover_opt.group_id
		}).success(param => {
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
		}).error(param => console.log(param));
	}





	$scope.loadBg = function() {
		$('#load_bg').modal('show');
	}



	$scope.cover_panel.style = function(w){
		return {"color": w.color, "top": w.y, "left": w.x, "font-size": w.font_size, "font-family": w.font_family, "font-weight": w.font_weight};
	}

	$scope.w_name = function(name) {
		switch (name) {
			case "time":
				return "Текущее время"
				break;
				
			case "last_sub":
				return "Последний подписавшийся"
				break;
				
			case "weather":
				return "Погода"
				break;
		
			default:
				break;
		}
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


	$scope.save_cover = function() {
		if(!cover_file) {
			alert('Вы забыли указать фон обложки.\nСделать это можно нажав на кнопку "Загрузить обложку" в блоке предпросмотра');
			return false;
		}


		var call = function(code) {
			$('#load_progress p').text('Сохранение данных');
			var _widgets = angular.toJson($scope.widgets);
			var fd = new FormData();
			fd.append('widgets', _widgets);
			fd.append('group_id', $scope.cover_opt.group_id);
			fd.append('group_token', $scope.cover_opt.group_token);
			fd.append('interval', $scope.cover_opt.interval);
			fd.append('status', $scope.cover_opt.status);
			fd.append('reset_type', $scope.cover_opt.resetType);
			fd.append('file', cover_file);

			$http.post('/api/save_cover', fd, {
				withCredentials: true,
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			}).success(param => {
				//console.log(param);
				window.location = '/cabinet/edit_cover/'+param+'#success';
				
			}).error(param => console.log(param));
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
			if($scope.cover_opt.group_token != '') {
				$('#load_progress').modal('show');
				$('#load_progress p').text('Проверка "Ключа доступа группы"');
				$scope.checkToken(call)
			} else {
				call()
			}
		}
	};



	$scope.edit_cover = function() {
		console.log('send cover info');
		var _widgets = angular.toJson($scope.widgets);

		var call = function() {
			var fd = new FormData();
			fd.append('cover_id', $scope.cover_id);
			fd.append('widgets', _widgets);
			fd.append('interval', $scope.cover_opt.interval);
			fd.append('group_token', $scope.cover_opt.group_token);
			fd.append('reset_type', $scope.cover_opt.resetType);
			fd.append('status', $scope.cover_opt.status);
			// fd.append('group_id', $scope.cover_opt.group_id);
			if(cover_file != null) {fd.append('file', cover_file);}

			$http.post('/api/edit_cover', fd, {
				withCredentials: true,
				headers: {'Content-Type': undefined },
				transformRequest: angular.identity
			}).success(param => {
				console.log(param);
				window.location.reload();
			}).error(param => console.log(param));
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
			if($scope.cover_opt.group_token != '') {
				$('#load_progress').modal('show');
				$('#load_progress p').text('Проверка "Ключа доступа группы"');
				$scope.checkToken(call)
			} else {
				call()
			}
		}
	};


	$scope.remove_cover = function() {
		console.log('send cover info');
		var _widgets = angular.toJson($scope.widgets);

		var fd = new FormData();
		fd.append('cover_id', $scope.cover_id);

		 $http.post('/api/remove_cover', fd, {
			withCredentials: true,
			headers: {'Content-Type': undefined },
			transformRequest: angular.identity
		}).success(param => {
			console.log(param);
			window.location = '/cabinet/cover';
		}).error(param => console.log(param));
	};



	$scope.load_data = function(data) {
		$scope.widgets = angular.fromJson(data);
		console.log('>> ', $scope.widgets);
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
}



var app = angular.module('create_cover', []);
app.controller("main_controler", main_controler);

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