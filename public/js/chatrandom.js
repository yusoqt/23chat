

(function connect() {
    let randomrooms = io.connect("http://localhost:5000/random")
    var connected = false;

    randomrooms.on('conncet', data => {
        connected = true;
    })

    
    randomrooms.on('chat start', data => {
        room = data;
        document.getElementById("wait").innerHTML = ''
        document.getElementById("roomnum").innerText = room
    })

    let username = document.querySelector('#username');
    let usernameBtn = document.querySelector('#usernameBtn');
    let curUsername = document.querySelector('.card-header .changename');

    usernameBtn.addEventListener('click', e => {
        console.log(username.value);
        randomrooms.emit('change_username', { username: username.value })
        curUsername.textContent = username.value 
        username.value = ''
    }) 

    let message = document.querySelector('#message');
    let messageBtn = document.querySelector('#messageBtn');
    let messageList = document.querySelector('#message-list');

    messageBtn.addEventListener('click', e => {
        console.log(message.value)
        randomrooms.emit('new_message', { message: message.value})
        message.value = ''

    })

    randomrooms.on('receive_message', data => {
        console.log(data)
        let listItem = document.createElement('li')
        listItem.textContent = data.username + " : " + data.message;
        listItem.classList.add('list-group-item');
        messageList.appendChild(listItem) 
    })

    let info = document.querySelector('.info');

    message.addEventListener('keypress', e => {
        randomrooms.emit('typing')
    })

    randomrooms.on('typing', data => {
        info.textContent = data.username + " กำลังพิมพ์..."
        setTimeout(() => { info.textContent = ''}, 2000)
    })

})();