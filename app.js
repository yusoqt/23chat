const express = require("express");
const socketio = require("socket.io");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("server is running...");
});

// Initialize socket for the server
// const io = socketio(server);

const io = socketio(server,{
    cors: {
            origin: "http://localhost",
            methods: ["GET", "POST"],
            credentials: true,
            transports: ['websocket', 'polling'],
    },
    allowEIO3: true
    });

const normalrooms = io.of('/nmroom')

const randomrooms = io.of('/random')


// default io

io.on("connection", socket => {
  socket.username = "นิรนาม"

  socket.on("change_username", data => {
    socket.username = data.username
  })

  // handle the new message event
  socket.on("new_message", data => {
    console.log("new messsage");
    io.sockets.emit("receive_message", { message: data.message, username: socket.username})
  })

  socket.on('typing', data => {
    socket.broadcast.emit('typing', { username: socket.username })
  })
})

// normalrooms 

normalrooms.on("connection", socket => {
  console.log("New user connected in normal rooms");

  socket.on("disconnect", data => {
    console.log("User disconnect");
  })

});


// randomroom

var waiting_list=[];
var temp_partner;
var num_users=0;
var faker = require("faker")

// random room system

randomrooms.on("connection", socket => {
    num_users++;
    socket.partner=null;
    socket.username='anonymous-'+faker.name.firstName();
    socket.avatar=faker.internet.avatar();
    socket.emit("init",{username:socket.username,avatar:socket.avatar,my_id:socket.id});
 
    if(waiting_list.length>0){
        temp_partner=waiting_list[0];
        socket.partner=temp_partner;
        waiting_list.splice(0,1);
        socket.broadcast.to(temp_partner).emit("partner", {id:socket.id,username:socket.username,avatar:socket.avatar});
    }else{
        waiting_list.push(socket.id);
    }
    console.log("Active Users = "+num_users+",Waiting list size="+waiting_list.length);
 
    socket.on('chat message', function(data){
        // var msg = emoji.parse(data.msg, '/emoji/images');
        var msg=data.msg;
        var target=data.target;
        var source=socket.id;
        socket.broadcast.to(target).emit("chat message partner", msg);
        randomrooms.to(source).emit("chat message mine", msg);
    });
 
    socket.on('partner', function(packet){
        socket.partner=packet.target;
        socket.broadcast.to(socket.partner).emit("partner", packet.data);
    });
 
    socket.on('disconnect', function () {
        if(socket.partner!=null){
            socket.broadcast.to(socket.partner).emit("typing", false);
               socket.broadcast.to(socket.partner).emit("disconnecting now", 'Your Partner has disconnected . Refresh page to chat again');
        }
        else{
            waiting_list.splice(0,1);
        }
        num_users--;
        console.log("Active Users = "+num_users+",Waiting List="+waiting_list.length);
    });
 
    socket.on('typing',function (data) {
        socket.broadcast.to(socket.partner).emit("typing", data);
    })
});

