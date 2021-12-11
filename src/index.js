import md5 from 'md5'
import { inflate } from 'pako'
import { Story } from './story'
let options = [false, false, false, true]
let story = null

domReady('charas', async charaTable => {
  console.log('dom ready')
  const data = JSON.parse(await (await (fetch('./data.json'))).text())
  window.URL_PREFIX = data.URL_PREFIX
  window.URL_VER = data.URL_VER
  showIconTable(data.charaData, charaTable)

  let loadImages = lazyload()
  loadImages()
  window.addEventListener('scroll', loadImages, false)

  let starsEl = ['star3', 'star4', 'star5', 'star6']
  starsEl.forEach((star, index) => {
    let el = document.getElementById(star)
    el.onclick = () => {
      options[index] = !options[index]
      if (options[index]) {
        el.className = "activated"
      } else {
        el.className = ""
      }
      showIconTable(charaTable)
    }
  })
})

function showIconTable(charaData, charaTable) {
  // remove all icons
  charaTable.innerHTML = ''
  let charasToShow = charaData.filter(chara => options[chara.star - 3])
  const fragment = document.createDocumentFragment();
  for (let i = 0, icon = null, div = null; i < charasToShow.length; ++i) {
    div = document.createElement('div')
    icon = document.createElement('img')
    icon.className = 'chara-icon'
    icon.title = charasToShow[i].name
    icon.setAttribute('data-id', charasToShow[i].id)
    icon.setAttribute('data-src', `https://dugrqaqinbtcq.cloudfront.net/product/ynnFQcGDLfaUcGhp/assets/`
      + `ultra/images/character/dmm/i/${md5(`icon_l_${charasToShow[i].id}`)}.bin?1.81.0`)
    icon.setAttribute('src', 'https://chiyo.now.sh/favicon.ico')
    let hsceneId = charasToShow[i].id > 400000 ? `${charasToShow[i].id - 300000}_2` : charasToShow[i].id
    icon.onclick = () => {
      loadHScene(hsceneId).then(lines => {
        if (story) cleanHScene(story)
        story = new Story('hs', lines)
      })
    }
    icon.addEventListener('error', () => {
      window.wrongPicList = window.wrongPicList || []
      window.wrongPicList.push(charasToShow[i].id)
    })
    div.appendChild(icon)
    const label = document.createElement('p')
    label.innerText = charasToShow[i].name
    div.appendChild(label)
    fragment.appendChild(div)
  }
  charaTable.appendChild(fragment)
}

function domReady(id, callback) {
  let timer = window.setInterval(() => {
    let dom = document.getElementById(id)
    console.log(dom)
    if (dom) {
      window.clearInterval(timer)
      callback && callback(dom)
    }
  }, 50)
}

function lazyload() {
  let images = document.getElementsByTagName('img')
  let n = 0
  return function () {
    let seeHeight = document.documentElement.clientHeight;
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    for (let i = n; i < images.length; i++) {
      if (images[i].offsetTop < seeHeight + scrollTop) {
        if (images[i].getAttribute('src') === `https://chiyo.now.sh/favicon.ico`) {
          images[i].src = images[i].getAttribute('data-src');
        }
        n++
      }
    }
  }
}

function loadHScene(charaId) {
  return new Promise(resolve => {
    fetch(`https://dugrqaqinbtcq.cloudfront.net/product/ynnFQcGDLfaUcGhp/assets/event/hscene_r18/${md5(`hscene_r18_${charaId}`)}.bin?o1`)
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
  story.bgmEl.pause()
  story.bgmEl.currentTime = 0
  story.voiceEl.pause()
  story.voiceEl.currentTime = 0
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