'use strict';
const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'webpack', 'autoprefixer', 'del']
});
// const gulpPug = require('gulp-pug');
let isDevelopment = true;
const path = require('path');
const webpackconfig = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const settings = require('./gulp-settings.js');
const postcssPlagins = [
	$.autoprefixer({
		browsers: ['last 2 version']
	})
];
// ES-2015 handler
const webpackHandler = (cb) => {
	$.webpack(webpackconfig(isDevelopment), (err, stats) => {
		if (err) throw new $.util.PluginError('webpack', err);
		$.util.log('[webpack]', stats.toString({}));
		cb();
	});
}

const allSass = () => {
	const entryDir = settings.scssDir.entry;

	return gulp.src(
		[
			path.resolve(__dirname, entryDir + '*.scss'),
			'!' + path.resolve(__dirname, entryDir + settings.scssDir.mainFileName + '.scss')
		],
		{
			base: path.resolve(__dirname, entryDir)
		}
	)
	.pipe($.sass().on('error', $.sass.logError))
	.pipe($.postcss(postcssPlagins))
	.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.output)))
	.pipe($.count('## files sass to css compiled', {logFiles: true}));
};

const mainSass = () => {
	const entryDir = path.resolve(__dirname, settings.scssDir.entry + settings.scssDir.mainFileName);

	return gulp.src(
		entryDir + '.scss',
		{
			base: entryDir
		}
	)
	.pipe($.plumber(function(error) {
		$.util.log($.util.colors.bold.red(error.message));
		$.util.beep();
		this.emit('end');
	}))
	.pipe($.if(isDevelopment, $.sourcemaps.init()))
	.pipe($.sass().on('error', $.sass.logError))
	.pipe($.postcss(postcssPlagins))
	.pipe($.if(isDevelopment, $.sourcemaps.write('./', {includeContent: true})))
	.pipe($.plumber.stop())
	.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.mainFileOutput + settings.scssDir.mainFileName)))
	.pipe($.count('## files sass to css compiled', {logFiles: true}))
	.pipe(browserSync.stream());
};

const reloadPage = (cb) => {
	browserSync.reload();
	cb();
}

// compile from sass to css
gulp.task('sassTask', gulp.parallel(allSass, mainSass));

// compile from pug to html
gulp.task('pugPages', function(cb) {
	return gulp.src(
			[
				path.resolve(__dirname, settings.pugDir.entry + '**/*.pug'),
				'!' + path.resolve(__dirname, settings.pugDir.entry + '**/_*.pug')
			],
			{
				base: path.resolve(__dirname, settings.pugDir.entry)
			}
		)
		.pipe($.cached('pugPages'))
		.pipe($.pug({pretty: '\t'})
		.on('error', err => {
			console.log(err);
			cb();
		}))
		.pipe(gulp.dest(path.resolve(__dirname, settings.pugDir.output)))
		.pipe($.count('## pug files compiled', {logFiles: true}));
});

gulp.task('pugAll', function(cb) {
	return gulp.src(
			[
				path.resolve(__dirname, settings.pugDir.entry + '*.pug')
			],
			{
				base: path.resolve(__dirname, settings.pugDir.entry)
			}
		)
		.pipe($.pug({pretty: '\t'})
		.on('error', err => {
			console.log(err);
			cb();
		}))
		.pipe(gulp.dest(path.resolve(__dirname, settings.pugDir.output)))
		.pipe($.count('## pug files compiled', {logFiles: true}));
});

