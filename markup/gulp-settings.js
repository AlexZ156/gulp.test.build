'use strict';
const entryDir = __dirname + '/assets';
const outputDir = __dirname;

module.exports = {
	imagesDir: {
		entry: `${entryDir}/images/`,
		output: `${outputDir}/images/`
	},
	scssDir: {
		sassEntry: `${entryDir}/scss/main.scss`,
		cssOutput: `${outputDir}/css/`,
		watch: `${entryDir}/scss/**/*.scss`
	},
	pugDir: {
		entry: `${entryDir}/*.pug`,
		output: `${outputDir}/`,
		watch: `${entryDir}/**/*.pug`,
	},
	jsDir: {
		entry: `${entryDir}/js/`,
		output: `${outputDir}/js/`
	},
	jsNames: {
		names: [`main`, 'jquery.main']
	}
};
