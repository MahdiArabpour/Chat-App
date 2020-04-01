let socket = io();

function scrollToBottom(){
    let message = document.querySelector('#messages').lastElementChild;
    message.scrollIntoView();
}

socket.on('connect', function(){
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"')+'"}');

    socket.emit('join', params, function(err){
        if(err){
            alert(err);
            window.location.href = '/';
        }
    });
});

socket.on('disconnect', function(){
    console.log('Disconnected from server.');
});

socket.on('newMessage', function(message){
    const formatedTime = moment(message.createdAt).format('LT');
    const template = document.querySelector('#message-template').innerHTML;
    const html = Mustache.render(template,{
        from: message.from,
        text:message.text,
        createdAt: formatedTime,
    });

    const div = document.createElement('div');
    div.innerHTML = html;

    document.querySelector('#messages').appendChild(div);

    scrollToBottom();
});
socket.on('newLocationMessage', function(message){
    const formatedTime = moment(message.createdAt).format('LT');
    const template = document.querySelector('#location-message-template').innerHTML;

    const html = Mustache.render(template,{
        from: message.from,
        url: message.url,
        createdAt: formatedTime,
    });

    const div = document.createElement('div');
    div.innerHTML = html;

    document.querySelector('#messages').appendChild(div);
    
    scrollToBottom();
});

document.querySelector('#submit-btn')
    .addEventListener('click',function(e){
        e.preventDefault();
        socket.emit('createMessage',{
            from: "User",
            text: document.querySelector('input[name="message"]').value,
        }, function(message){});

        document.querySelector('input[name="message"]').value = "";
    }
);

document.querySelector('#send-location-btn')
    .addEventListener('click',function(e){
        if(!navigator.geolocation) return alert('Geolocation is not supported by your browser!');
        navigator.geolocation.getCurrentPosition(function(position){
            socket.emit('createLocationMessage',{
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        },function(){
            alert('Unable to fetch location!');
        });
});