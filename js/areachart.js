
// Variables for the visualization instances
let areachart, timeline;

// Start application by loading the data
loadData();

function loadData() {
    d3.json("data/top10.json"). then(jsonData=>{

        // prepare data
        let data = prepareData(jsonData);

        // instantiate visualization objects
        areachart = new StackedAreaChart("stacked-area-chart", data.layers);
        timeline = new Timeline("timeline", data.years);

    });
}


function prepareData(data){

    let parseDate = d3.timeParse("%Y");

    let preparedData = {};

    // convert years to date objects
    preparedData.layers = data.layers.map( d => {
        for (let column in d) {
            if(d.hasOwnProperty(column) && column === "Year") {
                d[column] = parseDate(d[column].toString());
            }
        }
    });

    preparedData.years = data.years.map( d => {
        for (let column in d) {
            if(d.hasOwnProperty(column) && column === "Year") {
                d[column] = parseDate(d[column].toString());
            }
        }
    });

    return data
}


function brushed() {

    // Get the extent of the current brush
    let selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    let selectionDomain = selectionRange.map(timeline.xScale.invert);

    areachart.x.domain(selectionDomain);

    // Update focus chart (detailed information)
    areachart.wrangleData();

}


/*
 * StackedAreaChart - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the that's provided initially
 * @param  displayData      -- the data that will be used finally (which might vary based on the selection)
 *
 * @param  focus            -- a switch that indicates the current mode (focus or stacked overview)
 * @param  selectedIndex    -- a global 'variable' inside the class that keeps track of the index of the selected area
 */

class StackedAreaChart {

// constructor method to initialize StackedAreaChart object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        // let colors = ['#a6cee3','#1f78b4','#73d7c6','#349898','#c4a6a1','#ab6958','#fdbf6f','#f88445','#cab2d6','#a272dc'];
        let colors = ['#FFFFFF','#c9debc','#b8daa1','#a0cb83',
            '#83b761','#62963f','#407020','#2a540d',
            '#1a4200','#0f2a01'];

        // grab all the keys from the key value pairs in data (filter out 'year' ) to get a list of artists
        this.artists = Object.keys(this.data[0]).filter(d=>d !== "Year")

        // prepare colors for range
        let colorArray = this.artists.map( (d,i) => {return colors[i%10]})

        // Set ordinal color scale
        this.colorScale = d3.scaleOrdinal()
            .domain(this.artists)
            .range(colorArray);

        this.initVis();
    }


    /*
     * Method that initializes the visualization (static content, e.g. SVG area or axes)
     */
    initVis(){
        let vis = this;

        vis.margin = {top: 10, right: 40, bottom: 20, left: 350};
        vis.width = 1000;
        vis.height = 400;

        //vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append('g')
            .attr('class', 'x-axis-label')
            .append('text')
            .text("Year")
            .attr('transform', `translate(${vis.width / 2}, ${vis.height + 40})`)
            .attr('text-anchor', 'middle')
            .style("fill", "white");

        vis.svg.append('g')
            .attr('class', 'y-axis-label')
            .append('text')
            .text("Number of Hits")
            .attr('transform', `translate(-35, ${vis.height/2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .style("fill", "white");

        // Overlay with path clipping
        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis.data, (d) => (d.Year)));

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Initialize stack layout
        vis.stack = d3.stack().keys(vis.artists);

        vis.stackedData = vis.stack(vis.data)

        // Stacked area layout
        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .curve(d3.curveCardinal)
            .x(d => vis.x(d.data.Year))
            .y0(d => vis.y(d[0]))
            .y1(d => vis.y(d[1]));

        // Add Tooltip placeholder
        vis.tooltip = vis.svg.append("g")
            .append("text")
            .attr("x", 10)
            .attr("y", 10)
            .text("")
            .style("fill", "white");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */

    wrangleData(){
        let vis = this;

        this.displayData = this.stackedData;

        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis(){
        let vis = this;

        // update y domain
        vis.y.domain([0, d3.max(vis.displayData, function(d) {return d3.max(d, function(e) {return e[1];});})]);

        // draw the layers
        let name = vis.svg.selectAll(".area")
            .data(vis.displayData);
        name.enter().append("path")
            .attr("class", "area")
            .merge(name)
            .style("fill", d => {return vis.colorScale(d)})
            .attr("d", d => vis.area(d))

            // update tooltip text on hover
            .on("mouseover", (d,i) => {
                vis.tooltip.text(i.key)
            })
            .on("mouseout", d => vis.tooltip.text(null));

        name.exit().remove();

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis).style("stroke", "#FFFFFF");
        vis.svg.select(".y-axis").call(vis.yAxis).style("stroke", "#FFFFFF");
    }
}


/*
 * Timeline - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  data             -- the data the timeline should use
 */

class Timeline {

    // constructor method to initialize Timeline object
    constructor(parentElement, data){
        this._parentElement = parentElement;
        this._data = data;

        // No data wrangling, no update sequence
        this._displayData = data;

        this.initVis();
    }

    // create initVis method for Timeline class
    initVis() {

        // store keyword this which refers to the object it belongs to in variable vis
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 20, left: 350};
        vis.width = 1000;
        vis.height = 100;
        // vis.width = document.getElementById(vis._parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis._parentElement).getBoundingClientRect().height  - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis._parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis._displayData, function(d,i) { return d.Year; }));

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis._displayData, function(d) { return d.Total; })]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        // SVG area path generator
        vis.area = d3.area()
            .x(function(d) { return vis.x(d.Year); })
            .y0(vis.height)
            .y1(function(d) { return vis.y(d.Total); });

        // Draw area by using the path generator
        vis.svg.append("path")
            .datum(vis._displayData)
            .attr("fill", "#FFFFFF")
            .attr("d", vis.area);

        // scale component
        vis.xScale = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis._displayData, function(d) { return d.Year; }));

        // Initialize brush component
        let brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush", brushed);

        // TO-DO: Append brush component here
        vis.svg.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);

        // Append x-axis
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis)
            .style("stroke", "#FFFFFF");
    }
}