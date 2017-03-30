# H5demo--手势密码锁屏解锁实现

#### 任务描述：
     
   - 在移动端设备上，完成一个“UI手势密码锁屏解锁”组件
   
   - 锁屏要完成的功能    
      - 设置密码：将第一次设置的密码存储在localstorage中 
      - 验证密码长度：划过的点数必须大于等于4    
      - 再次输入确认密码：检测两次输入密码是否一致，不一致，提示用户重新设置密码；
      一致，显示密码设置成功，将密码保存在本地localStorage中
      - 验证密码：切换单选框进入验证模式，与之前存入到本地的密码进行匹配，一致，显示解锁成功
      不一致，提示输入解锁密码不正确，重置为等待用户再次输入；一致的话，提示密码正确
#### 任务实现思路
    
  - 利用`canvas`画出手势解屏的图案，以及相应画图API实现手势划过的路径
  
  - 使用`touch事件`，touchstart ,touchmove, touchend模拟用户手势在页面上移动，记录用户划过
  的路径的位置
  
        (1)touchstart 手指触摸屏幕触发（已经有手指放在屏幕上不会触发）
        (2)手指在屏幕上滑动，连续触发
        （3）touchend 手指离开屏幕时触发
         触摸事件的包含属性：
         （1）touches:跟踪触摸操作的touch对象数组
         
            a) clientX/clinetY:触摸目标在视口中的x,y坐标
            b) pageX/pageY:触摸目标在页面中的x,y坐标（包含滚动）
            
  
  - 对设置密码与再次输入密码进行前后密码匹配，一致，将设置的密码结果使用`MD5加密`保存在本地`localStorage`中
  为了防止密码在控制台被被明文看到 
  
  - 使用`组件的常规`开发流程，来设计和实现手势锁屏解锁。
     
        （1）了解产品的需求，适用于移动端，页面的手势圆圈可以进行自定义
        （2）静态HTML模板实现，页面的基本结构
        （3）初始化Lock，定义公共接口，设置密码，验证密码
        （4）实现具体功能，暴露出接口

  - 使用`发布者-订阅者`模式实现对象的解耦，使得给对象注册事件变得方便。
 
 #### 任务问题
 
   （1）现阶段只能在chrome下的模拟器中实现滑动效果，以及移动端，还没有能在pc端实现
 
 #### 任务学习总结
   - 移动端开发的基本知识
        
         HTML5将web开发者从PC端转移到移动端，然而移动端的交互的核心在于`手势`和`滑动`
 ##### 像素知识 
    
   - 像素px: css中的pixels`逻辑像素`,浏览器使用的抽象单位
      
   - dp/pt ：device independent pixels设备无关像素,物理像素固定
      
   - dpr: devicePixelRatio 设备像素缩放比
      1px = (dpr)*(dpr)*dp
     
   - dpi:打印机每英寸可以喷的墨汁点
    
   - ppi:屏幕每英寸的像素数量，单位英寸内的像素密度，计算机显示设备上，dpi,ppi一致
      ppi越高，像素数越高，图像越清晰
    
   - ldpi 对应的ppi为120，于此同时对应的默认缩放比是 0.75
    
   - mdpi 对应的ppi为160，于此同时对应的默认缩放比是1.0
     
   - hdpi（高清屏Retina屏） 对应的ppi为240，于此同时对应的默认缩放比是1.5
    
   - xhdpi(超高清屏) 对应的ppi为320，于此同时对应的默认缩放比是2.0
    
   从设备分辨率到屏幕像素的转换过程
    
     （1）设备分辨率 1136*640 dp 经过公示计算 得到326ppi
     (2)根据326ppi,知道属于retina屏，并且dpr=2,通过公示 1px = dpr*dpr*dp
     (3)得到屏幕像素为 320*568px
     
  #### viewport知识
    
  为了较大页面在较小屏幕上仍然可以完整显示，手机浏览器默认做两件事
  - 将页面渲染在一个980px的viewport上，为了排版正确，虚拟一个viewoport
  - 对页面进行缩放
  - viewport分为虚拟viewport和布局viewport
      
        虚拟布局是当前显示在屏幕上的部分页面，用户会滚动页面来改变可见部分，
        或者缩放浏览器来改变虚拟vieport的尺寸，document.body.clientWidth/clientHeight
        来表示布局viewport，window.innerWidth来表示虚拟viewport
        缩放比=window.innerWidth/document.body.clientWidth
  
  Viewport的Meta标签
  <meta name="viewport" content="width=decice-width,initial-scale=1,user-scalable=no">
  
  #### 屏幕尺寸 screen size
  
   screen.width/height 用户屏幕的完整大小，设备的pixels,其值不会因为缩放而改变
  
  #### 浏览器尺寸 window size
  
  window.innerWidth/Height 包含滚动条尺寸的浏览器完整尺寸，css的pixels

  #### 移动端事件
    
   - click事件在移动web页面上有300ms的延迟
   
       在默认的viewport(980px)的页面上，需要通过`双击`或`捏开`放大页面
       为了确认用户是双击操作还是单击操作，用300ms延迟来做判断
     
   - 自定义Tap事件原理：
   
       在toucnstart,touchend时记录时间，手指位置，在touchend时进行比较，在手指较小范围的移动中
       并且时间较短，都没有发生toucnmove,就可以认为是触发了手持设备上的“click”,成为Tap(会有点透bug)
