const path = require('path')

module.exports = {
  entry:{
    index:'./src/index.js'
  },
  output:{
    filename: 'flower.js', 
    path: path.resolve(__dirname,'../dist')
  },
  mode: "production"
}