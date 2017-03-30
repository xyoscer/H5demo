/**
 * Created by XiYin on 2017/3/27.
 */

//使用发布-订阅者模式实现对象之间松耦合
var emitter = {
    // 注册事件,订阅事件
    on: function(event, fn) {
        //hamdles表示存放订阅者,以及对应的回调函数
        var handles = this._handles || (this._handles = {});
        if(!handles[event]) {
            handles[event] = [];
        }
        handles[event].push(fn);
        return this;
    },
    // 解绑事件，解除订阅
    off: function(event, fn) {
        if(!event || !this._handles) this._handles = {};
        if(!this._handles) return;

        var handles = this._handles , calls;

        if (calls = handles[event]) {
            if (!fn) {
                handles[event] = [];
                return this;
            }
            // 找到栈内对应listener 并移除
            for (var i = 0, len = calls.length; i < len; i++) {
                if (fn === calls[i]) {
                    calls.splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    },
    // 发布事件，依次触发里面存放的订阅者回调函数
    emit: function(event){
        var args = [].slice.call(arguments, 1);
        var handles = this._handles;
        var calls; //该事件对应的所有回调函数

        if (!handles || !(calls = handles[event])) return this;
        // 触发所有对应名字的listeners
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(this, args);
        }
        return this;
    }
};
(function() {
    // 将HTML转换为节点
    function htmlTonode(str) {
        var container = document.createElement('div');
        container.innerHTML = str;
        document.body.appendChild(container);
        return container.children[0];
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
    // 页面HTML模板
    var template = '<div class="m-lock"><h4 id="title" class="title">手势密码</h4>\
                   <canvas  id="canvas" width="300" height="300"></canvas>\
                   <p class="m-para"></p>\
                    <div class="m-footer">\
                     <input type="radio"  class="radio"  name="pwd" id="Password">\
                     <label for="Password">设置密码</label>\
                     <input type="radio" class="radio" name="pwd" id="validpwd">\
                     <label for="validpwd">验证密码</label></div>\
                 </div>';
    // 构造锁屏
    function Lock(options) {
        options = options || {};
        this.container = this._layout.cloneNode(true);
        extend(this, options);
        this.init();

    }
    // 扩展Lock屏的原型
    extend(Lock.prototype,{
       _layout: htmlTonode(template),

        // 划过的点与未滑过点的距离
       pickPoints: function(fromPt,toPt) {
           var lineLen = getDistance(fromPt,toPt);
           var dir = toPt.index > fromPt.index ? 1 : -1;
           var len = this.notGotoPoint.length;
           var i = (dir === 1) ? 0: (len - 1);
           var limit = (dir === 1)? len : -1;
           while(i !== limit) {
               var pt = this.notGotoPoint[i];
               if(getDistance(pt,fromPt) + getDistance(pt,toPt) === lineLen) {
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
        // 手势滑动过的点，在圆圈里面画小圆
        drawPoint: function(gotoCircle) {
            for (let i = 0 ; i < gotoCircle.length ; i++) {
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(gotoCircle[i].x, gotoCircle[i].y, this.r / 4, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        },
        // 描绘touch过的路径
        drawLine:function(po, gotoCircle) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            // 路径的起点坐标
            this.ctx.moveTo(gotoCircle[0].x, gotoCircle[0].y);
            for (let i = 1 ; i < gotoCircle.length ; i++) {
                // 中间点坐标
                this.ctx.lineTo(gotoCircle[i].x, gotoCircle[i].y);
            }
            // 中间点坐标
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();
        },
        // 创建解锁圆圈的坐标位置
        createCircle:function() {
            var n = this.RowcircleNum; // 确定一行中圆圈的个数
            var count = 0; // 解锁圆圈的个数
            // 创建解锁点的坐标，根据canvas的大小来平均分配半径
            this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
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
        // tocuh移动到不同的点上
       update: function(po) {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (let i = 0 ; i < this.arrCircle.length ; i++) {
                this.drawCircle(this.arrCircle[i].x, this.arrCircle[i].y);
            }
            this.drawPoint(this.gotoCircle);// touch过的圆圈上画小圆圈
            this.drawLine(po, this.gotoCircle);// 绘制经过的路径
            for (let i = 0 ; i < this.notGotoPoint.length ; i++) {
               var pt = this.notGotoPoint[i];
                if (Math.abs(po.x - pt.x) < this.r && Math.abs(po.y - pt.y) < this.r) {
                    this.pickPoints(this.gotoCircle[this.gotoCircle.length - 1], pt);
                    break;
                }
            }
    },
        // touchend结束后，保存手势经过的节点坐标
        savePwd: function(pwd,num) {
            var pswObj = {};
            // 将划过的路径保存在一个对象中，只保存点在数组中的位置
            for(let i = 0;i<pwd.length;i++) {
                pswObj["step"+pwd[i].index] = md5(pwd[i].index);

            }
            var str = JSON.stringify(pswObj);
            if(num === 1 ) { // 是第一次设置密码
                if(window.localStorage.getItem('password1')) {
                    window.localStorage.removeItem('password1');
                }
                window.localStorage.setItem('password1',str);

            }
            if(num === 2) {  // 确认设置密码 ，并和第一次设置的密码进行匹配
                if(window.localStorage.getItem('password2')) {
                    window.localStorage.removeItem('password2');
                }
                window.localStorage.setItem('password2',str);
                if(this.checkpwd("password1","password2")) {
                    this.para.innerHTML = "密码设置成功";
                }else {
                    this.para.innerHTML = "两次密码不一致，请重新设置密码";
                    window.localStorage.removeItem('password2');
                    window.localStorage.removeItem('password1');
                }
            }
            if(num === 3) { // 进入滑动解锁
                if(window.localStorage.getItem('password3')) {
                    window.localStorage.removeItem('password3');
                }
                window.localStorage.setItem('password3',str);
                if(this.checkpwd("password2","password3")) {

                    this.para.innerHTML = "密码正确";
                    this.title.innerHTML = "360星计划欢迎您!";
                }else {
                    this.para.innerHTML = "输入密码有误，请重新输入密码";
                    window.localStorage.removeItem('password3');
                }
            }
        },
        // 进行密码匹配
        checkpwd: function(psd1,psd2) {
            var flag = 1;
            var pwd1 = JSON.parse(window.localStorage.getItem(psd1));
            var pwd2 = JSON.parse(window.localStorage.getItem(psd2));
            for(var i in pwd1) {
                if(pwd1[i] !== pwd2[i]) {
                    flag = 0;
                    return false;
                }
            }
            if(flag === 1) {
                return true;
            }
        },
        // 重置页面
        reset:function() {
            this.gotoCircle.length = 0;
            this.createCircle();
        },
        //初始化lock屏状态信息，以及初始化事件
        init:function() {
            this.gotoCircle = [];    // gotoCircle保存手势正确的经过的圈圈路径
            this.arrCircle = [];     // 保存总共的圆圈个数
            this.notGotoPoint = [];  // 保存手势没有经过的那些圆圈点
            this.touchFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.para = document.getElementsByClassName('m-para')[0];
            this.title = document.getElementById('title');
            this.createCircle();
            document.getElementById('Password').addEventListener('click', this._drawPwd.bind(this)
            ,false);
            document.getElementById('validpwd').addEventListener('click', this._verifyPwd.bind(this)
            ,false);

        },
        _drawPwd: function() {
            this.para.innerHTML = "请输入手势密码";
            // 清空之前的设置的解锁手势密码
            if(window.localStorage.getItem('password1')) {
                window.localStorage.removeItem('password1');
            }
            if(window.localStorage.getItem('password2')) {
                window.localStorage.removeItem('password2');
            }
            this.bindEvent();
            this.emit('setPwd'); //发布执行setPwd函数消息

        },
        _verifyPwd:function() {
            this.para.innerHTML = "输入验证密码";
            if(window.localStorage.getItem('password1') == null) {
                this.para.innerHTML = "您还没有设置密码，不能进行解锁";
            }else {
                this.bindEvent();
                this.emit('verifyPwd'); //发布执行setPwd函数消息
            }


        },
        // 进行touch事件
        bindEvent:function() {
            var that = this;
            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
                var po = that.getPosition(e);
                that.para.innerHTML = "";
                for (let i = 0 ; i < that.arrCircle.length ; i++) {
                    if (Math.abs(po.x - that.arrCircle[i].x) < that.r && Math.abs(po.y - that.arrCircle[i].y) < that.r) {
                        that.touchFlag = true; // 记录touch下的状态
                        that.gotoCircle.push(that.arrCircle[i]); // 划过的点进入数组
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
                  if(that.gotoCircle.length < 4) {
                       that.para.innerHTML = "密码长度太短，请至少划过4个点";
                  }
                  else {
                      if(window.localStorage.getItem('password1') == null) {
                          if(document.getElementById('validpwd').checked) {
                              that.para.innerHTML = "没有设置密码，验证密码有错";
                              setTimeout(function(){
                                  that.reset();
                              }, 1000);
                          }else {
                              that.savePwd(that.gotoCircle,1); // 第一次设置密码touch过的点，保存在本地
                              that.para.innerHTML = "请再次输入密码";
                          }

                      }else if(window.localStorage.getItem('password1')&&window.localStorage.getItem('password2') == null){
                          setTimeout(function(){
                              that.reset();
                          }, 1000);
                          that.savePwd(that.gotoCircle,2); // 确认输入密码touch过的点，保存在本地
                      }else{
                          setTimeout(function(){
                              that.reset();
                          }, 1000);
                          that.savePwd(that.gotoCircle,3); // 验证密码touch过的点，保存在本地
                      }
                  }
                    setTimeout(function(){
                        that.reset();
                    }, 1000);
                }
            }, false);
        }

    });
    // 使Lock实例上具有事件发射器功能
    extend(Lock.prototype, emitter);
    // 将Lock直接暴露到全局
    window.Lock = Lock;
})();