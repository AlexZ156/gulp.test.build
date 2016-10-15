'use strict';
const gulp = require('gulp');
const webpack = require('webpack');
const webpackconfig = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const imageop = require('gulp-image-optimization');
const settings = require('./gulp-settings.js');
let readyToBuildSass = true;
const gutil = require('gulp-util');
const pug = require('gulp-pug');
let sassHandler = cb => {
	const postcssPlagins = [
		autoprefixer({
			browsers: ['last 2 version']
		})
	];

	gulp.src(settings.scssDir.sassEntry)
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(postcssPlagins))
		.pipe(gulp.dest(settings.scssDir.cssOutput))
		.pipe(browserSync.stream());

	setTimeout(() => {
		readyToBuildSass = true;
	}, 500);

	typeof cb === 'function' && cb();
};
let reloadPage =() => browserSync.reload();

gulp.task('sass', cb => {
	if (readyToBuildSass) {
		setTimeout(() => {
			sassHandler(cb);
		}, 100);
		readyToBuildSass = false;
	} else {
		cb();
		console.log('\n\n\n !!!!!!  Timer hasn\'t completed, let\'s try again  !!!!!! \n *** this bug will be fixed in a future, sorry ***');
	}
});

gulp.task('reloadPage', reloadPage);

gulp.task('beautify', () => {
	return gulp.src('./css/main.css')
		.pipe(cssbeautify({
			indent: '  '
		}))
		.pipe(gulp.dest('./css'));
});

gulp.task('images', cb => {
	const imgEntry = settings.imagesDir.entry;
	const imgOutput = settings.imagesDir.output;

	gulp.src([imgEntry + '**/*.png', imgEntry + '**/*.jpg', imgEntry + '**/*.gif', imgEntry + '**/*.svg']).pipe(imageop({
		optimizationLevel: 5,
		progressive: true,
		interlaced: true
	})).pipe(gulp.dest(imgOutput));
});

// gulp.task('rfq', ['beautify', 'images']);

gulp.task('webpack', cb => {
	webpack(webpackconfig, (err, stats) => {
		if (err) throw new gutil.PluginError('webpack', err);
		gutil.log('[webpack]', stats.toString({
			// output options
		}));
		cb();
		reloadPage();
	});
});

gulp.task('pug', cb => {
	return gulp.src(settings.pugDir.entry)
			.pipe(pug({
				pretty: '\t'
			}).on('error', err => {
				console.log(err);
				cb();
			}))
			.pipe(gulp.dest(settings.pugDir.output));
});

gulp.task('watch', () => {
	gulp.watch(settings.scssDir.watch, ['sass']);
	gulp.watch(settings.pugDir.watch, ['pug']);
	gulp.watch(['./dev/js/*.js'], ['webpack']);
	watch('./sourceimages/**').pipe(gulp.dest('./images'));
	watch(['./js/*.js', './*.html'], reloadPage);
});

gulp.task('server', () => {
	browserSync.init({
		server: {
			baseDir: './',
			port: 3010,
			directory: true
		}
	});
});

gulp.task('default', ['webpack', 'watch', 'pug'/*, 'server'*/]);
