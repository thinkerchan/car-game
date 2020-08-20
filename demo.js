function game(){
  var canvas = document.getElementById('canvas');
  var cxt = canvas.getContext('2d');

  // 定时器
  var timer;
  // 游戏是否结束
  var iStop;
  // 赛车
  var car;
  // 障碍物
  var blocks;
  // 障碍物速度
  var speed;

  // 清除画布
  function erase() {
    cxt.clearRect(0, 0, canvas.width, canvas.height);
  }

  function init() {
    iStop = false;
    // 赛车
    car = { 'x': 0, 'y': 450, 'width': 50, 'height': 50 };
    // 障碍物
    blocks = [
      { 'x': -0, 'y': -50, 'width': 50, 'height': 50 },
      { 'x': 50, 'y': -50, 'width': 50, 'height': 50 },
      { 'x': 100, 'y': -50, 'width': 50, 'height': 50 },
      { 'x': 0, 'y': 250, 'width': 50, 'height': 50 },
      { 'x': 50, 'y': 250, 'width': 50, 'height': 50 },
      { 'x': 150, 'y': 250, 'width': 50, 'height': 50 }
    ];
    speed = 2;
  }

  // 绘图
  function draw() {
    cxt.save();
    cxt.fillRect(car.x, car.y, car.width, car.height);
    for (var i = 0; i < blocks.length; i++) {
      let curBlock = blocks[i]
      cxt.fillRect(curBlock.x, curBlock.y, curBlock.width, curBlock.height);
      // if (curBlock.y > 400 && curBlock.x == car.x) {
      if ((car.x < (curBlock.x + curBlock.width)) && car.x > curBlock.x) {
        iStop = true;
      }
    }
    cxt.restore();
  }

  // 障碍物前进
  function step() {
    var _blocks = [];

    for (var i = 0; i < blocks.length; i++) {
      blocks[i].y += speed;
      if (blocks[i].y < 500) {
        _blocks.push(blocks[i]);
      }
    }

    if (_blocks.length == 3) {
      var out = Math.round(Math.random() * 3);
      for (var j = 0; j < 4; j++) {
        if (j != out) {
          _blocks.push({ 'x': (50 * j), 'y': -50, 'width': 50, 'height': 50 });
        }
      }
    }

    blocks = _blocks;
  }

  function drawOver() {
    cxt.save();
    cxt.font = "20px Verdana";
    cxt.fillStyle = 'yellow';
    cxt.fillText('游戏结束！', 75, 200);
    cxt.restore();
  }

  // 键盘控制赛车左右(<-、->)运动
  var last = new Date();
  document.onkeydown = (function (e) {
    var now = new Date();
    if (now.getTime() - last.getTime() < 100) {
      return;
    }
    last = now;
    switch (e.which) {
      case 39:
        if (car.x < 150) {
          car.x += 50;
        }
        break;
      case 37:
        if (car.x > 0) {
          car.x -= 50;
        }
        break;
    }
  });


  function animate() {
    erase();
    draw();
    step();
    if (iStop) {
      cancelAnimationFrame(timer);
      drawOver();
    } else {
      timer = requestAnimationFrame(animate);
    }
  }


  document.querySelector('#btn').onclick = function () {
    if (this.innerHTML == '开始') {
      init();

      var s = document.querySelector('#sd').value;
      if (s != '') {
        speed = parseInt(s);
      }

      animate();
      this.innerHTML = '结束';
    } else {
      cancelAnimationFrame(timer);
      this.innerHTML = '开始';
    }
  }
}