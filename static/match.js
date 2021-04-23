tmpnodes=[];
tmplinks=[];
linkFlag=0;
first={};

function addNode(){
    var tmp={};
    tmp.name=""+tmpnodes.length;
	tmpnodes.push(tmp);
	
	drawSubForce();
}

function addLink(){
    linkFlag=1;
}

function postMatch(){
	let result;
	let xhttp;
	
	target={"nodes":tmpnodes,"links":tmplinks};
	
	xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		  result=JSON.parse(this.responseText);
		  displayTable1(result);
		}
    };
    xhttp.open("POST","/getMatch",true);
    xhttp.setRequestHeader("JSON", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(target));
}

function getStr(id){
	let result;
	let xhttp;
	xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		  result=JSON.parse(this.responseText);
		  if (id==1) 
		  	displayTable2(result['link']);
		  else if (id==2)
		    displayTable2(result['clique']);
		  else
		    displayTable2(result['star']);
		}
    };
    xhttp.open("GET","/static/subStr1.json",true);
    xhttp.setRequestHeader("JSON", "application/x-www-form-urlencoded");
    xhttp.send();
}

function initDispaly(){
	var table=document.createElement("table");
    var thead=document.createElement("thead");
    var tbody=document.createElement("tbody");
    table.setAttribute("id","TABLE");
    table.setAttribute("cellpadding","0");
    table.setAttribute("cellspacing","0");
    tbody.setAttribute("id","TBADY");
    table.appendChild(thead);
    table.appendChild(tbody);
        
    document.getElementById("resultContent").appendChild(table);
    var tr=thead.insertRow();   
    for (var i=0;i<2;++i){
        var th=document.createElement("th");
        if (i==0){
            th.innerHTML="序号";
        }
        else {th.innerHTML="结果";}
        tr.appendChild(th);
    }
}

function displayTable1(matchedGraph){
	
	var table=document.getElementById("TABLE");
    var tbody=document.getElementById("TBADY");
    tbody.remove();
    var tbody=document.createElement("tbody"); 
    tbody.setAttribute("id","TBADY");       
    table.appendChild(tbody);
        
    for (var i=0;i<matchedGraph['sub'].length;++i){
        var trRow=tbody.insertRow();
            
        for (var j=0;j<2;++j){
            var th=document.createElement("th");
            if (j==0) {th.innerHTML=i+1;}
            else {th.innerHTML=matchedGraph['sub'][i].toString();}
            trRow.appendChild(th);
		}
		
		trRow.onclick=function(){
			var rowIndex = this.rowIndex;
			//console.log(selected)
			
			//未按下shift键，将原先的恢复
			if (shiftflag==0){				
				d3.selectAll("line").attr("stroke",function(d){
					return colorScale(nodesType.length+linksType.indexOf(d.relation));
				})
				.attr("stroke-width",1);			
		
				control=0;
		
				d3.selectAll("circle")
					.each(function(d){				
						d3.select(this).attr("stroke", "none");									
					})	

				selected.nodes=[];
				selected.links=[];
				lineNames=[];
				add=[];	
				add2=[];
			}

			//无论是否按下shift，均要将新的在图中显示
			for (j=0;j<matchedGraph['sub'][rowIndex-1].length;++j){
				if (selected.nodes.indexOf(matchedGraph['sub'][rowIndex-1][j])==-1)
					selected.nodes.push(matchedGraph['sub'][rowIndex-1][j])
				
				d3.select("#NO"+matchedGraph['sub'][rowIndex-1][j])
				  .attr("stroke","black")
				  .attr("stroke-width","2px");
			}

			for (j=0;j<matchedGraph["links"].length;++j){
				if (matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].source]<matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].target])
					lineName=matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].source]+'-'+matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].target];
				else lineName=matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].target]+'-'+matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].source];

				if (lineNames.indexOf(lineName)==-1){
					lineNames.push(lineName);
					tmp={};
					tmp.source=matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].source];
					tmp.target=matchedGraph['sub'][rowIndex-1][matchedGraph["links"][j].target];
					selected["links"].push(tmp);
				}

				d3.select("#line"+lineName)
				  .attr("stroke","black")
				  .attr("stroke-width","3px");
			}
		}
    }
}

function displayTable2(matchedGraph){
	
	var table=document.getElementById("TABLE");
    var tbody=document.getElementById("TBADY");
    tbody.remove();
    var tbody=document.createElement("tbody"); 
    tbody.setAttribute("id","TBADY");       
    table.appendChild(tbody);

    for (var i=0;i<matchedGraph.length;++i){
        var trRow=tbody.insertRow();
            
        for (var j=0;j<2;++j){
            var th=document.createElement("th");
            if (j==0) {th.innerHTML=i+1;}
            else {th.innerHTML=matchedGraph[i]['nodes'].toString();}
            trRow.appendChild(th);
		}
		
		trRow.onclick=function(){
			var rowIndex = this.rowIndex;
			//console.log(selected)
			
			//未按下shift键，将原先的恢复
			if (shiftflag==0){				
				d3.selectAll("line").attr("stroke",function(d){
					return colorScale(nodesType.length+linksType.indexOf(d.relation));
				})
				.attr("stroke-width",1);			
		
				control=0;
		
				d3.selectAll("circle")
					.each(function(d){				
						d3.select(this).attr("stroke", "none");									
					})	

				selected.nodes=[];
				selected.links=[];
				lineNames=[];
				add=[];	
				add2=[];
			}

			//无论是否按下shift，均要将新的在图中显示
			for (j=0;j<matchedGraph[rowIndex-1]['nodes'].length;++j){
				if (selected.nodes.indexOf(matchedGraph[rowIndex-1]['nodes'][j])==-1)
					selected.nodes.push(matchedGraph[rowIndex-1]['nodes'][j])
				
				d3.select("#NO"+matchedGraph[rowIndex-1]['nodes'][j])
				  .attr("stroke","black")
				  .attr("stroke-width","2px");
			}

			for (j=0;j<matchedGraph[rowIndex-1]["links"].length;++j){
				if (matchedGraph[rowIndex-1]["links"][j].start<matchedGraph[rowIndex-1]["links"][j].end)
					lineName=matchedGraph[rowIndex-1]["links"][j].start+'-'+matchedGraph[rowIndex-1]["links"][j].end;
				else lineName=matchedGraph[rowIndex-1]["links"][j].end+'-'+matchedGraph[rowIndex-1]["links"][j].start;

				if (lineNames.indexOf(lineName)==-1){
					lineNames.push(lineName);
					tmp={};
					tmp.source=matchedGraph[rowIndex-1]["links"][j].start;
					tmp.target=matchedGraph[rowIndex-1]["links"][j].end;
					selected["links"].push(tmp);
				}

				d3.select("#line"+lineName)
				  .attr("stroke","black")
				  .attr("stroke-width","3px");
			}
		}
    }
}

