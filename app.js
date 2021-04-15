// Express
const express = require('express')
const app = express()

// Socket
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)

// Initial
//app.set('view engine', 'ejs')
app.use('/images', express.static(__dirname + '/public/images'))
app.use('/sounds', express.static(__dirname + '/public/sounds'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/sweetalert2', express.static(__dirname + '/node_modules/sweetalert2/dist'))

// Routing
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

let lastMsgUser, lastMsgTime
let onlineList = []
io.on('connection', (socket) => {
    // Initial
    socket.username = getUsername("Anonymous", socket)
    
    // Events
    socket.on('initial', x => {
        io.emit('getSocketId', socket.id)
    })

    socket.on('sendMsg', msg => {
        let currTimeTxt = getCurrTimeTxt()
        if (lastMsgUser != socket.username || lastMsgTime != currTimeTxt) {
            io.emit('getMsg', {
                'msg' : socket.username + currTimeTxt + ": <br/>" + msg,
                'senderSid' : socket.id
            })
            lastMsgUser = socket.username
            lastMsgTime = currTimeTxt
        }
        else {
            io.emit('getMsg', {
                'msg' : msg,
                'senderSid' : socket.id
            })
        }
    })

    socket.on('changeUsername', username => {
        socket.username = getUsername((username ? username : "Anonymous"), socket)
        io.emit('getMsg', {
            'msg' : socket.username + getCurrTimeTxt() + ": has connected",
            'senderSid' : -1
        })

        onlineList.push(socket.username)
        io.emit('getOnlineUser', getOnlineUserTxt())
    })

    // End
    socket.on('disconnect', msg => {
        onlineList = getRemoveArray(onlineList, socket.username)
        io.emit('getOnlineUser', getOnlineUserTxt())
        io.emit('getMsg', {
            'msg' : socket.username + getCurrTimeTxt() + ": has disconnected",
            'senderSid' : -1
        })
    })
})

function getUsername(username, socket) {
    return "<x class='username'>" + username  + " [" + socket.id.toString().substring(0, 4) + "]</x>"
}

function getOnlineUserTxt() {
    let result = ""
    for (let i = 0; i < onlineList.length; i++) {
        result += onlineList[i] + "<br/>"
    }
    return result
}

function getRemoveArray(arr, whichVal) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == whichVal) arr.splice(i, 1)
    }
    return arr
}

function getCurrTimeTxt() {
    let curTime = new Date()
    return " (" + curTime.getHours() + ":" + curTime.getMinutes() + ")"
}

server.listen(3000)