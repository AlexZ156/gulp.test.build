module.exports = {
	imagesDir: {
		entry: './sourceimages/',
		output: './images/'
	},
	scssDir: {
		sassEntry: './scss/main.scss',
		cssOutput: './css',
		watch: './scss/**/*.scss'
	},
	pugDir: {
		entry: './dev/*.pug',
		output: './',
		watch: './dev/**/*.pug',
	}
};
