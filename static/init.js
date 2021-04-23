nodesType=[],linksType=[1];
colorScale=0;

function dealData(){
  var result,nodes=[],edges=[],temp=[];
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
	  result=JSON.parse(this.responseText);     

	  for (let i=0;i<result.nodes.length;++i){
		  let tmp={};
		  tmp.name=result.nodes[i]["id"];
		  tmp.type=result.nodes[i]["label"];
		  nodes.push(tmp);

		  if (nodesType.indexOf(result.nodes[i]["label"])==-1)
			nodesType.push(result.nodes[i]["label"]);
	  }
	  
	  for (let i=0;i<result.links.length;++i){
		  let tmp={};
		  tmp.source=result.links[i]['start'];
		  tmp.target=result.links[i]['end'];
		  tmp.relation=1;
		  edges.push(tmp);
	  }

	  /*
      for (var i=0;i<result.nodes.length;++i){
        var tmp={};
		tmp.name=result.nodes[i]["id"];
		tmp.type=result.nodes[i]["weight"];
        nodes.push(tmp);
		temp.push(result.nodes[i]["id"]);
		if (nodesType.indexOf(result.nodes[i]["weight"])==-1)
			nodesType.push(result.nodes[i]["weight"]);
      }
      //console.log(nodes)

      for (var i=0;i<result.links.length;++i){
        var tmp={};
        tmp.source=temp.indexOf(result.links[i]["source"]);
        tmp.target=temp.indexOf(result.links[i]["target"]);
		tmp.relation=result.links[i]["type"];
		edges.push(tmp);
		if (linksType.indexOf(tmp.relation)==-1)
			linksType.push(tmp.relation);
      }
	  */
	  //console.log(nodes);
	  //console.log(nodesType);
	  //console.log(linksType);
      draw(nodes,edges,nodesType,linksType);
    }
  };
  xhttp.open("GET","/static/netscience.json",true);//"email.json",true);//"CA1.json",true);//"marieboucher.json",true);//"shneiderman.json", true);
  xhttp.setRequestHeader("JSON", "application/x-www-form-urlencoded");
  xhttp.send();
}

function draw(nodes,edges,nodesType,linksType){
    var marge = {top:60,bottom:60,left:60,right:60}
	var width=1050;
	var height = 900;

	var svg = d3.select("#main").append('svg')
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [-width / 2, -height / 2, width, height])
		//.call(zoom);
		/*
		.attr("viewBox", [0, 0, width, height])
        .call(d3.zoom().on("zoom", function () {
			svg.attr("transform", d3.event.transform)
		 }));
		*/
/*
	zoomSVG=svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.attr('id','svg')
		.style("fill", "none")
		.style("pointer-events", "all")
		.call(d3.zoom()
			.scaleExtent([1 / 100, 4])
			.on("zoom", zoomed));
*/
    var g = svg.append("g")
		//.attr("class","graphCon");
		.attr("transform","translate("+marge.top+","+marge.left+")");
	
	function zoomed(){
		g.attr("transform", d3.event.transform);
	}

	//设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
    colorScale = d3.scaleOrdinal()
    	.domain(nodesType.length+linksType.length)
    	.range(d3.schemeCategory10);

    //新建一个力导向图
    var forceSimulation = d3.forceSimulation()
    	.force("link",d3.forceLink())
    	.force("charge",d3.forceManyBody())
		.force("x", d3.forceX())
        .force("y", d3.forceY());
		//.force("center",d3.forceCenter())
	
    //初始化力导向图，也就是传入数据
	//生成节点数据
    forceSimulation.nodes(nodes)
    	.on("tick",ticked);//这个函数很重要，后面给出具体实现和说明

    //生成边数据
	forceSimulation.force("link")
    	.links(edges)
    	.distance(50) 
			
    /*设置图形的中心位置	
    forceSimulation.force("center")
    	.x(width/2)
    	.y(height/2);
*/
    //console.log(nodes);
	//console.log(edges);

    //有了节点和边的数据后，开始绘制
    //绘制边
    var links = g.append("g")
    	.selectAll("line")
    	.data(edges)
		.enter()
    	.append("line")
		.attr("id",function(d){
			if (d.source<d.target)
				return "line"+d.source.index+"-"+d.target.index;
			else return "line"+d.target.index+"-"+d.source.index;
		})
    	.attr("stroke",function(d){
			return colorScale(nodesType.length+linksType.indexOf(d.relation));
    	})
    	.attr("stroke-width",1)
		.on("click",function(d){
			rect.attr("width",0).attr("height",0);

			//shift点选与反选
			if (shiftflag==1){
				var lineName=this.id.slice(4);
				var index=lineNames.indexOf(lineName);

				if (index==-1){
					lineNames.push(lineName);

					tmp={};
					tmp.source=d.source.index;
					tmp.target=d.target.index;
					selected.links.push(tmp);

					d3.select(this).attr("stroke","black").attr("stroke-width","3px");

					if (selected.nodes.indexOf(tmp.source)==-1){
						selected.nodes.push(tmp.source);
						d3.select("#NO"+tmp.source).attr("stroke","black").attr("stroke-width","2px");
					}

					if (selected.nodes.indexOf(tmp.target)==-1){
						selected.nodes.push(tmp.target);
						d3.select("#NO"+tmp.target).attr("stroke","black").attr("stroke-width","2px");
					}
				}
				else{
					selected.links.splice(index,1);
					lineNames.splice(index,1);

					d3.select(this)
					  .attr("stroke", function(d){
					  	  return colorScale(nodesType.length+linksType.indexOf(d.relation));
					  });
				}
				//console.log(selected.nodes)
			}
		});

    var linksText = g.append("g")
    	.selectAll("text")
    	.data(edges)
		.enter()
    	.append("text")
