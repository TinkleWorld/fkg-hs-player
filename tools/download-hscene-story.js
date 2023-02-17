const DATA = require('../dist/data.json')
const ids = DATA.charaData.map(e => e.id).filter(id => (id >= 110000 && id < 200000) || (id >= 410000))

const ThreadPool = require('./lib/threadpool.js')
const download = require('./lib/download.js')
const inflate = require('./lib/inflate')
const MD5 = require('./lib/md5.js')

const pool = new ThreadPool(32);
pool.step = () => console.log(`Running: ${ pool.running }, downloaded: ${ pool.counter } / ${ pool.sum }, ${ pool.status() }`)
pool.finish(() => console.log('finished'))

for (let i = 0; i < ids.length; ++i) {
  pool.add(fn => {
    let id = ids[i] > 400000 ? (ids[i] - 300000) + '_2' : ids[i]
    let url = `https://dugrqaqinbtcq.cloudfront.net/product/ynnFQcGDLfaUcGhp/assets/event/hscene_r18/${ MD5(`hscene_r18_${id}`) }.bin${DATA.URL_VER}`;
    return download(url, `./hscene_r18/hscene_r18_${id}.txt`).then(info => {
      if (info === 'existed') return;
      inflate(`./hscene_r18/hscene_r18_${id}.txt`, `./hscene_r18/hscene_r18_${id}.txt`)
    });
  })
}

pool.run()
