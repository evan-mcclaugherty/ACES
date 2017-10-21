'use strict';
var aFrom = (function () {
  var toStr = Object.prototype.toString;
  var isCallable = function (fn) {
    return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
  };
  var toInteger = function (value) {
    var number = Number(value);
    if (isNaN(number)) {
      return 0;
    }
    if (number === 0 || !isFinite(number)) {
      return number;
    }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  };
  var maxSafeInteger = Math.pow(2, 53) - 1;
  var toLength = function (value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  };

  // The length property of the from method is 1.
  return function from(arrayLike /*, mapFn, thisArg */ ) {
    // 1. Let C be the this value.
    var C = this;

    // 2. Let items be ToObject(arrayLike).
    var items = Object(arrayLike);

    // 3. ReturnIfAbrupt(items).
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }

    // 4. If mapfn is undefined, then let mapping be false.
    var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
    var T;
    if (typeof mapFn !== 'undefined') {
      // 5. else
      // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
      if (!isCallable(mapFn)) {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }

      // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 2) {
        T = arguments[2];
      }
    }

    // 10. Let lenValue be Get(items, "length").
    // 11. Let len be ToLength(lenValue).
    var len = toLength(items.length);

    // 13. If IsConstructor(C) is true, then
    // 13. a. Let A be the result of calling the [[Construct]] internal method 
    // of C with an argument list containing the single item len.
    // 14. a. Else, Let A be ArrayCreate(len).
    var A = isCallable(C) ? Object(new C(len)) : new Array(len);

    // 16. Let k be 0.
    var k = 0;
    // 17. Repeat, while k < len… (also steps a - h)
    var kValue;
    while (k < len) {
      kValue = items[k];
      if (mapFn) {
        A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }
    // 18. Let putStatus be Put(A, "length", len, true).
    A.length = len;
    // 20. Return A.
    return A;
  };
}());
var socket = io();
var beginBtn = document.getElementById('beginBtn');
var game = document.getElementById('game');
var nogame = document.getElementById('nogame');
var h2Title = document.getElementById('title');
var joinBtn = document.getElementById('join');
var leaveBtn = document.getElementById('leave');
var playerList = document.getElementById('playerList');
var form = document.getElementById('form');
var playerArray = [];
var winnerDiv = document.getElementById('winner');

socket.emit('isStarted', title);

socket.on('isStarted', function (gameInfo) {
  if (gameInfo) {
    gameExists();
    updatePlayerList(gameInfo.players);
    render(gameInfo);
  } else {
    gameDoesntExist();
  }
});

socket.on('playerList', function (list) {
  socket.emit('isStarted', title);
  playerArray = list;
  updatePlayerList(list);
});

function updatePlayerList(players) {
  var inList = false;
  playerList.innerHTML = '';

  players.forEach(function (player) {
    if (player === user) {
      inList = true;
    }
    var tr = document.createElement('tr');
    tr.classList.add('player');
    var td1 = document.createElement('td');
    addTextNode(td1, player);

    var td2 = document.createElement('td');
    td2.innerHTML = '<input type="radio" class="radio" name="winner" value="' + player + '" required />';
    tr.appendChild(td1);
    tr.appendChild(td2);
    playerList.appendChild(tr);
  });
  if (inList) {
    joinBtn.style.display = 'none';
    leaveBtn.style.display = 'block';
  } else {
    joinBtn.style.display = 'block';
    leaveBtn.style.display = 'none';
  }
}

function gameExists() {
  nogame.style.display = "none";
  game.style.display = "block";
}

function gameDoesntExist() {
  nogame.style.display = "block";
  game.style.display = "none";
  winnerDiv.innerHTML = '';
}

function render(gameInfo) {
  h2Title.innerHTML = '';
  addTextNode(h2Title, 'Join ' + gameInfo.owner + '\'s game!');
  winnerDiv.style.display = 'block'
  winnerDiv.innerHTML = '';
}

function startGame() {
  gameExists();
  var info = {
    username: user,
    title: title
  };
  socket.emit('startGame', info);
  socket.emit('isStarted', title);
  joinGame();
}

function createNode(type, text) {
  var node = document.createElement(type);
  var nodeText = document.createTextNode(text);
  node.appendChild(nodeText);
  return node;
}

function addTextNode(el, text) {
  el.appendChild(document.createTextNode(text));
}

function joinGame() {
  var info = {
    user: user,
    title: title
  };
  socket.emit('addPlayer', info);
}

function leaveGame() {
  var info = {
    user: user,
    title: title
  };
  socket.emit('removePlayer', info);
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  var FD = new FormData(form);
  let nodes = document.getElementsByClassName('radio');
  let checked = [].filter.call(nodes, function (e) {
    return e.checked;
  })[0];
  var winner = checked.value;
  playerArray = playerArray.filter(function (player) {
    return winner !== player;
  });
  FD.append('losers', playerArray);
  FD.append('title', title);
  var request = new XMLHttpRequest();
  request.addEventListener('load', function (evt) {
    socket.emit('endGame', title);
    var gameResults = JSON.parse(request.response);
    socket.emit('winnerDiv', gameResults); // TODO
  });
  request.open("POST", "https://aces-game-hub.herokuapp.com/games/winner");
  // request.open("POST", "http://localhost:3000/games/winner");
  if (playerArray.length !== 0) {
    request.send(FD);
  }
});
socket.on('winnerDiv', function f_winnerDiv(gameResults) {
  winnerDiv.innerHTML = '';
  winnerDiv.style.display = 'block';
  gameResults.forEach(function (person) {
    var p = document.createElement('p');
    if (person.type === 'WON') {
      addTextNode(p, 'Congratulations ' + person.username + ', you won! You have won a total of ' + person.times + ' times!');
    } else {
      addTextNode(p, 'Wow you suck ' + person.username + '! You have lost this game ' + person.times + ' times! #justquit');
    }
    winnerDiv.appendChild(p);
  });
});

function endGame() {
  socket.emit('endGame', title);
  document.getElementById('winner').innerHTML = '';
}
socket.on('gameEnded', function (endedTitle) {
  if (endedTitle === title) {
    gameDoesntExist();
  }
});