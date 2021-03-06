
const through = require('through2')
const path = require('path')
const slash = require('slash')
const Vinyl = require('vinyl')

class GenerateIndex extends through.ctor() {
  constructor (opt = {}) {
    super({
      objectMode: true,
      highWaterMark: 16
    })

    this.opt = Object.assign({}, GenerateIndex.defOpt, opt)
  }

  _transform (file, enc, cb) {
    if (this.files == null) {
      this.files = []
    }
    this.files.push(file)
    cb()
  }

  stringify (obj, indent = '') {
    if (typeof obj === 'string') {
      return obj
    }
    let out = '{\n'
    for (const key in obj) {
      const val = obj[key]
      out += indent + '  ' + JSON.stringify(key) + ': ' + this.stringify(val, indent + '  ') + ',\n'
    }
    out += indent + '}'
    return out
  }

  trimExt (path) {
    return path.replace(/\.[^/.]+$/, '')
  }

  baseRequire (file) {
    let toRequire = file.relative
    if (this.opt.dest) {
      toRequire = path.relative(path.resolve(this.opt.dest), file.path)
    }
    toRequire = slash(toRequire)
    return 'require(' + JSON.stringify('./' + this.trimExt(toRequire)) + ')'
  }

  makeRequire (group, file) {
    const baseRequire = this.baseRequire(file)
    const name = this.trimExt(file.basename)
    const required = require(file.path)
    if (typeof required[name] !== 'undefined') {
      group[name] = baseRequire + '.' + name
    } else {
      group[name] = baseRequire
    }
    return group
  }

  makeRequireTree (files) {
    return files.reduce((out, file) => {
      const parts = file.relative.split(path.sep)
      let cur = out
      parts.pop()
      if (!this.opt.flat) {
        parts.forEach((part) => {
          cur = cur[part] || (cur[part] = {})
        })
      }
      cur = this.makeRequire(cur, file)
      return out
    }, {})
  }

  _flush (cb) {
    let content = 'module.exports = '
    content += this.stringify(this.makeRequireTree(this.files))

    const base = this.files[this.files.length - 1].base
    const file = new Vinyl({
      cwd: '',
      base: base,
      path: path.join(base, this.opt.name),
      contents: Buffer.from(content)
    })
    this.push(file)
    cb()
  }
}

GenerateIndex.defOpt = {
  name: 'index.js',
  dest: null,
  flat: false
}

module.exports = function (name = 'index.js') {
  return new GenerateIndex(name)
}
module.exports.GenerateIndex = GenerateIndex
