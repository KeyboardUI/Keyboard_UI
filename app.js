var sass = require('node-sass');

sass.render({
    file: "src/keyui.sass"
}, function(err, result) {
    if (err) throw err;
    console.log(result);
}