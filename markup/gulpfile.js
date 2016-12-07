'use strict';
const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'webpack', 'autoprefixer', 'del']
});
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
	.pipe($.cached('allSass'))
	.pipe($.debug({title: 'src'}))
	.pipe($.sass().on('error', $.sass.logError))
	.pipe($.debug({title: 'sass'}))
	.pipe($.postcss(postcssPlagins))
	.pipe($.debug({title: 'autoprefixer'}))
	.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.output)));
};

const mainSass = () => {
	const entryDir = path.resolve(__dirname, settings.scssDir.entry + settings.scssDir.mainFileName);

	return gulp.src(
		entryDir + '.scss',
		{
			base: entryDir
		}
	)
	.pipe($.if(isDevelopment, $.sourcemaps.init()))
	.pipe($.sass().on('error', $.sass.logError))
	.pipe($.postcss(postcssPlagins))
	.pipe($.debug({title: 'sass'}))
	.pipe($.if(isDevelopment, $.sourcemaps.write('./', {includeContent: true})))
	.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.mainFileOutput + settings.scssDir.mainFileName)))
	.pipe(browserSync.stream());
};

const reloadPage = (cb) => {
	browserSync.reload();
	cb();
}

// compile from sass to css
gulp.task('sassTask', gulp.parallel(allSass, mainSass));

// compile from pug to html
gulp.task('pugTask', function() {
	return gulp.src(
			path.resolve(__dirname, settings.pugDir.entry + '*.pug'),
			{
				base: path.resolve(__dirname, settings.pugDir.entry)
			}
		)
		.pipe($.cached('pug'))
		.pipe($.pug({pretty: '\t'})
		.pipe($.debug({title: 'pug'}))
		.on('error', err => {
			console.log(err);
			cb();
		}))
		.pipe(gulp.dest(path.resolve(__dirname, settings.pugDir.output)));
});

gulp.task('watch', function(cb) {
	gulp.watch(
		path.resolve(__dirname, settings.scssDir.entry + '**/*.scss'),
		gulp.series('sassTask')
	).on('unlink', function(filePath) {
		delete $.cached.caches.assets[path.resolve(filePath)];
	});

	gulp.watch(
		path.resolve(__dirname, settings.pugDir.entry + '**/*.pug'),
		gulp.series('pugTask')
	).on('unlink', function(filePath) {
		delete $.cached.caches.assets[path.resolve(filePath)];
	});

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.entry + '*'),
			'!' + path.resolve(__dirname, settings.jsES6.entry)
		],
		gulp.series(copyScripts)
	).on('unlink', function(filePath) {
		delete $.cached.caches.assets[path.resolve(filePath)];
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
	.pipe($.debug({title: 'copyScripts'}))
	.pipe(gulp.dest(settings.jsDir.output));
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
		.pipe($.debug({title: 'beautify'}))
		.pipe(gulp.dest(cssUrl));
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
		.pipe($.debug({title: 'beautify'}))
		.pipe(gulp.dest(cssUrl));
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
		.pipe(gulp.dest(output));
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
		.pipe($.debug({title: 'assets'}))
		.pipe(gulp.dest(path.resolve(settings.publicDir)));
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
	'pugTask'
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

