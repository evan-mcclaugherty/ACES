let socket = io();
let beginBtn = document.getElementById('beginBtn');
let game = document.getElementById('game');
let nogame = document.getElementById('nogame');
let h2Title = document.getElementById('title');
let joinBtn = document.getElementById('join');
let leaveBtn = document.getElementById('leave');
let playerList = document.getElementById('playerList');


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
    td2.innerHTML = `<input type="radio" name="winner" value="${player}" />`;
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
}

function gameDoesntExist() {
  nogame.style.display = "block";
  game.style.display = "none";
}

function render(gameInfo) {
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
  socket.emit('addPlayer', info)
}

function leaveGame() {
  let info = {
    user,
    title
  }
  //TODO need to hide/show based on events from clicks... not the clicks...
  socket.emit('removePlayer', info)
}

function finishGame() {

}