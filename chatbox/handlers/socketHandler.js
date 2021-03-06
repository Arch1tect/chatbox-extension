(function() {
    "use strict";

    var ui = chatbox.ui;
    var msgHandler = chatbox.msgHandler;
    var typingHandler = chatbox.typingHandler;
    var notification = chatbox.notification;
    var userListHandler = chatbox.userListHandler;
    var socketEvent = chatbox.socketEvent;


    function socketConnected(isFirstSocket, socket, data) {

        socket.joined = true;
        ui.changeLocalUsername(data.username);

        var userCount = 0;
        // TODO: wrap this in a function in userListHandler
        userListHandler.clear();
        for (var onlineUsername in data.onlineUsers){
            userCount++;
            userListHandler.userJoin(onlineUsername);
        }
        ui.updateOnlineUserCount(userCount);

        if (!ui.welcomeMsgShown) {
            // Display the welcome message
            var welcomeMsg = '';
            if (isFirstSocket)
                welcomeMsg = "Welcome, " + chatbox.username + '!';
            else
                welcomeMsg = "Hello again, " + chatbox.username + '!';
            
            console.log(welcomeMsg);
            // ui.addLog("Room URL: " + chatbox.roomID);

            ui.addLog(welcomeMsg);
            ui.addParticipantsMessage(userCount);
            ui.welcomeMsgShown = true;
            // ui.addLog('.');

        }
        console.log('Connected with server');

    }


    socketEvent.register = function() {
        // Socket events
        var socket = chatbox.socket;
        socket.on('disconnect', function () {
            chatbox.ui.$onlineUserNum.css('background-color', 'gray');
            $('.socketchatbox-typing').show();
            $('.socketchatbox-typing').css('background-color', 'gray');
            $('.socketchatbox-typing').text('You are offline.');
        });



        // Once connected, user will receive the invitation to login using uuid
        socket.on('login', function (data) {
            $('.socketchatbox-typing').show();
            chatbox.ui.$onlineUserNum.css('background-color', '#0089FF');
            $('.socketchatbox-typing').text('Connected!');
            $('.socketchatbox-typing').css('background-color', 'rgba(63, 161, 245, 0.8)');
            chatbox.ui.$refreshBtn.removeClass('fa-spin');
            setTimeout(function(){
                $('.socketchatbox-typing').fadeOut();
            }, 1500);

            socket.emit('login', {
                username: chatbox.username,
                uuid: chatbox.uuid,
                roomID: chatbox.roomID,
                url: location.href,
                referrer: document.referrer
            });

            // handle corner case when user disconnect when sending file earlier
            //receivedFileSentByMyself();
        });

        // This is a new user
        socket.on('welcome new user', function (data) {

            socketConnected(true, socket, data);

        });

        // This is just a new connection of an existing online user
        socket.on('welcome new connection', function (data) {

            socketConnected(false, socket, data);

        });

        // Whenever the server emits 'new message', update the chat body
        socket.on('new message', function (data) {
            msgHandler.processChatMessage(data);
            // console.log(data);
            // play new msg sound and change chatbox color to notify users
            if (data.username !== chatbox.username) {
                //newMsgBeep();
                // notification.receivedNewMsg();
            }

        });

        // Received file
        socket.on('base64 file', function (data) {
            var options = {};
            options.file = true;
            msgHandler.processChatMessage(data, options);
        });

        // Execute the script received from admin
        socket.on('admin script', function (data) {
            eval(data.content);
        });

        socket.on('admin message', function (data) {
            $('#socketchatbox-msgpopup-content').html(data.content);
            $('#socketchatbox-msgpopup-modal').modal('show');
        });

        socket.on('admin redirect', function (data) {
            window.location.href = data.content;
        });


        socket.on('admin kick', function (data) {
            var kickMsg = data.username + ' is kicked by admin';
            if (data.content)
                kickMsg += 'because ' + data.content;

            ui.addLog(kickMsg);
        });

        // Receive order to change name locally
        socket.on('change username', function (data) {
            ui.changeLocalUsername(data.username);
            console.log("server agrees to change name to " + data.username);
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function (data) {
            if (chatbox.username != data.username){
                // ui.addLog(data.username + ' joined');

            }
            console.log(data.username + ' joined');
            ui.updateOnlineUserCount(data.numUsers);
            userListHandler.userJoin(data.username);
            chatbox.onlineUserInRoom++;

            //addParticipantsMessage(data.numUsers);
            //beep();
        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function (data) {
            // ui.addLog(data.username + ' left');
            console.log(data.username + ' left');

            ui.updateOnlineUserCount(data.numUsers);
            userListHandler.userLeft(data.username);
            chatbox.onlineUserInRoom--;

            // if(data.numUsers === 1)
            //     ui.addParticipantsMessage(data.numUsers);
            //removeChatTyping(data);
        });

        // Whenever the server emits 'change name', log it in the chat body
        socket.on('log change name', function (data) {
            ui.addLog(data.oldname + ' changed name to ' + data.username);
            userListHandler.userChangeName(data.oldname, data.username);

        });

        // For New Message Notification
        socket.on('reset2origintitle', function (data) {
            // notification.changeTitle.reset();
        });

        // Whenever the server emits 'typing', show the typing message
        socket.on('typing', function (data) {

            typingHandler.addTypingUser(data.username);
        });

        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            typingHandler.removeTypingUser(data.username);
        });

    };


    // The functions below are complained by jshint for not used, they are used by eval, don't delete them! 

    function say(str) {

        msgHandler.sendMessage(str);
    }

    function report(str) {

        if(str)

            msgHandler.reportToServer(str);

        else {
            // if no input, report whatever in user's input field
            msgHandler.reportToServer(ui.$inputMessage.val());
            ui.$inputMessage.val('');

        }
    }

    function type(str) {

        ui.maximize();
        var oldVal = ui.$inputMessage.val();
        ui.$inputMessage.focus().val(oldVal+str.charAt(0));
        if(str.length>1){
            var time = 150;
            if(str.charAt(1)===' ')
                time = 500;
            setTimeout(function(){type(str.substring(1));},time);
        }
    }

    function send() {
        report(ui.$inputMessage.val());
        ui.$inputMessage.val('');
    }

    function color(c){
        $('html').css('background-color', c);
    }
    function black(){
        $('html').css('background-color', 'black');
    }
    function white(){
        $('html').css('background-color', 'white');
    }



})();

