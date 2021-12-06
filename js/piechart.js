
/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class PieChart {

    // constructor method
    constructor(parentElement, _data) {
        this.parentElement = parentElement;
        this.data = _data;
        this.circleColors = {
            "detroit hip hop" : '#149414',
            "dance pop" : '#0e6b0e',
            "pop" : '#649568',
            "canadian pop" : '#9ccc9c',
            "hip pop" : '#149414',
            "barbadian pop" : '#0e6b0e',
            "atl hip hop" : '#649568',
            "australian pop" : '#9ccc9c',
            "indie pop" : '#a0d080',
            "art pop" : '#90c070',
            "colombian pop" : '#80b060',
            "big room" : '#70a050',
            "british soul" : '#609040',
            "chicago rap" : '#508030',
            "acoustic pop" : '#407020',
            "permanent wave" : '#306010',
            "boy band" : '#203000',
            "baroque pop" : '#a0d080',
            "celtic rock" : '#90c070',
            "electro" : '#80b060',
            "complextro" : '#70a050',
            "canadian hip hop" : '#609040',
            "candy pop" : '#508030',
            "alaska indie" : '#407020',
            "folk-pop" : '#306010',
            "metropopolis" : '#203000',
            "house" : '#a0d080',
            "australian hip hop" : '#90c070',
            "electropop" : '#80b060',
            "australian dance" : '#70a050',
            "hollywood" : '#609040',
            "canadian contemporary r&b" : '#508030',
            "irish singer-songwriter" : '#407020',
            "tropical house" : '#306010',
            "belgian edm" : '#203000',
            "french indie pop" : '#80b060',
            "hip hop" : '#508030',
            "danish pop" : '#407020',
            "latin" : '#306010',
            "canadian latin" : '#203000',
            "electronic trap" : '#70a050',
            "edm" : '#609040',
            "electro house" : '#90c070',
            "downtempo" : '#a0d080',
            "brostep" : '#203000',
            "contemporary country" : '#90c070',
            "moroccan pop" : '#a0d080',
            "escape room" : '#203000',
            "alternative r&b" : '#80b060',
            "neo mellow": '#80b060'
        };

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        // vis.margin = {top: 10, right: 50, bottom: 10, left: 50};
        vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width / 1.3 - vis.margin.left - vis.margin.right;
        vis.height = vis.width;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g");
            // .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // pie chart setup
        vis.pieChartGroup = vis.svg.append('g')
            .attr('class', 'pie-chart')
            // .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2+ ")");
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 4 + ")");

        // Define a default pie layout
        vis.pie = d3.pie()
            .value(d => d.value);

        // Pie chart settings
        vis.outerRadius = vis.width / 4;
        vis.innerRadius = 0;

        // Path generator for the pie segments
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        // call next method in pipeline
        vis.wrangleData();

    }

    // wrangleData method
    wrangleData() {
        let vis = this

        vis.displayData = []

        vis.testData = {
            "detroit hip hop" : [],
            "dance pop" : [],
            "pop" : [],
            "canadian pop" : [],
            "hip pop" : [],
            "barbadian pop" : [],
            "atl hip hop" : [],
            "australian pop" : [],
            "indie pop" : [],
            "art pop" : [],
            "colombian pop" : [],
            "big room" : [],
            "british soul" : [],
            "chicago rap" : [],
            "acoustic pop" : [],
            "permanent wave" : [],
            "boy band" : [],
            "baroque pop" : [],
            "celtic rock" : [],
            "electro" : [],
            "complextro" : [],
            "canadian hip hop" : [],
            "candy pop" : [],
            "alaska indie" : [],
            "folk-pop" : [],
            "metropopolis" : [],
            "house" : [],
            "australian hip hop" : [],
            "electropop" : [],
            "australian dance" : [],
            "hollywood" : [],
            "canadian contemporary r&b" : [],
            "irish singer-songwriter" : [],
            "tropical house" : [],
            "belgian edm" : [],
            "french indie pop" : [],
            "hip hop" : [],
            "danish pop" : [],
            "latin" : [],
            "canadian latin" : [],
            "electronic trap" : [],
            "edm" : [],
            "electro house" : [],
            "downtempo" : [],
            "brostep" : [],
            "contemporary country" : [],
            "moroccan pop" : [],
            "escape room" : [],
            "alternative r&b" : [],
            "neo mellow": [],
            "other": []
        }

        vis.data.forEach(function(d) {
            vis.testData[d[ 'top genre' ]].push({d})
        })

        for (name in vis.testData) {
            let number = vis.testData[name].length;
            let popular = vis.testData[name].sort((a, b) => {
                return (b.pop) - (a.pop);
            });
            let song = popular.filter((d, i) => i == 0);
            let title, artist;
            if (song[0] === undefined) {
                title = 'N/A'
                artist = 'N/A'
            }
            else {
                title = song[0].d.title
                artist = song[0].d.artist
            }
            vis.displayData.push({
                name: name,
                value: number,
                color: vis.circleColors[name],
                song: title,
                artist: artist
            })
        }

        vis.updateVis()
    }

    // updateVis method
    updateVis() {
        let vis = this;

        // Bind data
        vis.arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData));

        // Append paths
        vis.arcs.enter()
            .append("path")
            .merge(vis.arcs)
            .attr("d", vis.arc)
            .attr("fill", function(d, index) {
                return d.data.color;
            })
            .attr('opacity', 0.4)
            .on('mouseover', function(event, d){
                highlight(d.data.name);

                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('opacity', 1)
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                       <div style="border: #013220; border-radius: 5px; padding: 20px">
                           <h3>Genre: ${d.data.name}<h3>
                           <h4> Number of Songs: ${d.value}</h4>      
                           <h4> Percentage: ${Math.round((d.value/603 + Number.EPSILON) * 10000) / 100}%</h4> 
                           <h4> #1 Popular Song: ${d.data.song}</h4>   
                           <h4> Author of the Song: ${d.data.artist}</h4>                         
                       </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr('opacity', 0.4)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }
}