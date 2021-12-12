import * as PIXI from 'pixi.js'
import md5 from 'md5'
import { ResMgr } from './resmgr'
import { Spine, TextureAtlas, AtlasAttachmentLoader, SkeletonJson } from '@pixi-spine/all-3.8';

export class SpineCG {
  constructor(skeletonURL, atlasURL) {
    this.skeletonURL = skeletonURL
    this.atlasURL = atlasURL
    this.width = 960
    this.app = new PIXI.Application({ width: this.width, height: this.width * 2 / 3 })
    this.inited = false
  }

  init (rawSkeletonData, rawAtlasData) {
    const images = rawAtlasData.match(/(.+)\.png/g).map(convertFilePath)
    const resMgr = new ResMgr(window.URL_PREFIX, window.URL_VER)
    images.forEach(image => {
      resMgr.add(image, 'compressed image', true)
    })
    resMgr.onload = () => {
      const spineAtlas = new TextureAtlas(rawAtlasData, function(line, callback) {
        callback(PIXI.BaseTexture.from(resMgr.get(convertFilePath(line)).burl))
      });
      
      const spineAtlasLoader = new AtlasAttachmentLoader(spineAtlas)
      const spineJsonParser = new SkeletonJson(spineAtlasLoader)
      const spineData = spineJsonParser.readSkeletonData(rawSkeletonData)
      this.spine = new Spine(spineData);
      this.inited = true
      this.spine.scale.set(0.25 / (this.spine.width / 4210))
    }
  }

  play(animationName, isLoop) {
    this.spine.x = this.app.screen.width / 2
    this.spine.y = this.app.screen.height / 2
    this.app.stage.addChild(this.spine)
    window.sp = this.spine
    window.app = this.app
    // play animation
    this.spine.state.setAnimation(0, animationName, isLoop)
  }
  effect(type) {  }
  wait(seconds) {  }
}

function convertFilePath(filename) {
  return `/hscene_r18_spine/${md5('webp' + filename.slice(0, -4))}.bin`
}