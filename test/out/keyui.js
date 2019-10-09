/*$(document).ready(function(){
    $("body").on('click', ".drp-u li", function() {
        var txt = $(this).text();
        $(this).parent().prev(".drp-txt").text(txt);
        $(this).parent().prevAll('.drp-i').val(txt);
    });
});*/
// document.addEventListener("mouseup", e => {
//   const { tagName: tag } = e.target;
//   if (e && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA")
//     e.target.blur();
// });

document.addEventListener("click", e => {
  const { tagName: tag } = e.target;
  console.log(e && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA");
  if (e && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA")
    e.target.blur();
});
