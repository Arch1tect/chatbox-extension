(function() {
    "use strict";
    window.chatbox = window.chatbox || {};
    chatbox.ui = {};
    chatbox.ui.init = []; //init is an array of functions
    chatbox.historyHandler = {};
    chatbox.userListHandler = {};
    chatbox.fileHandler = {};
    chatbox.msgHandler = {};
    chatbox.typingHandler = {};
    chatbox.notification = {};
    chatbox.socketEvent = {};

    // var utils = chatbox.utils;
    var ui = chatbox.ui;
    var historyHandler = chatbox.historyHandler;
    var socketEvent = chatbox.socketEvent;

    // change this to the port you want to use on server if you are hosting
    // TODO: move to config file
    chatbox.domain = "https://quotime.me";
    // chatbox.inboxUrl = "http://localhost:9000";
    chatbox.inboxUrl = chatbox.domain;
    // chatbox.domain = "https://localhost";
    // chatbox.domain = "http://localhost:8088";

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user,
    // multiple connections from same browser are regarded as same user.
    chatbox.uuid = "uuid not set!";
    chatbox.NAME = 'Chatbox';

    var d = new Date();
    var username = 'user-'+ (''+d.getMinutes()).slice(-1)+ d.getSeconds();
    chatbox.username = username;

    chatbox.inbox = {};

    chatbox.inbox.keepPullingMessages = function() {
        chatbox.inbox.pullMessages();

        var interval = 15*1000;
        if(ui.$inboxArea.is(':visible')) 
            interval = 2*1000;
        setTimeout(function(){chatbox.inbox.keepPullingMessages();}, interval);
    }

    // This is pulling all messages, makes sense for first load
    // but we only need to pull front-end opened conversation for the long-pulling
    chatbox.inbox.pullMessages = function() {
        $.get(chatbox.inboxUrl + "/db/message/user/" + chatbox.uuid, function(data, status) {
            chatbox.inbox.messages = data.sort(sortByMsgId);



            var index = 0;
            for (; index<chatbox.inbox.messages.length; index++) {

                var msg = chatbox.inbox.messages[index];
                chatbox.ui.updateInboxContactList(msg.sender, msg.sendername);
                chatbox.ui.updateInboxContactList(msg.receiver, msg.receivername);

            }

            
            // console.log(data);
            chatbox.ui.renderInboxMessage();
        });
    }

    function sortByMsgId(a, b) {
        return a.id > b.id ? 1 : -1;
    }

    chatbox.init = function() {

        console.log('Chatbox Init');


        var config = chatbox.config;


        if (config.lockRoom) {

            chatbox.roomID = config.roomID;

        } else {

            chatbox.roomID = location.search.substring(1);
            config.roomID = chatbox.roomID;
            chrome.storage.local.set({ chatbox_config: config });

        }

        console.log('room ' + chatbox.roomID);



        // load jquery objects and register ui events
        for (var i = 0; i < ui.init.length; i++) {
            ui.init[i]();
        }

        historyHandler.load();

        chatbox.inbox.keepPullingMessages();

        // now make your connection with server!
        chatbox.connect();

        console.log('config.open_chatbox_when: ' + config.open_chatbox_when);

        // Show/hide chatbox base on chrome storage value
        if (config.open_chatbox_when == "full_size") {
            ui.maximize();
        } 
        else if (config.open_chatbox_when == "minimized") {
            ui.minimize();
        }
    };

    chatbox.connect = function() {
        chatbox.socket = io(chatbox.domain, {path:'/socket.io'});
        chatbox.socket.joined = false;
        socketEvent.register();
    }


})();

$( document ).ready(function() {

    chrome.storage.local.get('chatbox_config', function(data) {

        chatbox.config = data.chatbox_config || {};

        var config = chatbox.config;


        if (config.uuid) {
            console.log("Found user id " + config.uuid);
            chatbox.uuid = config.uuid;

        } else {

            chatbox.uuid = chatbox.utils.guid();
            config.uuid =  chatbox.uuid;

            console.log("Creating new user id " + chatbox.uuid);
        }

        if (config.chatbox_username) {
            console.log("username from local storage: " + config.chatbox_username);
            chatbox.username = config.chatbox_username; 
        }else {
            console.log("no username in local storage, send default name to server db");
            var payload = {
                'uuid': chatbox.uuid,
                'name': chatbox.username
            }
            $.post(chatbox.inboxUrl + "/db/user/change_name", payload, function(resp) {
              console.log(resp);
            });
            config.chatbox_username = chatbox.username; 

        }
        
        chrome.storage.local.set({ chatbox_config: config });

        chatbox.init();

    });


});
