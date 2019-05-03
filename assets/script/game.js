import alert from 'alert';

cc.Class({
    extends: cc.Component,

    properties: {
        //暂停按钮
        pauseBtn:{
            default: null,
            type: cc.Button
        },
        //分数
        scoreLabel : cc.Label,
        score : 0,
        //间隔
        gap : 20,
        //块
        blockSN : cc.Node,
        //背景
        bg : cc.Node,
        //alert弹框资源
        alertEvent : cc.Prefab,
    },
    onLoad () {
        //场景加载时执行
        //侦听touchend事件来触他弹框。不能用click，否则在微信中无效。
        this.pauseBtn.node.on('touchend',this.AlertEvent.bind(this));
        this.drawBgBlocks();
    },

    AlertEvent: function() {
        cc.director.pause();
        let alertE = cc.instantiate(this.alertEvent);
        // cc.log(alertE);
        cc.log("alertalertalertalertalertalert");
        alertE.parent = this.bg;
        cc.log(alertE);
    },

    start () {
        
    },

    drawBgBlocks() {
        //循环获得6*8的块
        //获得块的width
        this.blockSizeW = (cc.winSize.width - this.gap*2) /6;
        //获得块的height
        this.blockSizeH = (cc.winSize.height - 275 - this.gap*2 ) /8;
        //横坐标
        let x = this.gap + this.blockSizeW/2;
        //纵坐标
        let y = 125 + this.blockSizeH/2;
        this.blockSN.width = this.blockSizeW;
        this.blockSN.height = this.blockSizeH;
        //设置块的坐标位置
        this.blockSN.setPosition(cc.v2(x,y));
        for(let i = 0;i < 8;i++) {
            for (let j = 0;j < 6;j++) {  
                //克隆已有节点
                let block = cc.instantiate(this.blockSN);
                block.width = this.blockSizeW;
                block.height = this.blockSizeH;       
                block.setPosition(cc.v2(x,y));
                block.parent = this.bg;
                //cc.log(x)
                //横坐标加一个块的宽度
                x += this.blockSizeW;
            }
            //纵坐标加一个块的高度
            y += this.blockSizeH;
            //设置横坐标为初始值
            x = this.gap + this.blockSizeW/2;
            //cc.log(x,y);
        }
        
    },
    // update (dt) {},
});