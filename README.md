# gulp-require-index

## Installation

Install package with NPM and add it to your development dependencies:
```sh
npm install gulp-require-index --save-dev
```

You can install it directly from github:
```sh
npm install kevthunder/gulp-require-index --save-dev
```

## Usage

```js
var requireIndex = require('gulp-require-index');

gulp.task('html:buildIndex', function() {
  return gulp.src('./lib/**/*.js')
    .pipe(requireIndex())
    .pipe(gulp.dest('./'));
});
```

This will generate a index.js from the files found in `./lib` and output something similar to :

```js
module.exports = {
  "Bar": require("./lib/Bar").Bar,
  "Foo": require("./lib/Foo"),
  "folder": {
    "Baz": require("./lib/folder/Baz").Baz,
    "Hi": require("./lib/folder/Hi").Hi,
    "sub": {
      "Hey": require("./lib/folder/sub/Hey").Hey,
    },
  },
}
```

## options
Some options can be specified, the default are:

```js
  // the name of the file generated
  name: 'index.js',
  // the destination for the generated file (used for the relative path)
  dest: null,
  // set to true to have the definitions on the root level instead of nested
  flat: false
```