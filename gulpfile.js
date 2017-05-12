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

require('source-map-support').install();

const ava = require('gulp-ava');
const clangFormat = require('clang-format');
const del = require('del');
const format = require('gulp-clang-format');
const gulp = require('gulp');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const path = require('path');
const process = require('process');

const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const outDir = rebase('build');
const sources = [rebase('src/**/*.ts')];
const tests = [rebase('test/**/*.ts')];
const allFiles = [rebase('*.js')].concat(sources, tests);

function rebase(glob) {
  let rootDir;
  if (__dirname.split(path.sep).slice(-2)[0] != "node_modules") {
    rootDir = path.join(path.resolve(__dirname, './example'), glob);
  } else {
    rootDir = path.join(path.resolve(__dirname, '../../'), glob);
  }
  return rootDir;
}

let exitOnError = true;
function onError() {
  if (exitOnError) {
    process.exit(1);
  }
}

gulp.task('test.check-format', () => {
  return gulp.src(allFiles)
      .pipe(format.checkFormat('file', clangFormat))
      .on('warning', onError);
});

gulp.task('format', () => {
  return gulp.src(allFiles, {base: '.'})
      .pipe(format.format('file', clangFormat))
      .pipe(gulp.dest('.'));
});

gulp.task('test.check-lint', () => {
  return gulp.src(allFiles)
      .pipe(tslint({formatter: 'verbose'}))
      .pipe(tslint.report())
      .on('warning', onError);
});

gulp.task('clean', () => {
  return del([`${outDir}`]);
});

gulp.task('compile', () => {
  const tsResult = gulp.src(sources)
                       .pipe(sourcemaps.init())
                       .pipe(ts.createProject(tsconfigPath)())
                       .on('error', onError);
  return merge([
    tsResult.dts.pipe(gulp.dest(`${outDir}/definitions`)),
    tsResult.js
        .pipe(sourcemaps.write(
            '.', {includeContent: false, sourceRoot: '../../src'}))
        .pipe(gulp.dest(`${outDir}/src`)),
    tsResult.js.pipe(gulp.dest(`${outDir}/src`))
  ]);
});

gulp.task('test.compile', ['compile'], () => {
  return gulp.src(tests, {base: '.'})
      .pipe(sourcemaps.init())
      .pipe(ts.createProject(tsconfigPath)())
      .on('error', onError)
      .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../..'}))
      .pipe(gulp.dest(`${outDir}/`));
});

gulp.task('test.unit', ['test.compile'], () => {
  return gulp.src([`${outDir}/test/**/*.js`]).pipe(ava({verbose: true}));
});

gulp.task('watch', () => {
  exitOnError = false;
  gulp.start(['test.compile']);
  // TODO: also run unit tests in a non-fatal way
  return gulp.watch(allFiles, ['test.compile']);
});

gulp.task('test', ['test.unit', 'test.check-format', 'test.check-lint']);
gulp.task('default', ['compile']);