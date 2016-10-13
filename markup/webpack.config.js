var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: __dirname + "/dev/index.js",

	output: {
		// Make sure to use [name] or [id] in output.filename
		//  when using multiple entry points
		filename: "index.js",
		path: __dirname + "/build/"
	},

	// watch: true,
	// devtool: "cheep-inline-module-source-map",

	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'react', 'stage-0']
				}
			}/*,
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
