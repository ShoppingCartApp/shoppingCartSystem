# sha-256-js

A sha-256 hashing implementation in vanilla JavaScript.

Based on pseudocode found here:

https://en.wikipedia.org/wiki/SHA-2#Pseudocode

## Install and use in your project:

```sh
npm install --save sha-256-js
```

## Usage

```js
var sha256 = require('sha-256-js');

console.log(
  sha256("abc")
);

// ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
```

## Text passed to sha256 should be UTF8 encoded:

```js
var sha256 = require('sha-256-js'),
  utf8 = require('utf8');

console.log(
  sha256(
    utf8.encode("í")
  )
);

// 127035a8ff26256ea0541b5add6dcc3ecdaeea603e606f84e0fd63492fbab2c5
```

## Install globally and use on the command line:

```sh
git clone https://github.com/jeffallen6767/sha-256-js.git
cd sha-256-js
npm install -g
```

Examples:

```sh
  Usage: sha256  [options]


  Options:

    -V, --version             output the version number
    -m, --message [text]      text to apply sha-256
    -f, --file [path]         file to apply sha-256
    -c, --compare [checksum]  Checksum to compare generated with
    -h, --help                output usage information

C:\Users\Malachi\Downloads>dir

 Volume in drive C has no label.
 Volume Serial Number is 164D-63E3

 Directory of C:\Users\Malachi\Downloads

08/27/2017  09:45 AM    <DIR>          .
08/27/2017  09:45 AM    <DIR>          ..
08/27/2017  09:45 AM        25,677,520 gpg4win-2.3.4.exe
               1 File(s)     25,677,520 bytes
               2 Dir(s)  1,066,195,410,944 bytes free

C:\Users\Malachi\Downloads>sha256 -f gpg4win-2.3.4.exe
9342019e69d14a360ba6d01e66733578bcfa1e00151d7ccfeba4cdc177ed224b

C:\Users\Malachi\Downloads>sha256 -m abc
ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad

C:\Users\Malachi\Downloads>sha256 -m "a b c"
0e9f64031fcb2bc708b531c2a20441580425d151a38503f38592a7dd36019d3b

```
---

### Copyright (c) 2017 Jeffrey David Allen

#### Licensed under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