/*    	.text(function(d){
    		return d.relation;
    	})
*/
    	
    //绘制节点
    //老规矩，先为节点和节点上的文字分组
    var gs = g.selectAll(".circleText")
    	.data(nodes)
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
    //console.log(edges)	
    //绘制节点
	gs.append("circle")
		.attr("id",function(d,i){return "NO"+i;})//""+d.index;})
		.attr("r",6)
    	.attr("fill",function(d){
    		return colorScale(nodesType.indexOf(d.type));
		})	
		.on("click",function(d){	
			rect.attr("width",0).attr("height",0);

			//shift点选与反选
			if (shiftflag==1){
				var index=selected.nodes.indexOf(d.index);
				if (index==-1){
					selected.nodes.unshift(d.index);
					d3.select(this).attr("stroke","black").attr("stroke-width","2px");
				}
				else{
					selected.nodes.splice(index,1);
					d3.select(this).attr("stroke", "none");

					for (i=selected.links.length-1;i>=0;--i){
						if (selected.links[i].source<selected.links.target)
							lineName=selected.links[i].source+"-"+selected.links[i].target;
						else lineName=selected.links[i].target+"-"+selected.links[i].source;
						
						if (selected.links[i].source==d.index||selected.links[i].target==d.index){
							d3.select("#line"+lineName)
							  .attr("stroke",function(d){
								return colorScale(nodesType.length+linksType.indexOf(d.relation));
							})
							  .attr("stroke-width",1);
							
							lineNames.splice(i,1);
							selected.links.splice(i,1);
						}
					}
					
				}
				//console.log(selected.nodes)
			}
			//路径选择		
			else if (control==2){

				if (selected.nodes.indexOf(d.index)==-1){
					selected.nodes.push(d.index);
					add2.push(d.index);
				}
			
				d3.select(this).attr("stroke","black").attr("stroke-width","2px");
				
				for (var i=0;i<edges.length;++i){
					if (edges[i].source<edges[i].target)
						lineName=edges[i].source.index+"-"+edges[i].target.index;
					else lineName=edges[i].target.index+"-"+edges[i].source.index;

					if(edges[i].source==d){
						//console.log(edges[i].target);
						d3.select("#NO"+edges[i].target.index).attr("stroke","black").attr("stroke-width","2px");
						
						if (selected.nodes.indexOf(edges[i].target.index)==-1)
							selected.nodes.push(edges[i].target.index);

							if (lineNames.indexOf(lineName)==-1){
								lineNames.push(lineName);
		
								tmp={};
								tmp.source=edges[i].source.index;
								tmp.target=edges[i].target.index;
								selected.links.push(tmp);
		
								d3.select("#line"+lineName).attr("stroke","black").attr("stroke-width","3px");
							}
					}
					else if (edges[i].target==d){
						//console.log(edges[i].source);
						d3.select("#NO"+edges[i].source.index).attr("stroke","black").attr("stroke-width","2px");
						
						if (selected.nodes.indexOf(edges[i].source.index)==-1)
							selected.nodes.push(edges[i].source.index);

							if (lineNames.indexOf(lineName)==-1){
								lineNames.push(lineName);
		
								tmp={};
								tmp.source=edges[i].source.index;
								tmp.target=edges[i].target.index;
								selected.links.push(tmp);
		
								d3.select("#line"+lineName).attr("stroke","black").attr("stroke-width","3px");
							}
					}

					
				}
				

			}

			
		});

	

    //文字 
