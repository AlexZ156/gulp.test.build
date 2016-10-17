const settings = require('./gulp-settings.js');

module.exports = function(dev) {
	return {
		entry: settings.jsEs2015Dir.entry,

		output: {
			filename: '[name].js',
			path: settings.jsEs2015Dir.output
		},

		devtool: dev ? "cheep-inline-module-source-map" : '',

		module: {
			loaders: [{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					loader: 'babel-loader',
					query: {
						presets: ['es2015', 'stage-0']
					}
				}
			]
		}
	};
};
