'use strict';
const gulp = require('gulp');
const path = require('path');
const del = require('del');
const webpack = require('webpack');
const webpackconfig = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csscomb = require('gulp-csscomb');
const imagemin = require('gulp-imagemin');
const settings = require('./gulp-settings.js');
let readyToBuildSass = true;
const gutil = require('gulp-util');
const pug = require('gulp-pug');
const imageWatchUrl = path.resolve(__dirname, settings.imagesDir.entry + '**/*');
const copyImage = () => gulp.src(imageWatchUrl).pipe(gulp.dest(settings.imagesDir.output));
const sourcemaps = require('gulp-sourcemaps');
const cache = require('gulp-cache');
// let reloadPage =() => browserSync.reload();
// sass handler
let sassHandler = cb => {
	const postcssPlagins = [
		autoprefixer({
			browsers: ['last 2 version']
		})
	];

	gulp.src(
			path.resolve(__dirname, settings.scssDir.entry + '**/*.scss'),
			{
				base: path.resolve(__dirname, settings.scssDir.entry)
			}
		)
		// .pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(postcssPlagins))
		// .pipe(sourcemaps.write('../', {includeContent: true}))
		.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.output)))
		.pipe(browserSync.stream());

	setTimeout(() => {
		readyToBuildSass = true;
	}, 100);

	typeof cb === 'function' && cb();
};
// ES-2015 handler
const webpackHandler = (dev, cb) => {
	webpack(webpackconfig(dev), (err, stats) => {
		if (err) throw new gutil.PluginError('webpack', err);
		gutil.log('[webpack]', stats.toString({
			// output options
		}));
		cb();
		// reloadPage();
	});
}

/*
 * all development tasks
*/
// compile from sass to css
gulp.task(function sass(cb) {
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
})

// compile ES-2015 to ES5;
// gulp.task('webpackDev', webpackHandler(true));
gulp.task(function webpackDev(cb) {
	webpackHandler(true, cb);
});

// compile from pug to html
/*gulp.task('pug', cb => {
	return gulp.src(settings.pugDir.entry)
			.pipe(pug({
				pretty: '\t'
			}).on('error', err => {
				console.log(err);
				cb();
			}))
			.pipe(gulp.dest(settings.pugDir.output));
});*/

gulp.task(function pugTask() {
	return gulp.src(
			path.resolve(__dirname, settings.pugDir.entry + '*.pug'),
			{
				base: path.resolve(__dirname, settings.pugDir.entry)
			}
		)
		.pipe(pug(
			{
				pretty: '\t'
			}
		).on('error', err => {
			console.log(err);
			cb();
		}))
		.pipe(gulp.dest(path.resolve(__dirname, settings.pugDir.output)));
});

// copy images
// gulp.task('copyImages', copyImage);

gulp.task(function copyImages() {
	return gulp.src(
		path.resolve(__dirname, settings.imagesDir.entry + '**/*'),
		{
			base: path.resolve(__dirname, settings.imagesDir.entry)
		}
	).pipe(gulp.dest(path.resolve(__dirname, settings.imagesDir.output)));
});

gulp.task(function watch(cb) {
	gulp.watch(
		path.resolve(__dirname, settings.scssDir.entry + '**/*.scss'),
		gulp.series('sass')
	);

	gulp.watch(
		path.resolve(__dirname, settings.pugDir.entry + '**/*.pug'),
		gulp.series('pugTask')
	);

	gulp.watch(
		path.resolve(__dirname, settings.jsDir.entry + '**/*.js'),
		gulp.series('webpackDev')
	);

	gulp.watch(
		path.resolve(__dirname, settings.imagesDir.entry + '**/*'),
		gulp.series('copyImages')
	);

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.output + '*.js'),
			'./*.html'
		],
		gulp.series('reloadPage')
	);

	cb();
});

gulp.task(function reloadPage(cb) {
	browserSync.reload();
	cb();
});

// server
const serve = (cb) => (
	browserSync.init({
		server: {
			baseDir: './',
			port: 3010,
			directory: true,
			notify: false
		}
	}, cb)
);

