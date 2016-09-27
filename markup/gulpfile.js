var gulp = require('gulp');
var webpack = require('webpack');
var webpackconfig = require('./webpack.config.js')
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');

gulp.task('webpack', function(cb) {
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
});