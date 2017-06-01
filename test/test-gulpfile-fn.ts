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

import test from 'ava';
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';

// tslint:disable-next-line:variable-name
const Module = require('module');

const fileUnderTest: string = path.resolve(__dirname, '../../gulpfile-fn.js');

function requireNoEval(filename: string) {
  const content = fs.readFileSync(filename, 'utf8');
  const wrapped = Module.wrap(content);
  return vm.runInThisContext(wrapped);
}

// Like `require`ing a module, but this allows us to test module behaviour
// against a different 'parent' module.
function requireWithParent(filename: string, parent: any): any {
  const compiledModule = requireNoEval(filename);
  const module = {exports: {}, parent: parent};
  compiledModule(
      module.exports, require, module, parent, 'fake__directory',
      'fake__filename');
  return module;
}

function makeFakeGulp(): any {
  return {task: () => { /*nop*/ }};
}

test('should throw if not loaded through a gulpfile.js', t => {
  const module = requireWithParent(fileUnderTest, {});
  t.throws(() => {
    module.exports();
  });
});

test('should accept gulpfile.js as a suffix only', t => {
  const module = requireWithParent(
      fileUnderTest, {filename: '/someplace/gulpfile.js/gulpfile'});
  t.throws(() => {
    module.exports();
  });
});

test('should work if the parent is a gulpfile', t => {
  const module =
      requireWithParent(fileUnderTest, {filename: '/someplace/gulpfile.js'});
  const gulp = makeFakeGulp();
  module.exports(gulp);
  t.pass();
});

test('should work if some ancestor is a gulpfile', t => {
  const module = requireWithParent(fileUnderTest, {
    filename: 'fake',
    parent: {
      filename: 'bake',
      parent: {
        filename: '/not-a-suffix/gulpfile.js$',
        parent: {
          filename: '/matching/gulpfile.js',
          parent: {filename: '/too/far/gulpfile.js'}
        }
      }
    }
  });
  const gulp = makeFakeGulp();
  module.exports(gulp);
  t.is(
      gulp.gootsConfig.rootDir, '/matching',
      'rootDir should be derived from the importig gulpfile');
});
