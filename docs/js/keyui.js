/*$(document).ready(function(){
    $("body").on('click', ".drp-u li", function() {
        var txt = $(this).text();
        $(this).parent().prev(".drp-txt").text(txt);
        $(this).parent().prevAll('.drp-i').val(txt);
    });
});*/

/* This is focus script. 
 * Disables outlines on click.
*/

document.addEventListener('mouseup', function(e) {
    if (e.target.tagName == 'BUTTON') {
        e.target.blur();
    }
}, false);
