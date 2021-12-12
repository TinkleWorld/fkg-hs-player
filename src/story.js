import md5 from 'md5'
import { ResMgr } from './resmgr'
import { SpineCG } from './spine'

export class Story {
  constructor(id, lines) {
    this.messages = []
    this.pointer = 0
    this.resMgr = new ResMgr(window.URL_PREFIX, window.URL_VER)
    this.hidden = false
    this.dynamicCG = null
    this.el = document.getElementById(id + "-container")
    this.labelEl = document.getElementById(id + "-label")
    this.bgmEl = document.getElementById(id + "-bgm")
    this.voiceEl = document.getElementById(id + "-voice")
    this.sceneEl = document.getElementById(id + "-scene")
    this.spineEl = document.getElementById(id + '-spine')
    this.dialogEl = document.getElementById(id + "-dialog")
    for (let i = 0; i < lines.length; ++i) {
      let words = lines[i].split(",")
      // remove blank messages
      if (words.length < 2)  continue
      // name is name in mess but imagePath in image
      this.messages.push({
        type: words[0],
        name: words[1],
        text: words[2],
        voice: words[3],
      })
    }
    this.resMgr.onStepLoaded = () =>
      (document.getElementById("hs-loading").innerHTML = `Loading: ${Math.floor(this.resMgr.status() * 100)
      }%...`)
    this.loadResource()
  }

  loadResource() {
    for (let i = 0; i < this.messages.length; ++i) {
      let mess = this.messages[i]
      switch (mess.type) {
        case "mess":
          if (mess.voice)
            this.resMgr.add(`/voice/c/${mess.voice.split("/")[0]}/${md5(mess.voice.split("/")[1])}.mp3`)
          break
        case "image":
            this.resMgr.add(`/ultra/images/hscene_r18/${md5(mess.name.split("/")[1])}.bin`)
          break
        case "spine":
            this.dynamicCG = new SpineCG(
              `/hscene_r18_spine/${md5('spine' + mess.name.split("/")[1])}.bin`,
              `/hscene_r18_spine/${md5('atlas' + mess.name.split("/")[1])}.bin`)
            this.resMgr.add(this.dynamicCG.skeletonURL, 'compressed text')
            this.resMgr.add(this.dynamicCG.atlasURL, 'compressed text')
          break
        default:
          break
      }
    }
    this.resMgr.onload = () => {
      document.getElementById("hs-loading").style.display = "none"
      this.el.style.opacity = 1
      this.wheelEvent = this.el.addEventListener("wheel", (evt) => {
        this.pointer += Math.floor(evt.deltaY * 0.01 - 1)
        this.next()
      })
      this.clickEvent = this.el.addEventListener("click", () => {
        if (this.hidden) {
          this.dialogEl.style.opacity = 1
          this.labelEl.style.opacity = 1
          this.hidden = false
          return
        }
        this.next()
      })
      this.contextEvent = this.el.addEventListener("contextmenu", (evt) => {
        if (this.hidden) {
          this.dialogEl.style.opacity = 1
          this.labelEl.style.opacity = 1
        } else {
          this.dialogEl.style.opacity = 0
          this.labelEl.style.opacity = 0
        }
        this.hidden = !this.hidden
        evt.preventDefault()
      })

      this.dynamicCG && this.dynamicCG.init(
        this.resMgr.get(this.dynamicCG.skeletonURL).blob,
        this.resMgr.get(this.dynamicCG.atlasURL).blob
      )
    }
  }

  next() {
    this.bgmEl.play()
    if (this.pointer < 0) this.pointer = 0
    let current = this.messages[this.pointer]
    switch (current.type) {
      case "mess":
        if (current.name !== "") {
          this.labelEl.style.display = "block"
          this.labelEl.children[0].innerHTML = current.name
        } else {
          this.labelEl.style.display = "none"
        }

        if (current.text !== "") {
          this.dialogEl.style.display = "flex"
          this.dialogEl.children[0].innerHTML = current.text.replace(/\\n/g,"<br>")
        } else {
          this.dialogEl.style.display = "none"
        }

        if (current.voice !== "") {
          this.voiceEl.src = this.resMgr.getBlobUrl(
            `/voice/c/${current.voice.split("/")[0]}/${md5(current.voice.split("/")[1])}.mp3`
          )
          this.voiceEl.play()
        }
        break
      case "effect":
        break

      case "image":
        this.sceneEl.style.opacity = 0
        setTimeout(() => {
          this.sceneEl.src = `${this.resMgr.getBlobUrl(
            `/ultra/images/hscene_r18/${md5(current.name.split("/")[1])}.bin`)}`
          this.sceneEl.style.opacity = 1
        }, 400)
        break

      case "spine":
          this.spineEl.style.display = 'block'
          this.spineEl.appendChild(this.dynamicCG.app.view)
          this.dynamicCG.app.stage.interactive = true
        break
      case "spine_play":
        if (this.dynamicCG.inited) {
          this.sceneEl.style.display = 'none'
          this.spineEl.style.display = 'block'
          this.dynamicCG.play(current.name, current.text === 'true')
        }
      default:
        break
    }
    if (this.pointer < this.messages.length - 1) this.pointer++
  }

  unload() {
    this.bgmEl.pause()
    this.bgmEl.currentTime = 0
    this.voiceEl.pause()
    this.voiceEl.currentTime = 0
    this.resMgr = null
    this.message = null
    this.dynamicCG = null
    window.removeEventListener('wheel', this.wheelEvent)
    window.removeEventListener('contextmenu', this.contextEvent)
    window.removeEventListener('click', this.clickEvent)
  }
}