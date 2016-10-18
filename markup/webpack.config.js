'use strict';
const settings = require('./gulp-settings.js');
let entryObj = {};

settings.jsNames.names.forEach(function(item) {
	entryObj[item] = settings.jsDir.entry + item;
});

module.exports = function(dev) {
	return {
		entry: entryObj,

		output: {
			filename: '[name].js',
			path: settings.jsDir.output
		},

		devtool: dev ? "cheep-inline-module-source-map" : '',

		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					loader: 'babel-loader',
					query: {
						presets: ['es2015', 'stage-0'],
						compact: false
					}
				}
			]
		}
	};
};
