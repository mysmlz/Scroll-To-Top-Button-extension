// Restores default settings.
function defaults() {
  loadcount=localStorage["loadcount"];
  donated=localStorage["donated"];
  bothered=localStorage["bothered"];
  bothered2=localStorage["bothered2"];
  localStorage.clear();
  localStorage["loadcount"]=loadcount;
  localStorage["bothered"]=bothered;
  localStorage["bothered2"]=bothered2;
  localStorage["donated"]=donated;
  localStorage["latest"]="2";
  restore_options();
  save_options();
  textChange();
}

// Sets options to my personal setup
function authorsettings() {
  localStorage["scroll_speed"]="1000";
  localStorage["scroll_speed2"]="1000";
  localStorage["size"]="50px";
  localStorage["arrow"]="arrow_only_blue";
  localStorage["location"]="CR";
  localStorage["stbb"]="dual";
  localStorage["transparency"]="0.5";
  localStorage["contextmenu"]="on";
  localStorage["shortcuts"]="arrows";
  localStorage["homeendaction"]="sttb";
  restore_options();
  save_options();
  textChange();
}

// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("speed");
  var speed = select.children[select.selectedIndex].value;
  localStorage["scroll_speed"] = speed;

  var select = document.getElementById("speed2");
  var speed2 = select.children[select.selectedIndex].value;
  localStorage["scroll_speed2"] = speed2;

  var select = document.getElementById("distance");
  var distance = select.children[select.selectedIndex].value;
  localStorage["distance_length"] = distance;

  var select = document.getElementById("buttonsize");
  var size = select.children[select.selectedIndex].value;
  localStorage["size"] = size;

  var select = document.getElementById("buttoncolor");
  var color = select[select.selectedIndex].value;
  localStorage["arrow"] = color;

  /*var select = document.getElementById("scroll");
  var scroll = select.children[select.selectedIndex].value;
  localStorage["scroll"] = scroll;*/

  var select = document.getElementById("location");
  var location = select.children[select.selectedIndex].value;
  localStorage["location"] = location;

  var select = document.getElementById("stbb");
  var stbb = select.children[select.selectedIndex].value;
  localStorage["stbb"] = stbb;

  var select = document.getElementById("transparency");
  var transparency = select.children[select.selectedIndex].value;
  localStorage["transparency"] = transparency;

  var select = document.getElementById("contextmenu");
  var contextmenu = select.children[select.selectedIndex].value;
  localStorage["contextmenu"] = contextmenu;

  var select = document.getElementById("shortcuts");
  var shortcuts = select.children[select.selectedIndex].value;
  localStorage["shortcuts"] = shortcuts;

  select = document.getElementById("homeendaction");
  var homeendaction = select.children[select.selectedIndex].value;
  localStorage["homeendaction"] = homeendaction;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 3000);
}

// Message to restart browser when setting change requires it
var restartChange = "false";
function restart() {
  if (restartChange=="false") {
    var status = document.getElementById("restartstatus");
    status.innerHTML = "Restart your browser to take effect.";
    restartChange = "true";
  }
  else if (restartChange=="true") {
    var status = document.getElementById("restartstatus");
    status.innerHTML = "";
    restartChange = "false";
  }

}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var favorite = localStorage["scroll_speed"];
  if (!favorite) {
    favorite = 1000;
  }
  var select = document.getElementById("speed");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite) {
      child.selected = "true";
      break;
    }
  }
  var favorite9 = localStorage["scroll_speed2"];
  if (!favorite9) {
    favorite9 = 1000;
  }
  var select = document.getElementById("speed2");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite9) {
      child.selected = "true";
      break;
    }
  }
  var favorite2 = localStorage["distance_length"];
  if (!favorite2) {
    favorite2 = 400;
  }
  var select = document.getElementById("distance");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite2) {
      child.selected = "true";
      break;
    }
  }
  var favorite3 = localStorage["size"];
  if (!favorite3) {
    favorite3 = "50px";
  }
  var select = document.getElementById("buttonsize");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite3) {
      child.selected = "true";
      break;
    }
  }

  // Button design
  var favorite4 = localStorage[ 'arrow' ];
  if ( ! favorite4 ) {
    favorite4 = 'arrow_blue';
  }

  var $$select = document.getElementById( 'buttoncolor' );

  loopOptgroups:
  for ( var i = 0, l = $$select.children.length; i < l; i++ ) {
    var $$optgroup = $$select.children[ i ];

    for ( var j = 0, m = $$optgroup.children.length; j < m; j++ ) {
      var $$option = $$optgroup.children[ j ];

      if ( $$option.value == favorite4 ) {
        $$option.selected = 'true';
        break loopOptgroups;
      }
    }
  }

  // Button location
  var favorite6 = localStorage["location"];
  if (!favorite6) {
    favorite6 = "TR";
  }
  var select = document.getElementById("location");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite6) {
      child.selected = "true";
      break;
    }
  }
 var favorite7 = localStorage["stbb"];
  if (!favorite7) {
    favorite7 = "off";
  }
  var select = document.getElementById("stbb");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite7) {
      child.selected = "true";
      break;
    }
  }
 var favorite8 = localStorage["transparency"];
  if (!favorite8) {
    favorite8 = "0.5";
  }
  var select = document.getElementById("transparency");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite8) {
      child.selected = "true";
      break;
    }
  }
   var favorite10 = localStorage["contextmenu"];
  if (!favorite10) {
    favorite10 = "on";
  }
  var select = document.getElementById("contextmenu");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite10) {
      child.selected = "true";
      break;
    }
  }
   var favorite11 = localStorage["shortcuts"];
  if (!favorite11) {
    favorite11 = "shortcuts";
  }
  var select = document.getElementById("shortcuts");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite11) {
      child.selected = "true";
      break;
    }
  }

  var favorite12 = localStorage["homeendaction"];
  if (!favorite12) {
    favorite12 = "homeendaction";
  }
  var select = document.getElementById("homeendaction");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == favorite12) {
      child.selected = "true";
      break;
    }
  }
  save_options();
}

