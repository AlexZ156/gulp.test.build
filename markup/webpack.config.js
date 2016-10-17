var CopyWebpackPlugin = require('copy-webpack-plugin');
const settings = require('./gulp-settings.js');

module.exports = function(dev) {
	return {
		entry: settings.jsEs2015Dir.entry,

		output: {
			// Make sure to use [name] or [id] in output.filename
			//  when using multiple entry points
			filename: '[name].js',
			path: settings.jsEs2015Dir.output
		},

		// watch: true,
		devtool: dev ? "cheep-inline-module-source-map" : '',

		module: {
			loaders: [{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					loader: 'babel-loader',
					query: {
						presets: ['es2015', 'react', 'stage-0']
					}
				}
				/*,
							{
								test: '/\.(png|jpg|gif)$/',
								loader: 'file?name=[name].[ext]'
							}*/
			]
		},

		/*plugins: [
			new CopyWebpackPlugin([
					{
						from: __dirname + '/sourceimages',
						to: __dirname + '/images'
					}
				], {
					copyUnmodified: true
				})
		]*/
	};
};
