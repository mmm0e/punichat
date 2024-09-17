let isMySelf = true;

let sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', function() {

  let inputMessage = document.getElementById('inputMessage');
  let messageText = inputMessage.value;

  if (messageText == '') {
    return;
  }

  let messageBox = document.createElement('div');

  if (isMySelf) {
    messageBox.classList.add('box-right');
  } else {
    messageBox.classList.add('box-left');
  }

  let message = document.createElement('p');
  message.textContent = messageText;
  message.classList.add('message-box');

  if (isMySelf) {
    message.classList.add('green');
  } else {
    message.classList.add('white');
  }

  messageBox.appendChild(message);

  let room = document.getElementById('room');

  room.appendChild(messageBox);

  isMySelf = !isMySelf;

  inputMessage.value = '';
})