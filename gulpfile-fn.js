/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// gulp binary loads the gulp module from the top-level node_modules folder.
// To make things work we need to let the caller load gulp and pass it in.
module.exports = function(gulp, options) {
  options = options || {};

  require('source-map-support').install();

  const ava = require('gulp-ava');
  const clangFormat = require('clang-format');
  const del = require('del');
  const format = require('gulp-clang-format');
  const merge = require('merge2');
  const sourcemaps = require('gulp-sourcemaps');
  const ts = require('gulp-typescript');
  const tslint = require('gulp-tslint');
  const path = require('path');
  const process = require('process');

  let rootDir = options.rootDir;

  if (!rootDir) {
    let parent = module.parent;
    while (parent) {
      if (parent.filename.endsWith('gulpfile.js')) {
        rootDir = path.dirname(parent.filename);
        break;
      }
      parent = parent.parent;
    }

    if (!rootDir) {
      throw new Error('Unable to detect parent gulpfile.');
    }
  }

  function rebase(glob) {
    return path.join(path.resolve(rootDir, glob));
  }

  const sources = [rebase('src/**/*.ts'), '!**/node_modules/**/*'];
  const tests = [rebase('test/**/*.ts'), '!**/node_modules/**/*'];
  const gootsConfig = gulp.gootsConfig = {
    rootDir: rootDir,
    tsconfigPath: path.join(__dirname, 'tsconfig.json'),
    tslintPath: path.join(__dirname, 'tslint.json'),
    outDir: rebase('build'),
    sources: sources,
    tests: tests,
    allFiles: [rebase('*.js')].concat(sources, tests)
  };

  let exitOnError = true;
  function onError() {
    if (exitOnError) {
      process.exit(1);
    }
  }

  gulp.task('test.check-format', () => {
    return gulp.src(gootsConfig.allFiles)
        .pipe(format.checkFormat('file', clangFormat))
        .on('warning', onError);
  });

  gulp.task('format', () => {
    return gulp.src(gootsConfig.allFiles, {base: '.'})
        .pipe(format.format('file', clangFormat))
        .pipe(gulp.dest('.'));
  });

  gulp.task('test.check-lint', () => {
    return gulp.src(gootsConfig.allFiles)
        .pipe(tslint(
            {configuration: gootsConfig.tslintPath, formatter: 'verbose'}))
        .pipe(tslint.report())
        .on('warning', onError);
  });

  gulp.task('clean', () => {
    return del([`${gootsConfig.outDir}`]);
  });

  gulp.task('compile', () => {
    const tsResult = gulp.src(gootsConfig.sources)
                         .pipe(sourcemaps.init())
                         .pipe(ts.createProject(gootsConfig.tsconfigPath)())
                         .on('error', onError);
    return merge([
      tsResult.dts.pipe(gulp.dest(`${gootsConfig.outDir}/definitions`)),
      tsResult.js
          .pipe(sourcemaps.write(
              '.', {includeContent: false, sourceRoot: '../../src'}))
          .pipe(gulp.dest(`${gootsConfig.outDir}/src`)),
      tsResult.js.pipe(gulp.dest(`${gootsConfig.outDir}/src`))
    ]);
  });

  gulp.task('test.compile', ['compile'], () => {
    return gulp.src(gootsConfig.tests, {base: '.'})
        .pipe(sourcemaps.init())
        .pipe(ts.createProject(gootsConfig.tsconfigPath)())
        .on('error', onError)
        .pipe(
            sourcemaps.write('.', {includeContent: false, sourceRoot: '../..'}))
        .pipe(gulp.dest(`${gootsConfig.outDir}/`));
  });

  gulp.task('test.unit', ['test.compile'], () => {
    return gulp.src([`${gootsConfig.outDir}/test/**/*.js`]).pipe(ava({
      verbose: true
    }));
  });

  gulp.task('watch', () => {
    exitOnError = false;
    gulp.start(['test.compile']);
    // TODO: also run unit tests in a non-fatal way
    return gulp.watch(gootsConfig.allFiles, ['test.compile']);
  });

  gulp.task('test', ['test.unit', 'test.check-format', 'test.check-lint']);
  gulp.task('default', ['compile']);

  return gulp;
};
