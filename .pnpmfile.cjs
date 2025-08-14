module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'sqlite3') {
        pkg.requiresBuild = true
      }
      return pkg
    }
  }
}