const clearScripts = (cb) => {
	let jsExceptStr = '';

	settings.jsNames.names.forEach(function(item, index) {
		jsExceptStr += ((index !== 0 ? '|' : '(') + item + (index === settings.jsNames.names.length - 1 ? ')' : ''))
	});

	/*del([`${settings.jsDir.output}*`, `!${settings.jsDir.output}*${jsExceptStr}`]).then(paths => {
		cb();
	});*/
	del(
		[
			path.resolve(__dirname, settings.jsDir.output + '*'),
			path.resolve(__dirname, '!' + settings.jsDir.output + '*' +jsExceptStr)
		]
	).then(paths => {
		cb();
	});
}

// build scripts
gulp.task('build', gulp.series(clearScripts, function(done) {
	let jsExceptStr = '';

	settings.jsNames.names.forEach(function(item, index) {
		jsExceptStr += ((index !== 0 ? '|' : '(') + item + (index === settings.jsNames.names.length - 1 ? ')' : ''))
	});

	return gulp.src(
		[
			path.resolve(__dirname, settings.jsDir.entry + '*'),
			path.resolve(__dirname, '!' + settings.jsDir.entry + '*' + jsExceptStr),
			path.resolve(__dirname, '!' + settings.jsDir.entry + 'modules')
		]
	)
	.pipe(gulp.dest(settings.jsDir.output));
	/*gulp.src(
		[
			`${settings.jsDir.entry}*`,
			`!${settings.jsDir.entry}*${jsExceptStr}`,
			`!${settings.jsDir.entry}modules`
		]
	)
	.pipe(gulp.dest(settings.jsDir.output));
	done();*/
}));

/*
 * optimization on gulp dist
*/

// css beautify
/*gulp.task('beautify', () => {
	return gulp.src([`${settings.scssDir.cssOutput}*.css`, `!${settings.scssDir.cssOutput}*min.css`])
		.pipe(csscomb())
		.pipe(gulp.dest(settings.scssDir.cssOutput));
});*/

gulp.task(function beautify() {
	return gulp.src(
			[
				path.resolve(__dirname, settings.scssDir.output + '*.css'),
				path.resolve(__dirname, '!' + settings.scssDir.output + '*min.css')
			],
			{
				base: path.resolve(__dirname, settings.scssDir.output)
			}
		)
		.pipe(csscomb())
		.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.output)));
});


// image optimization
// gulp.task('imagesOptimize', cb => {
// 	const imgEntry = settings.imagesDir.entry;
// 	const imgOutput = settings.imagesDir.output;

// 	gulp.src(`${imgEntry}**/*.+(png|jpg|gif|svg)`)
// 		.pipe(cache(imagemin()))
// 		.pipe(gulp.dest(imgOutput));
// });

gulp.task(function imagesOptimize() {
	const entry = path.resolve(__dirname, settings.imagesDir.entry + '**/*.+(png|jpg|gif|svg)');
	const output = path.resolve(__dirname, settings.imagesDir.output);

	return gulp.src(
		entry,
			{
				base: path.resolve(__dirname, settings.imagesDir.entry)
			}
		)
		.pipe(cache(imagemin()))
		.pipe(gulp.dest(output));
})

// remove JS source map
// gulp.task('webpackDist', webpackHandler());
gulp.task(function webpackDist(cb) {
	webpackHandler(false, cb);
});

// remove CSS source map
// gulp.task('removeScssSourceMap', (cb) => {
// 	del([`${__dirname}/*.css.map`]).then(paths => {
// 		cb();
// 	});
// });

gulp.task(function removeScssSourceMap(cb) {
	del([path.resolve(__dirname, '/*.css.map')]).then(paths => {
		cb();
	});
});

/*
 * run main development tasks
*/
// gulp.task('clear', done => cache.clearAll(done));
// gulp.task('dist', ['webpackDist', 'imagesOptimize', 'removeScssSourceMap', 'beautify']);
gulp.task('dist', gulp.parallel('webpackDist', 'imagesOptimize', 'removeScssSourceMap', 'beautify'));
// gulp.task('default', gulp.series('build', 'webpackDev', 'sass', 'copyImages', 'watch', 'pug', serve));
gulp.task('default', gulp.parallel('webpackDev', 'sass', 'copyImages', 'pugTask', serve, 'watch'));
