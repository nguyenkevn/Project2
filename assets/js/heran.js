// var svg = d3.select('svg');
// var svgContainer = d3.select('body');
var svgWidth = 960;
var svgHeight = 760;
var margin = 80;
var width = 1000 - 2 * margin;
var height = 600 - 2 * margin;
var chartMargin = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
};
// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
// Select body, append SVG area to it, and set the dimensions
var Job_Type = "";
changejobType("");
function changejobType(jobtype) {
  d3.select("#vis-container").html("");
  var svg = d3
    .select("#vis-container")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth)
    .style("fill", "#258F91");
  // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
  // to the margins set in the "chartMargin" object.
  var chartGroup = svg
    .append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
  d3.csv("../../indeed_job_dataset.csv")
    .then(function (raw_importedData) {
      console.log(importedData);
      var chart = svg
        .append("g")
        .attr("transform", `translate(${margin}, ${margin})`);
      var importedData = raw_importedData;
      if (jobtype !== "") {
        importedData = raw_importedData.filter(
          (data) => data.Job_Type === jobtype
        );
      }
      var length = Object.values(importedData).length;
      console.log(length);
      var nested_data = d3
        .nest()
        .key(function (d) {
          return d.Queried_Salary;
        })
        .rollup(function (ids) {
          return ids.length;
        })
        .entries(importedData);
      console.log(nested_data);
      // var tsv;
      // d3.tsv("importedData.tsv", function (d) {
      //     return d;
      // }, function (error, datafile) {
      //     if (error) throw error;
      //     // put the original data in tsv
      //     tsv = importedData;
      //     // filter the data based on the inital value
      //     var jobdata = tsv.filter(function (d) {
      //         var sq = d3.select("#filter").property("value");
      //         return d.key === sq;
      //     });
      // Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
      var xScale = d3
        .scaleBand()
        .domain(nested_data.map((data) => data.key))
        .range([0, width])
        .padding(0.1);
      var yScale = d3
        .scaleLinear()
        .domain([0, d3.max(nested_data.map((data) => data.value))])
        // .domain([0, d3.max(data => data.value)])
        .range([height, 0]);
      //  ***********************************
      // const xScale = d3.scaleBand()
      //     .range([0, width])
      //     .domain(sample.map((s) => s.language))
      //     .padding(0.4)
      // const yScale = d3.scaleLinear()
      //     .range([height, 0])
      //     .domain([0, 100]);
      // *************************************
      // vertical grid lines
      // const makeXLines = () => d3.axisBottom()
      //   .scale(xScale)
      // function update(byJob) {
      var jobType = importedData.filter((j) => j.Job_Type);
      console.log(jobType);
      var makeYLines = () => d3.axisLeft().scale(yScale);
      chart
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
      chart.append("g").call(d3.axisLeft(yScale));
      // vertical grid lines
      // chart.append('g')
      //   .attr('class', 'grid')
      //   .attr('transform', `translate(0, ${height})`)
      //   .call(makeXLines()
      //     .tickSize(-height, 0, 0)
      //     .tickFormat('')
      //   )
      chart
        .append("g")
        .attr("class", "grid")
        .call(makeYLines().tickSize(-width, 0, 0).tickFormat(""));
      var barGroups = chart.selectAll().data(nested_data).enter().append("g");
      barGroups
        .append("rect")
        .attr("class", "bar")
        .attr("x", (g) => xScale(g.key))
        .attr("y", (g) => yScale(g.value))
        .attr("height", (g) => height - yScale(g.value))
        .attr("width", xScale.bandwidth())
        .on("mouseenter", function (actual, i) {
          d3.selectAll(".value").attr("opacity", 0);
          d3.select(this)
            .transition()
            .duration(300)
            .attr("opacity", 0.6)
            .attr("x", (a) => xScale(a.key) - 5)
            .attr("width", xScale.bandwidth() + 10);
          var y = yScale(actual.value);
          chart
            .append("line")
            .attr("id", "limit")
            .attr("x1", 0)
            .attr("y1", y)
            .attr("x2", width)
            .attr("y2", y);
          barGroups
            .append("text")
            .attr("class", "divergence")
            .attr("x", (a) => xScale(a.key) + xScale.bandwidth() / 2)
            .attr("y", (a) => yScale(a.value) + 20)
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .html(function (d) {
              // return (`${Math.round(d.value / 5716 * 100)} % job listings`)
              return `${d.value} listings`;
            });
        })
        .on("mouseleave", function () {
          d3.selectAll(".value").attr("opacity", 1);
          d3.select(this)
            .transition()
            .duration(300)
            .attr("opacity", 1)
            .attr("x", (a) => xScale(a.key))
            .attr("width", xScale.bandwidth());
          chart.selectAll("#limit").remove();
          chart.selectAll(".divergence").remove();
        });
      barGroups
        .append("text")
        .attr("class", "value")
        .attr("x", (a) => xScale(a.key) + xScale.bandwidth() / 2)
        .attr("y", (a) => yScale(a.value) + 30)
        .attr("text-anchor", "middle")
        .text((a) => `${a.value}%`);
      svg
        .append("text")
        .attr("class", "label")
        .attr("x", -(height / 2) - margin)
        .attr("y", margin / 2.4)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Number of Job Listings");
      svg
        .append("text")
        .attr("class", "label")
        .attr("x", width / 2 + margin)
        .attr("y", height + margin * 1.7)
        .attr("text-anchor", "middle")
        .text("Salary Brackets");
      svg
        .append("text")
        .attr("class", "title")
        .attr("x", width / 2 + margin)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Salary by Job Type ");
    })
    .catch(function (error) {
      console.log(error);
    });
}

// ``````````````````````````PIE``````````````````````````
var data = [{
  values: [13, 11.3, 8.3, 5.6, 3.9, 57.9],
  labels: ['Consulting and Business Services', 'Internet and Softrware', 'Banks and Financial Services', 'Health Care',
        'Insurance', 'Other Industries'],
  type: 'pie',
  textinfo: "label+percent",
  textposition: "outside",
  automargin: true
}];
var layout = {
  height: 400,
  width: 700,
  margin: {"t": 0, "b": 0, "l": 0, "r": 0},
  showlegend: false,
  paper_bgcolor: "#00000000",
  plot_bgcolor: "#00000000",
  font:{color: "#FFFFFF"}
};
Plotly.newPlot('myDiv', data, layout);


// `````````````````````````Colin`````````````````````````
var dropdownMenu1 = d3.select("#Dropdown1");

var sub; 

function getData() {
    var job = dropdownMenu1.property("value");
    
    var filteredData = sub.filter(item => item.Job_Type === job);
    
    var data = {
        y: filteredData.map(item => parseInt(item.Count)),
        x: filteredData.map(item => item.Skill),
        type: "bar"
    }
    console.log(data)

    var layout = {
        title: "'Bar' Chart",
        height: 600,
        width: 600
    };

    Plotly.newPlot("plot", [data], layout);
}

dropdownMenu1.on("change", getData)


d3.json("./Job_Type").then(function (importedData) {
    sub = importedData
    getData()
    console.log(importedData)




}).catch(function (error) {
    console.log(error);
});