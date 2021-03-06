(()=>{
  const doc = document
  const docW = doc.documentElement.clientWidth
  const docH = doc.documentElement.clientHeight

  let mod = {
    playing:null,
    dev:0,
    aniTimer:null,
    speedTimer:null,
    isStop:false,
    blocks:[],
    useKeyboard:false,
    smooth:8,  // 使用键盘时,汽车移动速度
    keyBoardTimeGap:100,
    aniTimeGap:16,
    timerPreffix:'timer_',
    fontSize:40,
    score:0,
    roadWidth:540,  // 真实赛道宽度
    usePixelCheck:true,
    padding(){
      return (docW - this.roadWidth)/2
    },
    car:{
      width: 120,
      height: 240
    },
    genBlocks() {
      let _this = this;
      // 障碍物和金币要落在赛道宽度
      let half = ~~(this.roadWidth/2)

      let coinRadom = ~~(Math.random() * 2);
      return [
        {
          name:'brick1',
          width: 241,
          height: 155,
          x: (1-coinRadom) * half + ~~((half - 241) / 2),
          y: (!_this.playing ? -(docH * 0.5) : 0) - ( _this.car.height) ,
          speed: _this.speed ,
          image:'./images/jingai.png',
        },
        {
          name: 'brick2',
          width: 173,
          height: 97,
          x: coinRadom * half + ~~((half-173)/2),
          y: (!_this.playing? -(docH*0.5):0) - ((~~(Math.random() * 5)+4) * _this.car.height),
          speed: _this.speed ,
          image: './images/xuegao.png',
        },
        {
          name:'coin1',
          coin: 1,
          width: 77,
          height: 89,
          x: (coinRadom) * half + ~~((half - 77) / 2),
          y: (!_this.playing ? -(docH * 0.5) : 0) - 2*(_this.car.height),
          speed:_this.speed+(~~Math.random()*10),
          image:'./images/coin1.png',
        },
        {
          name:'coin2',
          coin: 1,
          width: 59,
          height: 93,
          x: (1-coinRadom )* half + ~~((half - 59) / 2),
          y: (!_this.playing ? -(docH * 0.5) : 0) - ((~~(Math.random() * 10) ) * _this.car.height),
          speed:_this.speed+(~~Math.random()*4)+2,
          image: './images/coin2.png',
        }
      ];
    },
    gameStop(){
      this.isStop = true;
      clearInterval(this.speedTimer)
      this.speedTimer = null
    },
    speedUp(){
      this.speedTimer = setInterval(() => {
        this.speed+=this.speedPadding
      }, 4000);
    },
    initStatus(speed){
      !this.originalSpeed && (this.originalSpeed = speed)
      this.speed = speed;
      this.playing = false
      this.car.x = ~~((this.canWitdh - this.car.width) / 2)
      this.car.y = this.canHeight - this.car.height - this.padding()

      this.mouse.style = `
        position:absolute;
        left:${this.car.x}px;
        top: ${this.car.y}px;
        width:${this.car.width}px;
        height:${this.car.height}px;
      `
      this.blocks = this.genBlocks()
      this.score = 0

      this.speedUp()
    },
    init(config){
      if (!config.ele) {
        alert('缺少容器')
        return;
      }

      config.scoreUpdate && (this.scoreUpdate = config.scoreUpdate)
      config.gameOver && (this._gameOver = config.gameOver)
      this.speedPadding = config.speedPadding || 1

      let wrap = doc.querySelector(config.ele)
      let canvas = doc.createElement('canvas');
      let cxt = canvas.getContext('2d');

      let emptyDiv = doc.createElement('div');
      emptyDiv.classList.add('mouse-wrap')
      emptyDiv.style = `
        position:absolute;
        left: ${(docW - this.roadWidth)/2}px;
        top:0;
        width:${this.roadWidth}px;
        height:${docH}px;
        z-index:10;
      `
      this.wrap = wrap
      wrap.appendChild(emptyDiv)

      canvas.classList.add('can')

      canvas.width = this.roadWidth
      canvas.height = docH

      wrap.appendChild(canvas)

      this.canvas = canvas
      this.cxt = cxt;
      this.canWitdh = canvas.width
      this.canHeight = canvas.height

      this.carImg = doc.createElement('img')
      this.carImg.src = !config.type ? 'images/blue.png' : 'images/red.png';

      this.brickImg1 = doc.createElement('img')
      this.brickImg1.src = 'images/jingai.png';

      this.brickImg2 = doc.createElement('img')
      this.brickImg2.src = 'images/xuegao.png';

      this.coinImg1 = doc.createElement('img')
      this.coinImg1.src = 'images/coin1.png';

      this.coinImg2 = doc.createElement('img')
      this.coinImg2.src = 'images/coin2.png';

      this.coinObj = {
        coin1:this.coinImg1,
        coin2:this.coinImg2
      }
      this.brickObj = {
        brick1:this.brickImg1,
        brick2:this.brickImg2
      }

      this.mouse = doc.createElement('div')
      this.mouse.classList.add('mouse')

      this.initStatus(config.speed)
      emptyDiv.appendChild(this.mouse)

      this.bindEvent()

      if (this.dev) {
        let checker = doc.createElement('div')
        checker.id = 'Jchecker'
        checker.classList.add('checker')
        doc.body.appendChild(checker)
      }
    },
    erase() {
      this.cxt.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    getCrossRect(A, B, C, D, E, F, G, H) { // 只有四种情况完全不碰撞
      let _b1 = C <= E; // 障碍物右边小于车左边
      let _b2 = G <= A; // 车右边小于障碍物左边
      let _b3 = H <= B  // 车底部小于等于障碍物顶部
      let _b4 = D <= F; // 障碍物底部小于车顶部
      if (_b1||_b2||_b3||_b4) {
        return [0,0,0,0]
      }

      let tmpX, tmpY;
      if (E > A) {
        tmpX = G < C ? [E, G] : [E, C];
      } else {
        tmpX = C < G ? [A, C] : [A, G];
      }

      if (F > B) {
        tmpY = H < D ? [F, H] : [F, D];
      } else {
        tmpY = D < H ? [B, D] : [B, H];
      }
      return [tmpX[0], tmpY[0], tmpX[1], tmpY[1]];
    },
    pixelCheck(obj1, obj2, rect) {
      let canvas = doc.createElement('canvas'),
      _ctx = canvas.getContext('2d');
      // canvas.classList.add('dCan')
      canvas.width = docW
      canvas.height = docH
      // doc.body.appendChild(canvas)

      _ctx.drawImage(obj1.img, 0, 0, obj1.w, obj1.h);
      _ctx.globalCompositeOperation = 'source-in';
      _ctx.drawImage(obj2.img, obj2.x - obj1.x, obj2.y - obj1.y, obj2.w, obj2.h);

      let data = _ctx.getImageData(
        rect[0] - obj1.x, 
        rect[1] - obj1.y, 
        Math.ceil(rect[2] - rect[0]),
        Math.ceil(rect[3] - rect[1])
      ).data;
      
      canvas.remove()
      canvas = null;
      _ctx = null;
      
      let res = false
      for (let i = 3; i < data.length; i += 4) {
        if (data[i]){
          res =  true;
          break;
        }
      }

      return res;
    },
    draw() {
      let blocks = this.blocks
      let car = this.car
      this.cxt.save();

      if (this.dev) {
        this.cxt.fillRect(car.x, car.y, car.width, car.height);
      }else{
        this.cxt.drawImage(this.carImg, car.x, car.y, car.width, car.height);
      }

      for (let i = 0; i < (blocks.length); i++) {
        let curBlock = blocks[i]
        if (curBlock.coin) {
          if (this.dev) {
            !curBlock.hide && this.cxt.fillRect(curBlock.x, curBlock.y, curBlock.width, curBlock.height);
          }else{
            !curBlock.hide && this.cxt.drawImage(this.coinObj[curBlock.name], curBlock.x, curBlock.y, curBlock.width, curBlock.height);
          }
        }else{
          if (this.dev) {
            this.cxt.fillRect(curBlock.x, curBlock.y, curBlock.width, curBlock.height);
          }else{
            this.cxt.drawImage(this.brickObj[curBlock.name],curBlock.x, curBlock.y, curBlock.width, curBlock.height);
          }
        }

        let A = curBlock.x,
          B = curBlock.y, 
          C = A + curBlock.width, 
          D = B + curBlock.height;

        let E = car.x,
          F = car.y,
          G = E + car.width,
          H = F + car.height;

        let crossRect = this.getCrossRect(A,B,C,D,E,F,G,H)
        let isHit = (crossRect[2] - crossRect[0]) * (crossRect[3] - crossRect[1]) > 0 //相交矩形有面积

        if (isHit) {
          if (curBlock.coin) {
            if (!curBlock.hide) {
              this.score += curBlock.coin
              this.scoreUpdate && this.scoreUpdate(this.score)
            }
            curBlock.hide = true
          }else{
            if (this.dev || !this.usePixelCheck) {
              this.gameStop()
            }else{
              if (this.dev) {
                doc.querySelector('#Jchecker').style.cssText += `
                  left:${crossRect[0]+this.padding()}px;
                  top:${crossRect[1]}px;
                  width:${crossRect[2]-crossRect[0]}px;
                  height:${crossRect[3]-crossRect[1]}px;
                `
              }

              let isRealHit = this.pixelCheck(
                {
                  img: this.carImg,
                  x:car.x,
                  y:car.y,
                  w:car.width,
                  h:car.height,
                }, 
                {
                  img: this.brickObj[curBlock.name],
                  x: curBlock.x,
                  y: curBlock.y,
                  w: curBlock.width,
                  h: curBlock.height,
                }, 
                crossRect
              )

              if (isRealHit) {
                this.gameStop()
              }
            }
          }
        }
      }
      this.cxt.restore();

      if (this.useKeyboard) {
        this.mouse.style.cssText += `
          left:${car.x}px;
          top:${car.y}px;
        `
      }
    },
    animate() {
      let blocks = this.blocks;
      let _blocks = []; // 用来计算当前屏幕有多少个障碍物

      for (let i = 0; i < blocks.length; i++) {
        let curBlock = blocks[i];

        curBlock.y += curBlock.speed;
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
      this.wrap.classList.add('ani-paused')
      if (this._gameOver) {
        this._gameOver()
      }

      if (this.dev) {
        let text = '游戏结束'
        this.cxt.save();
        this.cxt.font = this.fontSize+"px Arial";
        this.cxt.fillStyle = 'yellow';
        this.cxt.fillText(text, ~~((this.canWitdh - text.length*this.fontSize)/2), ~~((this.canHeight-this.fontSize)/2));
        this.cxt.restore();
      }
    },
    clearTimer(){
      this.aniTimer && window.cancelAnimationFrame(this.aniTimer);
      this.aniTimer = null
    },
    replay(){
      this.initStatus(this.originalSpeed)
      this.isStop = false
      this.play()
    },
    play(){
      this.wrap.classList.remove('ani-paused')
      this.wrap.classList.add('ani')
      this.playing = true
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

      doc.body.addEventListener('touchmove',(e)=>{
        e.preventDefault()
      },{passive:false})

      this.useKeyboard && (doc.onkeydown = ( (e)=> {
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
      }))

      this.useKeyboard && (doc.onkeyup = ((e)=>{
        let keyCode = e.which
        let tName = this.timerPreffix + keyCode
        if (_this[tName]) {
          clearInterval(_this[tName])
          _this[tName] = null
        }
      }))

      let disX = 0, disY = 0;
      this.mouse.addEventListener('touchstart',(e)=>{
        let fingerPos = e.targetTouches[0]
        let mouseRect = this.mouse.getBoundingClientRect()
        disX = fingerPos.pageX - mouseRect.left;
        disY = fingerPos.pageY - mouseRect.top;
      },false)

      this.mouse.addEventListener('touchmove', (e) => {
        if (this.isStop || !this.playing) {
          return
        }

        let fingerPos = e.targetTouches[0]

        let carLeft = fingerPos.pageX - disX
        let carTop = fingerPos.pageY - disY

        let carMaxX = _this.roadWidth - _this.car.width
        let carMaxY = docH - _this.car.height

        let _left = carLeft - _this.padding()
        let _top = carTop


        if (_left < 0) {
          _left = 0
        }
        if (_left > carMaxX) {
          _left = carMaxX
        }

        if (carTop <=0) {
          _top = 0
        }

        if (carTop > carMaxY) {
          _top = carMaxY
        }

        this.mouse.style.cssText +=`
          left:${_left}px;
          top:${_top}px;
        `

        car.x = _left
        car.y = _top

      }, false)
    }
  }
  window.Game = mod;
})()