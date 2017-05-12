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

/**
 * Simple interface to describe the Hello World writer.
 */
interface IAbstractHelloWorldWriter {
  writeHelloWorld(): void;
}

/**
 * Implementation of the IAbstractHelloWriter
 */
class HelloWorldWriterImpl implements IAbstractHelloWorldWriter {
  /**
   * Write 'Hello World!' to the console.
   */
  public writeHelloWorld() {
    console.log('Hello World!');
  }
}

let helloWorldWriter: IAbstractHelloWorldWriter;
helloWorldWriter = new HelloWorldWriterImpl();
helloWorldWriter.writeHelloWorld();
