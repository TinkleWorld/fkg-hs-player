import { inflate } from 'pako'
export class ResMgr {
  constructor(urlPrefix, urlVer) {
    this.files = []
    this.urlPrefix = urlPrefix
    this.urlVer = urlVer
  }

  /**
   * 
   * @param {string} url 
   * @param {string} type
   * @param {boolean} withBuffer
   * @returns 
   */
  add(url, type, withBuffer) {
    if (this.get(url)) return;
    this.files.push({
      name: url,
      blob: null,
      burl: null,
      load: false,
    });
    // async data requesting
    fetch(`${this.urlPrefix}${url}${this.urlVer}`)
      .then((req) => req.arrayBuffer())
      .then((data) => {
        if (url.includes("voice") && !url.includes('mp3')) data = inflate(data);
        if (url.includes("spine")) {
          data = inflate(data)
          if (type && type === 'compressed text') {
            data = new TextDecoder().decode(data)
          }
        }
        let file = this.get(url)
        if (!file) return
        file.blob = data
        file.burl = window.URL.createObjectURL(
          new Blob([new Uint8Array(data)])
        )
        this.onStepLoaded && this.onStepLoaded()
        file.load = true;
        if (this.status() === 1) {
          this.onload ? this.onload() : null;
        }
      });
  }
  /**
   * @param {string} url 
   * @returns {{ name: string, blob: any, burl: string, load: boolean }}
   */
  get(url) {
    return this.files.find((file) => file.name === url);
  }

  getBlobUrl(url) {
    let file = this.get(url);
    if (!file) return null;
    return this.get(url).burl;
  }

  status() {
    return this.files.filter((file) => file.load).length / this.files.length
  }
}
