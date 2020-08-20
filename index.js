mod = {
  timer:null,
  isStop:false,
  blocks:[],
  speed:2,
  car:null,
  timeGap:100,
  smooth:4,
  replay(){
    this.isStop = false;
    this.blocks = []
  },
  init(ele){
    var canvas = document.querySelector(ele);
    var cxt = canvas.getContext('2d');
    this.canvas = canvas
    this.canWitdh = canvas.width
    this.canHeight = canvas.height
    console.log('canvas宽高:',this.canWitdh,this.canHeight);
    this.cxt = cxt;
    this.isStop = false;
    let _this = this;
    // 赛车
    this.car = {
      x: ~~((_this.canWitdh -50)/2),
      y: _this.canHeight - 50,
      width: 50,
      height: 50
    };
    // 障碍物
    this.blocks = [
      { 'x': 0, 'y': -50, 'width': 50, 'height': 50 },
      { 'x': 50, 'y': 0, 'width': 50, 'height': 50 },
      { 'x': 120, 'y': -50, 'width': 50, 'height': 50 },
      { 'x': 180, 'y': 30, 'width': 50, 'height': 50 },
      { 'x': 300, 'y': 50, 'width': 50, 'height': 50 },
      { 'x': 250, 'y': 250, 'width': 50, 'height': 50 }
    ];
    this.speed = 2;

    this.bindEvent()
  },
  erase() {
    this.cxt.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  draw() {
    let blocks = this.blocks
    let car = this.car

    this.cxt.save();
    this.cxt.fillRect(car.x, car.y, car.width, car.height);

    for (var i = 0; i < (blocks.length); i++) {
      let curBlock = blocks[i]
      this.cxt.fillRect(curBlock.x, curBlock.y, curBlock.width, curBlock.height);

      // 四中情况完全不碰撞
      let b1 = (car.y >= (curBlock.y + curBlock.height)) // 汽车顶部大于块底部
      let b2 = ((car.y + car.height) <= curBlock.y) // 汽车底部小于块顶部
      let b3 = (car.x >= (curBlock.x + curBlock.width)) // 汽车左边大于块右边
      let b4 = ((car.x + car.width) <= curBlock.x) // 汽车右边小于块左边

      if (!(b1 || b2 || b3 || b4)) {
        this.isStop = true;
      }
    }
    this.cxt.restore();
  },
  step() {
    var _blocks = [];
    let blocks = this.blocks;

    for (var i = 0; i < blocks.length; i++) {
      blocks[i].y += this.speed; // 每一帧修改之后 更新 _blocks
      if (blocks[i].y < this.canHeight) {
        _blocks.push(blocks[i]); // 屏幕内有多少个障碍物
      }
    }

    if (_blocks.length == 3 || !_blocks.length) {
      let out = ~~(Math.random() * 3)+1; // 至少保证有一个缺口
      for (let j = 0; j < 1; j++) {
        if (j != out) {
          _blocks.push({
            'x': ~~(Math.random()* (this.canWitdh-50)),
            'y': -(50 + ~~(Math.random()*100)),
            'width': 50,
            'height': 50
          });
        }
      }
    }

    this.blocks = _blocks; // 循环
  },
  drawOver() {
    let cxt = this.cxt;
    cxt.save();
    cxt.font = "20px Verdana";
    cxt.fillStyle = 'pink';
    cxt.fillText('游戏结束！', 75, 200);
    cxt.restore();
  },
  play(){
    this.erase();
    this.draw();
    this.step();
    if (this.isStop) {
      window.cancelAnimationFrame(this.timer);
      this.drawOver();
    } else {
      this.timer = window.requestAnimationFrame(arguments.callee.bind(this));
    }
  },
  bindEvent(){
    let last = new Date();
    let car = this.car
    let _this = this;

    document.onkeydown = ( (e)=> {
      let now = new Date();

      if (!_this.smooth) {
        if (now.getTime() - last.getTime() < this.timeGap) {
          return;
        }
        last = now;
      }

      switch (e.which) {

        case 40: // 下
          if (!_this['timer_' + e.which]) {
            if (car.y < (this.canHeight - car.height)) {
              _this['timer_' + e.which] = setInterval(() => {
                car.y += _this.smooth ||car.height;
              }, 16);
            }
          }
          break;
        case 39: // 右
          if (!_this['timer_' + e.which]) {
            if (car.x < (this.canWitdh-car.width)) {
              _this['timer_' + e.which] = setInterval(() => {
                car.x += _this.smooth ||car.width;
              }, 16);
            }
          }

          break;
        case 38: // 上
          if (!_this['timer_' + e.which]) {
            _this['timer_' + e.which] = setInterval(() => {
              if (car.y > 0) {
                car.y -= _this.smooth ||car.height;
              }
            }, 16);
          }
          break;
        case 37: // 左
          if (!_this['timer_' + e.which]) {
            _this['timer_' + e.which] = setInterval(() => {
              if (car.x > 0) {
                car.x -= _this.smooth ||car.width;
              }
            }, 16);
          }
          break;
      }
    });

    document.onkeyup = ((e)=>{
      if (_this['timer_' + e.which]) {
        clearInterval(_this['timer_' + e.which])
        _this['timer_' + e.which] = null
      }
    })
  }
}

;(() => {
  document.addEventListener('DOMContentLoaded', (e) => {
    mod.init('#canvas')
    Jstart.addEventListener('click',(e)=>{
      mod.play()
    },false)
    Jstop.addEventListener('click', (e) => {
      mod.isStop = true
    }, false)
  }, false)
})()
