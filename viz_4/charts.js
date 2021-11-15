



// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 760 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#test")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr('id', 'nodes')
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


//Read the data
d3.json('data/terrorists.json').
    // Now I can use this dataset:
    then(function(data) {
	// create scales
 var importance = d3.map(data.nodes, d => d.value);
 var color_scale = d3.scaleQuantize()
	    .domain(d3.extent(importance))
	    .range(['#FFEC19', '#FFC100', '#FF9800', '#F6412D'])
 var link = svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
            .style("stroke", "#aaa")

    // Initialize the nodes
    var node = svg
        .selectAll("circle")
	// notify data of the identifier of data
        .data(data.nodes, (e)=> e.id)
        .enter()
        .append("circle")
            .attr("r", 10)
            .style("fill", (d)=>color_scale(d.value))
	    .on('mouseover', mouseover)
	    .on('mouseout', mouseleave)
	    .on('click', remove_nodes);
	 
    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()   // This force provides links between nodes
                        .id(function(d) { return d.id; })  // This provide    the id of a node
                        .links(data.links)  // and this the list of links
		    
            )
            .force("charge", d3.forceManyBody().strength(-200)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
            .on("end", ticked); // This function is run at each iteration of the force algorithm, updating the nodes position.
	

    function ticked() {
        link
        	.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

        node
                 .attr("cx", function (d) { return d.x; })
                 .attr("cy", function(d) { return d.y; });
    }

// create legend
var legend = d3.select('div').select('svg').selectAll('#legend')
		.data([null])
		.enter()
		.append('g')
		.attr('class', 'legend')

var size = 20
//title
legend.selectAll('#title')
	    .data([null])
	    .enter()
	    .append('text')
	    .attr('class', 'title')
	    .attr('x', 0)
	    .attr('y', 5 +size/2)
	    .text('number of other members communicated with');

var dots = legend.selectAll('rect')
	.data(color_scale.range().reverse())
	.enter()
	.append('rect')
	  .attr('x', 0)
	  .attr('y', (d,i)=> 30+i*(size+5))
	  .attr('width', size)
	  .attr('height', size)
	  .style('fill', (d)=>d);

var legend_text = legend.selectAll('annotations')
	    .data(color_scale.range().reverse())
	    .enter()
	    .append('text')
	      .attr('x', size*1.2)
	      .attr('y', (d,i) => 30+i*(size+5)+(size/2))
	      .text((d)=>Math.round(color_scale.invertExtent(d)[0])+ '-'+ Math.round(color_scale.invertExtent(d)[1]) + ' connections')
	      .attr('text-anchor', 'left')
	      .style('alignment-baseline', 'middle');

// indicator of number of nodes removed
var indicator = d3.select('div').select('svg').selectAll('#indicator')
	    .data([null])
	    .enter()
	    .append('g')
	      .attr('transform', `translate(${width - 100}, 15)`);

indicator.append('text')
	    .text('missing elements: 0');


//remove important nodes
var current_nodes = data.nodes;
var current_links = data.links;
function remove_nodes(event, node_data){
	console.log(color_scale(5))
	var nodes_removed = current_nodes.filter((d)=>d.id!==node_data.id);

	node.data(nodes_removed, (e)=>e.id).exit().remove();
	// update what nodes are available
	current_nodes = nodes_removed;

	var links_removed = filter_links(current_links, node_data.id)
	simulation.nodes(nodes_removed);
	simulation.force('link').links(links_removed);
	link.data(links_removed).exit().remove();
	// update what links are available
	current_links = links_removed;

	// rerun simulation with node removed
	simulation.restart();

	indicator.select('text').text(`missing elements: ${data.nodes.length - current_nodes.length}`)
	// remove tooltip to prevent strange behavior
	mouseleave(event, node_data);
}

/* in progress
// reset checkbox
var input = d3.select('body').selectAll('input')
	.data([null])
	.enter()
	.append('button')
	  .html('reset visual')
	  .attr('id', 'reset')

document.getElementById('reset').addEventListener('click', reset_visual);
function reset_visual(){
	console.log(current_nodes);
	console.log(data.nodes);
	current_nodes = data.nodes;
	current_links = data.links;
	node = node.data(data.nodes, (d)=> d.id)	

	node.enter().append('circle')
		.attr("r", 10)
		    .style("fill", (d)=>color_scale(d.value))
		    .on('mouseover', mouseover)
		    .on('mouseout', mouseleave)
		    .on('click', remove_nodes);
	
	simulation.nodes(data.nodes);
	
	link = link.data(data.links);
	link.enter()
		.append('line')
		.style('stroke', '#aaa');

	simulation.force('link').links(data.links);
	simulation.restart();
}
*/
});
//tooltip functions
var tooltip = d3.select('#test').select('svg').append('g')
	.style('opacity', 0);
tooltip.append('rect')
	.attr('width', 50+'%')
	.attr('height', 50)
	.attr('fill', 'white')
	.attr('stroke', 'black');

var mouseover = (event, d) => {
	// creates text inside the toolbox if it doesn't exist yet
	tooltip.selectAll('text')
		.data([null])
		.enter()
		.append('text')
		.attr('y', 25)
		.attr('x', 5);

	tooltip.style('opacity', 1);
	const text = tooltip.select('text')
		.text(d.name + ' ' + d.value);
	const [x,y] = d3.pointer(event);
	tooltip.attr('transform', `translate(${x}, ${y-50})`)
	var bbox = text.node().getBBox();
	tooltip.select('rect')
		.attr('width', bbox.width+10)
}

var mouseleave = (event, d)=>{
	tooltip
	      .style("opacity", 0);
	// move tooltip so it doesn't block any nodes
	tooltip.attr('transform', 'translate(0,0)');
}
// compare function for data.node
function compare(a,b){

	a =  Number(a.value);
	b = Number(b.value);

	if (a > b) return -1;
	else if (a === b) return 0;
	else return 1;
}	
function filter_links(links, remove){
	links = links.filter((l)=>l.source.id !== remove && l.target.id !== remove)	
	return links
}
