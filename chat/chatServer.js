const socketio = require('socket.io');

module.exports.listen = (server) => {
  io = socketio.listen(server);

  var numUsers = 0;

  io.on('connection', function (socket) {
    var addedUser = false;
    socket.on('new message', function (data) {
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });

    // BEGIN game
    socket.on('winnerDiv', function winnerDiv(data) {
      io.emit('winnerDiv', data);
    })
    socket.on('addPlayer', function (info) {
      let players = io[info.title].players;
      if (players.indexOf(info.user) === -1) {
        io[info.title].players.push(info.user);
      }
      io.emit('playerList', io[info.title].players);
    });
    socket.on('removePlayer', function (info) {
      let players = io[info.title].players;
      let index = players.indexOf(info.user);
      players.splice(index, 1);
      io.emit('playerList', io[info.title].players);
    });

    socket.on('startGame', function (info) {
      io[info.title] = {
        title: info.title,
        owner: info.username,
        players: []
      }
      socket.username = info.username;
      socket.broadcast.emit('gameStarting', io[info.title]);
    });

    socket.on('endGame', function (title) {
      delete io[title];
      io.emit('gameEnded', title);
    });
    socket.on('isStarted', function (title) {
      let gameData = io[title];
      if (gameData) {
        socket.emit('isStarted', gameData);
      } else {
        socket.emit('isStarted', false);
      }
    });
    // END of game 

    socket.on('add user', function (username) {
      if (addedUser) return;

      socket.username = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });

    socket.on('typing', function () {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    socket.on('stop typing', function () {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });

    socket.on('disconnect', function () {
      if (addedUser) {
        --numUsers;

        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  });
}