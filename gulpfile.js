var del = require('del');
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var debug = require('gulp-debug');
var less = require('gulp-less');
var processhtml = require('gulp-processhtml');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
//uses Montenegro usage statistics. It accepts two-letter country code.
  autoprefixPlugin = new LessPluginAutoPrefix({browsers: ['> 1% in ME']});

var LessPluginCleanCSS = require('less-plugin-clean-css'),
  cleancss = new LessPluginCleanCSS({advanced: true});

var paths = {
  scripts: {
    source: ['./js/game.js'],
    output: {
      path: './build/js',
      filename: 'game.min.js'
    }
  },
  styles: {
    source: './styles/*.less',
    output: {
      path: './build/styles',
      filename: 'game.css'
    }
  },
  html: {
    source: './index.html',
    output: {
      path: './build',
      filename: 'index'
    }
  }
};

function clean(done) {
  del(['build'], done);
}

function html() {
  return gulp.src(paths.html.source)
    .pipe(processhtml())
    .pipe(debug({title: 'html:'}))
    .pipe(gulp.dest(paths.html.output.path));
}

function styles() {
  return gulp.src(paths.styles.source)
    //TODO: sourcemap doesn't work with plugins because of bug in them
    //.pipe(sourcemaps.init())
    .pipe(less({
      plugins: [cleancss, autoprefixPlugin]
    }))
    //.pipe(sourcemaps.write('.'))
    .pipe(debug({title: 'styles:'}))
    .pipe(gulp.dest(paths.styles.output.path));
}

function scripts() {
  return gulp.src(paths.scripts.source)
    .pipe(sourcemaps.init())
    .pipe(browserify({
      //debug : !gulp.env.production
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(debug({title: 'scripts:'}))
    .pipe(gulp.dest(paths.scripts.output.path));
}

gulp.task('clean', clean);
gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('scripts', scripts);

gulp.task('watch', function () {
  gulp.watch(paths.html.source, html);
  gulp.watch(paths.styles.source, styles);
  gulp.watch(paths.scripts.source, scripts);
});

gulp.task('build', gulp.series(
  clean,
  gulp.parallel('scripts', 'html', 'styles')
));

gulp.task('default', gulp.series('build'));
