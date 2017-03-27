# H5demo
####HTML5将web开发者从PC端转移到移动端，然而移动端的交互的核心在于`手势`和`滑动`
####手势检测
   四个最基础的触摸事件
   - touchstart
   - touchmove
   - touchend
   - touchcancel
   
####HTML5实现屏幕手势解锁

- 原理

    - 利用canvas画出界面手势圆圈效果
    
    - 利用canvas的moveTo方法lineTo方法来画出手势密码经过的路径折线
    
    - 把路径里面经过的圆圈位置存放在localhost里面，用于解锁验证
        

       