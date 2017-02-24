requirejs.config({
    paths: {
        app: 'StzCommonSetting',
        "stzcommon" : "./StzCommon",
        "jquery" : "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "phaser_nine_patch" : "//stzhyegeun.github.io/libs/StzCommon/plugin/nine-patch-phaser-plugin", 
        "peer" : "//cdn.peerjs.com/0.3/peer.min" 
    }
});


requirejs(['stzcommon', 'jquery', 'phaser_nine_patch', 'peer'], function() {
    setLockOrientationElements();   
    window.onRequireLoad();
});


function setLockOrientationElements() {
    $('head').append("<style type='text/css' id='css_lock_orientation'></style>");  

    $('body').css( {
        "padding" : "0", 
        "margin" : "0", 
        "background" : "white"
    });
    
    $('body').append("<div id='lock_orientation_view'></div>");
    $('#lock_orientation_view').css({
        "width": "100%", 
        "height": "100%",
        "position": "fixed",
        "top": "0px", 
        "left": "0px",
        "background-color": "white",
        "background-repeat": "no-repeat", 
        "background-position": "center center"
    });
    
    if (StzGameConfig.LOCK_ORIENTATION == "PORTRAIT") {
        $('#css_lock_orientation').text('@media only screen and (orientation: portrait) { #lock_orientation_view {display: none;}} @media only screen and (orientation: landscape) { #lock_orientation_view {display: block;}}');
        $('#lock_orientation_view').css("background-image", "url('//stzhyegeun.github.io/libs/StzCommon/image/playportrait.png'");
    } else if (StzGameConfig.LOCK_ORIENTATION == "LANDSCAPE") {
        $('#css_lock_orientation').text('@media only screen and (orientation: portrait) { #lock_orientation_view {display: block;}} @media only screen and (orientation: landscape) { #lock_orientation_view {display: none;}}');
        $('#lock_orientation_view').css("background-image", "url('//stzhyegeun.github.io/libs/StzCommon/image/playlandscape.png'");
    }
} 