function subInit(){
	var width=327;
	var height = 300;

    var svg = d3.select("#sub").append('svg').attr("id","subgraph")
        .attr("width", width)
        .attr("height", height);

		
    svg.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width",width)
        .attr("height",height)
        .attr("fill","white");

    svg.on("mouseup", function() {
        if (control==3){

        }
    })
}

function trans(){
	var tmp={};
	tmp.source=first.source;
	tmp.target=first.target;

	tmplinks.push(tmp);
	drawSubForce();
}

function drawSubForce(){
	var subnodes=JSON.parse(JSON.stringify(tmpnodes)),sublinks=JSON.parse(JSON.stringify(tmplinks));
	var width=327;
	var height = 300;

	var marge = {top:20,bottom:20,left:20,right:20};

	d3.select("#subgraph").remove();

	var svg = d3.select("#sub").append('svg').attr("id","subgraph")
        .attr("width", width)
        .attr("height", height);
		
    svg.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width",width)
        .attr("height",height)
        .attr("fill","white");

	var g = svg.append("g")
		.attr("transform","translate("+marge.top+","+marge.left+")");

    //新建一个力导向图
    var forceSimulation = d3.forceSimulation()
    	.force("link",d3.forceLink())
    	.force("charge",d3.forceManyBody())
		.force("center",d3.forceCenter());;

    //初始化力导向图，也就是传入数据
	//生成节点数据
    forceSimulation.nodes(subnodes)
    	.on("tick",ticked);//这个函数很重要，后面给出具体实现和说明

    //生成边数据
	forceSimulation.force("link")
    	.links(sublinks)
    	.distance(30)    	

    //设置图形的中心位置	
    forceSimulation.force("center")
    	.x(width/2)
    	.y(height/2);

    //在浏览器的控制台输出
    //console.log(tmpnodes);
	//console.log(sublinks);

    //有了节点和边的数据后，我们开始绘制
    //绘制边
    var links = g.append("g")
    	.selectAll("line")
    	.data(sublinks)
		.enter()
    	.append("line")
    	.attr("stroke","purple")
    	.attr("stroke-width",1);

    
    //绘制节点
    //老规矩，先为节点和节点上的文字分组
    var gs = g.selectAll(".circleText")
    	.data(subnodes)
    	.enter()
		.append("g")
    	.attr("transform",function(d){
    		var cirX = d.x;
			var cirY = d.y;
    		return "translate("+cirX+","+cirY+")";
    	})
    	.call(d3.drag()
			.on("start",started)
    		.on("drag",dragged)
    		.on("end",ended)
    	);
    
    //绘制节点
	gs.append("circle")
		.attr("id",function(d,i){return "subNO"+i;})//""+d.index;})
		.attr("r",6)
    	.attr("fill","blue")	
		.on("click",function(d){	
			//路径选择
			
			if (control==3&&linkFlag==1){				
				first.source=d.name;
				linkFlag=2;
			}
			else if (control==3&&linkFlag==2){
				first.target=d.name;
				linkFlag=0;
				trans();
			}
		});

    	
	function ticked(){
    	links
    		.attr("x1",function(d){return valid(d.source.x,'x');})
			.attr("y1",function(d){return valid(d.source.y,'y');})
    		.attr("x2",function(d){return valid(d.target.x,'x');})
    		.attr("y2",function(d){return valid(d.target.y,'y');});

		gs.attr("transform",function(d) { return "translate(" + valid(d.x,'x') + "," + valid(d.y,'y') + ")"; });	

	}
	
	function valid(val,type){
		var r=6;
		var width=327;
		var height = 300;
		if (val<r) return r;
		
		//console.log(width);
		if (type=='x'){
			if (val>width-20-r) return width-r-20;
		}
		else{
			if (val>height-20-r) return height-20-r;
		}
		return val;
	}

    function started(d){
    	if(!d3.event.active){
    		forceSimulation.alphaTarget(0.8).restart();
		}

    	d.fx = d.x;
		d.fy = d.y;
		
	}

    function dragged(d){
    	d.fx = d3.event.x;
		d.fy = d3.event.y;
		
	}

    function ended(d){
    	if(!d3.event.active){
    		forceSimulation.alphaTarget(0);
		}
    	//d.fx = null;
		//d.fy = null;
	}
}