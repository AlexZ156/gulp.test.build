var gulp = require('gulp');
var webpack = require('webpack');
var webpackconfig = require('./webpack.config.js');
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssbeautify = require('gulp-cssbeautify');
var imageop = require('gulp-image-optimization');
var settings = require('./gulp-settings.js');
var readyToBuildSass = true;
var gutil = require('gulp-util');
var pug = require('gulp-pug');

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

function reloadPage() {
	browserSync.reload();
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

gulp.task('reloadPage', reloadPage);

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

// gulp.task('rfq', ['beautify', 'images']);

gulp.task('webpack', function(callback) {
	webpack(webpackconfig, function(err, stats) {
		if (err) throw new gutil.PluginError('webpack', err);
		gutil.log('[webpack]', stats.toString({
			// output options
		}));
		callback();
		reloadPage();
	});
});

gulp.task('pug', function(cb) {
	return gulp.src(settings.pugDir.entry)
			.pipe(pug({
				pretty: '\t'
			}).on('error', function(err) {
				console.log(err);
				cb();
			}))
			.pipe(gulp.dest(settings.pugDir.output));
});

gulp.task('watch', function() {
	gulp.watch(settings.scssDir.watch, ['sass']);
	gulp.watch(settings.pugDir.watch, ['pug']);
	gulp.watch(['./dev/*.js'], ['webpack']);
	watch('./sourceimages/**').pipe(gulp.dest('./images'));
	watch(['./js/*.js', './*.html'], reloadPage);
});

gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./",
			port: 3010,
			directory: true
		}
	});
});

gulp.task('default', ['webpack', 'watch', 'pug'/*, 'server'*/]);
