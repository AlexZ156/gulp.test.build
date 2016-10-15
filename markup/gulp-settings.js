'use strict';
const entryDir = __dirname + '/dev';
const outputDir = __dirname + '/build';

module.exports = {
	imagesDir: {
		entry: entryDir + '/images/',
		output: outputDir + '/images/'
	},
	scssDir: {
		sassEntry: entryDir + '/scss/main.scss',
		cssOutput: outputDir + '/css',
		watch: entryDir + '/scss/**/*.scss'
	},
	pugDir: {
		entry: entryDir + '/*.pug',
		output: outputDir + '/',
		watch: entryDir + '/**/*.pug',
	},
	jsEs2015Dir: {
		entry: entryDir + '/js/main.js',
		output: outputDir + '/js/'
	}
};
