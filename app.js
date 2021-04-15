// Express
const express = require('express')
const app = express()

// Socket
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)

// Initial
//app.set('view engine', 'ejs')
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/sweetalert2', express.static(__dirname + '/node_modules/sweetalert2/dist'))

// Routing
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

let lastMsgUserId
let onlineList = []
io.on('connection', (socket) => {
    // Initial
    socket.username = getUsername("Anonymous", socket)
    
    // Events
    socket.on('sendMsg', msg => {
        io.emit('getMsg', (lastMsgUserId != socket.username ? socket.username + "<br/>" : "") + msg)
        lastMsgUserId = socket.username
    })
    socket.on('changeUsername', username => {
        socket.username = getUsername((username ? username : "Anonymous"), socket)
        io.emit('getMsg', socket.username + ": has connected")

        onlineList.push(socket.username)
        io.emit('getOnlineUser', getOnlineUserTxt())
    })

    // End
    socket.on('disconnect', msg => {
        onlineList = getRemoveArray(onlineList, socket.username)
        io.emit('getOnlineUser', getOnlineUserTxt())
        io.emit('getMsg', socket.username + ": has disconnected")
    })
})

function getUsername(username, socket) {
    return "<x class='username'>" + username  + " (" + socket.id.toString().substring(0, 4) + ")</x>"
}

function getOnlineUserTxt() {
    let result = "";
    for (let i = 0; i < onlineList.length; i++) {
        result += onlineList[i] + "<br/>";
    }
    return result
}

function getRemoveArray(arr, whichVal) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == whichVal) { arr.splice(i, 1); }
    }
    return arr
}

server.listen(3000)