/*$(document).ready(function(){
    $("body").on('click', ".drp-u li", function() {
        var txt = $(this).text();
        $(this).parent().prev(".drp-txt").text(txt);
        $(this).parent().prevAll('.drp-i').val(txt);
    });
});*/
/*document.addEventListener('mouseup', function(e) {
    if (e.target.classList.contains('ui') && e.target.localName == 'button') {
        e.target.blur();
    }
}, false);

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('ui') && e.target.localName == 'button') {
        console.log(e.target.localName)
    }
}, false);*/
var focus = document.querySelectorAll('.focus');
console.log(focus);
document.addEventListener('keydown', focusTab, false)

for (var i =0; i<focus.length; i++) {
    focus[i].classList.toggle('focus');
    focus[i].classList.add('outoffocus');
}

function focusTab(e) {
    if(e.target.classList.contains('outoffocus') && e.keyCode === 9) {
        e.target.classList.add('focus');
    }
}