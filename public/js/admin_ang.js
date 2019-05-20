'use strict';

var main_controler = function($scope, $window){
	$scope.filter = {
		status: 1,
		freeze_status: 0
		// , widgets: ""
	};


	$scope.covers = $window.covers;
	$scope.userGroups = $window.userGroups;
	// for(let i in covers) {
	// 	let widgets = JSON.parse(covers[i].widgets);
	// 	let new_data = [];
	// 	for(let w of widgets) {
	// 		// if(w.name) {
	// 		// 	new_data.push(w.name)
	// 		// } else {
	// 		// 	new_data.push('XXXXXXXX')
	// 		// }
	// 	}
	// 	covers[i].widgets = new_data;

	// 	if(covers[i].freeze_status === null) covers[i].freeze_status = 0;
	// }

	console.log(covers)


	$scope.funFilter = function() {
		console.log(arguments)
	}
};


var app = angular.module('covers_admin', []);
app.controller("main_controler", main_controler);