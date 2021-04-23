//全部已选子图以边对应名称
selected={nodes:[],links:[]};
lineNames=[];
//框选到的节点，用来确定由于框选操作需加入的边
add=[];
//
add2=[];
var control=0,shiftflag=0;
function enterSelect(id){
    control=id;
    if (id==1){
        fix(0);
    }
    
    /*
    if (id<3){
        d3.select("#svg")//.on('zoom',null)
        .call(d3.zoom().on("zoom", null))
        console.log(id);
    }
    */
}

function fix(flag){
    var fix=document.getElementById("fix");
    var act=document.getElementById("act");
    if (flag==0){      
        fix.style.display="none";
        act.style.display="";
    }
    else{
        fix.style.display="";
        act.style.display="none";
    }

    d3.selectAll("circle")
		.each(function(d){
			
			if(flag==0){
                d.fx = d.x;
    	        d.fy = d.y;
            }
            else{
                d.fx = null;
    	        d.fy = null;
            }
        })
}