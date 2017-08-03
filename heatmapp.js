
var _ = {}
import ajax from './ajax-wrapper'

_.d3HeatMap = function(deWiseData,deMap,ouMap){

var itemSize = 22,
      cellSize = itemSize - 1,
      margin = {top: 220, right: 20, bottom: 20, left: 150};
      
  var width = 1050 - margin.right - margin.left,
      height = 700 - margin.top - margin.bottom;

  var formatDate = d3.time.format("%Y-%m-%d");


  d3.csv('data.csv', function ( response ) {

      var data = [];
      for (var key in deWiseData){
          for (var i=0;i<deWiseData[key].length;i++){
              var newItem = {};
              newItem.orgUnit = deWiseData[key][i].orgUnit;
              newItem.dataElement = deWiseData[key][i].dataElement;
              newItem.value = deWiseData[key][i].value;
          
              data.push(newItem);
          }
          
      }

      data.sort(function(a, b){
          return parseFloat(b.value) - parseFloat(a.value);
      });

    var x_elements = d3.set(data.map(function( item ) { return deMap[item.dataElement] } )).values(),
        y_elements = d3.set(data.map(function( item ) { return ouMap[item.orgUnit].name } )).values();

   //   x_elements = d3.ascending(x_elements.value);debugger
    var xScale = d3.scale.ordinal()
        .domain(x_elements)
        .rangeBands([0, x_elements.length * itemSize]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("top");

    var yScale = d3.scale.ordinal()
        .domain(y_elements)
        .rangeBands([0, y_elements.length * itemSize]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("left");

    var colorScale = d3.scale.threshold()
        .domain([data[0].value, data[data.length-1].value])
        .range(["#2980B9", "#E67E22", "#27AE60", "#27AE60"]);

      d3.selectAll("#heatmapp svg").remove();
    var svg = d3.select('#heatmapp')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    //      .attr("viewBox", "0,0,150,420")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(data)
        .enter().append('g').append('rect')
          .on('click' , function(e){window.cellClick(e,deWiseData)})
        .attr('class', 'cell')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('y', function(d) { return yScale(ouMap[d.orgUnit].name); })
        .attr('x', function(d) { return xScale(deMap[d.dataElement]); })
        .attr('fill', function(d) { return colorScale(d.value); });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", ".5em")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });
  });


}

module.exports = _;