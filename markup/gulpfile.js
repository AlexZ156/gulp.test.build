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
			webpack(webpackConfig(), cb);
		}, delay);
	};
}())

gulp.task('webpack', buildScripts);

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
	/*watch('./sourceimages/**', function() {
		gulp.src('./sourceimages/**')
			.pipe(gulp.dest('./images'));
	});*/
});
