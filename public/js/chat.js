const socket = io();
//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#msg');
const $messageFormButton = document.querySelector('button');
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages');



//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoscroll = () => {
    //new element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    
    //height of messages container
    const containerHeight = $messages.scrollHeight
    
    //how far I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message)=> {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('location-message', (message)=> {
    console.log(message)

    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html 
})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault();
    
    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = $messageFormInput.value
    // const message = e.target.element.message.value

    socket.emit('sendMessage', message, (error)=>{
        
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error) {
            return console.log(error)
        }
        console.log('Message is Delivered' )
    });
})

$locationButton.addEventListener('click', (e)=> {
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your device')
    }
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            lat: position.coords.latitude, 
            long: position.coords.longitude
        }, (error)=> {
            if(error) {
                return console.log(error)
            }
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href= '/'
    }
})