var World = function(unit, map, userdepth){
  this.unit = unit;
  this.userdepth =  userdepth;
  this.map = map.clone();
}
var Node=function(pos, parent){
  this.pos    = pos.clone();
  this.parent = parent;
  this.cost   = 0;
}
var List=function(body, cost, next){
  this.body  = body;
  this.score = cost;
  this.next  = null;
}
var Solver = function(world){
  this.world = world;
  this.alllist  = new Array(0);
  this.openlist = new function();
  this.openlist.top   = null;
  this.openlist.items = null;
  //initialize openlist
  var unit=world.unit;
  var map=world.map;
  var y=unit-1;
  for(var x=0;x<unit;x++){
    if(map[y][x]){
      var node = new Node([y,x], null);
      node.cost = 1/unit;
      this.addopenlist(node, node.cost);
    }
  }
}
var Solver.prototype.addopenlist=function(body, cost){
  if(this.openlist.items==0){
    var item = new List(body, cost, null);
    this.openlist.items++;
    this.openlist.top = item;
  }else{
    var parent = null;
    for(var i=this.openlist.top;i!=null;i=i.next){
      if(i.cost < cost){
        if(parent!=null){
          var item = new List(body, cost, parent.next);
          parent.next = item;
          this.openlist.items++;
        }else{//i==top
          var item = new List(body, cost, parent.next);
          this.openlist.top = item;
          this.openlist.items++;
        }
      }
      parent = i;
    }//for i
  }
}
var movelist=[//movelist[dim][amount]
  [0,-1],//-x
  [0,+1],//+x
  [1,-1],//-y
  [1,+1],//+y
];

/* ret=searchnext()
 * ret = judge ={0:unknown yet, 1:found, 2:unsolved}
 * */
var solver.prototype.searchnext=function(){
  var goalnode = null;
  if(tihs.openlist.top==null) return 2; //unsolved
  var world = this.world;
  var unit  = world.unit;

  var parent = this.openlist.top.body;
  var pos   = parent.pos;
  var depth = pos.length-1;
  var p1;
  var isgoal = false;
  for(dir=0;dir<4;dir++){
    p1 = pos.clone();
    //increment
    var over=true;
    for(d=depth;d>=0;d--){
      var mdim=movelist[dir][0];
      p1[d][mdim]+=movelist[dim][1];
      if(p1[d][mdim]<0 || p1[d][mdim]>=unit){// outside
        p1[d][mdim]=(p1[d][mdim]+unit)%unit;
      }else{
        over=false;
        break;//rewind is not needed
      }
      //try next depth
    }
    if(!over){//not over
      //make pos the largest
      for(d=0;d<depth;d++){
        if(!world.map[p1[d][1]][p1[d][0]]){//empty in depth d
          p1.splice(d+1);//delete over depth d
        }
      }
      int cost = this.evalcost(node.cost, node1);
      var node1 = new Node(p1, p);
      this.addopenlist(node1, cost);
    }else{
      if(p1[0][1]<0){ // found goal
        ret = 1;
        goalnode = node;
        return 1; // return solved
      }
    }//if over
  }//for dir
  return 0; //return unknown
}
Solver.prototype.evalcost = function(parent, node){
  var pos   = node.pos;
  var depth = pos.length;
  var unit = this.world.unit;

  var cind = 1/4;
  var cost;
  if(parent==null){
    cost = 0;
  }else{
    cost = parent.cost;
  }
  for(var d=0;d<depth;d++){
    cost += pos[d][1]*cind;
    cind /= unit;
  }
  return cost;
}


