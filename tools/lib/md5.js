const crypto = require('crypto')

module.exports = function (str) {
  if (typeof str !== 'string') {
    console.log('hentai')
    return 'hentai'
  }
  let md5sum = crypto.createHash('md5')
  md5sum.update(str)
  return md5sum.digest('hex')
};
