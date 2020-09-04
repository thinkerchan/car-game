; (() => {
  document.addEventListener('DOMContentLoaded', (e) => {
    window.vm = new Vue({
      el: '#Jbody',
      data:{
        appId: 'aReBgXf9QvnhftVdkKtkadp3-gzGzoHsz',
        appKey: '78EjmfLfQ4kMzCBps0hyyHkr',
        dataBase:'car_game',
        progress:0,
        showStartBtn:false,
        score:0,
        username: '',
        bestScore:0,
        btnTxt:'开始',
        showCover:false,
        showInitCover:true,
        showRankPop:false,
        rankListArr:[],
        isLoading:false,
        toastStr:'',
        showToast:false,
        iptDisable:false,
        showModPre:false,
        showClearBtn:false,
      },
      created () {
        let username = localStorage.getItem('lsUserName')
        if (username) {
          this.fromCache = true
          this.username = username
          this.iptDisable = true
        }

        if (window.location.href.indexOf('DEV')>-1) {
          this.showClearBtn = true;
        }

        AV.init(this.appId,this.appKey)
      },
      mounted () {
        let queue = new createjs.LoadQueue();
        queue.loadManifest([
          { src: "images/red.png" },
          { src: "images/jingai.png"},
          { src: "images/xuegao.png"},
          { src: "images/coin1.png"},
          { src: "images/coin2.png"},
          { src: "images/bgp.jpg"},
        ]);
        queue.on("progress", (e)=>{
          this.progress = ~~(e.progress*100)
        });
        queue.on("complete", ()=>{
          this.init()
          this.showModPre = true
          this.showStartBtn = true;
        });
      },
      methods: {
        prePlay(){
          let u = this.username.trim()
          if (!u) {
            this.toastStr = '兄弟, 要不先搞个名字吧?'
            this.showToast = true
            let t = setTimeout(() => {
              clearTimeout(t)
              t = null
              this.showToast = false
            }, 1000);
            return;
          }else{
            if (!this.fromCache) {
              this.username = u.slice(0,15);
              localStorage.setItem('lsUserName', this.username)
            }
          }

          this.showInitCover = false
          let t = setTimeout(() => {
            clearTimeout(t)
            t = null
            this.play()
          }, 500);
        },
        init() {
          let _this = this;
          Game.init({
            ele: '#Jgame',
            type: 1,
            speed: 20,
            speedPadding: 2,
            scoreUpdate(score) {
              _this.score = score
            },
            gameOver() {
              console.log('游戏结束');
              _this.showCover = true
              _this.chechRank()
            }
          })
        },
        play(){
          this.score = 0
          this.btnTxt = '重玩'
          Game.replay()
        },
        chechRank(){
          this.isLoading = true
          if (!this.fromCache) { // 第一次进来, 需要上报结果
            this.uploadRank()
          }else{
            this.querySelf(null,(bestScore)=>{ // 非首次进入, 则先对比分数是否超越最佳分数,否则不予上报
              if (this.score > bestScore) {
                this.uploadRank()
              }else{
                this.isLoading = false
              }
            })
          }

        },
        uploadRank(){
          let av = AV.Object.extend(this.dataBase);
          let instance = new av();
          instance.set('username', this.username);
          instance.set('score', this.score);

          instance.save().then((ret) => {
            this.isLoading = false
          },  (err)=>{
            console.log(err);
            this.isLoading = false
          });
        },
        querySelf(username,cb){
          let query = new AV.Query(this.dataBase);
          query.equalTo('username', username||this.username);
          query.descending('score')
          query.find().then((ret) => {
            console.log(ret);

            if (ret.length) { // 防止删除数据库,客户端还有用户名缓存
              this.bestScore = ret[0].get('score')
            }else{
              this.bestScore = 0;
            }
            cb && cb(this.bestScore)
          })
        },
        showRank(){
          this.isLoading = true
          let query = new AV.Query(this.dataBase);
          query.descending('score')
          query.limit(50);
          query.find().then((ret) => {
            this.isLoading = false;

            this.rankListArr = ret.map((item,index)=>{
              return {
                username: item.get('username'),
                score: item.get('score'),
              }
            })

            this.showRankPop = true;
          })
        },
        replay(){
          this.showCover = false
          this.play()
        },
        closeRankPop(){
          this.showRankPop = false;
        },
        clearCache(){
          localStorage.clear()
          this.username = ''
        }
      },
    })
  }, false)
})()