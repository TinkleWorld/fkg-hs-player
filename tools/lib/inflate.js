const fs = require('fs')
const zlib = require('zlib')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const __zlib_inflate = promisify(zlib.inflate)

if (process.argv.length < 2) {
  console.log(`usage: node inflate.js [input] [output]`)
  return
}

async function inflate(input, output) {
  let fileData = await readFile(input)
  await writeFile(output || input + '.out', await __zlib_inflate(fileData))
}

if (require.main === module) {
  inflate(process.argv[2], process.argv[3])
}

module.exports = inflate
