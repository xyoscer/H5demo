/**
 * Created by XiYin on 2017/3/27.
 */
(function() {
    // 将HTML转换为节点
    function htmlTonode(str) {
        var container = document.createElement('div');
        container.innerHTML = str;
        return  document.body.appendChild(container);
    }

    // 属性赋值
    function  extend(o1,o2) {
        for(var i in o2) {
            if(typeof o1[i] === 'undefined') {
                o1[i] = o2[i];
            }
        }
        return o1;
    }
    // 两点之间的距离
    function getDistance(a,b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    var template = '<div class="m-lock"><h4 id="title" class="title">绘制解锁图案</h4>\
                   <canvas  id="canvas" width="300" height="300"></canvas>\
                   <p></p>\
                    <div class="lock-footer">\
                     <button class="confirm" href="#" id="updatePassword">设置密码</button>\
                     <button class="valite" href="#" id="validpwd">验证密码</button>\
                 </div>';
    function Lock(options) {
        options = options || {};
        this.container = this._layout.cloneNode(true);
       // this.canvas = this.container.querySelector('#canvas');
       // this.ctx = this.canvas.getContext('2d');
        extend(this, options);
        this.init();

    }
    extend(Lock.prototype,{
       _layout: htmlTonode(template),
       pickPoints: function(fromPt,toPt) {
           var lineLen = getDistance(fromPt,toPt);
           var dir = toPt.index > fromPt.index ? 1 : -1;
           var len = this.notGotoPoint.length;
           var i = (dir === 1) ? 0: (len - 1);
           var limit = (dir === 1)? len : -1;
           while(i !== limit) {
               var pt = this.notGotoPoint[i];
               if(getDistance(pt,fromPt) + getDistance(pt,toPt) === lineLen) {
                   this.drawPoint(pt.x, pt.y);
                   this.gotoCircle.push(pt);
                   this.notGotoPoint.splice(i, 1);
                   if(limit > 0) {
                       i--;
                       limit--;
                   }
               }
               i += dir;
           }
       },
        // 根据计算出来的坐标，在对应的位置画圆
        drawCircle: function(x, y) {
            this.ctx.strokeStyle = 'red';
            this.ctx.fillStyle = '#FFA724';
            this.ctx.linewidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true); //画圆圈
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        },
        drawPoint: function() { // 初始化手势滑动过的圆心
            for (var i = 0 ; i < this.gotoCircle.length ; i++) {
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(this.gotoCircle[i].x, this.gotoCircle[i].y, this.r / 4, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        },
        drawStatusPoint: function(type) {
            for (var i = 0 ; i < this.gotoCircle.length ; i++) {
                this.ctx.strokeStyle = type;
                this.ctx.beginPath();
                this.ctx.arc(this.gotoCircle[i].x, this.gotoCircle[i].y, this.r, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        },
        // 解锁轨迹
        drawLine:function(po, gotoCircle) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.moveTo(this.gotoCircle[0].x, this.gotoCircle[0].y);
            for (var i = 1 ; i < this.gotoCircle.length ; i++) {
                this.ctx.lineTo(this.gotoCircle[i].x, this.gotoCircle[i].y);
            }
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();
        },
        // 创建解锁圆圈的坐标
        createCircle:function() {
            var n = this.RowcircleNum; // 确定一行中圆圈的个数
            var count = 0; // 解锁圆圈的个数
            this.arrCircle = [];
            this.notGotoPoint = []; // 保存手势没有经过的哪些圆圈点
            // 创建解锁点的坐标，根据canvas的大小来平均分配半径
            this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
            this.gotoCircle = [];
            var r = this.r;
            for (let i = 0 ; i < n ; i++) {
                for (let j = 0 ; j < n ; j++) {
                    count++;
                    // 数组中以行的形式存储坐标，计算出每个圆圈的x,y坐标，以及位置index存储在对象obj中
                    var obj = {
                        x: j * 4 * r + 3 * r,
                        y: i * 4 * r + 3 * r,
                        index: count
                    };
                    this.arrCircle.push(obj);
                    this.notGotoPoint.push(obj);
                }
            }
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arrCircle.length ; i++) {
                this.drawCircle(this.arrCircle[i].x, this.arrCircle[i].y);
            }
        },
        // 获取touch点相对于canvas的坐标
        getPosition: function(e) {
            // getBoundingClientRect()返回元素的大小及其相对于视口的位置
            // rect 是一个具有四个属性left、top、right、bottom的DOMRect对象
            var rect = e.currentTarget.getBoundingClientRect();
            var po = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
            return po;
        },
        // 变化方法
        update: function(po) {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            for (var i = 0 ; i < this.arrCircle.length ; i++) { // 每帧先把面板画出来
                this.drawCircle(this.arrCircle[i].x, this.arrCircle[i].y);
            }

            this.drawPoint(this.gotoCircle);// touch过的圆圈上画小圆圈
            this.drawLine(po, this.gotoCircle);// 绘制线

            for (var i = 0 ; i < this.notGotoPoint.length ; i++) {
                var pt = this.notGotoPoint[i];
                if (Math.abs(po.x - pt.x) < this.r && Math.abs(po.y - pt.y) < this.r) {
                    this.drawPoint(pt.x, pt.y);
                    this.pickPoints(this.gotoCircle[this.gotoCircle.length - 1], pt);
                    break;
                }
            }
    },
        //检测密码
        // 判定状态
        makeState:function() {
            if (this.pswObj.step == 2) {
                document.getElementById('updatePassword').style.display = 'block';
                document.getElementById('title').innerHTML = '手势密码';
            } else if (this.pswObj.step == 1) {

                document.getElementById('updatePassword').style.display = 'none';
            } else {
                document.getElementById('updatePassword').style.display = 'none';

            }
        },
        // 类型选择
        setChooseType:function(type) {
            chooseType = type;
            this.init();
        },
        // touchend结束后，保存手势经过的节点坐标
        savePwd: function(pwd,num) {
            var pswObj = {};
            for(var i = 0;i<pwd.length;i++) {
                pswObj[pwd[i].index] = pwd[i].index;
            }
            var str = JSON.stringify(pswObj);
            window.localStorage.setItem('xiyin',"测试");
            if(num === 1 ) {
                if(window.localStorage.getItem('password1')) {
                    window.localStorage.removeItem('password1');
                }
                window.localStorage.setItem('password1',str);

            }
            if(num === 2) {
                if(window.localStorage.getItem('password2')) {
                    window.localStorage.removeItem('password2');
                }
                window.localStorage.setItem('password2',str);
            }


            document.getElementById('title').innerHTML = '密码保存成功';


        },
        checkpwd: function() {
            var flag = 1;
            var pwd1 = JSON.parse(window.localStorage.getItem('password1'));
            var pwd2 = JSON.parse(window.localStorage.getItem('password2'));
            for(var i in pwd1) {
                if(pwd1[i] !== pwd2[i]) {
                    flag = 0;
                    document.getElementsByTagName("p")[0].innerHTML = "验证两次输入不一致";
                }
            }
            if(flag === 1) {
                document.getElementsByTagName("p")[0].innerHTML = "密码输入一致";
            }
        },
        reset:function() {
            //this.makeState();
            this.createCircle();
        },
        init:function() {
           /* this.pswObj = window.localStorage.getItem('password') ? {
                step: 2,
                spassword: JSON.parse(window.localStorage.getItem('password'))
            } : {};*/
            this.gotoCircle = []; // gotoCircle保存手势正确的经过的圈圈路径
            //this.makeState();
            this.touchFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.createCircle();

            this.bindEvent();
        },
        bindEvent:function() {
            var that = this;
            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
                var po = that.getPosition(e);
                for (var i = 0 ; i < that.arrCircle.length ; i++) {
                    if (Math.abs(po.x - that.arrCircle[i].x) < that.r && Math.abs(po.y - that.arrCircle[i].y) < that.r) {

                        that.touchFlag = true; // 记录touch下的状态
                        that.drawPoint(that.arrCircle[i].x, that.arrCircle[i].y);
                        that.gotoCircle.push(that.arrCircle[i]);
                        that.notGotoPoint.splice(i,1); // 保存全部圆圈中去除正确路径之后剩余的
                        break;
                    }
                }
            }, false);
            this.canvas.addEventListener("touchmove", function (e) {
                if (that.touchFlag) {
                    that.update(that.getPosition(e));
                }
            }, false);
            this.canvas.addEventListener("touchend", function (e) {
                if (that.touchFlag) {
                    that.touchFlag = false;

                  if(that.gotoCircle.length <= 4) {
                      document.getElementsByTagName("p")[0].innerHTML = "密码长度太短，请至少划过5个点";
                  }
                  else {
                      that.savePwd(that.gotoCircle,1); // 将走touch过的点，保存在本地
                      document.getElementsByTagName("p")[0].innerHTML = "请再次输入密码";
                      setTimeout(function(){
                          that.reset();
                      }, 1000);
                      that.savePwd(that.gotoCircle,2); // 将走touch过的点，保存在本地
                  }
                    setTimeout(function(){
                        that.reset();
                    }, 1000);

                }


            }, false);
            document.addEventListener('touchmove', function(e){
                e.preventDefault();
            },false);
            document.getElementById('updatePassword').addEventListener('click', function(){
                document.getElementsByTagName("p")[0].innerHTML = "请输入手势密码";
            });
            document.getElementById('validpwd').addEventListener('click', function(){
                that.checkpwd();
            });

        }

    });
    window.Lock = Lock;
})();