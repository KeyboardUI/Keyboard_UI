/*$(document).ready(function(){
    $("body").on('click', ".drp-u li", function() {
        var txt = $(this).text();
        $(this).parent().prev(".drp-txt").text(txt);
        $(this).parent().prevAll('.drp-i').val(txt);
    });
});*/
document.addEventListener('mouseup', function(e) {
    if (e.target.classList.contains('ui') && e.target.localName == 'button') {
        e.target.blur();
    }
}, false);

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('ui') && e.target.localName == 'button') {
        console.log(e.target.localName)
    }
}, false);