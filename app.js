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

var map;
var api = new dhis2API();

$('document').ready(function(){
    map = new dhis2Map();

    map.init("mapid",[13.23521,80.3332],5);

    setBoundaryLayers();

})

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

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

               // if (coords.length == 1){
               // ouCoords.push(coords[);
                //}else
                {
                ouCoords.push(coords[0]);
                }
            }
        }debugger
        return ouCoords;
    }

}

