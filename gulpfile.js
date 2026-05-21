const { src, dest, series, parallel, watch } = require('gulp');
const gulpSass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const merge = require('merge-stream');
const pkg = require('./package.json');

const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

function compileSass() {
  return src('scss/resume.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(header(banner, { pkg }))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function minifyCss() {
  return src('dist/css/resume.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function minifyJs() {
  return src('js/resume.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}

function copyVendor() {
  const bootstrap = src([
    'node_modules/bootstrap/dist/**/*',
    '!**/npm.js',
    '!**/bootstrap-theme.*',
    '!**/*.map'
  ]).pipe(dest('dist/vendor/bootstrap'));

  const jquery = src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/jquery/dist/jquery.min.js'
  ]).pipe(dest('dist/vendor/jquery'));

  const jqueryEasing = src('node_modules/jquery.easing/*.js')
    .pipe(dest('dist/vendor/jquery-easing'));

  const fontAwesome = src([
    'node_modules/font-awesome/**',
    '!node_modules/font-awesome/**/*.map',
    '!node_modules/font-awesome/.npmignore',
    '!node_modules/font-awesome/*.txt',
    '!node_modules/font-awesome/*.md',
    '!node_modules/font-awesome/*.json'
  ]).pipe(dest('dist/vendor/font-awesome'));

  const devicons = src([
    'node_modules/devicons/**/*',
    '!node_modules/devicons/*.json',
    '!node_modules/devicons/*.md'
  ]).pipe(dest('dist/vendor/devicons'));

  const simpleLineIcons = src([
    'node_modules/simple-line-icons/**/*',
    '!node_modules/simple-line-icons/*.json',
    '!node_modules/simple-line-icons/*.md'
  ]).pipe(dest('dist/vendor/simple-line-icons'));

  return merge(bootstrap, jquery, jqueryEasing, fontAwesome, devicons, simpleLineIcons);
}

function copyHtml() {
  return src('*.html').pipe(dest('dist'));
}

function copyImg() {
  return src('img/**/*', { allowEmpty: true }).pipe(dest('dist/img'));
}

function serve(cb) {
  browserSync.init({ server: { baseDir: 'dist' } });
  cb();
}

function reloadBrowser(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  watch('scss/*.scss', series(compileSass, minifyCss));
  watch('js/resume.js', series(minifyJs, reloadBrowser));
  watch('*.html', series(copyHtml, reloadBrowser));
  watch('img/**/*', series(copyImg, reloadBrowser));
}

const build = series(
  parallel(compileSass, minifyJs, copyVendor, copyHtml, copyImg),
  minifyCss
);

exports.build = build;
exports.default = build;
exports.dev = series(build, parallel(serve, watchFiles));
