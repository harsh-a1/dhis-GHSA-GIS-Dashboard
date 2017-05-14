/**
 * Created by harsh on 15/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
//import L from 'leaflet';
import ajax from './ajax-wrapper'
import $ from 'jquery';
import 'jquery-ui';
import dhis2API from './dhis2API/dhis2API';
import moment from 'moment';
import dhis2Map from './maps/map';
import mUtility from './maps/mapUtilities';
import {AlertPopUp} from './components/components';
import utility from './utility-functions';
//import {scaleLinear} from "d3-scale";
import d3 from "d3";

var map,heatmap;
var api = new dhis2API();
var orgUnitUIDWiseCentroidMap = [];
var currentDiseaseDeUID = "";
var currentSelectionOUUIDs = "";
var currentSelectionOUMap = [];
var currentSelectionOUUID =""
var currentSelectionOULevel ="2"
var currentSelectionOUName ="India"
var currentOUPolygonFeatures;
var info;

$('document').ready(function(){

    $( function() {
        $( "#tabs" ).tabs();
    } );

    fetchMetadata();

    function init(){
        map = new dhis2Map();
        heatmap = new dhis2Map();

        map.init("mapid",[0,0],5);
        heatmap.init("map-heat",[0,0],5);

        map.getMap().on('dblclick',        function (e) {debugger; console.log('dblclick'); });

        addInfo();

        info.update({"level":currentSelectionOULevel,"facility" : currentSelectionOUName});

        setBoundaryLayers(map,currentSelectionOULevel,currentSelectionOUUID,null,currentSelectionOUName);
        setBoundaryLayers(heatmap,currentSelectionOULevel,currentSelectionOUUID);
        //setBoundaryLayers(heatmap,3,currentSelectionOUUID,1);
        
    }
    function addInfo(){
        info = L.control({position : "bottomleft"});

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            if (!props){return}

            this._div.innerHTML = '<h2>Location : '+props.facility+'</h2>';
        };


        info.addTo(map.getMap());

    }
    function fetchMetadata(){

        ajax.request({
            type: "GET",
            async: true,
            contentType: "application/json",
            url: "../../organisationUnits?fields=id,name&filter=level:eq:1&paging=false"
        },function(error,response){
            if (error){

            }else{
                currentSelectionOUUID = response.organisationUnits[0].id;
                fetchDEs();
                
            }
        })

        function fetchDEs(){
            ajax.request({
                type: "GET",
                async: true,
                contentType: "application/json",
                url: "../..//dataElements?fields=id,name&filter=domainType:eq:AGGREGATE&paging=false"
            },function(error,response){
                if (error){

                }else{

                    var select = document.getElementById("selectDE");
                    var options = response.dataElements;
                    for(var i = 0; i < options.length; i++) {
                        var opt = options[i];
                        var el = document.createElement("option");
                        el.textContent = opt.name;
                        el.value = opt.id;
                        select.appendChild(el);
                    }
                    
                    currentDiseaseDeUID = options[0].id;
                    init();
                }
            })


        }

    }

})


window.reset = function(){
    clearData();
    currentSelectionOUUID ="WljvC4Ev45Y"
    currentSelectionOULevel ="2";
    currentSelectionOUName = "India";

    setBoundaryLayers(map,currentSelectionOULevel,currentSelectionOUUID,null,currentSelectionOUName);
    setBoundaryLayers(heatmap,currentSelectionOULevel,currentSelectionOUUID);

}
window.deSelected = function(elem){

    currentDiseaseDeUID = elem.selectedOptions[0].value;
    clearData();
    setBoundaryLayers(map,currentSelectionOULevel,currentSelectionOUUID,null,currentSelectionOUName);
    setBoundaryLayers(heatmap,currentSelectionOULevel,currentSelectionOUUID);

}

function clearData(){
    map.clearLayers("layerId","custom");
    map.clearLayers("layerId","ou");

    heatmap.clearLayers("layerId","custom");
    heatmap.clearLayers("layerId","ou");

    currentSelectionOUUIDs = [];
    currentSelectionOUMap = [];
    
}

function drillDown(e){
    
    if (currentSelectionOULevel == 5){
        showRandomPoints(e.target.feature.properties.ouUID,e.target.feature.properties.size);
        return;        
    }

    clearData();
    currentSelectionOUUIDs = [];

    currentSelectionOULevel =e.target.feature.properties.level+1;
    currentSelectionOUUID =e.target.feature.properties.ouUID;
    currentSelectionOUName =e.target.feature.properties.name;

    setBoundaryLayers(map,currentSelectionOULevel,currentSelectionOUUID,null,currentSelectionOUName); 
    setBoundaryLayers(heatmap,currentSelectionOULevel,currentSelectionOUUID);   
    
}

function showRandomPoints(ouUID,value){

    var polygon;
    for (var i=0;i<currentOUPolygonFeatures.length;i++){
        var ou = currentOUPolygonFeatures[i].properties.ouUID;
        if (ou == ouUID){
            polygon = currentOUPolygonFeatures[i];
            break;
        }
    }

    var randomPoints = mUtility.getRandomPoints(polygon,value);
    
    for (var i=0;i<randomPoints.length;i++){
        randomPoints[i].properties.layerId = "custom";
    }

    var pointToLayer = function(feature, latlng) {
        
        var icon = getCustomDivIcon("yellow");
        return L.marker(latlng, {
            // icon: icon
        });
    }

    function onEachDot(feature, layer) {
        
        layer.bindPopup('<label>Individual Case Reported from Facility-'+Math.round(Math.random()*5000)+'</label>');

    }

    map.addGeoJson(randomPoints,pointToLayer,null,onEachDot);
}


function getCustomDivIcon(background){

    return L.divIcon({
        className : 'alert-icon '+'',
        html:'<i class="alert-icon"  style="background: '+background+'"></i>'
    });
}

// Gets fired if ou are successfully gotten from API
function ouFetched(ous){
    
    var period = $('#period').val();
    getData(currentSelectionOUUIDs,period);
}


function getData(currentSelectionOUUIDs,period){

    ajax.request({
        type: "GET",
        async: true,
        contentType: "application/json",
        url: "../../analytics/dataValueSet.json?dimension=dx:"+currentDiseaseDeUID+"&dimension=ou:"+currentSelectionOUUIDs+"&dimension=pe:"+period+"&displayProperty=NAME"
    },function(error,response){
        if (error){

        }else{

            var deWiseData = utility.prepareMapGroupedById(response.dataValues,"dataElement");
            addDiseaseToLayer(deWiseData);
            addHeatMap(heatmap,deWiseData);
        }
    })
}

function addHeatMap(hmap,_data){
    var data = _data[currentDiseaseDeUID]

    var maxmin = utility.getMaxMin(data,"value");

    var heatmapDataFormat = [];

    for (var i=0;i<data.length;i++){
        
        var centroid = orgUnitUIDWiseCentroidMap[data[i].orgUnit];
        heatmapDataFormat.push([centroid.geometry.coordinates[1],
                                centroid.geometry.coordinates[0],
                                data[i].value]);
    }
    var heat = L.heatLayer(heatmapDataFormat, {radius: 25}).addTo(hmap.getMap());
    heat.feature = {
        properties : {layerId : "custom"}
    }

    $('#heatmaplabel').val("asdad");
}
function addDiseaseToLayer(_data){
    
    var data = _data[currentDiseaseDeUID]

    var maxmin = utility.getMaxMin(data,"value");

    var geoJsonPointFeatures = {
        type:"FeatureCollection",
        features : []
    };


    var geoJsonPointFeaturesLabels = {
        type:"FeatureCollection",
        features : []
    };

    for (var i=0;i<data.length;i++){
        var centroid = orgUnitUIDWiseCentroidMap[data[i].orgUnit];
        if (centroid){
            centroid.properties.size = data[i].value;
            centroid.properties.layerId = "custom";
            centroid.properties.maxmin = maxmin;
            centroid.properties.ouUID = data[i].orgUnit;
            centroid.properties.level = currentSelectionOUMap[centroid.properties.ouUID].level;

            
            geoJsonPointFeatures.features.push(Object.assign({},centroid));
            geoJsonPointFeaturesLabels.features.push(Object.assign({},centroid));

        }
    }


    //create highlight style, with darker color and larger radius
    function highlightStyle(feature) {
        return {
            radius: getRadius(feature.properties.size,feature.properties.maxmin)+1.5,
            fillColor: "#ffafca",
            // 	    fillColor: "#ddacca",
    	    color: "#116",
            weight: 1,
	    opacity: 1,
	    fillOpacity: 0.9
        };
    }

    //attach styles and popups to the marker layer
    function highlightDot(e) {
        var layer = e.target;
        var dotStyleHighlight = highlightStyle(layer.feature);
        layer.setStyle(dotStyleHighlight);
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    }
    function resetDotHighlight(e) {
        var layer = e.target;
        var dotStyleDefault = style(layer.feature);
        layer.setStyle(dotStyleDefault);
    }

    function onEachDot(feature, layer) {
        layer.on({
            mouseover: highlightDot,
            mouseout: resetDotHighlight,
            click : drillDown
        });
        // layer.bindPopup('<table style="width:150px"><tbody><tr><td><b>Name:</b></td><td>' + feature.properties.popup + '</td></tr><tr><td><b>Year:</b></td><td>' + feature.properties.year + '</td></tr><tr><td><b>Size:</b></td><td>' + feature.properties.size + '</td></tr></tbody></table>');

    }


    function onEachLabel(feature, layer) {
        layer.on({
            mouseover: highlightLabel,
            mouseout: resetLabelHighlight,
            click : drillDown
        });   


        //attach styles and popups to the marker layer
        function highlightLabel(e) {
            var layer = e.target;
            layer = map.getLayer("ouUID",layer.feature.properties.ouUID)
            var dotStyleHighlight = highlightStyle(layer.feature);
            layer.setStyle(dotStyleHighlight);
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }
        function resetLabelHighlight(e) {
            var layer = e.target;
            layer = map.getLayer("ouUID",layer.feature.properties.ouUID)
            var dotStyleDefault = style(layer.feature);
            layer.setStyle(dotStyleDefault);
        }
    }

    function getColor(y) {
        return y > 2000 ? '#6068F0' : 
            y > 1980 ? '#7660C9' : 
            y > 1960 ? '#8C58A3' : 
            y > 1940 ? '#A3507C' : 
            y > 1920 ? '#B94856' :
            '#D04030';
    }

    function getRadius(y,maxmin) {

        var scale = scaleLinear()        
            .domain([maxmin.min,maxmin.max])
            .range([8,30]);

        var r = Math.sqrt(y / Math.PI)
        //console.log(scale(y));
        return scale(y);
    }

    function style(feature) {
        return {
            radius: getRadius(feature.properties.size,feature.properties.maxmin),
            fillColor:"#f4b5ef",
            //   fillColor:"#AFEEEEm",
            color: "#000",
            weight: 1,
            opacity: 0,
            fillOpacity: 0.8
        };
    }
    var pointToLayer = function(feature, latlng) {
        
        var spotIcon =L.divIcon({
            className:'alert-icon',
            html:'<i class="alert-icon"></i>'
        })

        return L.circleMarker(latlng, style(feature));
    }
    
    var pointToLayerLabel = function(feature, latlng) {
        
        var labelIcon =L.divIcon({
            className:'label',
            html:'<i className="label">'+feature.properties.size+'</i>',
            iconSize :null,
            iconAnchor: [14,0]
        })

        return L.marker(latlng,{
            icon : labelIcon
            

        });
    }
    map.addGeoJson(geoJsonPointFeaturesLabels,pointToLayerLabel,null,onEachLabel);
    var spotLayer = map.addGeoJson(geoJsonPointFeatures,pointToLayer,null,onEachDot);
    //map.getMap().fitBounds(spotLayer.getBounds());

}

function zoomToFeature(e) {
    map.getMap().fitBounds(e.target.getBounds());
}

function setBoundaryLayers(map,level,parent,parentLevel,facility){

    if (map!=heatmap)
    info.update({"level":level,"facility" : facility});

    var style = { color: "black",
                  opacity: 0.75,
                  fillColor: "white",
                  fillOpacity: 0,
                  weight : 1.5
                  //                  dashArray: '5, 5',

                }

    addOrgUnitLayer(level,Object.assign({},style));
    style.weight =0.95;
    style.color = "black";
    style.opacity = 0.15;
    //  addOrgUnitLayer(3,Object.assign({},style));

    function addOrgUnitLayer(level,style){
        var parentStr = "parent";
        
        if (parentLevel){  
            for (var i=0;i<parentLevel;i++){
                parentStr+=".parent";
            }
        }
        var url =  "../../organisationUnits?filter=level:eq:"+level+"&fields=id,level,name,coordinates&paging=false&filter="+parentStr+".id:eq:"+parent;
        
        ajax.request({
            type: "GET",
            async: true,
            contentType: "application/json",
            url: url
        },function(error,response){
            if (error){

            }else{
                addOrgUnits(getFeatureSetFromOus(response.organisationUnits),style);
            }
        })
    }

    function addOrgUnits(geoJson,style){

        
        //create highlight style, with darker color and larger radius
        function highlightStyle(feature) {
            return {
                //  radius: getRadius(feature.properties.size)+1.5,
    	        fillColor: "#fcffce",
    	        color: "#116",
                weight: 1,
	        opacity: 1,
	        fillOpacity: 0.5
            };
        }

        //attach styles and popups to the marker layer
        function highlightOU(e) {
            var layer = e.target;
            var dotStyleHighlight = highlightStyle(layer.feature);
            layer.setStyle(dotStyleHighlight);
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }
        function resetOUHighlight(e) {
            var layer = e.target;
            var dotStyleDefault = style;
            layer.setStyle(dotStyleDefault);
        }

        function onEachOU(feature, layer) {
            layer.on({
                mouseover: highlightOU,
                mouseout: resetOUHighlight,
                //  click : zoomToFeature
            });

        }
        var pointToLayer = function(feature, latlng) {
            feature.properties.style = style;
        };

        //   map.addGeoJson(geoJson,null,style,onEachOU)
        map.getMap().fitBounds( map.addGeoJson(geoJson.geoJsonPolygonFeatures,null,style,onEachOU).getBounds());

        if (map == heatmap){
            addOULabels(geoJson.geoJsonLabelFeatures)
        }

        currentOUPolygonFeatures = geoJson.geoJsonPolygonFeatures;

        ouFetched();        
    }

    function addOULabels(geoJson){

        var pointToLayerLabel = function(feature, latlng) {
            var name =null;
            
            if (currentSelectionOUMap[feature.properties.ouUID]){
                name = currentSelectionOUMap[feature.properties.ouUID].name
            }

            if (!name){debugger}
            var labelIcon =L.divIcon({
                className:'ouLabel',
                html:'<i className="ouLabel">'+name+'</i>',
                iconSize :null,
                iconAnchor: [15,8]
            })

            return L.marker(latlng,{
                icon : labelIcon          
            });
        }

        map.addGeoJson(geoJson,pointToLayerLabel,null,null);

    }
    function getFeatureSetFromOus(ous){

        // a GeoJSON multipolygon
        var geoJsonPolygonFeatures = [];
        var geoJsonLabelFeatures = [];

        var ouCoords = [];
        for (var key in ous){
            if (ous[key].coordinates){
                var coords = JSON.parse(ous[key].coordinates);
                //reverseCoordinates(coords[0]);

                var co;
                if (ous[0].level == 2){
                    co = coords[getIndex(coords)];
                }else{
                    if (coords.length ==1){
                        co = coords;
                    }else{
                        co = coords[getIndex(coords)];                     
                    }
                    // co.push(coords);
                }
                var centroid = mUtility.getPolygonCentroid(co);
                centroid.properties.ouUID =ous[key].id;
                centroid.properties.name =ous[key].name;
                centroid.properties.layerId ="ou";

                orgUnitUIDWiseCentroidMap[ous[key].id] = centroid;
                currentSelectionOUMap[ous[key].id] = ous[key];
                currentSelectionOUUIDs = currentSelectionOUUIDs + ous[key].id + ";"

                var poly = {
                    "type": "Feature",
                    "properties": 
                    {
                        "ouUID":ous[key].id,
                        "level" : ous[key].level,
                        "name" : ous[key].name,
                        layerId : "ou"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": co
                    }
                }

                geoJsonPolygonFeatures.push(poly);
                geoJsonLabelFeatures.push(Object.assign({},centroid));

                // ouCoords.push(co);
            }
        }
        return {geoJsonPolygonFeatures:geoJsonPolygonFeatures,
                geoJsonLabelFeatures:geoJsonLabelFeatures};
    }

    function getIndex(array){

        var arr = array;
        var max = 0;
        var index=0;
        for (var i=0;i<arr.length;i++){
            if (arr[i][0].length > max){max = arr[i][0].length;index=i}
        }

        return index;
    }

}

function getRadius(y,maxmin) {

    var scale = scaleLinear()        
        .domain([maxmin.min,maxmin.max])
        .range([8,30]);

    var r = Math.sqrt(y / Math.PI)
    //console.log(scale(y));
    return scale(y);
}


function addLegend(map,label){
    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend');
        var height = 15,width=15;
        // var height1 = 40,width1=40;
        var html = '<label>'+label+'</label>'
        div.innerHTML = html;
	return div;
    };

    legend.addTo(map);

}

d3HeatMap();

function d3HeatMap(){

var itemSize = 22,
      cellSize = itemSize - 1,
      margin = {top: 120, right: 20, bottom: 20, left: 110};
      
  var width = 750 - margin.right - margin.left,
      height = 300 - margin.top - margin.bottom;

  var formatDate = d3.time.format("%Y-%m-%d");

  d3.csv('data.csv', function ( response ) {

    var data = response.map(function( item ) {
        var newItem = {};
        newItem.country = item.x;
        newItem.product = item.y;
        newItem.value = item.value;

        return newItem;
    })

    var x_elements = d3.set(data.map(function( item ) { return item.product; } )).values(),
        y_elements = d3.set(data.map(function( item ) { return item.country; } )).values();

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
        .domain([0.85, 1])
        .range(["#2980B9", "#E67E22", "#27AE60", "#27AE60"]);

    var svg = d3.select('.heatmap')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(data)
        .enter().append('g').append('rect')
        .attr('class', 'cell')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('y', function(d) { return yScale(d.country); })
        .attr('x', function(d) { return xScale(d.product); })
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