/*  gs.append("text")
		.attr("x",-10)
    	.attr("y",-20)
    	.attr("dy",10)
	.text(function(d){
    		return d.name;
    	})
*/

	function ticked(){
    	links
    		.attr("x1",function(d){return d.source.x;})//valid(d.source.x,'x');})
			.attr("y1",function(d){return d.source.y;})//valid(d.source.y,'y');})
    		.attr("x2",function(d){return d.target.x;})//valid(d.target.x,'x');})
    		.attr("y2",function(d){return d.target.y;});//valid(d.target.y,'y');});

    	linksText
    		.attr("x",function(d){
    		return (d.source.x+d.target.x)/2;})
    		.attr("y",function(d){
				return (d.source.y+d.target.y)/2;});				

		//gs.attr("transform",function(d) { return "translate(" + valid(d.x,'x') + "," + valid(d.y,'y') + ")"; });	
		gs.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	}
	
	function valid(val,type){
		var r=6;
		var width=1330;
		var height = 840;
		if (val<r) return r;
		
		//console.log(width);
		if (type=='x'){
			if (val>width-60-r) return width-r-60;
		}
		else{
			if (val>height-60-r) return height-60-r;
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
    	d.fx = null;
		d.fy = null;
	}
	
	//基本框选
	var startLoc = [];
	var endLoc = [];
	var flag = "";
	var rect = svg.append("rect")
		.attr("width", 0)
		.attr("height", 0)
		.attr("fill", "rgba(33,20,50,0.0)")
		.attr("stroke", "black")
		.attr("stroke-dasharray","5,5")
		.attr("stroke-width", "2px")
		.attr("transform", "translate(0,0)")
		.attr("id", "squareSelect");

  svg.on("mousedown", function() {

	if (control==1){
		flag = true;//以flag作为可执行圈选的标记
		rect.attr("transform", "translate(" + d3.mouse(this)[0] + "," + d3.mouse(this)[1] + ")");
		startLoc = [d3.mouse(this)[0], d3.mouse(this)[1]];
	}

    if (flag==0&&shiftflag==0) {
		rect.attr("width",0).attr("height",0);

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

  });

  svg.on("mousemove", function() {
    //判断事件target
    if (d3.event.target.localName == "svg" && flag == 1&&control==1 || d3.event.target.localName == "rect" && flag == true&&control==1) {

      var width = d3.mouse(this)[0] - startLoc[0];
      var height = d3.mouse(this)[1] - startLoc[1];
      if (width < 0) {
        rect.attr("transform", "translate(" + d3.mouse(this)[0] + "," + startLoc[1] + ")");
      }
      if (height < 0) {
        rect.attr("transform", "translate(" + startLoc[0] + "," + d3.mouse(this)[1] + ")");
      }
      if (height < 0 && width < 0) {
        rect.attr("transform", "translate(" + d3.mouse(this)[0] + "," + d3.mouse(this)[1] + ")");
      }
      rect.attr("width", Math.abs(width)).attr("height", Math.abs(height))
	}

  })

  svg.on("mouseup", function(){
	  
	if(flag == true&&control==1){
		
		flag = false;
		control=0;
		endLoc = [d3.mouse(this)[0], d3.mouse(this)[1]];
		var leftTop = [];
		var rightBottom = []
		if(endLoc[0]>=startLoc[0]){
			leftTop[0] = startLoc[0];
			rightBottom[0] = endLoc[0];
		}
		else{
			leftTop[0] = endLoc[0];
			rightBottom[0] = startLoc[0];
		}

		if(endLoc[1]>=startLoc[1]){
			leftTop[1] = startLoc[1];
			rightBottom[1] = endLoc[1];
		}
		else{
			leftTop[1] = endLoc[1];
			rightBottom[1] = startLoc[1];
		}

		//最后通过和node的坐标比较，确定哪些点在圈选范围
		d3.selectAll("circle")
			.each(function(d){
				if (selected.nodes.indexOf(d.index)==-1&&d.x<rightBottom[0]-60 && d.x>leftTop[0]-60 && d.y>leftTop[1]-60 && d.y<rightBottom[1]-60){
					d3.select(this).attr("stroke", "black").attr("stroke-width","2px");
					selected.nodes.push(d.index);
					add.push(d.index);					
				}
				
		})

		//添加边以及边名称
		for (i=0;i<edges.length;++i){
			if (add.indexOf(edges[i].source.index)!=-1&&add.indexOf(edges[i].target.index)!=-1){
				if (edges[i].source.index<edges[i].target.index)
					lineName=edges[i].source.index+"-"+edges[i].target.index;
				else lineName=edges[i].target.index+"-"+edges[i].source.index;

				if (lineNames.indexOf(lineName)==-1){
					tmp={};
					tmp.source=edges[i].source.index;
					tmp.target=edges[i].target.index;
					selected.links.push(tmp);
					lineNames.push(lineName);
				}

				d3.select("#line"+lineName)
//				d3.selectAll("line")
				  .attr("stroke","black")
				  .attr("stroke-width","3px");
			}
		}
		//console.log(selected.links.length+" "+edges.length)
		add=[];
		//rect.attr("width",0).attr("height",0);
	}
	/*
	var times = (new Date()).getTime()-clickTime;
            if (times<100 && d3.event.target.id !== "squareSelect") {
                  var nodes = d3.selectAll(".node").attr("class", "node unselected")
                }
	*/
	/*
	if (control==2){
		console.log(selected.nodes.length)
		selected.nodes.push(d3.mouse(this));
		if (selected.nodes.length>1){
			svg.append("line")
				.attr("x1",d3.mouse(this)[0])
				.attr("y1",d3.mouse(this)[1])
				.attr("x2",selected.nodes[selected.nodes.length-2][0])
				.attr("y2",selected.nodes[selected.nodes.length-2][1])
				.attr("stroke","black")
				.attr("stroke-width","3px")
		}
	}
**/
	})
	
}