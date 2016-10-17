'use strict';
const gulp = require('gulp');
const clean = require('gulp-clean');
const webpack = require('webpack');
const webpackconfig = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const imagemin = require('gulp-imagemin');
const settings = require('./gulp-settings.js');
let readyToBuildSass = true;
const gutil = require('gulp-util');
const pug = require('gulp-pug');
const imageWatchUrl = `${settings.imagesDir.entry}/**/*`;
const copyImage = () => gulp.src(imageWatchUrl).pipe(gulp.dest(settings.imagesDir.output));
const sourcemaps = require('gulp-sourcemaps');
const cache = require('gulp-cache');
let reloadPage =() => browserSync.reload();
// sass handler
let sassHandler = cb => {
	const postcssPlagins = [
		autoprefixer({
			browsers: ['last 2 version']
		})
	];

	gulp.src(settings.scssDir.sassEntry)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(postcssPlagins))
		.pipe(sourcemaps.write('../', {includeContent: true}))
		.pipe(gulp.dest(settings.scssDir.cssOutput))
		.pipe(browserSync.stream());

	setTimeout(() => {
		readyToBuildSass = true;
	}, 500);

	typeof cb === 'function' && cb();
};
// ES-2015 handler
const webpackHandler = (dev) => {
	return cb => {
		webpack(webpackconfig(dev), (err, stats) => {
			if (err) throw new gutil.PluginError('webpack', err);
			gutil.log('[webpack]', stats.toString({
				// output options
			}));
			cb();
			reloadPage();
		});
	}
}

/*
 * all development tasks
*/
// compile from sass to css
gulp.task('sass', cb => {
	if (readyToBuildSass) {
		setTimeout(() => {
			sassHandler(cb);
		}, 100);
		readyToBuildSass = false;
	} else {
		cb();
		console.log(`\n\n\n
	!!!!!!  Timer hasn\'t completed, let\'s try again  !!!!!!
	   *** this bug will be fixed in a future, sorry ***`);
	}
});

// reload page
gulp.task('reloadPage', reloadPage);

// compile ES-2015 to ES5;
gulp.task('webpackDev', webpackHandler(true));

// compile from pug to html
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

// copy images
gulp.task('copyImages', copyImage);

// watch files
gulp.task('watch', () => {
	gulp.watch(settings.scssDir.watch, ['sass']);
	gulp.watch(settings.pugDir.watch, ['pug']);
	gulp.watch(['./dev/js/*.js'], ['webpackDev']);
	watch(imageWatchUrl, copyImage);
	watch(['./js/*.js', './*.html'], reloadPage);
});

// server
gulp.task('server', () => {
	browserSync.init({
		// https: true,
		server: {
			baseDir: './',
			port: 3010,
			directory: true
		}
	});
});


/*
 * optimization on gulp dist
*/

// css beautify
gulp.task('beautify', () => {
	return gulp.src([`${settings.scssDir.cssOutput}*.css`, `!${settings.scssDir.cssOutput}*min.css`])
		.pipe(cssbeautify({
			indent: '  '
		}))
		.pipe(gulp.dest(settings.scssDir.cssOutput));
});

// image optimization
gulp.task('imagesOptimize', cb => {
	const imgEntry = settings.imagesDir.entry;
	const imgOutput = settings.imagesDir.output;
	const src = 

	gulp.src(`${imgEntry}**/*.+(png|jpg|gif|svg)`)
		.pipe(cache(imagemin()))
		.pipe(gulp.dest(imgOutput));
});

// remove JS source map
gulp.task('webpackDist', webpackHandler());

// remove CSS source map
gulp.task('removeScssSourceMap', () => {
	return gulp.src(`${__dirname}/*.css.map`, {
			read: false
		})
		.pipe(clean());
});


/*
 * run main development tasks
*/
gulp.task('clear', done => cache.clearAll(done));
gulp.task('dist', ['webpackDist', 'imagesOptimize', 'removeScssSourceMap', 'beautify']);
gulp.task('default', ['webpackDev', 'sass', 'copyImages', 'watch', 'pug', 'server']);
