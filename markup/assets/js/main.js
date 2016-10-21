const serve = (cb) => (
	browserSync.init({
		server: {
			baseDir: './',
			port: 30103,
			directory: true,
			notify: false
		}
	}, cb)

);
