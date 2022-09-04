// fields--------------------
// maps
var spreadsheetId = "11WH6PrhFAcdMEWSTjxSjZ7_rWHg-b8shAvSFn99bdyQ"; // for live
//var spreadsheetId = "1foxx3dOYDwnyqQsxmhmcWV93xvCzOxX73GCg8Bv-kg0";
var gW; /* world coordinate */
//entry point--------------------
window.onload = function(){
  unit=4;
  depth=3;
  map=[
    [1,0,1,1],
    [0,1,0,1],
    [1,0,1,1],
    [1,1,0,0]
  ];
  initDraw();
  initEvent(can);
  window.onresize(); //after loading maps
  setInterval(procAll, 1000/frameRate); //enter gameloop
}
var onchangetextbox = function(){
  depth = form0.depth.value;
  initMap(form0.unit.value);
  isRequestedDraw = true;
}
//maps-------------------
var unit;
var depth;
var map=[
];
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
//game loop ------------------
var procAll=function(){
  procEvent();
  if(isRequestedDraw){
    procDraw();
    isRequestedDraw = false;
  }
}
// html ----------------------------
var debug;
window.onresize = function(){ //browser resize
  var wx,wy;
  var agent = navigator.userAgent;
  var wx= [(document.documentElement.clientWidth-10)*0.99, 320].max();
  var wy= [(document.documentElement.clientHeight-300), 20].max();
  document.getElementById("outcanvas").width = wx;
  document.getElementById("outcanvas").height= wy;
  maplen = Math.floor([(can.width-margin*4)/2, can.height-margin*2].min());
  isRequestedDraw = true;
};
// graphics ------------------------
var ctx;
var can;
var margin = 10;
var maplen;
var isRequestedDraw = true;
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
        ctx.fillRect(margin+x*childlen, margin+y*childlen, childlen, childlen);
        ctx.strokeRect(margin+x*childlen, margin+y*childlen, childlen, childlen);
      }else{
        ctx.fillStyle  ="white";
        ctx.fillRect(margin+x*childlen, margin+y*childlen, childlen, childlen);
        ctx.strokeRect(margin+x*childlen, margin+y*childlen, childlen, childlen);
      }
    }
  }
  
  //draw fractal
  drawUnit(0,margin+maplen+margin+margin, margin, maplen);

}
var drawUnit = function(d, x0, y0, len){
  ctx.fillStyle  ="black";
  ctx.StrokeStyle="black";
  var childlen = len/unit;
  for(var x=0;x<unit;x++){
    for(var y=0;y<unit;y++){
      if(map[y][x]){
        if(d>=depth){
          ctx.fillRect  (x0+x*childlen, y0+y*childlen, childlen, childlen);
        }else{
          //draw inner recursively
          drawUnit(d+1, x0+x*childlen, y0+y*childlen, childlen);
        }
      }
    }
  }
}
//event---------------------
var lastpos=[-1,-1];
var downpos=[-1,-1];// start of drag
var movpos =[-1,-1];// while drag
var handleMouseDown = function(){
  var childlen = maplen/unit;
  var mx = Math.floor((mouseDownPos[0]-margin)/childlen);
  var my = Math.floor((mouseDownPos[1]-margin)/childlen);

  if(mx>=unit||my>=unit) return;

  map[my][mx]^=1;
  lastpos[0]=mx;
  lastpos[1]=my;
  isRequestedDraw = true;
}
var handleMouseDragging = function(){
  var childlen = maplen/unit;
  var mx = Math.floor((mouseDownPos[0]-margin)/childlen);
  var my = Math.floor((mouseDownPos[1]-margin)/childlen);

  if(mx>=unit||my>=unit) return;
  if(lastpos[0]==mx && lastpos[1]==my) return;

  map[my][mx]^=1;
  lastpos[0]=mx;
  lastpos[1]=my;
  isRequestedDraw = true;
}
var handleMouseUp = function(){
}
var handleMouseWheel = function(){
}

