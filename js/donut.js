
// Variables for the visualization instances
let valence, energy, dance, data;


d3.csv("data/data.csv", d => {

    // convert strings to numbers
    d.year = +d.year;
    d.bpm = +d.bpm;
    d.nrgy = +d.nrgy;
    d.dnce = +d.dnce;
    d.pop = +d.pop;
    d.val = +d.val;
    return d

}).then(d => {

    data = preparedData(d)

    // instantiate visualization objects
    energy = new ENERGY("energy", data);
    valence = new BPM("bpm", data);
    dance = new DANCE("dance", data);
});

// grab the selected year from user
let selectedYear = document.getElementById('year').value;

function categoryChange() {

    selectedYear = document.getElementById('year').value;
    // append image of artist
    document.getElementById('image').innerHTML = '<img style = "width: 100%; height: 20vh; object-fit: cover; object-position: right top;" src= "img/' + selectedYear + ".jpg" + '" />'
    // append audio of song
    document.getElementById('audio').innerHTML = '<audio style = "width: 100%"  controls src= "audio/' + selectedYear + ".mp3" + '" />'

    // append song title and artist name
    for (let j = 0; j < 10; j++) {
        if (data[j][0].year == selectedYear) {
            document.getElementById('artistName').innerText = data[j][0].artist;
            document.getElementById('song').innerText = data[j][0].title;
        }
    }

    // wrangle data again once selection is changed
    energy.wrangleData();
    valence.wrangleData();
    dance.wrangleData();
}


function preparedData(data){

    let d = [];

    // get most popular song from dataset for each year
    for (let i = 2010; i < 2020; i++) {
        d.push(data.filter(function (currentElement) {
            if (currentElement.year === i) {
                return currentElement;
            }
        }).slice(0, 1));
    }
    return d;
}

/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */

/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class DANCE {

    // constructor method to initialize Timeline object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.circleColors = ['#2a540d', 'rgb(73,73,73)'];

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;


        // margin conventions
        vis.margin = {top: 0, right: 0, bottom: 75, left: 15};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", (vis.height + vis.margin.top + vis.margin.bottom))
            .append("g");

        // start by creating a pieChart group
        vis.pieChartgroup = vis.svg
            .append('g')
            .attr('class', 'pieChart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

        // define inner and outer radius
        vis.innerRadius = 105;
        vis.outerRadius = vis.width / 2;

        // define pie layout
        vis.pie = d3.pie()
            .sort(null);

        // set up path generator
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip');

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this;

        vis.displayData = [];

        let danceability;

        // grab danceability value for that year's top song
        for (let j = 0; j < 10; j++) {
            if (vis.data[j][0].year == selectedYear) {
                danceability = vis.data[j][0].dnce;
            }
        }

        vis.displayData.push({
            value: danceability,
            color: vis.circleColors[0]
        });

        danceability = 100-danceability;
        vis.displayData.push({
            value: danceability,
            color: vis.circleColors[1]
        });

        vis.updateVis();
    }


    // updateVis method
    updateVis() {
        let vis = this;

        vis.dataMap = [];
        vis.displayData.forEach(function(d, i){return vis.dataMap[i] = d.value});

        // bind data
        vis.arcs = vis.pieChartgroup.selectAll('.arc')
            .data(vis.pie(vis.dataMap))

        // append paths
        vis.arcs.enter()
            .append('path')
            .style('fill', function(d, i) { return vis.circleColors[i];})
            .attr('d', vis.arc)
            .merge(vis.arcs)
            .on('mouseover', function(event, d){
                if (d.value == vis.displayData[0].value) {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .attr('stroke', 'black')

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid rgb(255,255,255); border-radius: 5px; background: rgba(0,128,0,0.18); padding: 20px">
                             <h4> Danceability: ${d.value}</h4>    
                         </div>`);
                }
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                var i = d3.interpolate(d.startAngle+0.5, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return vis.arc(d);
                }
            });
    }
}

class ENERGY {

    // constructor method to initialize Timeline object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.circleColors = ['#83b761', 'rgb(73,73,73)'];

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = {top: 0, right: 0, bottom: 65, left: 45};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", (vis.height + vis.margin.top + vis.margin.bottom))
            .append("g");

        // start by creating a pieChart group
        vis.pieChartgroup = vis.svg
            .append('g')
            .attr('class', 'pieChart')
            .attr("transform", "translate(" + vis.width / 1.75 + "," + vis.height / 2 + ")");

        // define inner and outer radius
        vis.innerRadius = 100;
        vis.outerRadius = vis.width/2;

        // define pie layout
        vis.pie = d3.pie()
            .sort(null);

        // set up path generator
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip');

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this;

        vis.displayData = [];

        let energy;

        // grab energy value for that year's top song
        for (let j = 0; j < 10; j++) {
            if (vis.data[j][0].year == selectedYear) {
                energy = vis.data[j][0].nrgy;
            }
        }

        vis.displayData.push({
            value: energy,
            color: vis.circleColors[0]
        });

        // subtract energy value by 100 for the second value of pie chart
        energy = 100-energy;

        vis.displayData.push({
            value: energy,
            color: vis.circleColors[1]
        });

        vis.updateVis();
    }


    // updateVis method
    updateVis() {
        let vis = this;

        vis.dataMap = [];
        vis.displayData.forEach(function(d, i){return vis.dataMap[i] = d.value});

        // bind data
        vis.arcs = vis.pieChartgroup.selectAll('.arc')
            .data(vis.pie(vis.dataMap))

        // append paths
        vis.arcs.enter()
            .append('path')
            .style('fill', function(d, i) { return vis.circleColors[i];})
            .attr('d', vis.arc)
            .merge(vis.arcs)
            .on('mouseover', function(event, d){
                if (d.value == vis.displayData[0].value) {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .attr('stroke', 'black')

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid rgb(255,255,255); border-radius: 5px; background: rgba(0,128,0,0.18); padding: 20px">
                             <h4> Energy: ${d.value}</h4>    
                         </div>`);
                }
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                var i = d3.interpolate(d.startAngle+0.5, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return vis.arc(d);
                }
            });
    }

}


