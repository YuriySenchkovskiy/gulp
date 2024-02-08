const {src, dest, series, watch} = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const notify = require('gulp-notify');
const image = require('gulp-image');
const concat = require('gulp-concat');

const isProd = process.env.NODE_ENV === 'production';
const noop = require('gulp-noop');

const clean = () => {
	return del(['dist/*'])
}

//svg sprite
const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg" //sprite file name
        }
      },
    }))
    .pipe(dest('./dist/img'));
}

const styles = () => {
    return src('./src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            cascade: false,
        }))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(concat('main.css'))
        .pipe(isProd ? sourcemaps.write('.') : noop())
        .pipe(dest('./dist/css/'))
        .pipe(browserSync.stream());
};

const scripts = () => {
    return src(['./src/js/components/**.js', './src/js/main.js'])
        .pipe(isProd ? sourcemaps.init() : noop())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(isProd ? uglify().on("error", notify.onError()) : noop())
        .pipe(isProd ? sourcemaps.write('.') : noop())
        .pipe(dest('./dist/js'))
        .pipe(browserSync.stream());
};

const resources = () => {
  return src('./src/resources/**')
    .pipe(dest('./dist'))
}

const images = () => {
  return src([
		'./src/img/**.jpg',
		'./src/img/**.png',
		'./src/img/**.jpeg',
		'./src/img/*.svg',
		'./src/img/**/*.jpg',
		'./src/img/**/*.png',
		'./src/img/**/*.jpeg'
		])
    .pipe(image())
    .pipe(dest('./dist/img'))
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
  });

  watch('./src/css/**/*.css', styles);
	watch('./src/*.html', htmlMinify);
  watch('./src/js/**/*.js', scripts);
  watch('./src/resources/**', resources);
  watch('./src/img/*.{jpg,jpeg,png,svg}', images);
	watch('./src/img/**/*.{jpg,jpeg,png}', images);
  watch('./src/img/svg/**.svg', svgSprites);
}

const htmlMinify = () => {
    return src('src/**/*.html')
        .pipe(isProd ? htmlmin({ collapseWhitespace: true }) : noop())
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
};

exports.styles = styles;

exports.htmlMinify = htmlMinify;

exports.default = series(clean, scripts, styles, resources, images, svgSprites, htmlMinify, watchFiles);
