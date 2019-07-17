
const chai = require('chai')
chai.use(require('chai-fs'))
const assert = chai.assert
const gulpRequireIndex = require('../index.js')
const gulp = require('gulp')
const rimraf = require('rimraf')

describe('gulp-require-index', function () {
  beforeEach(function (done) {
    rimraf('./test/output/', done)
  })

  afterEach(function () {
    delete require.cache[require.resolve('./output/index.js')]
  })

  it('can create an index file', function (done) {
    return gulp.src(['./test/files/**/*.js'])
      .pipe(gulpRequireIndex({ dest: './test/output/' }))
      .pipe(gulp.dest('./test/output/'))
      .on('end', function () {
        assert.pathExists('./test/output/index.js')
        const index = require('./output/index.js')
        assert.equal(index.Foo, require('./files/Foo'))
        assert.equal(index.Bar, require('./files/Bar').Bar)
        assert.equal(index.folder.Baz, require('./files/folder/Baz').Baz)
        assert.equal(index.folder.sub.Hey, require('./files/folder/sub/Hey').Hey)
        return done()
      })
  })

  it('can create an flat index file', function (done) {
    return gulp.src(['./test/files/**/*.js'])
      .pipe(gulpRequireIndex({ dest: './test/output/', flat: true }))
      .pipe(gulp.dest('./test/output/'))
      .on('end', function () {
        assert.pathExists('./test/output/index.js')
        const index = require('./output/index.js')
        assert.equal(index.Foo, require('./files/Foo'))
        assert.equal(index.Bar, require('./files/Bar').Bar)
        assert.equal(index.Baz, require('./files/folder/Baz').Baz)
        assert.equal(index.Hey, require('./files/folder/sub/Hey').Hey)
        return done()
      })
  })
})
