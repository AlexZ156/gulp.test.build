var gulp = require('gulp');
var webpack = require('webpack');
var webpackconfig = require('./webpack.config.js')
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssbeautify = require('gulp-cssbeautify');
var imageop = require('gulp-image-optimization');
var settings = require('./gulp-settings.js');
var readyToBuildSass = true;

/*gulp.task('webpack', function(cb) {
    webpack(webpackconfig, cb);
});

gulp.task('default', ['webpack'], function() {
    browserSync.init({
        server: {
            baseDir: "./build",
            directory: true
        },
        port: 8080,
        files: ['./build/index.js'],
        notify: false
    });

    gulp.watch('./dev/index.js', ['webpack', function() {
        browserSync.reload();
    }]);
});*/

function sassHandler(cb) {
    var postcssPlagins = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];

    gulp.src(settings.scssDir.sassEntry)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcssPlagins))
        .pipe(gulp.dest(settings.scssDir.cssOutput))
        .pipe(browserSync.stream());

    setTimeout(function() {
        readyToBuildSass = true;
    }, 500);

    typeof cb === 'function' && cb();
}

gulp.task('sass', function(cb) {
    if (readyToBuildSass) {
        setTimeout(function() {
            sassHandler(cb);
        }, 100);
        readyToBuildSass = false;
    } else {
        cb();
        console.log('\n\n\n !!!!!!  Timer hasn\'t completed, let\'s try again  !!!!!! \n *** this bug will be fixed in a future, sorry ***');
    }
});

gulp.task('reloadPage', function() {
    browserSync.reload();
});

gulp.task('beautify', function() {
    return gulp.src('./css/main.css')
        .pipe(cssbeautify({
            indent: '  '
        }))
        .pipe(gulp.dest('./css'));
});

gulp.task('images', function(cb) {
    var imgEntry = settings.imagesDir.entry;
    var imgOutput = settings.imagesDir.output;

    gulp.src([imgEntry + '**/*.png', imgEntry + '**/*.jpg', imgEntry + '**/*.gif', imgEntry + '**/*.svg']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest(imgOutput));
});

gulp.task('rfq', ['beautify', 'images']);

var buildScripts = (function() {
    var timer;
    var delay = 500;

    return function(cb) {
        clearTimeout(timer);
        timer = setTimeout(function() {
            webpack(webpackconfig, cb);
        }, delay);
    };
}())

// gulp.task('webpack', buildScripts);
gulp.task('webpack', function() {
    return gulp.src('./dev/index.js')
        .pipe(webpack(webpackconfig))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['webpack'], function(cb) {
    /*browserSync.init({
        server: {
            baseDir: "./",
            port: 3010,
            directory: true
        }
    });*/
    gulp.watch(settings.scssDir.watch, ['sass']);
    gulp.watch(['./*.html', './js/*.js'], ['reloadPage']);
    gulp.watch(['./dev/*.js'], ['webpack']);
    /*watch('./sourceimages/**', function() {
        gulp.src('./sourceimages/**')
            .pipe(gulp.dest('./images'));
    });*/
});



{
  "name": "webpack_fucking_test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "autoprefixer": "^6.3.1",
    "babel-core": "^6.5.1",
    "babel-loader": "^6.2.2",
    "babel-plugin-transform-object-assign": "^6.5.0",
    "babel-plugin-transform-runtime": "^6.4.3",
    "babel-preset-es2015": "^6.3.13",
    "babel-preset-react": "^6.5.0",
    "babel-preset-stage-0": "^6.5.0",
    "browser-sync": "^2.15.0",
    "copy-webpack-plugin": "^3.0.1",
    "gulp": "^3.9.1",
    "gulp-cssbeautify": "^0.1.3",
    "gulp-image-optimization": "^0.1.3",
    "gulp-postcss": "^6.0.1",
    "gulp-sass": "^2.0.4",
    "gulp-watch": "^4.3.9",
    "webpack": "^1.13.2"
  }
}
