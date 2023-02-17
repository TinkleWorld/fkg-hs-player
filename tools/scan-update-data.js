const fs = require('fs')
const getFileList = require('./lib/getFileList')
const DATA = require('../dist/data.json')

!(async function main() {
  const scenes = getFileList('hscene_r18', true)
  for (let f = 0; f < scenes.length; ++f) {
    let scene = scenes[f]
    let id = scene.match(/r18_(\w+)\.txt/)[1]
    if (id.includes('_2')) id = +id.slice(0, 6) + 300000
    else id = parseInt(id)
    try {
      const text = await fs.promises.readFile(scene, 'utf-8')
      if (text.includes('spine')) {
        DATA.charaData.find(chara => chara.id == id).spine = true
        console.log(`${scene} added`)
      }
      
    } catch (e) {
      console.error(e)
    }
  }


  await fs.promises.writeFile('../dist/data.json', JSON.stringify(DATA, null, 4))
  console.log('finished.')

})()