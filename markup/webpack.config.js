'use strict';
const settings = require('./gulp-settings.js');
const path = require('path');
let entryObj = {};

settings.jsES6.names.forEach(function(item) {
	entryObj[item] = path.resolve(__dirname, settings.jsES6.entry + '/' + item);
});

module.exports = function(dev) {
	return {
		entry: entryObj,

		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, settings.jsDir.output)
		},

		devtool: dev ? "cheep-inline-module-source-map" : '',

		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					loader: 'babel-loader',
					query: {
						plugins: ['transform-object-assign'],
						presets: ['es2015', 'stage-0'],
						compact: false
					}
				}
			]
		}
	};
};
