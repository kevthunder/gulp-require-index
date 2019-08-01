
const chai = require('chai')
chai.use(require('chai-fs'))
const assert = chai.assert
const gulpRequireIndex = require('../index.js')
const gulp = require('gulp')
const rimraf = require('rimraf')
const Vinyl = require('vinyl')
const pathRequire = require('path')
const path = Object.assign({}, pathRequire)

describe('gulp-require-index', function () {
  beforeEach(function (done) {
    rimraf('./test/output/', done)
  })

  afterEach(function () {
    try {
      delete require.cache[require.resolve('./output/index.js')]
    } catch (e) {
      // not all test create the output file. Save to ignore
    }
  })

  it('can get the base require for a file', function () {
    const generator = new gulpRequireIndex.GenerateIndex('test.js')
    const file = new Vinyl({
      cwd: '',
      base: path.resolve('./test/files'),
      path: path.resolve('./test/files/folder/Baz.js')
    })
    const res = generator.baseRequire(file)
    assert.equal(res, 'require("./folder/Baz")')
  })

  it('can get the proper require for a file', function () {
    const generator = new gulpRequireIndex.GenerateIndex('test.js')
    const file = new Vinyl({
      cwd: '',
      base: path.resolve('./test/files'),
      path: path.resolve('./test/files/folder/Baz.js')
    })
    const res = generator.makeRequire({}, file)
    assert.deepEqual(res, { Baz: 'require("./folder/Baz").Baz' })
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

  describe('win32', function () {
    beforeEach(function () {
      Object.assign(pathRequire, pathRequire.win32)
    })

    afterEach(function () {
      Object.assign(pathRequire, path)
    })

    it('can get the base require for a file', function () {
      const generator = new gulpRequireIndex.GenerateIndex('test.js')
      const file = new Vinyl({
        cwd: '',
        base: path.resolve('./test/files'),
        path: path.resolve('./test/files/folder/Baz.js')
      })
      const res = generator.baseRequire(file)
      assert.equal(res, 'require("./folder/Baz")')
    })
  })
})
