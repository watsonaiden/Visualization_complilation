//general information about viz
var margin = {top: 30, right: 0, bottom: 30, left: 60},
    width = 550 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// cached astroids so dont have to keep making api calls every reload
// change this once all finished to actually get data
var today = new Date();
//decrease current date by 7
today.setDate(today.getDate()-7)
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;
console.log(today)
url = 'https://api.nasa.gov/neo/rest/v1/feed?start_date=' + today + '&api_key=xQLhf0rG75lyghSdMyTQoWUqabhnTxTaFmZuzwCW'
local_url = 'nasa_data_cached.txt'
fetch(url)
  .then((response) => response.json())
  .then((json) => {
	 
	var near_impacts = Object.values(json.near_earth_objects);
	// flatten array so that is just one long array rather than multiple nested
	near_impacts = near_impacts.flat(1);
	generate_histogram(near_impacts);	
	generate_scatter(near_impacts);
  });
// cors error preventing getting api code
local_all_url = 'all_data.txt'
all_url = 'https://ssd-api.jpl.nasa.gov/cad.api?date-min=1900-01-01&date-max=2021-01-01'
fetch(local_all_url)
  .then((response) => response.json())
  .then((json) => {
	generate_heatmap(json['data'])
  });


function generate_heatmap(all_data){
// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 30, left: 60},
  width = 1000 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#heatmap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Labels of row and columns

var years = [];
for (let year=1900; year<=2021; year++){
	years.push(year)
	}
const seasons = ['winter', 'spring', 'summer', 'fall'];

const x_year = d3.scaleBand()
	.range([0, width])
	.domain(years)
	.padding(0.01)

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x_year).tickValues(x_year.domain().filter((d,i)=> i % 10 == 0)))
.selectAll("text")
    .attr("transform", "translate(-10,2)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", 8)
    .style("fill", "#69a3b2")

const y_season = d3.scaleBand()
	.range([height, 0])
	.domain(seasons)
	.padding(0.01)
svg.append('g')
	.call(d3.axisLeft(y_season));

// third item refrences date of nearest approach
var dates = d3.map(all_data, (d)=>d[3]);
var bins = bin_dates(dates);
console.log(bins)	
	
// Build color scale
const myColor = d3.scaleLinear()
  .range(d3.schemeOranges[3])
  .domain(d3.extent(bins, (d)=>d.count))
//title
svg.append('text')
	.attr('x', width/2)
	.attr('y', 0-(margin.top/2))
	.attr('text-anchor', 'middle')
	.text('observed near miss astroids');

svg.selectAll()
	.data(bins)
	.join('rect')
	.attr('x', function(d){return x_year(d.year)})
	.attr('y', function(d){return y_season(d.season)})
	.attr('width', x_year.bandwidth())
	.attr('height', y_season.bandwidth())
	.style('fill', function(d){return myColor(d.count)});



}




// missdistance on x axis - velocity on y axis
// potential hazordous astroids are red
function generate_scatter(near_impacts){
	var svg = d3.select("#scatterplot")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
		  "translate(" + margin.left + "," + margin.top + ")");
	var approach = d3.map(near_impacts, (d)=>{return d.close_approach_data[0]});

	var x = d3.scaleLinear()
		 .domain(d3.extent(approach, (d) => parseFloat(d.miss_distance.astronomical)))
		 .range([0, width]);
	svg.append('g')
		.call(d3.axisBottom(x))
		.attr('transform',
			'translate(0,'+height+')');
	var y = d3.scaleLinear()
		  .domain(d3.extent(approach, (d)=> parseFloat(d.relative_velocity.kilometers_per_second)))
		  .range([height, 0])
	svg.append('g')
		.call(d3.axisLeft(y));

	var color = d3.scaleOrdinal()
		.domain([false, true])
		.range(['#0000D1','#DC143C']);
	
	var size = d3.scaleLinear()
		.domain(d3.extent(near_impacts, (d)=>{return (d.estimated_diameter.meters.estimated_diameter_min + d.estimated_diameter.meters.estimated_diameter_min)/2}))
		.range([1,10]);
	
	//tooltip
	 const tooltip = d3.select("#scatterplot")
	    .append("div")
	    .style("opacity", 0)
	    .attr("class", "tooltip")
	    .style("background-color", "white")
	    .style("border", "solid")
	    .style("border-width", "1px")
	    .style("border-radius", "5px")
	    .style("padding", "10px")

 	  console.log(near_impacts)

	  const mouseover = function(event, d) {
	    tooltip
	      .style("opacity", 1)
	  }

	  const mousemove = function(event, d) {
	    tooltip
	      .html(`astroid id: ${d.id}  |  name: ${d.name} <br> closest approach date: ${d.close_approach_data[0].close_approach_date} `)
	      .style("left", (event.x)/2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
	      .style("top", (event.y)/2 + "px")
	  }

	  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
	  const mouseleave = function(event,d) {
	    tooltip
	      .transition()
	      .duration(200)
	      .style("opacity", 0)
	  }	
		
	
	//title
	svg.append('text')
		.attr('x', width/2)
		.attr('y', 0-(margin.top/2))
		.attr('text-anchor', 'middle')
		.text('Miss distance vs Velocity')
	//y axis label
	svg.append('text')
		.attr('text-anchor', 'end')
		.attr('transform', 'rotate(-90)')
		.attr('y', -margin.left+20)
		.attr('x', -height/2 + 20)
		.text('Velocity(km/s)')



	//x axis label
	svg.append('text') 
		.attr('text-anchor', 'end')
		.attr('x', (width+margin.left+margin.right)/2)
		.attr('y', height+margin.top)
		.text('Miss distance(AU)');


	svg.append('g')
		.selectAll('dot')
		.data(near_impacts)
		.enter()
		.append('circle')
		  .attr('cx', (d)=>{return x(d.close_approach_data[0].miss_distance.astronomical)})
		  .attr('cy', (d)=>{return y(d.close_approach_data[0].relative_velocity.kilometers_per_second)})
		  .attr('r', (d)=>{return size((d.estimated_diameter.meters.estimated_diameter_min + d.estimated_diameter.meters.estimated_diameter_min)/2)})
		  .style('fill' , (d)=>{return color(d.is_potentially_hazardous_asteroid)})
		    .on("mouseover", mouseover )
		    .on("mousemove", mousemove )
		    .on("mouseleave", mouseleave );
}


