let socket = io();
let beginBtn = document.getElementById('beginBtn');
let game = document.getElementById('game');
let nogame = document.getElementById('nogame');
let h2Title = document.getElementById('title');
let joinBtn = document.getElementById('join');
let leaveBtn = document.getElementById('leave');
let playerList = document.getElementById('playerList');
let form = document.getElementById('form');
let playerArray = [];
let winnerDiv = document.getElementById('winner');


socket.emit('isStarted', title);

socket.on('isStarted', gameInfo => {
  if (gameInfo) {
    gameExists();
    updatePlayerList(gameInfo.players);
    render(gameInfo);
  } else {
    gameDoesntExist();
  }
});

socket.on('playerList', list => {
  socket.emit('isStarted', title);
  playerArray = list;
  updatePlayerList(list);
});

function updatePlayerList(players) {
  let inList = false;
  playerList.innerHTML = '';

  players.forEach(player => {
    if (player === user) {
      inList = true;
    }
    let tr = document.createElement('tr');
    tr.classList.add('player')
    let td1 = document.createElement('td');
    addTextNode(td1, player);

    let td2 = document.createElement('td');
    td2.innerHTML = `<input type="radio" name="winner" value="${player}" required />`;
    tr.appendChild(td1);
    tr.appendChild(td2);
    playerList.appendChild(tr);
  })
  if (inList) {
    joinBtn.style.display = 'none';
    leaveBtn.style.display = 'block';
  } else {
    joinBtn.style.display = 'block';
    leaveBtn.style.display = 'none';
  }
}

function gameExists() {
  nogame.style.display = "none"
  game.style.display = "block";
  winnerDiv.style.display = 'none';
}

function gameDoesntExist() {
  nogame.style.display = "block";
  game.style.display = "none";
  winnerDiv.style.display = 'block';
}

function render(gameInfo) {
  h2Title.innerHTML = '';
  addTextNode(h2Title, `Join ${gameInfo.owner}'s game!`);
}

function startGame() {
  gameExists();
  let info = {
    username: user,
    title
  }
  socket.emit('startGame', info);
  socket.emit('isStarted', title);
  joinGame();
}

function createNode(type, text) {
  let node = document.createElement(type);
  let nodeText = document.createTextNode(text);
  node.appendChild(nodeText);
  return node;
}

function addTextNode(el, text) {
  el.appendChild(document.createTextNode(text));
}

function joinGame() {
  let info = {
    user,
    title
  }
  socket.emit('addPlayer', info);
}

function leaveGame() {
  let info = {
    user,
    title
  }
  socket.emit('removePlayer', info)
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  let FD = new FormData(form);
  let winner = Array.from(FD.values())[0]
  playerArray = playerArray.filter(player => {
    return winner !== player;
  });
  FD.append('losers', playerArray);
  FD.append('title', title);
  let request = new XMLHttpRequest();
  request.addEventListener('load', (evt) => {
    socket.emit('endGame', title);
    let gameResults = JSON.parse(request.response);
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
  gameResults.forEach(person => {
    let p = document.createElement('p');
    if (person.type === 'WON') {
      addTextNode(p, `Congratulations ${person.username}, you won! You have won a total of ${person.times} times!`)
    } else {
      addTextNode(p, `Wow you suck ${person.username}! You have lost this game ${person.times} times! #justquit`)
    }
    winnerDiv.appendChild(p);
  });
})
function endGame() {
  socket.emit('endGame', title);
}
socket.on('gameEnded', (endedTitle) => {
  if (endedTitle === title) {
    gameDoesntExist();
    winnerDiv.style.display = 'block';
  }
  request = null;
});