gulp.task('watch', function(cb) {
	gulp.watch(
		path.resolve(__dirname, settings.scssDir.entry + '**/*.scss'),
		gulp.series('sassTask')
	);

	gulp.watch(
		path.resolve(__dirname, settings.pugDir.entry + '*.pug'),
		gulp.series('pugPages')
	).on('unlink', function(filePath) {
		delete $.cached.caches.pugPages[path.resolve(filePath)];
	});

	gulp.watch(
		path.resolve(__dirname, settings.pugDir.entry + '**/_*.pug'),
		gulp.series('pugAll')
	).on('unlink', function(filePath) {
		// delete $.cached.caches.pugPages[path.resolve(filePath)];
	});

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.entry + '*'),
			'!' + path.resolve(__dirname, settings.jsES6.entry)
		],
		gulp.series(copyScripts)
	).on('unlink', function(filePath) {
		delete $.cached.caches.copyScripts[path.resolve(filePath)];
	});

	gulp.watch(
		path.resolve(__dirname, settings.jsES6.entry + '**/*.js'),
		gulp.series(webpackHandler)
	);

	gulp.watch(
		path.resolve(__dirname, settings.assetsDir + '**'),
		gulp.series('assets')
	).on('error', () => {})
	.on('unlink', function(filePath) {
		delete $.cached.caches.assets[path.resolve(filePath)];
	});

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.output + '*.js'),
			path.resolve(__dirname, settings.publicDir + '*.html')
		],
		gulp.series(reloadPage)
	);
	cb();
});

// server
const serve = (cb) => (
	browserSync.init({
		server: {
			baseDir: settings.publicDir,
			port: 3010,
			directory: true,
			notify: false
		}
	}, cb)
);

const copyScripts = () => {
	return gulp.src(
		[
			path.resolve(__dirname, settings.jsDir.entry + '**/*.*'),
			'!' + path.resolve(__dirname, settings.jsES6.entry + '**/*.*')
		],
		{
			base: path.resolve(__dirname, settings.jsDir.entry)
		}
	)
	.pipe($.cached('copyScripts'))
	.pipe(gulp.dest(settings.jsDir.output))
	.pipe($.count('## JS files was copied', {logFiles: true}));
}

const beautifyMainCss = () => {
	const cssUrl = path.resolve(__dirname, settings.scssDir.mainFileOutput + settings.scssDir.mainFileName);

	return gulp.src(
			`${cssUrl}.css`,
			{
				base: path.resolve(__dirname, settings.scssDir.output)
			}
		)
		.pipe($.csscomb())
		.pipe(gulp.dest(cssUrl))
		.pipe($.count('beautified css files', {logFiles: true}));
};

const beautifyOtherCss = () => {
	const cssUrl = path.resolve(__dirname, settings.scssDir.output);

	return gulp.src(
			[
				`${cssUrl}*.css`,
				`!${cssUrl}*min.css`
			],
			{
				base: cssUrl
			}
		)
		.pipe($.csscomb())
		.pipe(gulp.dest(cssUrl))
		.pipe($.count('beautified css files', {logFiles: true}));
};

// image optimization
gulp.task(function imagesOptimize() {
	const entry = path.resolve(__dirname, settings.imagesDir.entry + '**/*.+(png|jpg|gif|svg)');
	const output = path.resolve(__dirname, settings.imagesDir.output);

	return gulp.src(
		entry,
			{
				base: path.resolve(__dirname, settings.imagesDir.entry)
			}
		)
		.pipe($.imagemin())
		.pipe(gulp.dest(output))
		.pipe($.count('## images was optimize', {logFiles: true}));
});

// css beautify
gulp.task('beautify', gulp.parallel(beautifyMainCss, beautifyOtherCss));

gulp.task('assets', (cb) => {
	return gulp.src(
			path.resolve(settings.assetsDir + '**'),
			{
				base: path.resolve(settings.assetsDir)
			}
		)
		.pipe($.cached('assets'))
		.pipe(gulp.dest(path.resolve(settings.publicDir)))
		.pipe($.count('## assets files copied', {logFiles: true}));
});

gulp.task('clear', (cb) => {
	$.del(path.resolve(settings.publicDir), {read: false}).then(paths => {
		cb();
	});
});

gulp.task('build', gulp.parallel(
	'assets',
	copyScripts,
	webpackHandler,
	'sassTask',
	'pugPages'
));
gulp.task('dist', gulp.series(
	(cb) => {
		isDevelopment = false;
		cb();
	},
	'clear',
	'build',
	gulp.parallel('imagesOptimize', 'beautify')
));
gulp.task('default', gulp.series(
	gulp.parallel(serve, gulp.parallel('build')),
	'watch'
));