function generate_histogram(near_impacts){
	var svg = d3.select('#histogram')
		.append('svg')
		.attr('width', width+margin.left + margin.right+20)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform',
			'translate('+margin.left + ',' + margin.top + ')');



	var diameters = d3.map(near_impacts, (d)=>{return (parseFloat(d.estimated_diameter.meters.estimated_diameter_max)+  parseFloat(d.estimated_diameter.meters.estimated_diameter_min))/2});
	
	//deal with cutoff
	var domain_margin = Math.pow(10, Math.floor(Math.log10(d3.max(diameters))))
	var new_max = Math.ceil(d3.max(diameters)/domain_margin)*domain_margin

	var x = d3.scaleLinear()
	  .domain([0, new_max])
	  .range([0, width])
	// create bottom axis
	svg.append('g')
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x));
	//title
	svg.append('text')
		.attr('x', width/2)
		.attr('y', 0-(margin.top/2))
		.attr('text-anchor', 'middle')
		.text('Astroid sizes')
	
	//y axis label
	svg.append('text')
		.attr('text-anchor', 'end')
		.attr('transform', 'rotate(-90)')
		.attr('y', -margin.left+20)
		.attr('x', -height/2 + 20)
		.text('Occurances')



	//x axis label
	svg.append('text') 
		.attr('text-anchor', 'end')
		.attr('x', (width+margin.left+margin.right)/2)
		.attr('y', height+margin.top)
		.text('Diameter in meters');

	var histogram = d3.bin()
	  .thresholds(6);	

	var bins = histogram(diameters)


	var y = d3.scaleLinear()
	  .range([height, 0]);
	y.domain([0, d3.max(bins, function(d){return d.length;})]);
	
	svg.append('g')
	  	.call(d3.axisLeft(y));

	bar_length = width / bins.length - 1
	svg.selectAll('rect')
	  .data(bins)
	  .enter()
	  .append('rect')
	    .attr('x', 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return bar_length ; })
	    .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2");

}

function time2season(date){
	var date_o = new Date(date);
	var month = date_o.getMonth()+1;	// add one since goes from 0-12
	var season;
	if (month == 1 || month == 2 || month == 12){
		season = 'winter'
	}
	else if (month<=5){
		season = 'spring'
	}
	else if (month<=8){
		season = 'summer'
	}
	else if (month<=11){
		season = 'fall'
	}
	else{
		//console.log('error', date)
	}
	return [season, date_o.getFullYear()]
}
function bin_dates(dates){
	var bins = {}
	dates.forEach(function (date){
		var [season, year] = time2season(date)
		if (!(year in bins)){
			bins[year] = {};
			bins[year][season] = {'count':1, 'season':season, 'year': year}
	}
		else if (year in bins && !(season in bins[year])){
			bins[year][season] = {'count':1, 'season':season, 'year': year}

		}
		else{
			bins[year][season]['count'] = bins[year][season]['count'] + 1;
		}


	}
	)
	// flatten bins
	//
	//
	var output = []
	Object.values(bins).forEach(function(year_data){
		var arr = Object.values(year_data)
		output = output.concat(arr)
	});
	return output
}


