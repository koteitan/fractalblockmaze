var World = function(unit, map){
  this.unit  = unit;
  this.map   = map.clone();
}
var Node=function(pos, parent){
  this.pos    = pos.clone();
  this.parent = parent;
  this.cost   = 0;
}
Node.prototype.toString=function(){
  return "<"+this.pos.toString()+","+this.cost+">";
}
var List=function(body, cost, next){
  this.body  = body;
  this.score = cost;
  this.next  = null;
}
var Solver = function(world, depth){
  this.depth = depth;
  this.world = world;
  this.alllist  = [];
  this.openlist = function(){};
  this.openlist.top   = null;
  //initialize openlist
  var unit=world.unit;
  var map=world.map;
  var y=unit-1;
  for(var x=0;x<unit;x++){
    if(!map[y][x]){
      var node = new Node([[x,y]], null);
      node.cost = this.evalcost(0, node);
      this.addopenlist(node, node.cost);
    }
  }
}
Solver.prototype.addopenlist=function(body){
//  debugout("try add:"+body.pos.toString());
  //check alllist
  if(this.ismemberalllist(body)){ //is member of alllist
//    debugout("alllist=["+this.printalllist()+"] -> rejected.");
    return; // nop and return
  }
  //add into alllist
  this.addalllist(body);
  debugout("success to add:"+body.pos.toString());
//  debugout("alllist=["+this.printalllist()+"] -> accepted.");
//  debugout("openlist=["+this.printopenlist()+"].");
  
  if(this.openlist.top==null){ // first add
    var item = new List(body, 1, null);
    this.openlist.top = item;
  }else{ // after second
    var cost=body.cost;
    var parent = null;
    var isadded = false;
    for(var i=this.openlist.top;i!=null;i=i.next){
      if(i.cost < cost){
        if(parent!=null){
          var item = new List(body, cost, parent.next);
          parent.next = item;
        }else{//i==top
          var item = new List(body, cost, parent.next);
          this.openlist.top = item;
        }
      }
      parent = i;
    }//for i
    if(!isadded){// highest cost
      var item = new List(body, cost, parent.next);
      parent.next = item;
    }
  }
}
Solver.prototype.delopenlist = function(node){
  var parent = null;
  if(this.openlist.top==null) return;
  for(var i=this.openlist.top;i!=null;i=i.next){
    if(i.body==node){
      if(parent==null){
        this.openlist.top = i.next;
      }else{
        parent.next = i.next;
      }
      return;
    }
    parent = i;
  }
}
Solver.prototype.printopenlist = function(){
  if(this.openlist.top==null) return;
  for(var i=this.openlist.top;i!=null;i=i.next){
    debugout("pos="+i.body.pos.toString()+", cost="+i.body.cost);
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
Solver.prototype.searchnext=function(){
  var goalnode = null;
  if(this.openlist.top==null) return 2; //unsolved
  var world = this.world;
  var map   = world.map;
  var unit  = world.unit;

  var parent = this.openlist.top.body; //parent = lowest cost
  var pos   = parent.pos;
  var depth = pos.length;
  var pos1;
  var isgoal = false;
  debugout(this.printopenlist());
  debugout("top pos="+pos.toString());
  if(pos.isEqual([[1,2],[0,3] ])){
    var x=1;
  }
  //try all 4 directions
  for(dir=0;dir<4;dir++){
    pos1 = pos.clone();
    //try moving in movamt in a dimension movdim
    var movdim=movelist[dir][0];
    var movamt=movelist[dir][1];
    
    //carrying loop -> pos1 (catch over=true)
    var over=true;
    for(d=depth-1;d>=0;d--){
      pos1[d][movdim]+=movamt;
//      debugout("try pos1 "+pos1.toString());
      
      //check outside -> over
      if(pos1[d][movdim]<0 || pos1[d][movdim]>=unit){// outside
        pos1[d][movdim]=(pos1[d][movdim]+unit)%unit;
      }else{
        over=false;
        break;//rewind is not needed
      }
      //try next depth
    }
    
    if(!over){//not over
      
      //judge if pos1 is empty -> isempty
      var isempty=false;
      for(d=0;d<pos1.length;d++){
        if(map[pos1[d][1]][pos1[d][0]]==0){//empty in depth d
          isempty=true;
          pos1.splice(d+1);//delete over depth d
        }
      }
      
      if(isempty){// pos1 is empty
        
        //add it as it is
        var node1 = new Node(pos1, parent);
        node1.cost = this.evalcost(parent.cost, node1);
        this.addopenlist(node1);
        
      }else{// pos1 is not empty
        
        if(depth < this.depth){
          //search deeper nodes
          if(movdim==0){//x
            for(var y=0;y<unit;y++){
              var x=(movamt==-1)?unit-1:0;
              if(map[y][x]==0){
                var pos2 = pos1.clone();
                pos2.push([x,y]);
                var node2 = new Node(pos2, parent);
                node2.cost = this.evalcost(parent.cost, node2);
                this.addopenlist(node2);
              }
            }//for y
          }else{//y
            for(var x=0;x<unit;x++){
              var y=(movamt==-1)?unit-1:0;
              if(map[y][x]==0){
                var pos2 = pos1.clone();
                pos2.push([x,y]);
                var node2 = new Node(pos2, parent);
                node2.code = this.evalcost(parent.cost, node2);
                this.addopenlist(node2);
              }
            }//for x
          }//if movdim==0
        }// depth
      }//! else isempty
      
    }else{//over
      if(pos1[0][1]<0){ // found goal
        ret = 1;
        return 1; // return solved
      }
    }//if over
  }//for dir

  // remove parent from openlist
  this.delopenlist(parent);
  
  return 0; //return unknown
}
Solver.prototype.evalcost = function(parent_cost, node){
  var pos   = node.pos;
  var depth = pos.length;
  var unit = this.world.unit;

  var cind = 1/4;
  var cost = 0;
  for(var d=0;d<depth;d++){
    cost += pos[d][1]*cind;
    cind /= unit;
  }
  return cost;
}
Solver.prototype.addalllist = function(node){
  this.alllist.push(node);
}
Solver.prototype.ismemberalllist = function(node){
  var len=this.alllist.length;
  var alllist=this.alllist;
  for(var i=0;i<len;i++){
    if(alllist[i].pos.isEqual(node.pos)) return true;
  }
  return false;
}
Solver.prototype.printalllist=function(){
  var str="";
  for(var i=0;i<this.alllist.length;i++) str += this.alllist[i].toString(); 
  return str;
}
Solver.prototype.printopenlist=function(){
  var str="";
  for(var i=this.openlist.top;i!=null;i=i.next) str += i.body.toString(); 
  return str;
}
