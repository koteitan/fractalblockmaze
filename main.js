//entry point--------------------
window.onload = function(){
  map=[
    [1,0,1],
    [0,1,0],
    [1,0,1],
  ];
  map=[
    [1,0,1,1],
    [0,1,0,1],
    [1,0,1,1],
    [1,1,0,0]
  ];
  unit        = map.length;
  drawdepth   = 3;
  solverdepth = 4;
  form0.unit.value        = unit;
  form0.drawdepth.value   = drawdepth;
  form0.solverdepth.value = solverdepth;
  initSolver(1);
  initDraw();
  initEvent(can);
  window.onresize();
  setInterval(procAll, 1000/frameRate); //enter gameloop
}
//game loop ------------------
var procAll=function(){
  procEvent();
  procForm();
  if(reqdraw){
    procDraw();
    reqdraw = false;
  }
  procSolver();
}
//form events------------
issolverdepthchanged = false;
isdrawdepthchange    = false;
isunitchanged        = false;
var procForm = function(){
  if(issolverdepthchanged){
    solverdepth = parseInt(form0.solverdepth.value);
    reqinitsolver = true;
    reqdraw = true;
    ischangesolverdepth = false;
  }
  if(isdrawdepthchange){
    drawdepth = parseInt(form0.drawdepth.value);
    reqdraw = true;
    isdrawdepthchange = false;
  }
  if(isunitchanged){
    initMap(parseInt(form0.unit.value));
    reqdraw = true;
    isunitchanged = false;
  }
}
//solver -----------------
var unit;
var drawdepth;
var solverdepth;
var direction; // 0=horizontal
var map=[
];
//initMap: make a empty map
var initMap=function(_unit){
  unit = _unit;
  map = new Array(unit);
  for(var y=0;y<unit;y++){
    map[y] = new Array(unit);
    for(var x=0;x<unit;x++){
      map[y][x]=0;
    }
  }
}
var solver;
var world;
var trials = 100;
var solverstatus = 0; /* 0:unknown, 1:solved, 2:unsolved-end */
var reqinitsolver = 0;
//initSolver: renew solver instance for the depth depth
var initSolver = function(depth){
  world  = new World(unit, map);
  solver = new Solver(world, depth);
  debugout("Solver(,"+depth+")-------!!");
  solverstatus = 0;
}
var procSolver = function(){
  if(reqinitsolver){
    initSolver(1);
    reqinitsolver = 0;
  }

  switch(solverstatus){
    case 0:
      for(var i=0;i<trials;i++){
        var result = solver.searchnext();
        if(result!=0)break;
      }
      reqdraw = true;
      if(result==2){// unsolved
        if(solver.depth < solverdepth){
          var newdepth = solver.depth+1;
          initSolver(newdepth);
        }else{
          solverstatus = 2; // finally unsolved
        }
      }else if(result==1){// solved
        solverstatus = 1;
      }
      break;
    default:
      break;
  }//switch status
}
// debugout ------------------------
var isdebugout = false; // false for release
var debugout = function(str){
  if(isdebugout){
    console.log(str);
  }
}
var debug;
// graphics ------------------------
var ctx;
var can;
var margin = 10;
var maplen;
var reqdraw = true;
var frameRate = 30; //[fps]
//init
var initDraw=function(){
  can = document.getElementById("outcanvas");
  ctx = can.getContext('2d');
}
//proc
var procDraw = function(){

  //background
  ctx.strokeStyle="black";
  ctx.fillStyle  ="white";
  ctx.fillRect  (0,0,can.width, can.height);
  ctx.strokeRect(0,0,can.width, can.height);
  
  if(maplen <= 0) return;
  
  //pattern
  var childlen = maplen/unit;
  ctx.strokeStyle="gray";
  for(var x=0;x<unit;x++){
    for(var y=0;y<unit;y++){
      if(map[y][x]){
        ctx.fillStyle  ="black";
        ctx.fillRect  (margin+x*childlen, margin+y*childlen, childlen, childlen);
        ctx.strokeRect(margin+x*childlen, margin+y*childlen, childlen, childlen);
      }else{
        ctx.fillStyle  ="white";
        ctx.fillRect  (margin+x*childlen, margin+y*childlen, childlen, childlen);
        ctx.strokeRect(margin+x*childlen, margin+y*childlen, childlen, childlen);
      }
    }
  }
  
  var x;
  var y;
  if(direction){
    x=margin;
    y=margin+maplen+margin+margin;
  }else{
    x=margin+maplen+margin+margin;
    y=margin;
  }
  //draw fractal
  drawUnit(0, x, y, maplen);
  
  //draw openlist
  for(var i=solver.openlist.top;i!=null;i=i.next){
    var x1=x;
    var y1=y;
    var len=maplen;
    var pos=i.body.pos;
    var depth=pos.length;
    for(var d=0;d<depth;d++){
      len=len/unit;
      x1 = x1+pos[d][0]*len;
      y1 = y1+pos[d][1]*len;
    }
    ctx.fillStyle="rgb(255,0,255)";
    ctx.fillRect(x1, y1, len, len);
    a=1;
  }
  //draw alllist
  for(var i=0;i<solver.alllist.length;i++){
    var body = solver.alllist[i];
    var x1=x;
    var y1=y;
    var len=maplen;
    var pos=body.pos;
    var depth=pos.length;
    for(var d=0;d<depth;d++){
      len=len/unit;
      x1 = x1+pos[d][0]*len;
      y1 = y1+pos[d][1]*len;
    }
    ctx.fillStyle="rgb(255,0,255)";
    ctx.fillRect(x1, y1, len, len);
  }
}
var drawUnit = function(d, x0, y0, len){
  ctx.fillStyle  ="black";
  ctx.StrokeStyle="black";
  var childlen = len/unit;
  for(var x=0;x<unit;x++){
    for(var y=0;y<unit;y++){
      if(map[y][x]){
        if(d>=drawdepth){
          ctx.fillRect  (x0+x*childlen, y0+y*childlen, childlen, childlen);
        }else{
          //draw inner recursively
          drawUnit(d+1, x0+x*childlen, y0+y*childlen, childlen);
        }
      }
    }
  }
}
//GUI event---------------------
var lastpos=[-1,-1];
var downpos=[-1,-1];// start of drag
var movpos =[-1,-1];// while drag
var handleMouseDown = function(){
  var childlen = maplen/unit;
  var mx = Math.floor((mouseDownPos[0]-margin)/childlen);
  var my = Math.floor((mouseDownPos[1]-margin)/childlen);

  if(mx>=unit||my>=unit||mx<0||my<0) return;

  map[my][mx]^=1;
  lastpos[0]=mx;
  lastpos[1]=my;
  reqdraw = true;
  reqinitsolver = true;
}
var handleMouseDragging = function(){
  var childlen = maplen/unit;
  var mx = Math.floor((mousePos[0]-margin)/childlen);
  var my = Math.floor((mousePos[1]-margin)/childlen);

  if(mx>=unit||my>=unit||mx<0||my<0) return;
  if(lastpos[0]==mx && lastpos[1]==my) return;

  map[my][mx]^=1;
  lastpos[0]=mx;
  lastpos[1]=my;
  reqdraw = true;
  reqinitsolver = true;
}
var handleMouseUp = function(){
}
var handleMouseWheel = function(){
}
window.onresize = function(){ //browser resize
  var wx,wy;
  var agent = navigator.userAgent;
  var wx= [(document.documentElement.clientWidth-10)*0.99, 320].max();
  var wy= [(document.documentElement.clientHeight-300), 20].max();
  document.getElementById("outcanvas").width = wx;
  document.getElementById("outcanvas").height= wy;
  direction = wy>=wx;
  if(direction){
    maplen = Math.floor([(can.width-margin*2)/1, (can.height-margin*4)/2].min());
  }else{
    maplen = Math.floor([(can.width-margin*4)/2, (can.height-margin*2)/1].min());
  }
  reqdraw = true;
};

