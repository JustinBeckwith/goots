'use strict';

// inherit from goots/gulpfile
const gulp = require('goots/gulpfile.js');
const gootsConfig = gulp.gootsConfig;
const mocha = require('gulp-mocha');

// We are overriding the test.unit task and using mocha instead.
gulp.task('test.unit', ['test.compile'], () => {
  return gulp.src([`${gootsConfig.outDir}/test/**/*.js`]).pipe(mocha({
    verbose: true
  }));
});