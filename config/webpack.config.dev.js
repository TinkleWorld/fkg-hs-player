const path = require('path')

module.exports = {
  entry:{
    index:'./src/index.js'
  },
  output:{
    filename: 'flower.js', 
    path: path.resolve(__dirname,'../dist')
  },
  mode:"development",
  devServer: {
    static: {
      directory: './dist',
    },
    compress: true,
    port: 8080,
    hot: true
  },
  devtool: 'eval-source-map'
}