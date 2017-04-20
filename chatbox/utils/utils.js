(function() {

    "use strict";
    window.chatbox = window.chatbox || {}; 
    var utils = {};
    chatbox.utils = utils;
    
    function updateIframeSize(state) {
        var resizeMsg = {};
        resizeMsg.state = state;


        if (state == "full size") {
            // This weird show/hide hack is to ease the 
            // problem when iframe got full sized, the 
            // chatbox UI is resized for 1/10 sec
            $("body").css({
                transition : 'background-color 0.5s ease-in-out',
                "background-color": "rgba(255, 255, 255, 0.75)"
            });

            chatbox.ui.$chatBox.hide();

            setTimeout(function(){ 
                chatbox.ui.$chatBox.fadeIn('fast');
            }, 100);
        }

        if (state == "close") 
            chatbox.showing = false;

        if (state == "fit") {
            $("body").css({
                transition : 'background-color 0.5s ease-in-out',
                "background-color": "transparent"
            });
            chatbox.ui.$chatBox.hide();
            setTimeout(function(){ 
                chatbox.ui.$chatBox.fadeIn('fast');
            }, 100);
        }

        resizeMsg.size = { height: $('.socketchatbox-page').height(), width: $('#socketchatbox-body').width()};
        window.parent.postMessage(resizeMsg, "*");

    }
    utils.updateIframeSize = updateIframeSize;

    // generate a unique guid for each browser, will pass in cookie
    utils.guid = function() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };


    function getCookie(cname) {

        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
        }

        return "";
    }

    utils.getCookie = getCookie;

    function addCookie(cname, cvalue) {

        var exdays = 365;
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; domain=" + getCookieDomain() + "; path=/";
    }

    utils.addCookie = addCookie;


    function doNothing(e){

        e.preventDefault();
        e.stopPropagation();
    }

    utils.doNothing = doNothing;

    function getCookieDomain() {

        var host = location.hostname;
        var ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        if (ip.test(host) === true || host === 'localhost') return host;
        var regex = /([^]*).*/;
        var match = host.match(regex);
        if (typeof match !== "undefined" && null !== match) {
            host = match[1];
        }
        if (typeof host !== "undefined" && null !== host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
            host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return '.' + host;
    }

    function checkImageUrl(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) !== null);
    }
    utils.checkImageUrl = checkImageUrl;

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').html(input).text();
    }
    utils.cleanInput = cleanInput;

})();

// just to center bootstrap modals
(function ($) {
    "use strict";
    function centerModal() {
        $(this).css('display', 'block');
        var $dialog  = $(this).find(".modal-dialog"),
        offset       = ($(window).height() - $dialog.height()) / 2,
        bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if(offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}(jQuery));
