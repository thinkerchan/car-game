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
        this.cacheName = localStorage.getItem('lsUserName')
        if (this.cacheName) {
          this.username = this.cacheName
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

        });
      },
      methods: {
        prePlay(){
          let u = this.cacheName || this.username.trim()
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
            if (!this.cacheName) {
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
          this.showModPre = true
          this.showStartBtn = true;

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
          Game.replay()
        },
        chechRank(){
          this.isLoading = true
          this.queryBestScore(null,(bestScore,needUpload,id)=>{
            console.log('当前分数:',this.score, '历史最高:',bestScore,'是否需要上报:',needUpload);
            if (needUpload) {
              this.uploadRank(bestScore,id)
            }else{
              this.isLoading = false
            }
          })
        },
        uploadRank(bestScore,id){
          let instance = null;
          if (id) {
            instance = AV.Object.createWithoutData(this.dataBase,id)
          }else{
            let av = AV.Object.extend(this.dataBase);
            instance = new av();
            instance.set('username', this.username);
          }

          instance.set('score', bestScore);
          instance.save().then((ret) => {
            this.isLoading = false
            localStorage.setItem('lsRecord',1)
          },  (err)=>{
            console.log(err);
            this.isLoading = false
          });
        },
        queryBestScore(username,cb){
          // 最佳分数不适合做缓存,有可能服务器删除了记录,缓存判断的存在,会导致用户无法提交最新记录
          let query = new AV.Query(this.dataBase);
          query.equalTo('username', username||this.username);
          query.descending('score')
          query.find().then((ret) => {
            console.log(username || this.username,'的记录:',ret);
            let id = '';
            if (ret.length) {
              id = ret[0].id
              this.bestScore = ret[0].get('score')
            }else{
              this.bestScore = 0;
            }

            let bool = this.score - this.bestScore > 0
            if (bool) {
              this.bestScore = this.score
            }

            cb && cb(this.bestScore, bool,id)
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
          localStorage.clear();
          this.username = '';
          this.iptDisable = false;
        }
      },
    })
  }, false)
})()