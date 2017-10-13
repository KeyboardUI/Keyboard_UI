$(document).ready(function(){
    $("body").on('click', ".drp-u li", function() {
        var txt = $(this).text();
        $(this).parent().prev(".drp-txt").text(txt);
        $(this).parent().prevAll('.drp-i').val(txt);
    });
});


