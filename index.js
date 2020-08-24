const docW = document.documentElement.clientWidth
const docH = document.documentElement.clientHeight

let oBaseBlock = {
  width: 90,
  height: 190
}

let mod = {
  aniTimer:null,
  isStop:false,
  blocks:[],
  speed:4,
  coinSpeed:6,
  car:null,
  smooth:8,  // 汽车移动速度
  keyBoardTimeGap:100,
  aniTimeGap:16,
  timerPreffix:'timer_',
  fontSize:40,
  baseBlock:{
    width:90,
    height:190
  },
  score:0,
  replay(){
    this.isStop = false;
    this.erase()
  },
  genBlocks() {
    let _this = this;
    return [
      {
        x: ~~(Math.random() * (docW / 2 - oBaseBlock.width)),
        y: -50 - ~~(Math.random()*200),
        width: oBaseBlock.width,
        height: oBaseBlock.height,
        speed: _this.speed + ~~(Math.random()*3)
      },
      {
        x: ~~(docW / 2) + ~~(Math.random() * (docW / 2 - oBaseBlock.width)),
        y: -250 - ~~(Math.random() * 200),
        width: oBaseBlock.width,
        height: oBaseBlock.height,
        speed: _this.speed + ~~(Math.random()*4)
      },
      {
        x: ~~((Math.random()*(~~(docW / oBaseBlock.width) )) * (1.5*oBaseBlock.width)),
        y: -50 - (~~Math.random()*50),
        width: 50,
        height: 50,
        coin: 10
      }
    ];
  },
  init(ele){
    let _this = this;


    let wrap = document.querySelector(ele)
    let canvas = document.createElement('canvas');
    let cxt = canvas.getContext('2d');

    canvas.classList.add('can')
    canvas.width = docW
    canvas.height = docH

    wrap.appendChild(canvas)

    this.canvas = canvas
    this.cxt = cxt;
    this.canWitdh = canvas.width
    this.canHeight = canvas.height

    this.carImg = document.createElement('img')
    this.carImg.src = 'images/car.png';

    this.car0Img = document.createElement('img')
    this.car0Img.src = 'images/car0.png';

    this.coinImg = document.createElement('img')
    this.coinImg.src = 'images/coin.png';

    this.scoreEle = document.querySelector('#Jscore')


    this.car = {
      x: ~~((_this.canWitdh -100)/2),
      y: _this.canHeight - 300,
      width:100,
      height:230
    };

    this.mouse = document.createElement('div')
    this.mouse.classList.add('mouse')
    this.mouse.style =`
      position:absolute;
      left:${~~((_this.canWitdh -100)/2)}px;
      top: ${_this.canHeight - 300}px;
      width:${100}px;
      height:${230}px;
      `
    wrap.appendChild(this.mouse)

    this.blocks = this.genBlocks()

    this.bindEvent()
  },
  erase() {
    this.cxt.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  draw() {
    let blocks = this.blocks
    let car = this.car

    this.cxt.save();
    this.cxt.drawImage(this.carImg, car.x, car.y, car.width, car.height);

    for (let i = 0; i < (blocks.length); i++) {
      let curBlock = blocks[i]
      if (curBlock.coin) {
        !curBlock.hide && this.cxt.drawImage(this.coinImg, curBlock.x, curBlock.y, curBlock.width, curBlock.height);
      }else{
        this.cxt.drawImage(this.car0Img,curBlock.x, curBlock.y, curBlock.width, curBlock.height);
      }

      // 只有四种情况完全不碰撞
      let b1 = (car.y >= (curBlock.y + curBlock.height)) // 汽车顶部大于块底部
      let b2 = ((car.y + car.height) <= curBlock.y) // 汽车底部小于块顶部
      let b3 = (car.x >= (curBlock.x + curBlock.width)) // 汽车左边大于块右边
      let b4 = ((car.x + car.width) <= curBlock.x) // 汽车右边小于块左边

      if (!(b1 || b2 || b3 || b4)) {
        if (curBlock.coin) {
          if (!curBlock.hide) {
            this.score += curBlock.coin
            this.scoreEle && (this.scoreEle.innerHTML = this.score)
          }
          curBlock.hide = true
        }else{
          this.isStop = true;
        }
      }
    }
    this.cxt.restore();
  },
  animate() {
    let blocks = this.blocks;
    let _blocks = [];

    for (let i = 0; i < blocks.length; i++) {
      let curBlock = blocks[i];

      curBlock.y += (curBlock.coin ? this.coinSpeed : curBlock.speed||this.speed);
      if (curBlock.y < this.canHeight) {
        _blocks.push(curBlock);
      }
    }

    if (!_blocks.length) {
      this.blocks = [] // 性能优化
      this.blocks = this.genBlocks()
    }
  },
  gameOver() {
    let text = '游戏结束'
    this.cxt.save();
    this.cxt.font = this.fontSize+"px Arial";
    this.cxt.fillStyle = 'pink';
    this.cxt.fillText(text, ~~((this.canWitdh - text.length*this.fontSize)/2), ~~((this.canHeight-this.fontSize)/2));
    this.cxt.restore();
  },
  clearTimer(){
    this.aniTimer && window.cancelAnimationFrame(this.aniTimer);
    this.aniTimer = null
  },
  play(){
    this.clearTimer() // 性能优化
    this.erase();
    this.draw();
    this.animate();
    if (this.isStop) {
      this.gameOver();
    } else {
      this.aniTimer = window.requestAnimationFrame(arguments.callee.bind(this));
    }
  },
  genTimer(keyCode,cb){
    if (this.smooth) {
      this[this.timerPreffix + keyCode] = setInterval(() => {
        cb && cb()
      },this.aniTimeGap)
    }else{
      cb && cb()
    }
  },
  bindEvent(){
    let last = new Date();
    let car = this.car
    let _this = this;

    document.onkeydown = ( (e)=> {
      let now = new Date();
      let keyCode = e.which

      if (!_this.smooth) {
        if (now.getTime() - last.getTime() < this.keyBoardTimeGap) {
          return;
        }
        last = now;
      }

      if (!_this[_this.timerPreffix + keyCode]) {
        switch (keyCode) {
          case 40:
          _this.genTimer(keyCode,()=>{
            if (car.y < (this.canHeight - car.height)) {
              car.y += _this.smooth ||car.height;
            }
          })
          break;
          case 39:
          _this.genTimer(keyCode,()=>{
            if (car.x < (this.canWitdh-car.width)) {
              car.x += _this.smooth ||car.width;
            }
          })
          break;
          case 38:
          _this.genTimer(keyCode,()=>{
            if (car.y > 0) {
              car.y -= _this.smooth ||car.height;
            }
          })
          break;
          case 37:
          _this.genTimer(keyCode,()=>{
            if (car.x > 0) {
              car.x -= _this.smooth ||car.width;
            }
          })
          break;
        }
      }
    });

    document.onkeyup = ((e)=>{
      let keyCode = e.which
      let tName = this.timerPreffix + keyCode
      if (_this[tName]) {
        clearInterval(_this[tName])
        _this[tName] = null
      }
    })

    this.mouse.addEventListener('touchstart',(e)=>{
      console.log(e);
    },{passive:false})
  }
}

;(() => {
  document.addEventListener('DOMContentLoaded', (e) => {
    mod.init('#Jgame')

    Jstart.addEventListener('click',(e)=>{
      mod.play()
    },false)

    Jstop.addEventListener('click', (e) => {
      mod.isStop = true
    }, false)
  }, false)
})()
