$(document).ready(function () {
	$('[data-toggle=tooltip]').tooltip();
	$('[data-toggle=popover]').popover({
		html: true,
		content: function(){
			var target = $(this).data('asdas');
			return $(target).html();
		}
	})


	$('.btn_test_cover').click(function (e) { 
		e.preventDefault();
		$('i:first-child', this).hide();
		$('i:last-child', this).show();


		var secret_key = $(this).data('cover');
		var that = this;
		$.ajax({
			type: "get",
			url: "/test/"+secret_key,
			success: function (res) {
				$('i:first-child', that).show();
				$('i:last-child', that).hide();
				
				if(res.error == null) {
					mesAlert('<b>Обложка установленна!</b>', 5);
				} else if(res.error == 'token') {
					mesAlert('Обложка не может быть установленна, т.к. ваш "ключ доступа" устарел. Пожалуйста нажмите кнопку "обновить ключ" и повторите попытку.<br><br><a href="/auth/vk" class="btn btn-success">Обновить ключ</a>');
				} else if(res.error == 'balance') {
					mesAlert('Для обновления обложки необходимо пополнить баланс');
				}
			},
			error: function(){
				alert('Пожалуйста повторите попытку позже');
			}
		});
	});


	$('.btn_copy_cover').click(function (e) { 
		e.preventDefault();
		$('i:first-child', this).hide();
		$('i:last-child', this).show();


		var secret_key = $(this).data('cover');
		var that = this;
		$.ajax({
			type: "get",
			url: "/copy/"+secret_key,
			success: function (res) {
				$('i:first-child', that).show();
				$('i:last-child', that).hide();
				
				if(res.error == null) {
					location.reload()
				} else {
					mesAlert('Копирование не удалось. Пожалуйста повторите попытку через некоторе время. При систематическом получении данной ошибки, <a href="https://vk.com/im?media=&sel=-85107772" target="_blank">свяжитесь с администрацией</a>.');
				}
			},
			error: function(){
				alert('Пожалуйста повторите попытку позже');
			}
		});
	});


	$('#buy_table tr:not(:first-child)').each(function(){
		var sum = $('.sum', this).data('sum');
		$('.resources', this).html(number_format(Math.floor(sum * 288), 0, ',', '.'))

		
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

		// $('.bonus .label span', this).html(number_format(sum * 288 * sale, 0, ',', '.'))
		$('.bonus .label span', this).html(number_format(Math.floor(sum * 288 * sale), 0, ',', '.'))
	});



	$('#buy_table .btn').click(function(){
		var sum = $(this).parents('tr').find('.sum').data('sum');
		$('#start_pay').data('sum', sum)

		// if($('input[name="paymentType"]:checked').val() == 'PC') {
		// 	$('#sum_val').val(komisia.pc(sum))
		// } else {
		// 	$('#sum_val').val(komisia.ac(sum))
		// }

		$('#start_pay').modal('show');
	});


	$('input[name="paymentType"]').change(function(){
		var sum = $('#start_pay form').data('sum');
		
		if($('input[name="paymentType"]:checked').val() == 'PC') {
			$('#sum_val').val(komisia.pc(sum))
		} else {
			$('#sum_val').val(komisia.ac(sum))
		}
	})
});





function mesAlert(text, autoClose, id) {
	var mes_alert ='<div id="mes_alert">';
	mes_alert +='	<div class="container">';
	mes_alert +='		<div class="row">';
	mes_alert +='			<div class="col-xs-8 col-xs-offset-2 mes_alert_box">';
	mes_alert +='			</div>';
	mes_alert +='		</div>';
	mes_alert +='	</div>';
	mes_alert +='</div>';


	var mes_only_alert ='				<div id="mes_id_'+id+'" class="alert alert-dark">';
	mes_only_alert +='					<button type="button" class="close" data-dismiss="alert" aria-hidden="true"><i class="fa fa-tw fa-close"></i></button>';
	mes_only_alert +='					'+text;
	mes_only_alert +='				</div>';

	if(id && $('div.alert').is('#mes_id_'+id)) {return false;}

	if(!$('div').is('#mes_alert')) {
		$('body').append(mes_alert);
	}
	var mesBox = $('.mes_alert_box').prepend(mes_only_alert).children();
	if(autoClose) {
		setTimeout(function(){
			$(mesBox).remove();
		}, autoClose * 1000)
	}
}


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

function randomString(len, callback) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}

	return randomString;
}

function rand(min, max) {
	var rand = min + Math.random() * (max + 1 - min);
	rand = Math.floor(rand);
	return rand;
}

function randomColor() {
	return "#"+((1<<24)*Math.random()|0).toString(16);
}



/***
number - число
decimals - количество знаков после разделителя
dec_point - символ разделителя
separator - разделитель тысячных
***/
function number_format(number, decimals, dec_point, separator ) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof separator === 'undefined') ? ',' : separator ,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Фиксим баг в IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}