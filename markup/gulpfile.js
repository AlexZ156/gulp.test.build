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

gulp.task('sass', function() {
	var postcssPlagins = [
		autoprefixer({
			browsers: ['last 2 version']
		})
	];

	return gulp.src('./scss/main.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(postcssPlagins))
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream());
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

gulp.task('default', function() {
	/*browserSync.init({
		server: {
			baseDir: "./",
			directory: true
		}
	});*/
	gulp.watch('./scss/**/*.scss', ['sass']);
	gulp.watch('./**/*.html', ['reloadPage']);
	gulp.watch('./**/*.js', ['reloadPage']);
	watch('./sourceimages/**', function() {
		gulp.src('./sourceimages/**')
			.pipe(gulp.dest('./images'));
	});
});