/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class BPM {

    // constructor method to initialize Timeline object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.circleColors = ['#cae0be', 'rgb(73,73,73)'];

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = {top: 0, right: 0, bottom: 65, left: 45};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", (vis.height + vis.margin.top + vis.margin.bottom))
            .append("g");

        // start by creating a pieChart group
        vis.pieChartgroup = vis.svg
            .append('g')
            .attr('class', 'pieChart')
            .attr("transform", "translate(" + vis.width / 1.5 + "," + vis.height / 2 + ")");

        // define inner and outer radius
        vis.innerRadius = 100;
        vis.outerRadius = vis.width/2;

        // define pie layout
        vis.pie = d3.pie()
            .sort(null);

        // set up your path generator
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip');

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this;

        vis.displayData = [];

        let val;

        // grab bpm value for that year's top song
        for (let j = 0; j < 10; j++) {
            if (vis.data[j][0].year == selectedYear) {
                val = vis.data[j][0].val;
            }
        }

        vis.displayData.push({
            value: val,
            color: vis.circleColors[0]
        });

        val = 100-val;
        vis.displayData.push({
            value: val,
            color: vis.circleColors[1]
        });

        vis.updateVis();
    }


    // updateVis method
    updateVis() {
        let vis = this;

        vis.dataMap = [];
        vis.displayData.forEach(function(d, i){return vis.dataMap[i] = d.value});

        // bind data
        vis.arcs = vis.pieChartgroup.selectAll('.arc')
            .data(vis.pie(vis.dataMap))

        // append paths
        vis.arcs.enter()
            .append('path')
            .style('fill', function(d, i) { return vis.circleColors[i];})
            .attr('d', vis.arc)
            .merge(vis.arcs)
            .on('mouseover', function(event, d){
                if (d.value == vis.displayData[0].value) {
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .attr('stroke', 'black')

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid rgb(255,255,255); border-radius: 5px; background: rgba(0,128,0,0.18); padding: 20px">
                             <h4> Valence: ${d.value}</h4>
                         </div>`);
                }
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                var i = d3.interpolate(d.startAngle+0.5, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return vis.arc(d);
                }
            });
    }
}