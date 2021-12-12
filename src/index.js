import md5 from 'md5'
import { inflate } from 'pako'
import { Story } from './story'
let options = [[ 'star', 3 ], [ 'star', 4 ], [ 'star', 5 ], [ 'star', 6 ], [ 'spine', true ]]
let activateOptionIndex = 4
let iconTableInited = false
let story = null

domReady('charas', async charaTable => {
  console.log('dom ready')
  const data = JSON.parse(await (await (fetch('./data.json'))).text())
  window.URL_PREFIX = data.URL_PREFIX
  window.URL_VER = data.URL_VER
  window.DEFAULT_ICON = data.DEFAULT_ICON
  showIconTable(data.charaData, charaTable)
  
  lazyload()
  window.addEventListener('scroll', lazyload, false)

  let starsEl = ['star3', 'star4', 'star5', 'star6', 'anime-cg']
  starsEl.forEach((star, index) => {
    let el = document.getElementById(star)
    el.onclick = () => {
      activateOptionIndex = index
      Array.from(document.querySelectorAll('#star-panel button')).forEach(btn => btn.className = "")
      if (options[index]) el.className = "activated"
      showIconTable(data.charaData, charaTable)
      lazyload()
    }
  })
})

function showIconTable(charaData, charaTable) {
  if (!iconTableInited) {
    const fragment = document.createDocumentFragment();
    for (let i = 0, icon = null, div = null; i < charaData.length; ++i) {
      div = document.createElement('div')
      icon = document.createElement('img')
      icon.className = 'chara-icon'
      icon.title = charaData[i].name
      icon.setAttribute('data-id', charaData[i].id)
      icon.setAttribute('data-src', `${window.URL_PREFIX}/ultra/images/character/dmm/i/${md5(`icon_l_${charaData[i].id}`)}.bin${window.URL_VER}`)
      icon.setAttribute('src', window.DEFAULT_ICON)
      let hsceneId = charaData[i].id > 400000 ? `${charaData[i].id - 300000}_2` : charaData[i].id
      icon.onclick = () => {
        loadHScene(hsceneId).then(lines => {
          if (story) cleanHScene(story)
          story = new Story('hs', lines)
          document.documentElement.scrollTop = 0
        })
      }
      icon.addEventListener('error', () => {
        window.wrongPicList = window.wrongPicList || []
        window.wrongPicList.push(charaData[i].id)
      })
      div.appendChild(icon)
      const label = document.createElement('p')
      label.innerText = charaData[i].name
      div.appendChild(label)
      fragment.appendChild(div)
      iconTableInited = true
    }
    charaTable.appendChild(fragment)
  }
  // apply filter
  const icons = document.querySelectorAll('#charas > div')
  const filter = options[activateOptionIndex]
  for (let i = 0; i < charaData.length; ++i) {
    if (charaData[i][filter[0]] !== filter[1]) icons[i].style.display = 'none'
    else icons[i].style.display = 'block'
  }
}

function domReady(id, callback) {
  let timer = window.setInterval(() => {
    let dom = document.getElementById(id)
    console.log(dom)
    if (dom) {
      window.clearInterval(timer)
      callback && callback(dom)
    }
  }, 200)
}

function lazyload() {
  const imagesToLoad =  Array.from(document.querySelectorAll('#charas > div'))
    .filter(div => div.style.display !== 'none').map(div => div.children[0])
    .filter(img => img.src === window.DEFAULT_ICON)
  const seeHeight = document.documentElement.clientHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  for (let i = 0; i < imagesToLoad.length; ++i)
    if (imagesToLoad[i].offsetTop < seeHeight + scrollTop) imagesToLoad[i].src = imagesToLoad[i].getAttribute('data-src')
}

function loadHScene(charaId) {
  document.getElementById('logo').style.display = 'none'
  return new Promise(resolve => {
    fetch(`${window.URL_PREFIX}/event/hscene_r18/${md5(`hscene_r18_${charaId}`)}.bin${window.URL_VER}`)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        let dec = new TextDecoder('utf-8')
        let story = dec.decode(inflate(buffer))
        resolve(story.replace(/\r\n/g, '\n').split('\n'))
      })
  })
}

/**
 * Clean Story Board before reloading
 * @param {Story} story 
 */
function cleanHScene(story) {
  story.unload()
  document.getElementById('hs-container').style.opacity = 0.7
  document.getElementById('hs-container').innerHTML = ''
  document.getElementById('hs-container').innerHTML = 
  `<div id="hs-loading"></div>
  <audio id="hs-bgm" src="./bgm/fkg_bgm_hscene001.mp3"></audio>
  <audio id="hs-voice"></audio>
  <img id="hs-scene"></img>
  <div id="hs-spine" style="display: none;"></div>
  <div id="hs-frame"></div>
  <div id="hs-label">
    <span id="hs-name"></span>
  </div>
  <div id="hs-dialog">
    <span id="hs-text"></span>
  </div>`  
}