const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log('Listening on ' + PORT));

var io = socketIO(server);

var users =  {};


var messages = [];


var history = 5;


io.on('connection', function(socket) {
   
    var newUser = false;
    console.log("Nouvel Utilisateur");

    //Save users in object
    for(var u in users){
      socket.emit('new', users[u]);
    
    }

    //Save messages inarray
    for(var m in messages){
       socket.emit('newmsg', messages[m])
    
    }


     //receive message
   socket.on('newmsg', function(message){
        message.user = newUser;
        date = new Date();
        message.h = date.getHours();
        message.m = date.getMinutes();
        messages.push(message);
        if(messages.length > history){
            messages.shift();
        }

        //Post message in chatroom
  io.emit('newmsg', message);
    });


    //listen login user
   socket.on('login', function(user){

        newUser = user;
        newUser.id = user.mail.replace('@', '-').replace('.', '-');
        newUser.avatar = 'kimt.jpg';
        console.log(newUser);
        if (newUser.username === '' || newUser.mail === ''){
            console.log("vide");
            socket.emit('noLogged');
        } else {
            users[newUser.id] = newUser;
         socket.emit('logged');
       io.emit('new', newUser);
          socket.emit('connecterU', newUser);
          socket.broadcast.emit('newt', newUser);
        }
       
     
    });


    //Listen logout user  
   socket.on('disconnect', function(){
        if(!newUser){
            return false;
        }

        delete users[newUser.id];
        io.emit('deco', newUser);
    });
     
});

