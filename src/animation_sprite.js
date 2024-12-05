export class animation extends PIXI.Sprite {
  constructor(scaling = 0.4) {
    super()
    this.scaling = scaling
    this.anim = null
  }
  // アニメーションの読み込みとセットアップ
  async createAnimation(isSelf) {
    const textures = []
    const spritesheet = await PIXI.Assets.load(
      isSelf ? 'texture.json' : 'hukidashi_white.json'
    )

    for (let i = 1; i < 86; i++) {
      const frameKey = isSelf
        ? `hukidashigreen (${i}).png`
        : `hukidashi_white (${i}).png`
      const texture = spritesheet.textures[frameKey]
      if (texture) {
        textures.push(texture)
      } else {
        continue
      }
    }

    this.anim = new PIXI.AnimatedSprite(textures)
    this.anim.anchor.set(0.5)
    this.anim.scale.set(this.scaling)
    this.anim.animationSpeed = 0.5
    this.anim.loop = false
    this.anim.gotoAndStop(0)
    this.addChild(this.anim)

    return this.anim // アニメーションを返す
  }

  // アニメーションを再生するメソッド
  playAnimation() {
    if (this.anim) {
			this.anim.gotoAndStop(0);
      this.anim.play()
			this.anim.onComplete = () => {
					this.anim.gotoAndStop(0) // 再生完了後、最初のフレームに戻す
			}
    }
    if(window.navigator.vibrate){
      window.navigator.vibrate([100,100,100,100,100]);
    }else if(window.navigator.mozVibrate){
      window.navigator.mozVibrate([200,200,200]);
    }else if(window.navigator.webkitVibrate){
      window.navigator.webkitVibrate([200,200,200]);
    }else{
      alert("sorry (T-T)");
    }
  }
	
}