function textChange(){
  if(localStorage["stbb"]=="flip"){
    $("#textChange").html( chrome.i18n.getMessage( 'flipDistance' ) );
    $("#textChange").closest( '.settingContainer' ).show();
    $("#distance").closest( '.settingContainer' ).show();
    $(".appearance").closest( '.settingContainer' ).show();
    $("#speed2").closest( '.settingContainer' ).show();
  }
  else if(localStorage["stbb"]=="dual"){
    $("#textChange").closest( '.settingContainer' ).hide();
    $("#distance").closest( '.settingContainer' ).hide();
    $(".appearance").closest( '.settingContainer' ).show();
    $("#speed2").closest( '.settingContainer' ).show();
  }
  else if(localStorage["stbb"]=="keys"){
    $("#textChange").closest( '.settingContainer' ).hide();
    $("#distance").closest( '.settingContainer' ).hide();
    $(".appearance").closest( '.settingContainer' ).hide();
    $("#speed2").closest( '.settingContainer' ).show();
  }
  else{
    $("#textChange").html( chrome.i18n.getMessage( 'appearDistance' ) );
    $("#textChange").closest( '.settingContainer' ).show();
    $("#distance").closest( '.settingContainer' ).show();
    $(".appearance").closest( '.settingContainer' ).show();
    $("#speed2").closest( '.settingContainer' ).hide();
  }
}

if (localStorage["latest"]!="2"){
  localStorage["latest"]="2";
}

$(function() {
  if ( boolConstUseOptionsUi )
    document.body.classList.add( 'newUi' );

  restore_options();
  textChange();

  var strRateLink = 'https://chrome.google.com/webstore/detail/scroll-to-top-button/chinfkfmaefdlchhempbfgbdagheknoj/reviews';

  // Show appropriate link for Opera (snippet from http://stackoverflow.com/a/9851769)
  if (  ( !! window.opr && !! opr.addons )
    ||  !! window.opera
    ||  navigator.userAgent.indexOf( ' OPR/' ) >= 0
  ) {
    strRateLink = 'https://addons.opera.com/extensions/details/scroll-to-top-button/';
  }

  $( '#rateLink' ).attr( 'href', strRateLink );

  // Button Mode
  $( '#stbb' ).bind( 'change', function() {
    save_options();
    textChange();
  } );

  // Scroll Up Speed, Scroll Down Speed, Appear Distance, Button Size,
  // Button Design, Button Location, Opacity of button while idle,
  // Keyboard Shortcuts
  $( '.optionsChanger' ).bind( 'change', function() {
    save_options();
  } );

  // Context (Right-click) Menu
  $( '#contextmenu' ).bind( 'change', function() {
    save_options();
    restart();
  } );

  // Restore Defaults
  $( '#restore' ).bind( 'click', function() {
    defaults();
    return false;
  } );

  // Author's Settings
  $( '#author' ).bind( 'click', function() {
    authorsettings();
    return false;
  } );

  // Save settings button
  document.getElementById( 'save' ).addEventListener( 'click', function () {
    save_options();
    return false;
  } );

  // Form submission
  $( '#settingsForm' ).bind( 'submit', function() {
    return false;
  } );
});
