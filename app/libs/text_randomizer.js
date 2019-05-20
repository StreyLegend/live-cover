/* Поддерживаемые шаблоны и директивы */
/*
{текст 1|текст 2|текст 3} - перебор вариантов
[текст 1|текст 2|текст 3] - перестановки
[+разделитель+текст 1|текст 2|текст 3] - перестановки с разделителем
\{ \} \| \[ \] \+ \\ - экранизация спецсимволов
*/

exports.TextRandomizator = function($text) {
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
	}






/* Примеры использования js библиотеки рандомизатора */
/*
var text_data = '{текст 1|текст 2|текст 3} или [текст 1|текст 2|текст 3]';	// Строка с шаблоном и директивами
var rm_text = new TextRandomizator(text_data);											// Объект рандомизатора, параметр text_data - текстовая строка с командами
console.log(rm_text.num_variant());															// Общее количество возможных вариантов
var rm_text_random = true;																		// Задаём случайный порядок выдачи результатов рандомизатора
console.log(rm_text.get_text(rm_text_random));											// Получаем очередной вариант текста
*/