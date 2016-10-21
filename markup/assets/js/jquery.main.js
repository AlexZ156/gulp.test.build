const serve = (cb) => (
	browserSync.init({
		server: {
			baseDir: './',
			port: 30106,
			directory: true,
			notify: false
		}
	}, cb)
);
