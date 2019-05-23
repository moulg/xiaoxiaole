
import alert from 'alert';

var rows = 8;   //排
var columns = 6;    //列

var vis = [];
//sum 触摸次数；
var sum = 0;
var lastx = 0;
var lasty = 0;
var touchesSnack = [];
var touchesSnackData = [];
var touchesSnackAnim = [];

for (let x = 0; x < rows; ++x) {
    vis[x] = [];
    for (let y = 0; y < columns; ++y) {
        vis[x][y] = 0;
    }
}
//零食块的状态值；
// var ICON_STATE_NORMAL = 1
// var ICON_STATE_MOVE   = 2
// var ICON_STATE_PRECANCEL = 3
// var ICON_STATE_PRECANCEL2 = 4
// var ICON_STATE_CANCEL = 5
// var ICON_STATE_CANCELED = 6

cc.Class({
    extends: cc.Component,

    properties: {
        //画布
        canvas: cc.Node,
        //暂停按钮
        pauseBtn: {
            default: null,
            type: cc.Button
        },
        //分数
        scoreLabel: cc.Label,
        score: 0,
        //步数
        stepsLabel: cc.Label,
        steps: 9,
        //饼干个数
        cookiesLabel: cc.Label,
        cookies: 15,
        //间隔
        gap: 20,
        //块
        blockSN: cc.Prefab,
        //零食[]
        snacks: {
            default: [],
            type: [cc.Prefab],
        },
        ButtonAudio: {
            default: null,
            type: cc.AudioClip
        },
        //背景
        bg: cc.Node,
        //alert弹框资源
        alertEvent: cc.Node,
    },
    onLoad() {
        //场景加载时执行
        //关闭alertEent节点
        this.alertEvent.active = false;
        //侦听touchend事件来触他弹框。不能用click，否则在微信中无效。
        this.pauseBtn.node.on('touchstart', this.PlayClick.bind(this));

        this.pauseBtn.node.on('touchend', this.AlertEvent.bind(this));
        //初始化分数，过关条件，过关限制等数据；
        this.initGameData();
        //初始化背景块；
        this.drawBgBlocks();
        //初始化零食块；
        this.drawBgSnacks();

        this.scanAllSnacks();
       
     
        //点击事件
        // this.canvas.on(cc.Node.EventType.TOUCH_START, this.onmTouchBagan, this);
        // this.canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onmTouchMove, this);
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.onmTouchEnd, this);
    },

    start() {
        // this.scanAllSnacks();
    },

    PlayClick: function () {
        cc.audioEngine.play(this.ButtonAudio, false, 1);
    },

    initGameData() {
        this.updateScore(0);
        this.updateSteps(9);
        this.updateCookies(15);
        
        this.typeNum = 6;//零食块种类
        this.isControl = false;  //是否控制着零食块
        this.chooseSnackPos = cc.v2(-1, -1); //控制零食块的位置
        this.deltaPos = cc.v2(0, 0); //相差坐标

    },

    //当前分数初始化
    updateScore(number) {
        this.score = number;
        this.scoreLabel.string = number;
    },

    //剩余步数初始化
    updateSteps(number) {
        this.steps = number;
        this.stepsLabel.string = number;
    },

    //需要消除的饼干数初始化
    updateCookies(number) {
        this.cookies = number;
        this.cookiesLabel.string = number;
    },

    //暂停按钮触发的弹框事件；
    AlertEvent: function () {
        //暂停场景；
        cc.director.pause();
        //激活节点
        this.alertEvent.active = true;
        // cc.log(alertE);
        //alertE.parent = this.bg;
    },

    //循环画出背景块；
    drawBgBlocks() {
        //循环获得6*8的块
        //获得块的width
        this.blockSizeW = (cc.winSize.width - this.gap * 2) / columns;
        //获得块的height
        this.blockSizeH = (cc.winSize.height - 275 - this.gap * 2) / rows;
        //横坐标
        let x = this.gap + this.blockSizeW / 2;
        //纵坐标
        let y = 125 + this.blockSizeH / 2;
        this.positions = [];
        for (let i = 0; i < rows; ++i) {
            this.positions.push([0, 0, 0, 0, 0, 0]);
            for (let j = 0; j < columns; ++j) {
                //克隆已有节点
                let block = cc.instantiate(this.blockSN);
                block.width = this.blockSizeW;
                block.height = this.blockSizeH;
                //设置块的坐标位置      
                block.setPosition(cc.v2(x, y));
                block.parent = this.bg;
                this.positions[i][j] = cc.v2(x, y);
                //横坐标加一个块的宽度
                x += this.blockSizeW;
                //cc.log(m);
                //block.active = false;
            }
            //纵坐标加一个块的高度
            y += this.blockSizeH;
            //设置横坐标为初始值
            x = this.gap + this.blockSizeW / 2;
        }

    },
    //循环
    drawBgSnacks() {
        //存储snack节点；
        this.snacksTable = [];
        //存储对应动画；
        this.snacksAnimTable = [];
        //存储位置；
        this.snacksPosTable = [];
        //存储snack对应数字；
        this.snacksDataTable = [];
        //获得块的width
        this.blockSizeW = (cc.winSize.width - this.gap * 2) / columns;
        //获得块的height
        this.blockSizeH = (cc.winSize.height - 275 - this.gap * 2) / rows;
        //横坐标
        let x = this.gap + this.blockSizeW / 2;
        //纵坐标
        let y = 125 + this.blockSizeH / 2;

        for (let i = 0; i < rows; ++i) {
            //存储snack节点；
            this.snacksTable[i] = [];
            //存储位置；
            this.snacksPosTable[i] = [];
            //存储对应动画；
            this.snacksAnimTable[i] = [];
            //存储snack对应数字；
            this.snacksDataTable[i] = [];

            for (let j = 0; j < columns; ++j) {

                this.snacksPosTable[i][j] = cc.v2(x, y);
                this.snacksDataTable[i][j] = this.randomNum();
                //根据产生的随机数来填充格子
                var snack = cc.instantiate(this.snacks[this.snacksDataTable[i][j]]);
                snack.width = this.blockSizeW - 5;
                snack.height = this.blockSizeH - 5;
                snack.setPosition(cc.v2(x, y));
                snack.parent = this.bg;
                this.snacksTable[i][j] = snack;
                //cc.log(snack);
                this.snacksAnimTable[i][j] = snack.getComponent(cc.Animation);

                //cc.log(this.snacksAnimTable[i][j]);
                // snack.on('touchend',this.exchange(snack,i,j),this);
                //横坐标加一个块的宽度
                x += this.blockSizeW;
                //cc.log(snack);
            }

            //纵坐标加一个块的高度
            y += this.blockSizeH;
            //设置横坐标为初始值
            x = this.gap + this.blockSizeW / 2;
            //cc.log(x,y);
        }
        
    },

    randomNum() {
        //取得1~6的整数；
        let randoms = Math.random() * 6;
        //返回大于或等于其数值参数的最小整数;
        let num = Math.ceil(randoms);
        return num;

    },

    scanSwapSnack(i, j) {
       
        //记录此次点击的零食；
        var clickedSnack = this.snacksTable[i][j];
        //cc.log(clickedSnack.name);

        //记录横向扫描的相同snack数，r_num；
        var r_num = 0;
        //记录纵向扫描的相同snack数，c_num；
        var c_num = 0;
        //记录与当前零食相同的最左边零食位置；
        var left_i = i;
        var left_j = j;
        //记录与当前零食相同的最上边零食位置；
        var up_i = i;
        var up_j = j;
        //向左扫描；其中本身也记录了
        for (let a = 0; ; a++) {
            if (j - a < 0 || this.snacksTable[i][j - a].name != clickedSnack.name) {
                break;
            }
            if (this.snacksTable[i][j - a].name == clickedSnack.name) {
                r_num++;
                //记录与当前零食相同的零食；
                vis[i][j - a]++;
                //cc.log(vis[i][j-a]++);
                if (a != 0) { //a==0时为本身
                    left_j--; //纵列-1；
                }

            }
            //cc.log(this.snacksTable[i][j - a].name);
        }
        //向右扫描；
        for (let a = 1; ; a++) {
            if (j + a > 5 || this.snacksTable[i][j + a].name != clickedSnack.name) {
                break;
            }
            if (this.snacksTable[i][j + a].name == clickedSnack.name) {
                r_num++;
                vis[i][j + a]++;
            }
           // cc.log(this.snacksTable[i][j + a].name);
        }
        //判断是否能消除；
        //r_num 小于 3 即不能消除；
        cc.log(r_num);
        if (r_num < 3) {
            for (let x = 0;x < r_num;x++) {
                vis[left_i][left_j+x]--;
            }
            r_num = 0;
        }
        //向下扫描；
        for (let a = 0; ; a++) {
            if (i - a < 0 || this.snacksTable[i - a][j].name != clickedSnack.name) {
                break;
            }
            if (this.snacksTable[i - a][j].name == clickedSnack.name) {
                c_num++;
                //记录与当前零食相同的零食；
                vis[i - a][j]++;
                //cc.log(vis[i][j-a]++);
                if (a != 0) { //a==0时为本身
                    up_i--; //横排-1；
                }
            }
            //cc.log(this.snacksTable[i - a][j].name);
        }
        //向上扫描；
        for (let a = 1; ; a++) {
            if (i + a > 7 || this.snacksTable[i + a][j].name != clickedSnack.name) {
                break;
            }
            if (this.snacksTable[i + a][j].name == clickedSnack.name) {
                c_num++;
                //记录与当前零食相同的零食；
                vis[i + a][j]++;
                //cc.log(vis[i][j-a]++);
            }
            //cc.log(this.snacksTable[i + a][j].name);
        }
        cc.log(c_num);
        if (c_num < 3) {
            for (let y = 0;y < c_num;y++) {
                vis[up_i+y][up_j]--;
            }
            c_num = 0;
        }
        //为3时即普通消除；
        if (r_num == 3 || c_num == 3) {
            // cc.log(r_num);
            // cc.log(c_num);
            this.score = this.score + 30;
            //返回1表示可以交换,执行消除
            return 1;

        }
        //为4时即横纵特效；
        else if (r_num == 4 || c_num == 4) {
            // cc.log(r_num);
            // cc.log(c_num);
            this.score = this.score + 60;
            //返回1表示可以交换
            return 1;
        }
        //为5时即魔力天使特效；
        else if (r_num == 5 || c_num == 5) {
            // cc.log(r_num);
            // cc.log(c_num);
            this.score = this.score + 100;
            //返回1表示可以交换
            return 1;
        }
        else {
            //返回0表示不可交换；
            return 0;
        }
    },

    //删除snack节点
    delSnack() {
        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < columns; ++j) {
                //vis值大于0，即消除；
               
                if (vis[i][j] > 0) {
                    
                    vis[i][j] = 0;
                    //删除此节点
                    //cc.log("aaaaaaaaa")
                   // this.setSnackAnimObj(this.snacksAnimTable[i][j],'cancel');
                    //cc.log(this.setSnackAnimObj(this.snacksAnimTable[i][j],'cancel'));
                    this.snacksTable[i][j].destroy();
                    this.snacksDataTable[i][j] = 9;   
                    //this.addSnack();
                    cc.log("进来没？");
                }
            }
        }
    },

    addSnack() {
        this.refreshScoreLabel();
        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < columns; ++j) {
                //data值为9，即生成；
                if (this.snacksDataTable[i][j] == 9) {
                    //创建节点
                    this.snacksDataTable[i][j] = this.randomNum();
                    var snack = cc.instantiate(this.snacks[this.snacksDataTable[i][j]]);
                    snack.width = this.blockSizeW - 5;
                    snack.height = this.blockSizeH - 5;
                    snack.setPosition(this.snacksPosTable[i][j]);
                    snack.parent = this.bg;
                    this.snacksTable[i][j] = snack;
                    this.snacksAnimTable[i][j] = snack.getComponent(cc.Animation);
                    //cc.log(snack.name);
                }
            }
        }
    },

    setSnackAnimObj (obj,name) {
        obj.play(name);    
        obj.setCurrentTime(2,name);
    },

    //扫描所以snack节点，判断是否可以消除；
    scanAllSnacks() {
        //是否进行下轮全局扫描；
        var flag = false;
        do {
            flag = false;
            for (let i = 0; i < rows; ++i) {
                for (let j = 0; j < columns; ++j) {
                    if (this.scanSwapSnack(i, j) == 1) {
                        this.delSnack();
                        this.addSnack();
                        //删除后添加完，再检查此节点是否可消除；
                        j--;
                        flag = true;
                        break;
                    }
                }
                if (flag == true) {
                    break;
                }
            }
        }
        while (flag);
       
    },
    refreshScoreLabel () {
        this.scoreLabel.string =  this.score;
    },

    exchange(x, y) {
        /*

        如果两个方块不相邻
            sum<-1
            更新坐标
        否则
            如果两个零食一样
                不交换
            否则
                交换
                如果可以消除
                    执行
                    全局扫描
                    sum<-0
                否则
                    换回来

        */
        var m = 0;
        var n = 0;
        if (sum == 0) {
            //第一次点击
            lastx = x;
            lasty = y;
        }
        //把交换的图片存起来
        //cc.log(this.snacksTable[x][y].getPosition());
        touchesSnackAnim[sum] = this.snacksAnimTable[x][y];
        touchesSnackData[sum] = this.snacksDataTable[x][y];
        touchesSnack[sum] = this.snacksTable[x][y];
        sum++;
        
        
        if (sum == 2) {
            
            cc.log(x,y);
            cc.log(lastx,lasty);
            if ( lastx == x && lasty == y) {//同排同列
                sum = 1; //处理连续点击一样的图片
            }
            //x==lastx在同排不同列，左右交换，y==lasty在同列不同排，上下交换；
            else if (lastx == x || lasty == y){
                
                //确定交换的两个为相邻的；
                if (Math.abs(lastx - x) == 1 || Math.abs(lasty - y) == 1) {

                    if(touchesSnackData[0]==touchesSnackData[1]){
                        cc.log("交换的两个零食一样！不交换");
                        sum = 0;
                    }
                    else { //交换
                        this.snacksTable[x][y] = touchesSnack[0];
                        this.snacksTable[lastx][lasty] = touchesSnack[1];
                        
                        n = this.scanSwapSnack(x,y);
                        m = this.scanSwapSnack(lastx,lasty);
                        cc.log(n);
                        cc.log(m);
                        if (n==1 || m==1) { //可以消除
                            sum = 0;
                            touchesSnack[0] =  touchesSnack[1] = '';
                            this.snacksDataTable[x][y] = touchesSnackData[0];
                            this.snacksDataTable[lastx][lasty] = touchesSnackData[1];
                            this.snacksAnimTable[x][y] = touchesSnackAnim[0];
                            this.snacksAnimTable[lastx][lasty] = touchesSnackAnim[1];
                            this.snacksTable[x][y].setPosition(this.snacksPosTable[x][y]);
                            this.snacksTable[lastx][lasty].setPosition(this.snacksPosTable[lastx][lasty]);
                            cc.log(this.snacksTable[x][y]);
                            cc.log(this.snacksTable[lastx][lasty]);
                            
                            this.delSnack();
                            this.addSnack();
                            // this.scanAllSnacks();
                            cc.log("可以消除，执行");
                            
                        } 
                        else { //不可以消除，换回来
                            this.snacksTable[x][y] = touchesSnack[1];
                            this.snacksTable[lastx][lasty] = touchesSnack[0];
                            cc.log("不可以消除，换回来")
                            sum = 0;
                        }
                    }
                }
                //交换的两个不相邻
                else {
                    sum = 0;
                    touchesSnack[0] =  touchesSnack[1] = '';
                    // touchesSnack[0] = touchesSnack[1];
                   // touchesSnack[1] = '';
                    // touchesSnackData[0] = touchesSnackData[1];
                    //touchesSnackData[1] = 0;
                    
                    cc.log("交换不相邻！");
                }
                
            }
            //不同排不同列，肯定不相邻，则去最后一次触摸的节点为第一次，sum=1；
            else { 
                sum = 0;
                touchesSnack[0] =  touchesSnack[1] = '';
                // touchesSnack[0] = touchesSnack[1];
               // touchesSnack[1] = '';
                // touchesSnackData[0] = touchesSnackData[1];
               // touchesSnackData[1] = 0;
                
                cc.log("交换不相邻!!!!!");
            }
        }
        // cc.log(sum);
            

    },
    onmTouchEnd(event) {
        var touches = event.getLocation();
        var touchesX = touches.x;
        var touchesY = touches.y;
        //var touchesStart = touchesStart[0].getStartLocation();
        //cc.log(touches);
        //触点范围； x += this.blockSizeW; y += this.blockSizeH;
        let xMin= this.gap ;
        let yMin = 125 ;
        let xMax= this.gap + this.blockSizeW*columns ;
        let yMax = 125 + this.blockSizeH*rows ;
        if (touchesX < xMin || touchesX > xMax || touchesY < yMin || touchesY > yMax) {
            cc.log("触点不在范围内，无效");
            //不处理；
        }

        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < columns; ++j) {
                //触点是否在节点内；
                if(this.snacksTable[i][j].getBoundingBoxToWorld().contains(touches)) {
                    
                    this.exchange(i,j);
                }
               
            }
              
        }

    },
    // update (dt) {},
});



        
        