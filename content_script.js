/*-----------------------
* Scroll to Top Button
* by Cody Sherman (versions < 6.1.3), http://codysherman.com/
*
* Brought back to life by PoziWorld
* 
* Copyright (c) 2011 Cody Sherman (versions < 6.1.3)
* Copyright (c) 2014-2016 PoziWorld
* 
* Licensed under the MIT License
* http://www.opensource.org/licenses/mit-license.php
*
* Original source code at: http://github.com/codysherman/Scroll-to-Top-Button-Extension
* Forked source code at: http://github.com/PoziWorld/Scroll-to-Top-Button-Extension
-----------------------*/

if ( sttb.isWindowReady() ) {
    ContentScript.init();
}
else {
    sttb.watch();
}

/**
 * Main function, sets up the button
 *
 * @type    method
 * @param   No Parameters Taken
 * @return  void
 **/

function STTB() {
    // Removes the built-in button when on Tumblr
    if (window.location.href.indexOf('http://www.tumblr.com/') != -1) {
        var alreadyHasIt=['http://www.tumblr.com/dashboard','http://www.tumblr.com/tumblelog/','http://www.tumblr.com/messages','http://www.tumblr.com/tagged/','http://www.tumblr.com/liked/by/','http://www.tumblr.com/likes'];
        $.each( alreadyHasIt, function(i, urlString){
            if (window.location.href.indexOf( urlString ) != -1) {
                $('#return_to_top').remove();
            }
        })
    }

    // Asks Background for [LocalStorage] settings from Options Page and assigns them to variables
    chrome.runtime.sendMessage({greeting: "settings"}, function(response) {
        var speed = parseInt(response.speed);
        var speed2 = parseInt(response.speed2);
        var distance = parseInt(response.distance);
        var flipDistance = parseInt(response.distance);
        var size = response.size;
        var arrow = response.arrow;
        var scroll = response.scroll;
        var location = response.location;
        var stbb = response.stbb;
        var transparency = response.transparency;
        var shortcuts = response.shortcuts;
        var homeendaction = response.homeendaction;

        // Assigns the correct arrow color to imgURL
        if (stbb == "dual"){
            var imgURL=chrome.extension.getURL("arrows/dual/"+arrow+".png");
        }
        else{
            var imgURL=chrome.extension.getURL("arrows/"+arrow+".png");
        }

        var $body;

        // Creates the button image on the page
        if ( stbb !== 'keys' ) {
            $body = $( 'body' );

            $body.after( // Have to use after. Otherwise, Bing search results page removes #STTBimg in dual-arrow mode
                '<img id="STTBimg" />' +
                // Don't show buttons when JavaScript is disabled
                '<noscript>' +
                  '<style>' +
                      '#STTBimg, #STTBimg2 { display: none !important; }' +
                  '</style>' +
                '</noscript>'
            );
        }

        if(stbb=="flip"){
            $("#STTBimg").rotate(-180);
        }

        var $sttbImg = document.getElementById( 'STTBimg' );

        if ( document.contains( $sttbImg ) ) {
            // TODO: Move moveable properties to .css
            $sttbImg.style.opacity = transparency;
            $sttbImg.src=imgURL;
            $sttbImg.style.position = 'fixed';
            $sttbImg.style.width = size;
            $sttbImg.style.height = 'auto';
            $sttbImg.style.display = 'none';
            $sttbImg.style.zIndex = 2147483647;
            $sttbImg.style.border = '0px';
            $sttbImg.style.padding = '0px';

            if (location == "TR") {
                $sttbImg.style.top = '20px';
                $sttbImg.style.right = '20px';
                $sttbImg.style.margin = '0px 0px 0px 0px';
            }
            else if (location == "TL") {
                $sttbImg.style.top = '20px';
                $sttbImg.style.left = '20px';
                $sttbImg.style.margin = '0px 0px 0px 0px';
            }
            else if ((location == "BR") && (stbb != "dual")) {
                $sttbImg.style.bottom = '20px';
                $sttbImg.style.right = '20px';
                $sttbImg.style.margin = '0px 0px 0px 0px';
            }
            else if ((location == "BR") && (stbb == "dual")) {
                adjust=parseInt(size) / 2 + 22;
                adjusted=adjust + "px";
                $sttbImg.style.bottom = adjusted;
                $sttbImg.style.right = '20px';
                $sttbImg.style.margin = '0px 0px 0px 0px';
            }
            else if ((location == "BL") && (stbb != "dual")) {
                $sttbImg.style.bottom = '20px';
                $sttbImg.style.left = '20px';
                $sttbImg.style.margin = '0px 0px 0px 0px';
            }
            else if ((location == "BL") && (stbb == "dual")) {
                adjust=parseInt(size) / 2 + 22;
                adjusted=adjust + "px";
                $sttbImg.style.bottom = adjusted;
                $sttbImg.style.left = '20px';
                $sttbImg.style.margin = '0px 0px 0px 0px';
            }
            else if (location == "CR") {
                adjust="-" + parseInt(size) / 2 + "px 0px 0px 0px";
                $sttbImg.style.right = '20px';
                $sttbImg.style.top = '50%';
                $sttbImg.style.margin = adjust;
            }
            else if (location == "CL") {
                adjust="-" + parseInt(size) / 2 + "px 0px 0px 0px";
                $sttbImg.style.left = '20px';
                $sttbImg.style.top = '50%';
                $sttbImg.style.margin = adjust;
            }
            else if (location == "TC") {
                adjust="0px -" + parseInt(size) / 2 + "px 0px 0px";
                $sttbImg.style.top = '20px';
                $sttbImg.style.right = '50%';
                $sttbImg.style.margin = adjust;
            }
            else if ((location == "BC") && (stbb != "dual")) {
                adjust="0px -" + parseInt(size) / 2 + "px 0px 0px";
                $sttbImg.style.bottom = '20px';
                $sttbImg.style.right = '50%';
                $sttbImg.style.margin = adjust;
            }
            else if ((location == "BC") && (stbb == "dual")) {
                adjust="0px -" + parseInt(size) / 2 + "px " + "0px 0px";
                adjust2=parseInt(size) / 2 + 22;
                adjusted=adjust2 + "px";
                $sttbImg.style.bottom = adjusted;
                $sttbImg.style.right = '50%';
                $sttbImg.style.margin = adjust;
            }
        }

        if(stbb=="dual"){
            $body.after( '<img id="STTBimg2" />' ); // Have to use after. Otherwise, Bing search results page removes #STTBimg in dual-arrow mode
            $("#STTBimg2").rotate(-180);
            var $sttbImg2 = document.getElementById( 'STTBimg2' );
            $sttbImg2.style.opacity = transparency;
            $sttbImg2.src=imgURL;
            $sttbImg2.style.position = 'fixed';
            $sttbImg2.style.width = size;
            $sttbImg2.style.height = 'auto';
            $sttbImg2.style.display = 'none';
            $sttbImg2.style.zIndex = 2147483647;
            $sttbImg2.style.border = '0px';
            $sttbImg2.style.padding = '0px';
            if (location == "TR") {
                adjust=parseInt(size) / 2 + 22;
                adjusted=adjust + "px";
                $sttbImg2.style.top = adjusted;
                $sttbImg2.style.right = '20px';
                $sttbImg2.style.margin = '0px 0px 0px 0px';
            }
            else if (location == "TL") {
                adjust=parseInt(size) / 2 + 22;
                adjusted=adjust + "px";
                $sttbImg2.style.top = adjusted;
                $sttbImg2.style.left = '20px';
                $sttbImg2.style.margin = '0px 0px 0px 0px';
            }
            else if (location == "BR") {
                $sttbImg2.style.bottom = '20px';
                $sttbImg2.style.right = '20px';
                $sttbImg2.style.margin = '0px 0px 0px 0px';
            }
            else if (location == "BL") {
                $sttbImg2.style.bottom = '20px';
                $sttbImg2.style.left = '20px';
                $sttbImg2.style.margin = '0px 0px 0px 0px';
            }
            else if (location == "CR") {
                adjust=2 + "px 0px 0px 0px";
                $sttbImg2.style.right = '20px';
                $sttbImg2.style.top = '50%';
                $sttbImg2.style.margin = adjust;
            }
            else if (location == "CL") {
                adjust=2 + "px 0px 0px 0px";
                $sttbImg2.style.left = '20px';
                $sttbImg2.style.top = '50%';
                $sttbImg2.style.margin = adjust;
            }
            else if (location == "TC") {
                adjust=parseInt(size) / 2 + 2 + "px -" + parseInt(size) / 2 + "px 0px 0px";
                $sttbImg2.style.top = '20px';
                $sttbImg2.style.right = '50%';
                $sttbImg2.style.margin = adjust;
            }
            else if (location == "BC") {
                adjust="0px -" + parseInt(size) / 2 + "px 0px 0px";
                $sttbImg2.style.bottom = '20px';
                $sttbImg2.style.right = '50%';
                $sttbImg2.style.margin = adjust;
            }
        }

        // Sets the appear distance to 0 for modes where button is always present
        if((stbb=="flip") || (stbb=="dual")){
            distance=0;
        }

        // Creates CSS so that the button is not present on printed pages
        if (stbb != "keys"){
            var head = document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            rules = document.createTextNode('@media print{#STTBimg{ display:none; }#STTBimg2{ display:none; }}');

            style.type = 'text/css';
            style.appendChild(rules);
            head.appendChild(style);
        }

        // A fix so that if user has set transparency to 0, both buttons will appear when hovering over one in dual mode
        if ((transparency == 0.0) && (stbb=="dual")){
            $("#STTBimg").hover(function(){
                if ( sttb.getScrollTop() >= distance ) {
                    $("#STTBimg").stop();
                    $("#STTBimg2").stop();
                    $("#STTBimg").stop().fadeTo("fast", 1.0);
                    $("#STTBimg2").stop().fadeTo("fast", 0.5);
                }
            },function(){
                if ( sttb.getScrollTop() >= distance ) {
                    $("#STTBimg").stop().fadeTo("medium", transparency);
                    $("#STTBimg2").stop().fadeTo("medium", transparency);
                }
            });

            $("#STTBimg2").hover(function(){
                if ( sttb.getScrollTop() >= distance ) {
                    $("#STTBimg").stop();
                    $("#STTBimg2").stop();
                    $("#STTBimg").stop().fadeTo("fast", 0.5);
                    $("#STTBimg2").stop().fadeTo("fast", 1.0);
                }
            },function(){
                if ( sttb.getScrollTop() >= distance ) {
                    $("#STTBimg").fadeTo("medium", transparency);
                    $("#STTBimg2").fadeTo("medium", transparency);
                }
            });
        }

        // Has transparency change on mouseover
        else{
            if (transparency != 1.0) {
                $("#STTBimg").hover(function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $("#STTBimg").stop().fadeTo("fast", 1.0);
                    }
                },function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $("#STTBimg").stop().fadeTo("medium", transparency);
                    }
                });

                $("#STTBimg2").hover(function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $("#STTBimg2").stop().fadeTo("fast", 1.0);
                    }
                },function(){
                    if ( sttb.getScrollTop() >= distance ) {
                        $("#STTBimg2").stop().fadeTo("medium", transparency);
                    }
                });
            }
        }


        // Calls and passes variables to jquery.scroll.pack.js which finds the created button and applies the scrolling rules.
        $( "#STTBimg" ).scrollToTop( {
                speed : speed
            ,   ease : scroll
            ,   start : distance
            ,   stbb : stbb
            ,   flipDistance : flipDistance
            ,   transparency : transparency
            ,   direction : 'up'
        } );

        $( "#STTBimg2" ).scrollToTop( {
                speed : speed2
            ,   ease : scroll
            ,   start : distance
            ,   stbb : stbb
            ,   flipDistance : flipDistance
            ,   transparency : transparency
            ,   direction : 'down'
        } );

        //Adds keyboard commands using shortcut.js
        if (shortcuts == "arrows") {
            shortcut.add("Alt+Down", function() {
                sttb.scrollDown( speed2, scroll );
            });
            shortcut.add("Alt+Up", function() {
                sttb.scrollUp( speed, scroll );
            });
        }
        else if (shortcuts == "tb") {
            shortcut.add("Alt+B", function() {
                sttb.scrollDown( speed2, scroll );
            });
            shortcut.add("Alt+T", function() {
                sttb.scrollUp( speed, scroll );
            });
        }

        if ( homeendaction === 'sttb' ) {
            shortcut.add("End", function() {
                sttb.scrollDown( speed2, scroll );
            },{
                'disable_in_input':true
            });
            shortcut.add("Home", function() {
                sttb.scrollUp( speed, scroll );
            },{
                'disable_in_input':true
            });
        }

        document.addEventListener( 'webkitfullscreenchange', onFullscreenchange );
        document.addEventListener( 'mozfullscreenchange', onFullscreenchange );
        document.addEventListener( 'msfullscreenchange', onFullscreenchange );
        document.addEventListener( 'fullscreenchange', onFullscreenchange );

        var arrButtons = [ $sttbImg, $sttbImg2 ];

        function onFullscreenchange() {
            var boolIsFullscreen = !! ( document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement );

            for ( var i = arrButtons.length; i--; ) {
                var $button = arrButtons[ i ];

                if ( document.contains( $button ) ) {
                    $button.classList.toggle( 'disabled', boolIsFullscreen );
                }
            }
        }
    });
}
