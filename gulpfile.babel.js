import gulp, { series, src, dest } from "gulp";
import sass from "gulp-sass";
import pug from "gulp-pug";
import browserSync from "browser-sync";
import browserify from "browserify";
import babel from "babelify";
import fs from "fs";
import patch from "gulp-apply-patch";
const server = browserSync.create();

const config = {
  src: {
    sass: "./src/sass/**/*.sass",
    js: "./src/keyui.js",
    patch: "./patches/*.patch",
    modules: "./node-modules"
  },
  test: {
    pug: "./test/views/*.pug",
    sass: "./test/views/sass/*.sass",
    css: "./test/out/css",
    out: "./test/out"
  },
  out: {
    css: "./css",
    js: "./js"
  },
  build: "./dist"
};

const browser = done => {
  browserify(config.src.js, { debug: true })
    .transform(babel)
    .bundle()
    .pipe(fs.createWriteStream("./js/keyui.js"));
  patch(config.src.patch, config.src.modules);
  done();
};

const reload = done => {
  server.reload();
  done();
};

const serve = done => {
  server.init({
    server: {
      baseDir: "./",
      index: "./test/out/index.html"
    }
  });
  done();
};

const observe = () => {
  gulp
    .watch(config.src.sass, series(pugTest, testSass, srcComp, browser, reload))
    .on("change", browserSync.reload);
  gulp
    .watch(config.test.pug, series(pugTest, testSass, srcComp, browser, reload))
    .on("change", browserSync.reload);
  gulp
    .watch(
      config.test.sass,
      series(pugTest, testSass, srcComp, browser, reload)
    )
    .on("change", browserSync.reload);
  gulp
    .watch(config.src.js, series(pugTest, testSass, srcComp, browser, reload))
    .on("change", browserSync.reload);
};

const srcComp = done => {
  src(config.src.sass)
    .pipe(dest(config.out.css))
    .pipe(browserSync.stream());
  done();
};

const pugTest = done => {
  src(config.test.pug)
    .pipe(pug())
    .pipe(dest(config.test.out))
    .pipe(browserSync.stream(config.test.out));
  done();
};

const testSass = done => {
  src(config.test.sass)
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(config.test.css));
  done();
};

const build = done => {
  src(config.src.sass).pipe(dest(config.build));
  browserify(config.src.js, { debug: true })
    .transform(babel)
    .bundle()
    .pipe(fs.createWriteStream("./dist/keyui.js"));
  done();
};
const dev = series(pugTest, testSass, srcComp);
const watch = series(serve, dev, observe);
export { dev, testSass, srcComp, watch, browser, build };
