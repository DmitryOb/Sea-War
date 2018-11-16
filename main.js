const arrayOfDirections = ['right', 'down', 'left', 'up'];

$(document).ready(function(){
	$('form').submit(function(e){
		e.preventDefault();
		$('form').hide();
		$('#halfWrapperOne h3.description').text($('input[name="you"]').val());
		$('#halfWrapperTwo h3.description').text($('input[name="pc"]').val());
		$('#tableWrapper').show();
		gameStart();
	})
})

function gameStart(){
	computerExpose(); //ПК расставляет свои корабли в случайном порядке
	var arrayOfShips = [4,3,3,2,2,2,1,1,1,1];
	//поворот корабля
	$('#panelForShipsContent button').click(function(e){
		var ship = $('#currentShipContainer').find('div[currentship]');
		if (ship[0]){
			var typeOfShip = Number(ship.attr('type'));
			var indexOfShip = Number(ship.attr('shipid'));
			var vertical = ship.attr('vertical');
			//удаляем корабль
			$('#currentShipContainer').html("");
			if (vertical=='false'){
				shipVertExpose(typeOfShip, indexOfShip);
			} else {
				shipHorizExpose(typeOfShip, indexOfShip);
			}

		}
	})
	shipHorizExpose(arrayOfShips.splice(0,1), (new Date()).getTime());

	function shipHorizExpose(typeOfShip, indexOfShip){
		var tableWidth = typeOfShip*2.5;
		var tdString = '';
		for (var i=0; i<typeOfShip; i++) {
			tdString+='<td></td>';
		}
		var html = 
			'<div shipid="'+indexOfShip+'" currentship class="deck'+typeOfShip+'" vertical="false" type="'+typeOfShip+'">'+
				'<table style="width: '+tableWidth+'vw; height: 2.5vw" border="1px">'+
					'<tr>'+
						tdString
					'</tr>'+
				'</table>'+
			'</div>';
		$('#currentShipContainer').append(html);
		DragAndDropLoop(arrayOfShips);
	}
	function DragAndDropLoop(arrayOfShips){
		var activeElement;
		var offsetX = 0;
		var offsetY = 0;
		var container = document.querySelector('div[currentship]');
		if (container){
			var mDown = function(e){
				activeElement = document.querySelector('div[currentship]');
				offsetX = e.offsetX;
				offsetY = e.offsetY;
			};
			var mUp = function(e){
				activeElement = null;
				DropCheck(e, arrayOfShips);
			};
			var mMove = function(e){
				if(activeElement) {
					activeElement.style.top = (e.clientY - offsetY) + 'px';
					activeElement.style.left = (e.clientX - offsetX) + 'px';
				}
			};
			$('body').on('mousedown', 'div[currentship]', mDown);
			$(document).on('mouseup', mUp);
			$(document).on('mousemove', mMove);
		}
	}
	function DropCheck(event, arrayOfShips){
		if (event.target.id == 'rotateButton') {
			event.preventDefault();
		} else {
			var leftToBattle = Math.round($('#battlefieldOne').offset().left);
			var topToBattle = Math.round($('#battlefieldOne').offset().top);
			var size = $('#battlefieldOne').outerWidth();
			var leftToRightBoard = leftToBattle + size;
			var topToBottomBoard = topToBattle + size;
			var horizontalHit = event.clientX>=leftToBattle && event.clientX<=leftToRightBoard;
			var verticalHit = event.clientY>=topToBattle && event.clientY<=topToBottomBoard;
			if ( horizontalHit && verticalHit){
				$('div[currentship]').hide();
				var elem = document.elementFromPoint(event.clientX, event.clientY);
				$('div[currentship]').show();
				var type = $('div[currentship]').attr('type');
				var cellId = elem.id;
				var directionTitle;
				var shipid = Number($('div[currentship]').attr('shipid'));
				if ($('div[currentship]').attr('vertical')=='true'){
					directionTitle = 'down';
				} else {
					directionTitle = 'right';
				}
				if ($(elem).attr('status')=='busy'){
					alert('Данная клетка уже занята другим кораблём!');
					$('div[currentship]')[0].style.left = "";
					$('div[currentship]')[0].style.top = "";
				} else {
					if (placeShip(type, cellId, directionTitle, shipid, '#battlefieldOne')){
						$('#currentShipContainer').html("");
						delDragAndDropListener();
						if (arrayOfShips.length>0){
							shipHorizExpose(arrayOfShips.splice(0,1), (new Date()).getTime());
						} else {
							// размещение кораблей закончилось
							$('#battlefieldOne td').attr('unlock-status', 'false');
							$('#panelForShips').remove();
							listenClickToEnemy();
						}
					} else {
						$('div[currentship]')[0].style.left = "";
						$('div[currentship]')[0].style.top = "";
					}
				}
			} else {
				if ($('div[currentship]')[0].style.top.length>0 && $('div[currentship]')[0].style.left.length>0){
					$('div[currentship]')[0].style.left = "";
					$('div[currentship]')[0].style.top = "";
				}
				event.preventDefault();
				alert ('Разместите корабль внутри поля!');
				event.preventDefault();
			}
		}
	}

	function shipVertExpose(typeOfShip, indexOfShip){
		var tableHeight = typeOfShip*2.5;
		var trString = '';
		for (var i=0; i<typeOfShip; i++) {
			trString+='<tr><td></td></tr>';
		}
		var html = 
		'<div shipid="'+indexOfShip+'" currentship class="deck'+typeOfShip+'" vertical="true" type="'+typeOfShip+'">'+
			'<table style="width: 2.5vw; height: '+tableHeight+'vw" border="1px">'+
					trString+
			'</table>'+
		'</div>';
		$('#currentShipContainer').append(html);
	}
	function delDragAndDropListener(){
		$(document).off('mouseup');
		$(document).off('mousemove');
		$('body').off('mousedown', 'div[currentship]');
	}
}
function drawShips(battlefieldSelector){
	[4,3,3,2,2,2,1,1,1,1].forEach(function(e,i,arr){
		place(e, findIdFreeCell(this.battlefieldSelector), i, this.battlefieldSelector);
	},{battlefieldSelector: battlefieldSelector})
}
function place(lengthOfShip, freeCellId, indexOfShip, battlefieldSelector){
	var directions = JSON.parse(JSON.stringify(arrayOfDirections));
	function directionTitleReturn(){
		if (directions.length){
			var rndDirectionOrder = rndInt(0, (directions.length-1));
			var directionTitle = directions[rndDirectionOrder];
			directions.splice(rndDirectionOrder, 1);
			return directionTitle;
		} else {
			return false;
		}
	}
	var nextDirectionTitle = directionTitleReturn();
	while (nextDirectionTitle){
		currentDirectionTitle = nextDirectionTitle;
		nextDirectionTitle = directionTitleReturn();
		// удалось разместить корабль
		if (placeShip(lengthOfShip, freeCellId, currentDirectionTitle, indexOfShip, battlefieldSelector)){
			nextDirectionTitle = false;
		}
		// если не удалось разместить корабль по всем 4 направлениям то размещаем в новой клетке
		else {
			if (nextDirectionTitle==false){
				place(lengthOfShip, findIdFreeCell(), indexOfShip, battlefieldSelector);
			}
		}
	}
}
function placeShip(lengthOfShip, freeCellId, directionTitle, indexOfShip, battlefieldSelector){
	var startX = Number(freeCellId[0]);
	var startY = Number(freeCellId[1]);
	var ship = [freeCellId];
	switch (directionTitle){
		case 'right':
			for (var i=0; i<lengthOfShip-1; i++) {
				var x = ++startX;
				var cellId = String(x)+startY;
				ship.push(cellId)
			}
			break;
		case 'down':
			for (var i=0; i<lengthOfShip-1; i++) {
				var y = --startY;
				var cellId = startX+String(y);
				ship.push(cellId)
			}
			break;
		case 'left':
			for (var i=0; i<lengthOfShip-1; i++) {
				var x = --startX;
				var cellId = String(x)+startY;
				ship.push(cellId)
			}
			break;
		case 'up':
			for (var i=0; i<lengthOfShip-1; i++) {
				var y = ++startY;
				var cellId = startX+String(y);
				ship.push(cellId)
			}
			break;
	}
	return checkFreeSpace(ship, indexOfShip, battlefieldSelector);
}
function checkFreeSpace(ship, indexOfShip, battlefieldSelector){
	var checkResult = true;

	ship.forEach(function(e,i,arr){
		//проверяем на существование текущей клетки и что она не занята
		if (!$(this.battlefieldSelector+' #'+e)[0] || $(this.battlefieldSelector+' #'+e).attr('status')=='busy'){
			checkResult = false;
		}
		// проверяем на незанятость соседних клеток
		var x = Number(e[0]);
		var y = Number(e[1]);
		var up = $(this.battlefieldSelector+' #'+x+(y+1)).attr('status')=='busy';
		var down = $(this.battlefieldSelector+' #'+x+(y-1)).attr('status')=='busy';
		var right = $(this.battlefieldSelector+' #'+(x+1)+y).attr('status')=='busy';
		var left = $(this.battlefieldSelector+' #'+(x-1)+y).attr('status')=='busy';
		if (up || down || right || left){
			checkResult = false;
		}
	}, {battlefieldSelector: battlefieldSelector})

	if (checkResult){
		ship.forEach(function(e,i,arr){
			$(this.battlefieldSelector + ' #'+e).attr('status', 'busy');
			$(this.battlefieldSelector + ' #'+e).addClass('deck'+ship.length);
			$(this.battlefieldSelector + ' #'+e).attr('shipId', this.indexOfShip);
		},{indexOfShip: indexOfShip, battlefieldSelector: battlefieldSelector})
	}
	return checkResult;
}
function rndInt(min, max){
	var rand = min + Math.random() * (max - min)
	rand = Math.round(rand);
	return rand;
}
function findIdFreeCell(battlefieldSelector){
	var startX = rndInt(0, 9);
	var startY = rndInt(0, 9);
	var cellId = String(startX) + String(startY);
	if ($(battlefieldSelector+' #'+cellId).attr('status')!='busy'){
		return cellId;
	}
	else if ($(battlefieldSelector+' #'+cellId).attr('status')=='busy'){
		while ($(battlefieldSelector+' #'+cellId).attr('status')=='busy') {
			startX = rndInt(0, 9);
			startY = rndInt(0, 9);
			cellId = String(startX) + String(startY);
		}
		return cellId;
	}
}
function listenClickToEnemy(){
	$('#shootInfo').show().text($('input[name="you"]').val() + ' ходит...');
	$('#battlefieldTwo td').click(function(e){
		if ($(this).attr('unlock-status')=='true'){
			e.preventDefault();
		}
		else {
			$(this).removeClass('invisible');
			$(this).attr('unlock-status', 'true');
			if ($(this).attr('status')=='busy'){
				// проверка на ранил или убил
				if($('#battlefieldTwo td[shipid="'+$(this).attr('shipid')+'"]:not([status="shoot"])').length>1){
					$(this).addClass('shoot');
				}
				else {
					$('#battlefieldTwo td[shipid="'+$(this).attr('shipid')+'"]').removeClass('shoot');
				}
				$(this).attr('status', 'shoot');
			}
			$('#battlefieldTwo td').unbind('click');
			var win = true;
			$('#battlefieldTwo td[shipid]').each(function(i,e,arr){
				if($(e).hasClass('invisible')){
					win = false;
				}
			})
			// если не победил то ход ПК
			if (!win){
				$('#shootInfo').hide();
				$('#shootInfo').show().text($('input[name="pc"]').val() + ' ходит...');
				setTimeout(computerShoot, 100);
			} else {
				alert('Поздравляю ТЫ Победил!');
				$('#shootInfo').css('color', 'red');
				$('#shootInfo').text('Люди одержали верх над машинами!')
			}
		}
	})
}
function computerShoot(){
	var cellElem = $('#battlefieldOne td#'+generateCellIdShootPC());
	cellElem.attr('unlock-status', 'true');
	if (cellElem.attr('status')=='busy'){
		cellElem.addClass('shoot');
	} else {
		cellElem.addClass('miss');
	}
	var win = true;
	$('#battlefieldOne td[shipid]').each(function(i,e,arr){
		if($(e).attr('unlock-status')=='false'){
			win = false;
		}
	})
	// если не победил то наш ход
	if (!win){
		listenClickToEnemy();
	} else {
		alert('К сожалению ТЫ проиграл');
		$('#shootInfo').css('color', 'red');
		$('#shootInfo').text('Машины одержали верх над людьми!')
	}
}
function computerExpose(){
	drawShips('#battlefieldTwo');
	$('#battlefieldTwo td:not([status])').css('backgroundColor', '#8080804d');
	$('#battlefieldTwo td').addClass('invisible');
	$('#battlefieldTwo td').attr('unlock-status', 'false');
}
function generateCellIdShootPC(){
	var shootX = rndInt(0, 9);
	var shootY = rndInt(0, 9);
	var cellId = String(shootX) + String(shootY);
	if ( $('#battlefieldOne td#'+cellId).attr('unlock-status')=='true' ){
		return generateCellIdShootPC();
	} else {
		return cellId;
	}
}