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


    chatbox.init = function() {

        console.log('Chatbox Init');

        // load jquery objects and register events
        for (var i = 0; i < ui.init.length; i++) {
            ui.init[i]();
        }

        var config = chatbox.config;
        console.log('config.open_chatbox_when: ' + config.open_chatbox_when);

        // Show/hide chatbox base on chrome storage value
        if (config.open_chatbox_when == "full_size") {
            ui.maximize();
        } 
        else if (config.open_chatbox_when == "minimized") {
            ui.minimize();
        }


        chatbox.roomID = location.search.substring(1);
        console.log('room ' + chatbox.roomID);



        historyHandler.load();
        // now make your connection with server!
        chatbox.connect();


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


        if (config.chatbox_username) {
            console.log("username from local storage: " + config.chatbox_username);
            chatbox.username = config.chatbox_username; 
        }else {
            console.log("no username in local storage");
        }


        if (config.uuid) {
            console.log("Found user id " + config.uuid);
            chatbox.uuid = config.uuid;

        } else {

            chatbox.uuid = chatbox.utils.guid();
            config.uuid =  chatbox.uuid;
            chrome.storage.local.set({ chatbox_config: config });

            console.log("Creating new user id " + chatbox.uuid);
        }

        chatbox.init();

    });


});
