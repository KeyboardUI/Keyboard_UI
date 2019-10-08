import gulp, { series, src, dest } from "gulp";
import sass from "gulp-sass";
import pug from "gulp-pug";
import browserSync from "browser-sync";
const server = browserSync.create();

const config = {
  src: {
    sass: "./src/sass/**/*.sass"
  },
  test: {
    pug: "./test/views/*.pug",
    sass: "./test/views/sass/*.sass",
    css: "./test/out/css",
    out: "./test/out"
  },
  out: {
    css: "./css"
  }
};

const reload = done => {
  server.reload();
  done();
};

const serve = done => {
  server.init({
    server: {
      baseDir: config.test.out
    }
  });
  done();
};

const observe = () => {
  gulp
    .watch(config.src.sass, series(reload, pugTest, testSass))
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

const dev = series(pugTest, testSass);
const watch = series(serve, observe);
export { dev, testSass, srcComp, watch };
