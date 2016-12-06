const devDir = 'dev/';
const publicDir = 'public/';

module.exports = {
	publicDir,
	devDir,
	assetsDir: `${devDir}assets/`,
	/*imagesDir: {
		entry: 'assets/images/',
		output: 'images/'
	},*/
	scssDir: {
		entry: 'dev/scss/',
		output: 'public/css/',
		mainFileName: 'style',
		mainFileOutput: './public/'
	},
	pugDir: {
		entry: 'dev/',
		output: 'public'
	},
	jsDir: {
		entry: 'dev/js/',
		output: 'public/js/'
	},
	jsES6: {
		names: ['main']
	}
};
