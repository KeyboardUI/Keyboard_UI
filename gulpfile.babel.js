import gulp from "gulp";
import sass from "gulp-sass";
import pug from "gulp-pug";

gulp.task("sass", () => {
  return gulp
    .src("src/sass/**/*.sass")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./css"));
});

gulp.task("pug", () => {
  return gulp
    .src("test/views/*.pug")
    .pipe(pug())
    .pipe(gulp.dest("./test/out"));
});

gulp.task("test sass", () => {
  return gulp
    .src("./test/views/sass/*.sass")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./test/out/css"));
});

gulp.task("test", gulp.series("pug", "test sass"));
