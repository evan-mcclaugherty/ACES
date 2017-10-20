if (!Array.from) {
  Array.from = (function () {
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
}
if (!("Notification" in window)) {
  alert("Booo! This browser won't notify you when a game is starting :( #sadPanda");
} else {
  if (Notification.permission !== "granted") {
    Notification.requestPermission(function (permission) {
      if (permission === "granted") {
        let options = {
          body: "You will see this when someone wnats to start a new game!"
        }
        var notification = new Notification("ACES Game Hub", options);
      } else {
        alert("Without notifcations you won't be able to know when someone starts a game!")
      }
    });
  }
}
let chatPage = document.getElementById('chat page');
let messages = document.getElementById('messages');
let inputMessage = document.getElementById('inputMessage');
let connected = false;
let typing = false;
let lastTypingTime;
let currentInput = inputMessage;
var TYPING_TIMER_LENGTH = 400; // ms
var COLORS = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

let socket = io();

function addParticipantsMessage(data) {
  var message = '';
  if (data.numUsers === 1) {
    message += "there's 1 participant";
  } else {
    message += "there are " + data.numUsers + " participants";
  }
  log(message);
}

// Tell the server your username
socket.emit('add user', username);

// Sends a chat message
function sendMessage() {
  var message = inputMessage.value;
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  // if there is a non-empty message and a socket connection
  if (message && connected) {
    inputMessage.textContent = '';
    addChatMessage({
      username: username,
      message: message
    });
    // tell server to execute 'new message' and send along one parameter
    socket.emit('new message', message);
  }
  inputMessage.value = '';
}

// Log a message
function log(message, options) {
  let el = document.createElement('li');
  el.classList.add('log');
  let text = document.createTextNode(message);
  el.appendChild(text);
  addMessageElement(el, options);
}

function removeNodes(nodes) {
  nodes.forEach(function (node) {
    messages.removeChild(node);
  })
}
// Adds the visual chat message to the message list
function addChatMessage(data, options) {
  var typingMessages = getTypingMessages(data);
  options = options || {};
  if (typingMessages.length !== 0) {
    options.fade = false;
    removeNodes(typingMessages);
  }

  var usernameDiv = document.createElement('span')
  let messageDiv = document.createElement('li');
  usernameDiv.classList.add('username');
  usernameDiv.textContent = data.username;

  // usernameDiv.style.cssText = `color: ${getUsernameColor(data.username || data.owner)}`;
  usernameDiv.style.cssText = "color: " + getUsernameColor(data.username || data.owner);

  let messageBodyDiv = document.createElement('span');
  messageBodyDiv.classList.add('messageBody');
  if (data.title) {
    messageDiv.classList.add('newgame');
    let anchor = document.createElement('a');
    anchor.setAttribute('href', '/games/' + data.title);
    let message = document.createTextNode("I am starting a new game, '" + data.title + "', click to join!");
    anchor.appendChild(message);
    messageBodyDiv.appendChild(anchor)
  } else {
    messageBodyDiv.textContent = data.message;
  }


  messageDiv.classList.add('message')
  if (data.typing) {
    messageDiv.classList.add('typing');
  }
  messageDiv.appendChild(usernameDiv);
  messageDiv.appendChild(messageBodyDiv);
  sessionStorage.setItem('username', data.username);

  addMessageElement(messageDiv, options);
}

// Adds the visual chat typing message
function addChatTyping(data) {
  data.typing = true;
  data.message = 'is typing';
  addChatMessage(data);
}

// Removes the visual chat typing message
//TODO
function removeChatTyping(data) {
  let msgs = getTypingMessages(data);
  sessionStorage.clear();
  removeNodes(msgs);
  // .fadeOut(function () {
  //   $(this).remove();
  // });
}

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
function addMessageElement(el, options) {
  // Setup default options
  if (!options) {
    options = {};
  }
  if (typeof options.fade === 'undefined') {
    options.fade = true;
  }
  if (typeof options.prepend === 'undefined') {
    options.prepend = false;
  }

  // Apply options
  if (options.fade) {
    let list = el.classList;
    list.add('displayNone');
    list.remove('displayNone');
    list.add('fade_in');
  }
  if (options.prepend) {
    var temp = messages.firstChild;
    messages.insertBefore(el, temp);
  } else {
    messages.append(el);
  }
  messages.firstChild.scrollTop = messages.firstChild.scrollHeight;
}

// Prevents input from having injected markup
function cleanInput(input) {
  let div = document.createElement('div');
  let text = document.createTextNode(input);
  div.appendChild(text);
  let str = div.textContent;
  return str;
}

// Updates the typing event
function updateTyping() {
  if (connected) {
    if (!typing) {
      typing = true;
      socket.emit('typing');
    }
    lastTypingTime = (new Date()).getTime();

    setTimeout(function () {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing');
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  }
}

// Gets the 'X is typing' messages of a user
function getTypingMessages(data) {
  let typingMessage = document.getElementsByClassName('typing message');
  let username = sessionStorage.getItem('username');
  let typingMessageArray = Array.from(typingMessage);
  return typingMessageArray.filter(function (msg) {
    let tempName = msg.getElementsByClassName('username');
    return username === tempName[0].textContent;
  });
}

// Gets the color of a username through our hash function
function getUsernameColor(username) {
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}

// Keyboard events

window.addEventListener('keydown', function (event) {
  // Auto-focus the current input when a key is typed
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    currentInput.focus();
  }
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    } else {
      setUsername();
    }
  }
});

inputMessage.addEventListener('input', function () {
  updateTyping();
});

// Click events


// Focus input when clicking on the message input's border
inputMessage.click(function () {
  inputMessage.focus();
});

// Socket events
socket.on('gameStarting', function (data) {
  addChatMessage(data);
  let n = new Notification('Game is starting!', {
    body: "Check the chat to join",
    requireInteraction: true
  })
});
// Whenever the server emits 'login', log the login message
socket.on('login', function (data) {
  connected = true;
  // Display the welcome message
  var message = "Welcome to ACES chat! Have fun!";
  log(message, {
    prepend: true
  });
  addParticipantsMessage(data);
});

// Whenever the server emits 'new message', update the chat body
socket.on('new message', function (data) {
  addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function (data) {
  log(data.username + ' joined');
  addParticipantsMessage(data);
});

// Whenever the server emits 'user left', log it in the chat body
socket.on('user left', function (data) {
  log(data.username + ' left');
  addParticipantsMessage(data);
  removeChatTyping(data);
});

// Whenever the server emits 'typing', show the typing message
socket.on('typing', function (data) {
  addChatTyping(data);
});

// Whenever the server emits 'stop typing', kill the typing message
socket.on('stop typing', function (data) {
  removeChatTyping(data);
});

socket.on('disconnect', function () {
  log('you have been disconnected');
});

socket.on('reconnect', function () {
  log('you have been reconnected');
  if (username) {
    socket.emit('add user', username);
  }
});

socket.on('reconnect_error', function () {
  log('attempt to reconnect has failed');
});