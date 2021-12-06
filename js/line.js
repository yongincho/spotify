var parseTime = d3.timeParse("%Y");

d3.csv("/data/data.csv").then(data => {
    data.forEach(function(d){
        d.acous = +d.acous;
        d.bpm = +d.bpm;
        d.dB = +d.dB;
        d.dnce = +d.dnce;
        d.dur = +d.dur;
        d.live = +d.live;
        d.nrgy = +d.nrgy;
        d.pop = +d.pop;
        d.spch = +d.spch;
        d.val = +d.val;
        d.year = +d.year;
        d.top_genre = d["top genre"];
    })
    let vis = this;
    vis.dataset = data;
    wrangleData();
});

function wrangleData(){

    let vis = this;
    vis.genres = [];
    // get genre categories to be ranked
    vis.dataset.map(song => {
        if(!vis.genres.includes(song.top_genre)){
            vis.genres.push(song.top_genre);
        }
    })

    // creates data structure for count of songs per genres for each year
    vis.genreCount = []
    d3.range(2010, 2020).forEach(function(current_year){
        vis.genre_info = {year: current_year};
        vis.genres.forEach(function(genre){
            vis.genre_info[genre] = 0;
        })

        vis.genreCount.push(genre_info);
    })

    vis.dataset.forEach(function(song){
        current_year = vis.genreCount.find(element => element.year == song.year);
        current_year[song.top_genre] += 1;
    })

    vis.lineData = [];

    vis.genres.forEach(function(current_genre){
        songCount = {}
        songCount["genre"] = current_genre;
        songCount["count"] = [];

        d3.range(2010, 2020).map(function(year){
            value = vis.genreCount.find(element => element.year == year)[current_genre];
            songCount["count"].push([year, value]);
        })

        vis.lineData.push(songCount);
    })

    vis.fixedGenreNames = ['Neo Mellow', 'Detroit Hip Hop', 'Dance Pop', 'Pop', 'Canadian Pop', 'Hip Pop', 'Barbadian Pop', 'Atl Hip Hop', 'Australian Pop',
        'Indie Pop', 'Art Pop', 'Colombian Pop', 'Big Room', 'British Soul', 'Chicago Rap', 'Acoustic Pop', 'Permanent Wave', 'Boy Band', 'Baroque Pop',
        'Celtic Rock', 'Electro', 'Complextro', 'Canadian Hip Hop', 'Candy Pop', 'Alaska Indie', 'Folk-Pop', 'Metropopolis', 'House', 'Australian Hip Hop',
        'Electropop', 'Australian Dance', 'Hollywood', 'Canadian Contemporary R&B', 'Irish Singer-Songwriter', 'Tropical House', 'Belgian EDM',
        'French Indie Pop', 'Hip Hop', 'Danish Pop', 'Latin', 'Canadian Latin', 'Electronic Trap', 'EDM', 'Electro House', 'Downtempo', 'Brostep',
        'Contemporary Country', 'Moroccan Pop', 'Escape Room', 'Alternative R&B']

    initVis();
}


function initVis(){
    let vis = this;
    vis.parentElement = "line_graph";
    vis.margin = {top: 50, right: 20, bottom: 70, left: 100};
    vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
    vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height -vis.margin.top - vis.margin.bottom;


    vis.svg = d3.select("#line_graph").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.xScale = d3.scaleTime()
        .domain([parseTime(2010),parseTime(2019)])
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .domain([0, 52]) // input
        .range([vis.height, 0]); // output

    vis.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(vis.xScale))
        .style("stroke", "#607e60");

    vis.svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(vis.yScale))
        .style("stroke", "#607e60");

    vis.svg.append('g')
        .attr('class', 'x-label')
        .append('text')
        .text("Years")
        .attr('transform', `translate(${vis.width / 2}, ${vis.height + 50})`)
        .attr('text-anchor', 'middle')
        .style("fill", "white");

    vis.svg.append('g')
        .attr('class', 'y-label')
        .append('text')
        .text("Number of Songs")
        .attr('transform', `translate(-50, ${vis.height/2}) rotate(-90)`)
        .attr('text-anchor', 'middle')
        .style("fill", "white");

    updateVis();
}

function highlight(genre){
    let vis = this;
    vis.selectedGenre = genre;
    updateVis();
}



function updateVis(){
    let vis = this;

    vis.line = d3.line()
        .x(function(d){return vis.xScale(parseTime(d[0]));}) // set the x values for the line generator
        .y(function(d){return vis.yScale(d[1]);}) // set the y values for the line generator
        .curve(d3.curveBasis);

    for(let i = 0; i < 50; i++){
        vis.svg.append("path")
            .datum(vis.lineData[i]["count"]) // 10. Binds data to the line
            .attr("class", "line") // Assign a class for styling
            .attr("d", vis.line)
            .attr("fill", "none")
            .attr("stroke", function(genre){
                if(vis.lineData[i]["genre"] === vis.selectedGenre){
                    return "#00d700";
                } else {
                    return "white";
                }
            })
            .attr("stroke-width", function(genre){
                if(vis.lineData[i]["genre"] === vis.selectedGenre){
                    return "2px";
                } else {
                    return "1px";
                }
            })
            .on("mouseover", function(event, d){
                vis.tooltip
                    .style("opacity", 0.85)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
            <div style = "color: black;">
              <h4>${vis.fixedGenreNames[i]}<h4></div>`)})
            .on("mouseout", function(){
                vis.tooltip.transition().duration(500)
                    .style("opacity", 0);
            });
    }

    // Redrawing just the highlighted line
    for(let i = 0; i < 50; i++){
        vis.svg.append("path")
            .datum(vis.lineData[i]["count"]) // 10. Binds data to the line
            .attr("class", "line") // Assign a class for styling
            .attr("d", vis.line)
            .attr("fill", "none")
            .attr("stroke", function(genre){
                if(vis.lineData[i]["genre"] === vis.selectedGenre){
                    return "#00d700";
                } else {
                    return "white";
                }
            })
            .attr("stroke-width", function(genre){
                if(vis.lineData[i]["genre"] === vis.selectedGenre){
                    return "2px";
                } else {
                    return "1px";
                }
            })
            .on("mouseover", function(event, d){
                vis.tooltip
                    .style("opacity", 0.85)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
            <div style = "color: black;">
              <h4>${vis.fixedGenreNames[i]}<h4></div>`)})
            .on("mouseout", function(){
                vis.tooltip.transition().duration(700)
                    .style("opacity", 0);
            });
    }

    vis.tooltip = d3.select("body").append('div')
        .attr('class', "tooltip")
        .attr('id', 'visTooltip');


}
