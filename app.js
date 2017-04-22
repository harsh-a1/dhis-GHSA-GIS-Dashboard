/**
 * Created by harsh on 15/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
//import L from 'leaflet';
import ajax from './ajax-wrapper'
import $ from 'jquery';
import dhis2API from './dhis2API/dhis2API';
import moment from 'moment';
import dhis2Map from './maps/map';
import mUtility from './maps/mapUtilities';
import {AlertPopUp} from './components/components';
import utility from './utility-functions';
import {scaleLinear} from "d3-scale";


var scale = scaleLinear()        
            .domain([0,50000000])
            .range([9,100]);
       
var map;
var api = new dhis2API();
var orgUnitUIDWiseCentroidMap = [];
var currentDiseaseDeUID = "F77LnLT0wTN";


$('document').ready(function(){
    map = new dhis2Map();
  map.init("mapid",[13.23521,80.3332],5);
    setBoundaryLayers();

    fetchDEs();

})

window.deSelected = function(elem){
    currentDiseaseDeUID = elem.selectedOptions[0].value;
    map.clearLayers();
    getData();

}
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
        }
    })


}

function getData(){

    ajax.request({
        type: "GET",
        async: true,
        contentType: "application/json",
        url: "../../analytics/dataValueSet.json?dimension=dx:"+currentDiseaseDeUID+"&dimension=ou:TC3u1PWRhUl;zvdyAu36Jdc;P9JVvU606MC;lMRqka8Trmt;LFrxRGnnkf1;SfHPptmriak;r7zN1iGqO28;ZyuwKXDoZzo;qPVfEFTn5NH;TA4KV1QBJtl;vlmI0npiZ11;jO4CZffulCu;OZ5xzjAxVgu;zBtXYjHOUED;F3Kw7QWZpFu;LRVGjeuOLyE;NIU6q1Icuv5;fWxq2GNhZ7j;mTkZvAtqxq9;kaSqJZdaGkU;J2v97q1ptLm;CCpVSFdgQtO;mQtPV0pt0mZ;K1s8W4arDFw;YJefwu9qI9H;gQqOjjSCOtp;by0k22r4gm0;Okrj7tQxHbm;fhcwS3FrcwT;AU7FUrZsxwh;x8hX70TpB7w;OhL1G1iPQYC;v0PM7jZvVpi;mEIiPlZVqDB;OKqYGzYdbOx;ygWcNC3gKkm&dimension=pe:LAST_YEAR&displayProperty=NAME"
    },function(error,response){
        if (error){

        }else{

            var deWiseData = utility.prepareMapGroupedById(response.dataValues,"dataElement");
            addDiseaseToLayer(deWiseData);
        }
    })
}

function drillDown(e){
    debugger
}
function addDiseaseToLayer(_data){
    
    var data = _data[currentDiseaseDeUID]

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
            centroid.properties.layerId = "circles";
            geoJsonPointFeatures.features.push(centroid);
            geoJsonPointFeaturesLabels.features.push(centroid);

        }
    }


    //create highlight style, with darker color and larger radius
    function highlightStyle(feature) {
        return {
            radius: getRadius(feature.properties.size)+1.5,
    	    fillColor: "#102040",
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
    }

    function getColor(y) {
        return y > 2000 ? '#6068F0' : 
            y > 1980 ? '#7660C9' : 
            y > 1960 ? '#8C58A3' : 
            y > 1940 ? '#A3507C' : 
            y > 1920 ? '#B94856' :
            '#D04030';
    }

    function getRadius(y) {

         var r = Math.sqrt(y / Math.PI)
        console.log(scale(y));
        return r;
    }

    function style(feature) {
        return {
            radius: getRadius(feature.properties.size),
            fillColor: getColor(1940),
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
            html:'<i>'+feature.properties.size+'</i>',
            iconSize :null,
            iconAnchor: [17,7.5]
        })

        return L.marker(latlng,{
            icon : labelIcon
            

        });
    }
    map.addGeoJson(geoJsonPointFeaturesLabels,pointToLayerLabel,null,null);
    map.addGeoJson(geoJsonPointFeatures,pointToLayer,null,null);

}

function setBoundaryLayers(){


    var style = { color: "black",
                  opacity: 0.75,
                  fillColor: "white",
                  fillOpacity: 0,
                  weight : 2
                  //                  dashArray: '5, 5',

                }

    addOrgUnitLayer(2,Object.assign({},style));
    style.weight =0.95;
    style.color = "black";
    style.opacity = 0.25;
    //  addOrgUnitLayer(3,Object.assign({},style));

    function addOrgUnitLayer(level,style){

        ajax.request({
            type: "GET",
            async: true,
            contentType: "application/json",
            url: "../../organisationUnits?filter=level:eq:"+level+"&fields=id,name,coordinates&paging=false"
        },function(error,response){
            if (error){

            }else{
                addOrgUnits(getCoordinatesFromOus(response.organisationUnits),style);
            }
        })
    }

    function addOrgUnits(blockCoords,style){

        // a GeoJSON multipolygon
        var mp = {
            "type": "Feature",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": blockCoords
            },
            "properties": {
                "name": "MultiPolygon",
                key : "block"
            }
        };

        var pointToLayer = function(feature, latlng) {
            feature.properties.style = style;
        };

        map.addGeoJson(mp,null,style);
    }

    function getCoordinatesFromOus(ous){

        var ouCoords = [];
        for (var key in ous){
            if (ous[key].coordinates){
                var coords = JSON.parse(ous[key].coordinates);
                //reverseCoordinates(coords[0]);

                var co = coords[getIndex(coords)];
                var centroid = mUtility.getPolygonCentroid(co);
                orgUnitUIDWiseCentroidMap[ous[key].id] = centroid;
                
                ouCoords.push(co);
            }
        }
        return ouCoords;
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

