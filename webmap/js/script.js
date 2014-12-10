/* Author:
    Anthony Preston; VESTRA Resources, Inc.; 2012
*/

dojo.require("esri.map");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("dijit.dijit"); // optimize: load dijit layer
dojo.require("esri.tasks.query");
dojo.require("dijit.form.CheckBox");
dojo.require("esri.toolbars.navigation");
dojo.require("esri.dijit.Print");
dojo.require("esri.tasks.PrintTask");

var maps = [], fLayers = [], locateGfx = [], layersDialog, idSymbol, idHighSymbol, lastIdEvt = null,
    locator = null, priorMapWidths = [0, 0, 0], mapCount = 0,
    mapChange = false, mapExtent, firstMap = false, mapsLoaded = 0, schoolResults = [],
    geocodeMapIndex = 0, printMapIndex = 0, syncLoc = true, syncLevel = true, sync = false, numMapsSyncCheck = 0,
    mapsResized = 0, mapsResizedTest = 0, mapExtent, mapCenter, mapScale, widgetPrint,
    basemapGallery = null, caExtent = null, jqueryReadyChecks = 0, mouseDown = 0, visibleSvcByMap = {"0": null, "1": null, "2": null},
    activeBottomTab = "", currentBaseMapName = "", layerList = [], domainLayerNames = [], tocList = { count: 0 }, tocActiveMap = -1, numPanels = 3;
    

//show map on load 
dojo.addOnLoad(init);

function init() { 'use strict';
    initMaps();
}

function initMaps() { 'use strict';
    caExtent = new esri.geometry.Extent(CA_EXTENT_JSON);
    // mapCount = 0;
    
    $("#mapDiv0").mouseover(function (e) { 
        if (mouseDown === 0) {
            mapCount = 0;
        }
    });
    $("#mapDiv1").mouseover(function (e) {
        if (mouseDown === 0) {
            mapCount = 1;
        }
    });
    $("#mapDiv2").mouseover(function (e) {
        if (mouseDown === 0) {
            mapCount = 2;
        }
    });

    //Find Address 
    locator = new esri.tasks.Locator(GEOCODE_URL);
    dojo.connect(locator, "onAddressToLocationsComplete", showGeocodeResults);
    
    jqueryReadyChecks += 1;
    finalizeJQueryIfReady();
}

function resizeMaps(n) { 'use strict';
    var i, $maps = $('.map');
    
    sync = false;
    mapsResized = n;
    numMapsSyncCheck = 0;
    mapsResizedTest = 0;
    
    for (i = 0; i < numPanels; i += 1) {
        if (maps[i] !== null) {
            maps[i].resize();
            if (n === 0 && parseInt($maps.eq(i).css('width').replace('px', ''), 10) !== priorMapWidths[i]) {
                mapsResized += 1;
            }
        }
    }
}

function afterMapResized() { 'use strict';
    mapsResizedTest += 1;
    if (sync === false) {
        numMapsSyncCheck += 1;
        if (numMapsSyncCheck === mapsResized) {
            mapsResized = 0;
            enableSyncing();
        }
    }
}

function enableSyncing() { 'use strict';
    sync = true;
    syncMaps();
}

function syncMaps() { 'use strict';
    if (sync === true) {
        var i, numVisibleMaps = $('#numPanelsSelected').get(0).selectedIndex + 1;

        if (syncLoc === true && syncLevel === false) {
            if (mapExtent !== maps[mapCount].extent) {
                mapExtent = maps[mapCount].extent;
                mapCenter = maps[mapCount].extent.getCenter();
                for (i = 0; i < numVisibleMaps; i += 1) {
                    if (maps[i] !== null) {
                        if (i !== mapCount) {
                            maps[i].centerAt(mapCenter);
                        }
                    }
                }
            }
        }
        else if (syncLoc === false && syncLevel === true) {
            if (mapScale !== maps[mapCount].getLevel()) {
                mapScale = maps[mapCount].getLevel();
                for (i = 0; i < numVisibleMaps; i += 1) {
                    if (maps[i] !== null) {
                        if (i !== mapCount) {
                            maps[i].setLevel(mapScale);
                        }
                    }
                }
            }
        }
        else if (syncLoc === true && syncLevel === true) {
            if (mapExtent !== maps[mapCount].extent) {
                mapExtent = maps[mapCount].extent;
                for (i = 0; i < numVisibleMaps; i += 1) {
                    if (maps[i] !== null) {
                        if (i !== mapCount) {
                            maps[i].setExtent(mapExtent);
                        }
                    }
                }
            }
        }
    }
}

function createMap(j) { 'use strict';
    // Setup the popup window for identify results
    var tempMap, b, bl, tempBasemapOption,
        $basemaps = $('#baseMapSelected'); 
        //popup = new esri.dijit.Popup({ marginTop: 80,
        //    fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        //                                                 new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        //                                                 new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]))
        //}, dojo.create("div"));
        
    //remember to add your server to the proxy.config as a fallback from CORS    
        
    idSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                                                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                                new dojo.Color([0, 0, 0]), 2), new dojo.Color([0, 0, 0, 0]));
    idHighSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                                                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                                new dojo.Color([0, 225, 255]), 2), new dojo.Color([0, 0, 0, 0]));

    tempMap = new esri.Map("mapDiv" + j, { extent: caExtent, slider: false, showInfoWindowOnClick: false, showAttribution: false, logo: false });
    maps.push(tempMap);
    fLayers = {};
    locateGfx.push(new esri.layers.GraphicsLayer());

    dojo.connect(tempMap, "onLoad", function () {        
        // Set up event handler for map click
        dojo.connect(maps[j], "onClick", function (evt) {
            var mapIndex, idQueryTask, idQuery; //, geographicPoint = esri.geometry.webMercatorToGeographic(evt.mapPoint);
            
            mapIndex = this.id.replace('mapDiv', '');
            if ($('#rdoClickIdentify').get(0).checked) {
                
                idQueryTask = new esri.tasks.QueryTask(SERVICES[OP_MAPS[mapIndex].svcIndex].url + "FeatureServer/" + OP_MAPS[mapIndex].lyrIndex); 
                idQuery = new esri.tasks.Query();
               
                idQuery.geometry = evt.mapPoint;
                idQuery.returnGeometry = true;
                idQuery.outSpatialReference = maps[mapIndex].spatialReference;
                idQuery.outFields = ["*"];
            
                //$('#identify' + mapIndex).html("<tr><td>Loading...</tr></td>");
                idQueryTask.execute(idQuery, function (results) {
                    var i, il, key, val, maxAbsVal = 0, feature, content, zSeries = [], idResults = results.features, 
                        //fl = maps[mapIndex].getLayer("tempFeatLyr" + mapIndex);
                        regionField, countyVal, displayAlias, fl = fLayers[OP_MAPS[mapIndex].svcIndex]["f" + OP_MAPS[mapIndex].lyrIndex];
                
                    if (idResults.length > 0) {
                        feature = idResults[0];
                        $('#id-chart' + mapIndex).empty();
                        if (feature.attributes.hasOwnProperty(fl.displayField)) {
                            $("#dialog-identify" + mapIndex).dialog("option", "title", "Details for: " + feature.attributes[fl.displayField]);    
                        } else {
                            $("#dialog-identify" + mapIndex).dialog("option", "title", "Unknown feature");
                        }
                        
                        if (!($("#dialog-identify" + mapIndex).dialog("isOpen"))) {
                            $("#dialog-identify" + mapIndex).dialog("option", "position", { my: "left top", at: "left+5 bottom", of: $("#titleCon" + mapIndex) }).dialog('open');
                        }
                        
                        maps[mapIndex].graphics.clear();
                        maps[mapIndex].graphics.add(new esri.Graphic(feature.geometry, idSymbol, feature.attributes, null));
                        
                        if (fl.name.indexOf("Regional Opportunity Index") === -1 && $.inArray(fl.name, domainLayerNames) === -1) {
                            regionField = "R" + fl.rendererField;
                            //regionField = regionField.substring(0, 10);
                            
                            if (feature.attributes.hasOwnProperty("CntyNm") && fl.displayField !== "CntyNm") {
                                countyVal = feature.attributes.CntyNm;
                            } else if (feature.attributes.hasOwnProperty("CountyName") && fl.displayField !== "CountyName") {
                                countyVal = feature.attributes.CountyName;
                            } else {
                                countyVal = "n/a";
                            }
                            
                            displayAlias = fl.displayField;
                            for (i = 0, il = results.fields.length; i < il; i += 1) {
                                if (results.fields[i].name === fl.displayField) {
                                    displayAlias = results.fields[i].alias;
                                }
                            }
                            
                            $('#id-chart' + mapIndex).html('<div class="id-details">' + fl.name + '<hr size="1">' 
                                + '<strong>' + displayAlias + ":</strong> " + feature.attributes[fl.displayField]
                                + (countyVal === "n/a" ? "" : '<br /><strong>County:</strong> ' + countyVal)
                                + (feature.attributes.hasOwnProperty(fl.rendererField) ? '<br /><strong>Value:</strong> ' + roundToDecimal(feature.attributes[fl.rendererField], 2) : '')
                                + (feature.attributes.hasOwnProperty(regionField) ? '<br /><strong>Regional Average:</strong> ' + roundToDecimal(feature.attributes[regionField], 2) : "") + '</div>');
                            
                            
                            
                        } else {
                            for (i = 0, il = results.fields.length; i < il; i += 1) {
                                key = results.fields[i].name;
                                if (key.substr(0, 2) === "z_") {
                                    val = feature.attributes[key];
                                    if (Math.abs(val) > maxAbsVal) { maxAbsVal = Math.abs(val); }
                                    zSeries.push({
                                        layerName: zLayerLookup[key],
                                        name: results.fields[i].alias,
                                        data: [{ y: val, color: (val < 0 ? '#aa0000' : '#009900')}]
                                    });
                                }
                            }
                          
                            $('#id-chart' + mapIndex).highcharts({
                                chart: {
                                    type: 'bar',
                                    height: 300,
                                    width: 350,
                                    margin: [40, 0, 50, 0],
                                    backgroundColor: '#ffffff'
                                },
                                title: {
                                    text: fl.name
                                },
                                credits: { enabled: false },
                                series: zSeries,
                                yAxis: {
                                    min: -2 * maxAbsVal,
                                    max: 2 * maxAbsVal,
                                    title: { text: "Overall Mean" },
                                    labels: {enabled: false},
                                    gridLineWidth: 0,
                                    plotLines: [{
                                        color: '#000000',
                                        value: 0,
                                        width: 1
                                    }]
                                },
                                xAxis: {
                                    labels: {enabled: false},
                                    title: null
                                },
                                legend: { enabled: false },
                                plotOptions: {
                                    bar: {
                                        cursor: "pointer",
                                        colorByPoint: true,
                                        borderWidth: 1,
                                        borderColor: '#000000',
                                        shadow: true,
                                        pointPadding: 0.3,
                                        dataLabels: { enabled: true,
                                                     verticalAlign: "middle",
                                                     formatter: function() {
                                                         return this.series.name;
                                                     },
                                                     style: {
                                                         width:'70px',
                                                         textAlign: 'right'
                                                     },
                                                     x: 0,
                                                     padding: 5
                                        },
                                        point: {
                                            events: {
                                                click: function () {
                                                    loadLayerByName(mapIndex, this.series.userOptions.layerName);
                                                }
                                            }
                                        }
                                    }
                                },
                                tooltip: {
                                    enabled: true,
                                    followPointer: true,
                                    formatter: function () {
                                        return "Map this";
                                    }
                                }
                            });
                        } 
                    }
                });    
                
                
            } else {
                lastIdEvt = evt;
                $('#dialog-report').dialog('open');
                
                idForMap(0, evt);
                idForMap(1, evt);
                idForMap(2, evt);
            }
        });

        // Other events
        dojo.connect(maps[j], "onExtentChange", syncMaps);
        dojo.connect(maps[j], "onZoomEnd", enableSyncing);
        dojo.connect(maps[j], "onResize", afterMapResized);
        dojo.connect(maps[j], "onLayerAdd", processNewFeatLayer);
        dojo.connect(maps[j], "onUpdateEnd", function() {
            $('#mapLoading' + j).hide();
        });
        dojo.connect(maps[j].graphics, "onMouseOver", mapGfxOver);
        dojo.connect(maps[j].graphics, "onMouseOut", mapGfxOut);

        maps[j].addLayer(locateGfx[j]);
        
        mapsLoaded += 1;
        checkLoadToc();
    });

    // Load basemap layer(s)
    
    $basemaps.children().remove();
    for (b = 0, bl = BASEMAPS.length; b < bl; b += 1) {
        tempBasemapOption = BASEMAPS[b];
        $basemaps.append('<option value="' + b + '"' + (b === 0 ? ' selected' : '') + '>' + tempBasemapOption.name + '</option>');
        tempMap.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(tempBasemapOption.url, { id: tempBasemapOption.name, visible: (b === 0 ? true : false) }));
        if (b === 0) { currentBaseMapName = tempBasemapOption.name; }
    }
}

var currentTocIndex = 0;

function loadLayerByName(mapIndex, lyrName) { 'use strict';
    var key, i, il, svc, found = false;
    
    for (key in tocList) {
        if (tocList.hasOwnProperty(key) && !found) {
            svc = tocList[key];
            for (i = 0, il = svc.length; i < il; i += 1) {
                if (svc[i].label === lyrName) {
                    if ($("#back" + mapIndex).button("option", "disabled")) {
                        $("#back" + mapIndex).button("option", "disabled", false);
                    }  
                    setMapLayer(mapIndex, svc[i].svcIdx, svc[i].lyrIdx);
                    found = true;
                    break;
                }
            }
        }
    }
}

function mapGfxOver(evt) { 'use strict';
    // Report: Activates on mouse over of a previously selected tract, and highlights it (teal border) on the map 
    var gfxId, mapIdx, fl;
    
    mapIdx = evt.currentTarget.id.replace('mapDiv', '').replace('_graphics_layer', '');  //mapDiv0_graphics_layer    
    fl = maps[parseInt(mapIdx, 10)].getLayer("tempFeatLyr" + mapIdx);
    
    if ($('#rdoClickReport').get(0).checked  && typeof(evt.graphic.attributes) !== 'undefined') {
        gfxId = evt.graphic.attributes[fl.displayField].replace('.', '-');        
        $('#' + gfxId + '_0 td, #' + gfxId + '_1 td, #' + gfxId + '_2 td').addClass('id-row-highlight');
        
        //if (!(typeof(OP_MAPS[0].selectedGraphics[gfxId + '_0']) === 'undefined'
        //   || typeof(OP_MAPS[0].selectedGraphics[gfxId + '_1']) === 'undefined'
        //   || typeof(OP_MAPS[0].selectedGraphics[gfxId + '_2']) === 'undefined')) {
            OP_MAPS[0].selectedGraphics[gfxId + '_0'].setSymbol(idHighSymbol);
            OP_MAPS[1].selectedGraphics[gfxId + '_1'].setSymbol(idHighSymbol);
            OP_MAPS[2].selectedGraphics[gfxId + '_2'].setSymbol(idHighSymbol);     
        //}
    }
}

function mapGfxOut(evt) { 'use strict';
    // Report: Activates on mouse leaving of a previously selected tract, and de-highlights it on the map 
	var gfxId, mapIdx, fl;
    
    mapIdx = evt.currentTarget.id.replace('mapDiv', '').replace('_graphics_layer', '');  //mapDiv0_graphics_layer
    fl = maps[parseInt(mapIdx, 10)].getLayer("tempFeatLyr" + mapIdx);
    
    if ($('#rdoClickReport').get(0).checked  && typeof(evt.graphic.attributes) !== 'undefined') {
        gfxId = evt.graphic.attributes[fl.displayField].replace('.', '-');
        $('#' + gfxId + '_0 td, #' + gfxId + '_1 td, #' + gfxId + '_2 td').removeClass('id-row-highlight');
        
        OP_MAPS[0].selectedGraphics[gfxId + '_0'].setSymbol(idSymbol);
        OP_MAPS[1].selectedGraphics[gfxId + '_1'].setSymbol(idSymbol);
        OP_MAPS[2].selectedGraphics[gfxId + '_2'].setSymbol(idSymbol);
    }
}

function idForMap(mapIndex, evt) { 'use strict';
    var idQueryTask = new esri.tasks.QueryTask(SERVICES[OP_MAPS[mapIndex].svcIndex].url + "FeatureServer/" + OP_MAPS[mapIndex].lyrIndex), 
        idQuery = new esri.tasks.Query(),
        geographicPoint;
   
    idQuery.geometry = evt.mapPoint;
    idQuery.returnGeometry = true;
    idQuery.outSpatialReference = maps[mapIndex].spatialReference;
    idQuery.outFields = ["*"];

    //$('#identify' + mapIndex).html("<tr><td>Loading...</tr></td>");
    idQueryTask.execute(idQuery, function (results) {
        var feature, content, renderField, idResults = results.features, fl = maps[mapIndex].getLayer("tempFeatLyr" + mapIndex), gfx, gfxId, $el;
    
        //maps[mapIndex].graphics.clear();        
        if (idResults.length > 0) {
            feature = idResults[0];
            renderField = fl.renderer.attributeField;
            
            gfxId = feature.attributes[fl.displayField].replace('.', '-') + '_' + mapIndex;
            
            if (OP_MAPS[mapIndex].selectedGraphics.hasOwnProperty(gfxId) && OP_MAPS[mapIndex].selectedGraphics[gfxId] !== null) {
                $('#' + gfxId).remove();
                maps[mapIndex].graphics.remove(OP_MAPS[mapIndex].selectedGraphics[gfxId]);
                OP_MAPS[mapIndex].selectedGraphics[gfxId] = null;                
            } else {
                //content = '<tr class="id-results-head"><td>' + fl.displayField + ": </td><td>" + feature.attributes[fl.displayField] + '</td>'
                //        + '<tr><td class="id-results-left">' + renderField + ': </td><td class="id-results-right">' + feature.attributes[renderField] + '</td></tr>';
                content = '<tr id="' + gfxId + '"><td class="id-results-left">' + (feature.attributes.hasOwnProperty(fl.displayField) ? feature.attributes[fl.displayField] : "??") + ': </td><td class="id-results-right">' + (feature.attributes.hasOwnProperty(renderField) ? roundToDecimal(feature.attributes[renderField], 2) : "no data") + '</td></tr>';
                
                $('#identify' + mapIndex).append(content);
                
                gfx = new esri.Graphic(feature.geometry, idSymbol, feature.attributes, null);
                OP_MAPS[mapIndex].selectedGraphics[gfxId] = gfx;                    
                maps[mapIndex].graphics.add(gfx);
            }
        }
    });    
}

function checkLoadToc() { 'use strict';
    if (mapsLoaded === 3) {
        var i, il, m, ml, tempConfig, tempOb, $toc = $('#toc');
       
        for (i = 0, il = SERVICES.length; i < il; i += 1) {
            tempConfig = SERVICES[i];
            $toc.append('<div id="toc-svc-' + i + '"></div>');
            for (m = 0; m < 3; m += 1) {
                tempOb = new esri.layers.ArcGISDynamicMapServiceLayer(tempConfig.url + 'MapServer', { opacity: 0.8, id: tempConfig.name });
                tempConfig.layerObs.push(tempOb);
                
                addLayerHandlers(tempOb, tempConfig, m, i);  
            }
        }
    }
}

function addLayerHandlers(layerOb, cfg, mapIdx, svcIdx) { 'use strict';    
    dojo.connect(layerOb, "onLoad", function (lyr) {        
        if (!tocList.hasOwnProperty(svcIdx)) {
            var data = [], $lyrList = $('<ul class="layer-group-header"></ul>'),
                i, il, tocData = [];
            
            createToc($lyrList, lyr.layerInfos, mapIdx, svcIdx, data);
            tocList[svcIdx] = data;
            tocList.count += 1;
            
            $('#toc-svc-' + svcIdx).html($lyrList);
            
            if (tocList.count === SERVICES.length) {
                for (i = 0, il = tocList.count; i < il; i += 1) {
                    tocData = tocData.concat(tocList[i]);
                }
                $( "#toc-search" ).catcomplete({
                    delay: 0,
                    source: tocData,
                    select: function(event, ui) {
                        setMapLayer(-1, ui.item.svcIdx, ui.item.lyrIdx);
                    }
                });   
            }
        }
        
        if (cfg.defaultForMap !== null) {
            for (i = 0, il = cfg.defaultForMap.length; i < il; i += 1) {
                if (cfg.defaultForMap[i] === mapIdx) {
                    OP_MAPS[mapIdx].svcIndex = svcIdx;
                    OP_MAPS[mapIdx].lyrIndex = cfg.defaultLayerIndex[i];
                    
                    lyr.setVisibleLayers([cfg.defaultLayerIndex[i]]);
                    visibleSvcByMap[mapIdx] = lyr.id;
                    setMapLayer(mapIdx, svcIdx, cfg.defaultLayerIndex[i]);
                    
                    $('#titleCon' + mapIdx).html((lyr.layerInfos[cfg.defaultLayerIndex[i]].name || "Untitled Layer"));
                    
                    maps[mapIdx].addLayer(lyr);
                }  
            }
        }
        
        /*if (cfg.defaultForMap === mapIdx) {
            OP_MAPS[mapIdx].svcIndex = svcIdx;
            OP_MAPS[mapIdx].lyrIndex = cfg.defaultLayerIndex;
            
            lyr.setVisibleLayers([cfg.defaultLayerIndex]);
            visibleSvcByMap[mapIdx] = lyr.id;
            setMapLayer(mapIdx, svcIdx, cfg.defaultLayerIndex);
            
            $('#titleCon' + mapIdx).html(lyr.layerInfos[cfg.defaultLayerIndex].name || "Untitled Layer");
            
            maps[mapIdx].addLayer(lyr);            
        }*/
    });

    dojo.connect(layerOb, "onError", function (error) {
        alert("Error loading operational layer for map " + (mapIdx + 1) + ".\n\n" + error.message);
    });              
}

function createToc($myLyrList, infos, mapIndex, svcIndex, outData) { 'use strict';
    var i, il, $myNode, $mySubNode, info, category;
    for (i = 0, il = infos.length; i < il; i += 1) {
        $myNode = $('<li></li>');
        info = infos[i];

        if (info.subLayerIds === null) {
            // create the <a> for the name of this layer, with no +/- tree box
            outData.push({ label: info.name, category: (typeof(category) === 'undefined' ? "Uncategorized" : category), svcIdx: svcIndex, lyrIdx: info.id });
            $myNode.append('<div><a id="lyrSel_' + mapIndex + '_' + info.id + '" class="selectable-layer" href="javascript:setMapLayer(-1,' + svcIndex + ',' + info.id + ')">' + info.name + '</a></div>'); //<img class="layer-selector" src="img/toc-blank.png"/> 
            currentTocIndex = i;
        } else {
            // create the <div> for the +/- box and the name of this layer
            category = info.name;
            if (info.name.indexOf("People") > -1 || info.name.indexOf("Place") > -1) {
                $myNode.append('<div class="has-sub-layers"><img class="layer-toggle" src="img/toc-plus.png"/> <a id="lyrSel_' + mapIndex + '_' + (info.id+1) + '" href="javascript:setMapLayer(-1,' + svcIndex + ',' + (info.id+1) + ')">' + info.name + '</a></div>');
            } else {
                $myNode.append('<div class="has-sub-layers"><img class="layer-toggle" src="img/toc-plus.png"/> <span>' + info.name + '</span></div>');
            }
            // call the recursive function to add nested nodes for each of the sub layers
            $mySubNode = $('<ul class="layer-group-header"></ul>');
            addTocNodeWithSubs($mySubNode, infos, info.subLayerIds, mapIndex, svcIndex, info.id, outData, category);
            $mySubNode.css('display', 'none');
            $myNode.append($mySubNode);
        }

        $myLyrList.append($myNode);

        // Before looping, set the master loop counter = to the last layer that was added inside all the recursion
        if (currentTocIndex > i) {
            i = currentTocIndex;
        }
    }
}

function addTocNodeWithSubs($node, infos, subIds, mapIndex, svcIndex, parentLyrIndex, outData, inCategory) { 'use strict';
    var t = 0, k, kl, $myNode, $mySubNode, lyrIndex, info;
    
    // add a toc entry for the first sub-layer if it's an indicator domain
    info = infos[parentLyrIndex];
    
    if (info.name.indexOf("People") > -1 || info.name.indexOf("Place") > -1) {
        lyrIndex = subIds[0];
        info = infos[lyrIndex];
        domainLayerNames.push(info.name);
        if (subIds.length > 1) { t = 1; }
    }
    
    outData.push({ label: info.name, category: inCategory, svcIdx: svcIndex, lyrIdx: info.id });
    
    // changed starting k from 0 to 1, since the category name above is now the clickable for the domain level 
    for (k = t, kl = subIds.length; k < kl; k += 1) {
        $myNode = $('<li></li>');
        lyrIndex = subIds[k];
        info = infos[lyrIndex];

        if (info.subLayerIds === null) {
            // create the <a> for the name of this layer, with no +/- tree box
            outData.push({ label: info.name, category: inCategory, svcIdx: svcIndex, lyrIdx: info.id });
            $myNode.append('<div><a id="lyrSel_' + mapIndex + '_' + info.id + '" class="selectable-layer" href="javascript:setMapLayer(-1,' + svcIndex + ',' + info.id + ')">' + info.name + '</a></div>'); //<img class="layer-selector" src="img/toc-blank.png"/>
            currentTocIndex = lyrIndex;
        } else {
            // create the <div> for the +/- box and the name of this layer
            inCategory = info.name;
            $myNode.append('<div class="has-sub-layers"><img class="layer-toggle" src="img/toc-plus.png"/> <span>' + info.name + '</span></div>');

            // call the recursive function to add nested nodes for each of the sub layers
            $mySubNode = $('<ul class="layer-group-header"></ul>');
            addTocNodeWithSubs($mySubNode, infos, info.subLayerIds, mapIndex, svcIndex, lyrIndex, outData, inCategory);
            $mySubNode.css('display', 'none');
            $myNode.append($mySubNode);
        }

        $node.append($myNode);
    }
}

function backMapLayer(mapIndex) { 'use strict';
    if (OP_MAPS[mapIndex].lastSvcIndex !== -1) {
        setMapLayer(mapIndex, OP_MAPS[mapIndex].lastSvcIndex, OP_MAPS[mapIndex].lastLyrIndex);
    }
}

function setMapLayer(mapIndex, svcIndex, lyrIndex) { 'use strict';
    var myLayer, oldVisSvc,
        featLyrId = "f" + lyrIndex,
        featLyr;
    
    $("#dialog-print").dialog('close');
    
    if (mapIndex === -1) { 
        mapIndex = tocActiveMap; 
        if ($("#back" + mapIndex).button("option", "disabled")) {
            $("#back" + mapIndex).button("option", "disabled", false);
        }    
    }
    myLayer = SERVICES[svcIndex].layerObs[mapIndex];

    $('#mapLoading' + mapIndex).show();
    
    OP_MAPS[mapIndex].lastSvcIndex = OP_MAPS[mapIndex].svcIndex;
    OP_MAPS[mapIndex].lastLyrIndex = OP_MAPS[mapIndex].lyrIndex;
    OP_MAPS[mapIndex].svcIndex = svcIndex;
    OP_MAPS[mapIndex].lyrIndex = lyrIndex;
    
    oldVisSvc = maps[mapIndex].getLayer(visibleSvcByMap[mapIndex]);
    if (typeof (oldVisSvc) !== "undefined") {
        oldVisSvc.setVisibleLayers([-1]);
    }
    
    // add layer to map now if it's not already
    if (typeof (maps[mapIndex].getLayer(SERVICES[svcIndex].name)) === "undefined") {
        maps[mapIndex].addLayer(myLayer);
    }
    
    myLayer.setVisibleLayers([lyrIndex]);
    visibleSvcByMap[mapIndex] = myLayer.id;
    $('#titleCon' + mapIndex).html(myLayer.layerInfos[lyrIndex].name || "Untitled Layer");

    // remove the prior feature layer if there is one (it's only needed to pull description/legend info from, which is then cached elsewhere)
    if (typeof (maps[mapIndex].getLayer("tempFeatLyr" + mapIndex)) !== "undefined") {
        maps[mapIndex].removeLayer(maps[mapIndex].getLayer("tempFeatLyr" + mapIndex));
    }

    if (!fLayers.hasOwnProperty(svcIndex)) { 
            fLayers[svcIndex] = {}; 
    }
        
    // if the user already loaded this layer, use its cached info, else load it now.
    // its info will be cached in the callback event below (from the map's onLayerAdd event)
    if (fLayers[svcIndex].hasOwnProperty(featLyrId)) {
        setCachedLayerInfo(mapIndex, svcIndex, featLyrId);
    } else {
        featLyr = new esri.layers.FeatureLayer(SERVICES[svcIndex].url + 'FeatureServer/' + lyrIndex, { mode: esri.layers.FeatureLayer.MODE_SELECTION, id: "tempFeatLyr" + mapIndex });
        fLayers[svcIndex][featLyrId] = { legendInfo: [], description: "(no additional information)", name: "Unknown", displayField: "none", rendererField: "none" };
        maps[mapIndex].addLayer(featLyr);
    }

    // close the layers pane if the user got here from there
    //if ($('#layersPane' + mapIndex).css('display') === 'block') {
    //    $('#btnLayers' + mapIndex).click();
    //}
}

function processNewFeatLayer(lyr) { 'use strict';
    // process this layer after its added to the map, and cache its info if it's a feature layer
    if (lyr.declaredClass === "esri.layers.FeatureLayer") {
        var valArray, myLabel, i, il, info, outlineColor, mapIndex = lyr.id.replace("tempFeatLyr", ""); 

        // get renderer info and store in legend info cache
        if (typeof (lyr.renderer.infos) !== "undefined") {
            for (i = lyr.renderer.infos.length - 1; i > -1; i -= 1) {
            //for (i = 0, il = lyr.renderer.infos.length; i < il; i += 1) {
                info = lyr.renderer.infos[i];
                outlineColor = "#002855";
                if (typeof (info.symbol.outline.color) !== "undefined" && info.symbol.outline.color !== null) {
                    outlineColor = info.symbol.outline.color.toHex();
                }
                valArray = info.label.split(' - ');
                if (valArray.length === 2) {
                    myLabel = roundToDecimal(valArray[0], 2) + ' - ' + roundToDecimal(valArray[1], 2); 
                } else {
                    myLabel = info.label;
                }
                
                fLayers[OP_MAPS[mapIndex].svcIndex]["f" + lyr.layerId].legendInfo.push({
                    label: myLabel,
                    color: info.symbol.color.toHex(),
                    outline: "#333333" //outlineColor
                });
            }            
        }
        
        fLayers[OP_MAPS[mapIndex].svcIndex]["f" + lyr.layerId].description = lyr.description;
        fLayers[OP_MAPS[mapIndex].svcIndex]["f" + lyr.layerId].name = lyr.name;
        fLayers[OP_MAPS[mapIndex].svcIndex]["f" + lyr.layerId].rendererField = lyr.renderer.attributeField;
        fLayers[OP_MAPS[mapIndex].svcIndex]["f" + lyr.layerId].displayField = lyr.displayField;

        setCachedLayerInfo(mapIndex, OP_MAPS[mapIndex].svcIndex, "f" + lyr.layerId);
    }
}

function setCachedLayerInfo(mapIndex, svcIndex, lyrId) { 'use strict';
    var i, il, info, legendInfos = fLayers[svcIndex][lyrId].legendInfo,
        $legend = $('#legend' + mapIndex + ' ul');    
    
    //$('#description' + mapIndex).html(fLayers[mapIndex][lyrId].layerOb.description);

    $legend.children().remove();
    //$legend.append('<li><strong>' + (SERVICES[svcIndex].layerObs[mapIndex].layerInfos[lyrId.replace("f", "")].name || "Untitled Layer") + ' Color Scale</strong></li>');
    //$('#legend-layer' + mapIndex).html('<a href="javascript:showDescription(' + svcIndex + ',\'' + lyrId + '\');">' + (SERVICES[svcIndex].layerObs[mapIndex].layerInfos[lyrId.replace("f", "")].name || "Untitled Layer") + '</a>');
    $('#desc' + mapIndex).html('<b>' + fLayers[svcIndex][lyrId].name + ':</b><br/><span>' + fLayers[svcIndex][lyrId].description + '</span>'); 
    $('#titleCon' + mapIndex).attr('title', fLayers[svcIndex][lyrId].description);
    $('#identify-layer' + mapIndex).html((SERVICES[svcIndex].layerObs[mapIndex].layerInfos[lyrId.replace("f", "")].name || "Untitled Layer"));

    if (lastIdEvt !== null) {
        //idForMap(0, lastIdEvt);
        idStartOver(); 
    }    

    if (typeof (legendInfos) !== "undefined" && legendInfos !== null) {
        for (i = 0, il = legendInfos.length; i < il; i += 1) {
            info = legendInfos[i];
            $legend.append('<li><div style="border-color: ' + info.outline + '; background-color: ' + info.color + '"></div><div><span style="background-color: white;">&nbsp;' + info.label + '&nbsp;</span></div><br style="clear: both;"/></li>');
        }
    }
}

function changeBaseMap(baseMapIdx) { 'use strict';
    var j, jl, i, il, thisBaseMapName, baseMapName = BASEMAPS[baseMapIdx].name;
    if (baseMapName !== currentBaseMapName) {
        currentBaseMapName = baseMapName;

        for (j = 0, jl = maps.length; j < jl; j += 1) {
            for (i = 0, il = BASEMAPS.length; i < il; i += 1) {
                thisBaseMapName = BASEMAPS[i].name;
                if (thisBaseMapName === currentBaseMapName) {
                    maps[j].getLayer(thisBaseMapName).setOpacity(1.0);
                    maps[j].getLayer(thisBaseMapName).show();
                } else {
                    maps[j].getLayer(thisBaseMapName).hide();
                }
            }
        }
    }
}

function showDescription(svcIndex, lyrId) { 'use strict';
    $('#layer-description').html('<b>' + fLayers[svcIndex][lyrId].name + ':</b> ' + fLayers[svcIndex][lyrId].description);    
}

function idStartOver() { 'use strict';
    maps[0].graphics.clear();
    maps[1].graphics.clear();
    maps[2].graphics.clear();
    $('#identify0').children().remove();
    $('#identify1').children().remove();
    $('#identify2').children().remove();
    OP_MAPS[0].selectedGraphics = {};
    OP_MAPS[1].selectedGraphics = {};
    OP_MAPS[2].selectedGraphics = {};
}

$(document).ready(function (e) { 'use strict';
    $(document).mousedown(function (e) {
        mouseDown = 1;
    });
    $(document).mouseup(function (e) {
        mouseDown = 0;
    });

    //$(window).resize(function () {
    //    resizeMaps(3);
    //});

    layersDialog = $("#dialog-layers").dialog({
        position: { 
            my: 'top',
            at: 'center',
            of: $('#titleCon1'),
            collision: 'none'
        },
        modal: false,
        height: 450,
        width: 350,
        show: "fade",
        hide: "fade",
        draggable: true,
        resizable: true,
        autoOpen: false,
        create: function( event, ui ) {
            $(this).prev().addClass('layer-button-active');
        },
        close: function( event, ui ) {
            $('button.layers-button').button('option', 'icons', { primary: 'ui-icon-triangle-1-e' }).removeClass('layer-button-active');
        }
    });
    
    $("#dialog-report").dialog({
        position: { 
            my: 'top',
            at: 'top',
            of: $('body'),
            collision: 'none'
        },
        modal: false,
        maxHeight: 450,
        //maxWidth: 350,
        height: 'auto',
        width: 800,
        show: "fade",
        hide: "fade",
        draggable: true,
        resizable: false,
        autoOpen: false
    });

    $("#dialog-geocode").dialog({
        position: { 
            my: 'top',
            at: 'left',
            of: $('#titleCon1'),
            collision: 'none'
        },
        modal: false,
        height: "auto",
        width: 480,
        show: "fade",
        hide: "fade",
        draggable: true,
        resizable: false,
        autoOpen: false
    });
    
    /*$("#dialog-legend").dialog({
        position: { 
            my: 'top',
            at: 'left',
            of: $('#titleCon1'),
            collision: 'none'
        },
        modal: false,
        height: 'auto',
        width: 800,
        show: "fade",
        hide: "fade",
        draggable: true,
        resizable: false,
        autoOpen: false
    });*/
    
    $("#dialog-print").dialog({
        autoOpen: false,
        width: 260,
        height: 190,
        position: "right",
        open: function (event, ui) {
            var legendLayer = new esri.tasks.LegendLayer();
            legendLayer.layerId = visibleSvcByMap[printMapIndex];
            legendLayer.subLayerIds = [OP_MAPS[printMapIndex].lyrIndex];
            widgetPrint = vgis.widget.print({divToAttachTo: "divDefaultPrint", 
                                             //customTitle: $('#titleCon' + printMapIndex).html(), 
                                             legendLayers: [legendLayer],
                                             customText: {
                                                 panelTitle: $('#titleCon' + printMapIndex).html(),
                                                 layerTitle: "", // $('#titleCon' + printMapIndex).html(),
                                                 sourceUrl: "http://mappingregionalchange.ucdavis.edu/roi/",
                                                 description: $('#desc' + printMapIndex + ' span').html()
                                             }});
            widgetPrint.start();
        },
        close: function (event, ui) {
            widgetPrint.end();
        }
    });
    
    $('.dialog-identify').dialog({
        modal: false,
        height: 'auto',
        width: 380,
        //show: "fade",
        hide: "fade",
        draggable: true,
        resizable: true,
        autoOpen: false
    });

    // Handle click on the +/- row to expand or collapse a toc group.
    $("#toc, #dialog-legend").on('click', '.layer-toggle', function () {
        var $sub = $(this).parent().next('ul'),
            $img = $(this); //.children('img');

        if ($sub.css('display') === 'none') {
            $sub.css('display', 'block');
            $img.attr('src', 'img/toc-minus.png');
        } else {
            $sub.css('display', 'none');
            $img.attr('src', 'img/toc-plus.png');
        }
    });

    // Handle click on a layer name in the ToC.
    $('#toc').on('click', 'a.selectable-layer', function () {
        //var myTocId = $(this).closest("div.layers-pane").get(0).id;
        //$('#' + myTocId + ' a.highlight-layer').removeClass('highlight-layer');
        //$(this).addClass('highlight-layer');
        //$('#' + myTocId + ' img.layer-checked').attr('src', 'img/toc-blank.png').removeClass('layer-checked');
        //$(this).prev('img').attr('src', 'img/toc-checked.png').addClass('layer-checked');
    });

    // Handle change # of panels to display.
    var $sel = $('#numPanelsSelected'),
        i, il, $searchSel = $('#search-type');
        
    $sel.get(0).selectedIndex = 2;
    $sel.change(function () {
        var $pane;
        numPanels = this.selectedIndex + 1;
        priorMapWidths[0] = maps[0].width;
        priorMapWidths[1] = maps[1].width;
        priorMapWidths[2] = maps[2].width;

        $pane = $('#dialog-layers');
        if ($pane.dialog('isOpen')) {
            $pane.dialog('close');
        }
        $pane = $('#dialog-print');
        if ($pane.dialog('isOpen')) {
            $pane.dialog('close');
        }

        // User changed the number of Panels.  Redraw the maps.
        if (numPanels === 1) {
            $("#titleCon2").hide();
            $("#mapCon2").hide();
            $(".details-for-map2").hide();
            $("#titleCon1").hide();
            $("#mapCon1").hide();
            $(".details-for-map1").hide();
            $("#titleCon0").css('width', '100%');
            $("#mapCon0").css('width', '100%');
        }

        if (numPanels === 2) {
            $("#titleCon2").hide();
            $("#mapCon2").hide();
            $(".details-for-map2").hide();
            $("#titleCon1").show();
            $("#mapCon1").show();
            $(".details-for-map1").show();
            $("#titleCon1").css('width', '50%');
            $("#mapCon1").css('width', '50%');
            $("#titleCon0").css('width', '50%');
            $("#mapCon0").css('width', '50%');
        }

        if (numPanels === 3) {
            $("#titleCon2").show();
            $("#mapCon2").show();
            $(".details-for-map2").show();
            $("#titleCon1").show();
            $("#mapCon1").show();
            $(".details-for-map1").show();
            $("#titleCon2").css('width', '33.3%');
            $("#mapCon2").css('width', '33.3%');
            $("#titleCon1").css('width', '33.3%');
            $("#mapCon1").css('width', '33.3%');
            $("#titleCon0").css('width', '33.4%');
            $("#mapCon0").css('width', '33.4%');
        }

        resizeMaps(0);
    });

    // Layer list buttons and panes
    $('button.back-button').button({ icons: { primary: 'ui-icon-triangle-1-w'}, disabled: true }).click(function () {
        var mapIndex = parseInt(this.id.replace('back', ''), 10);
        backMapLayer(mapIndex);
    });
    $('button.layers-button').button({ icons: { primary: 'ui-icon-triangle-1-e'} }).click(function () {
        var $me = $(this);
        $me.blur().button('refresh');
        
        if ($me.children().eq(0).hasClass('ui-icon-triangle-1-s')) {
            $('#dialog-layers').dialog('close');
            $me.button('option', 'icons', { primary: 'ui-icon-triangle-1-e' }).removeClass('layer-button-active');          
        } else {
            $("#dialog-layers").dialog( "option", "position", { my: "left top", at: "left bottom", of: $me } ).dialog('open'); 
            $('button.layers-button').button('option', 'icons', { primary: 'ui-icon-triangle-1-e' }).removeClass('layer-button-active');
            $me.button('option', 'icons', { primary: 'ui-icon-triangle-1-s' }).addClass('layer-button-active');
            tocActiveMap = parseInt($me.data('formap'), 10);
            $('#active-map-display').val(tocActiveMap);
        }        
    });
    $('div.layers-pane').hide();
    $("div.layers-opacity").slider({
        value: 80,
        stop: function (event, ui) {
            var mapIndex = parseInt(this.id.replace('opacity', ''), 10),
                opacity = parseFloat($(this).slider('option', 'value')) / 100.0;
            SERVICES[OP_MAPS[mapIndex].svcIndex].layerObs[mapIndex].setOpacity(opacity);
        }
    });
    $('#active-map-display').on('change', function() {
        tocActiveMap = parseInt($(this).val(), 10);
        $('button.layers-button').button('option', 'icons', { primary: 'ui-icon-triangle-1-e' }).removeClass('layer-button-active');
        $('#btnLayers' + tocActiveMap).button('option', 'icons', { primary: 'ui-icon-triangle-1-s' }).addClass('layer-button-active');
        $("#dialog-layers").dialog( "option", "position", { my: "left top", at: "left bottom", of: $('#btnLayers' + tocActiveMap) } );
    });

    $('.btnLegendToggle').button().click(function () {
        var $pane = $(this).parent().prev();
        
        if ($pane.css('display') === 'none') {
            $pane.show();
        } else {
            $pane.hide();
        }
    });

    $('.btnDescToggle').button().click(function () {
        var $pane = $(this).parent().next();
        
        if ($pane.css('display') === 'none') {
            $pane.show();
        } else {
            $pane.hide();
        }
    });

    $('#rdoClickReport').on('click', function() {
        $('#dialog-report').dialog('open');    
    });
    $('#rdoClickIdentify').on('click', function() {
        idStartOver(); 
    });
    
    // Map Zoom Buttons
    $('button.zoom-in-button').button({ icons: { primary: 'none' }, text: false }).click(function () {
        var mapIndex = parseInt(this.id.replace('zoomIn', ''), 10);
        maps[mapIndex].setLevel(maps[mapIndex].getLevel() + 1);
    }).children(1).removeClass('ui-icon').addClass('zoom-in-button');
    $('button.zoom-out-button').button({ icons: { primary: 'none' }, text: false }).click(function () {
        var mapIndex = parseInt(this.id.replace('zoomOut', ''), 10);
        maps[mapIndex].setLevel(maps[mapIndex].getLevel() - 1);
    }).children(1).removeClass('ui-icon').addClass('zoom-out-button');
    $('button.full-ext-button').button({ icons: { primary: 'none' }, text: false }).click(function () {
        var mapIndex = parseInt(this.id.replace('fullExt', ''), 10);
        maps[mapIndex].setExtent(caExtent);
    }).children(1).removeClass('ui-icon').addClass('full-ext-button');
    

    $('button.map-tool-square-button').css('width', '27px');
    
    $('#id-clear-button').button().click(function () {
        idStartOver();
    });

    $('#id-excel-button').button().click(function () {
        alert("excel");
    });
    
    $('#id-csv-button').button().click(function () {
        var jsonArray, tempOb, str = "", line, item, idx, i, il, tractTable = -1, title0 = "", title1 = "", title2 = "";
        
        // titles = #identify-layer0, #identify-layer1, #identify-layer2
        // tables = #details-for-map0, #details-for-map1,#details-for-map2
        
        // tract = first visible table's td.id-results-left ... need to remove the : at the end
        // tables themselves will have "display: none;" on them if hidden
        // indicator vaolues = all tables' td.id-results-right
        
        if ($('#identify0 tr').length > 0) {
            if ($('#identify0').css('display') !== "none") { title0 = $('#identify-layer0').text(); }
            if ($('#identify1').css('display') !== "none") { title1 = $('#identify-layer1').text(); }
            if ($('#identify2').css('display') !== "none") { title2 = $('#identify-layer2').text(); }
                
            if (title0 !== "" && $('#identify0 td.id-results-left').eq(0).text() !== "") {
                tractTable = '0';
            } else if (title1 !== "" && $('#identify1 td.id-results-left').eq(0).text() !== "") {
                tractTable = '1';
            } else if (title2 !== "" && $('#identify2 td.id-results-left').eq(0).text() !== "") {
                tractTable = '2';
            } 
                    
            if (tractTable > -1) {
                // header row
                line = 'Tract';
                if (title0 !== "") { line += ',"' + title0.replace(/"/g, '""') + '"'; }
                if (title1 !== "") { line += ',"' + title1.replace(/"/g, '""') + '"'; }
                if (title2 !== "") { line += ',"' + title2.replace(/"/g, '""') + '"'; }
                
                
                str += line + '\r\n';  
                    
                // data rows
                for (i = 0, il = $('#identify' + tractTable + ' tr').length; i < il; i += 1) {
                    line = '"' + $('#identify' + tractTable + ' tr').eq(i).children('td.id-results-left').eq(0).text().slice(0, -2) + '"';
                    
                    if (title0 !== "") { 
                        line += "," + $('#identify0 tr').eq(i).children('td.id-results-right').eq(0).text(); 
                    }
                    if (title1 !== "") { 
                        line += "," + $('#identify1 tr').eq(i).children('td.id-results-right').eq(0).text(); 
                    }
                    if (title2 !== "") { 
                        line += "," + $('#identify2 tr').eq(i).children('td.id-results-right').eq(0).text(); 
                    }
                    
                    str += line + '\r\n';  
                }
                
                
                /*
                for (i = 0, il = jsonArray.length; i < il; i += 1) {
                    line = '';
                    item = jsonArray[0];
                    for (idx in item) {
                        if (item.hasOwnProperty(idx)) {
                            if (i === 0) {
                                line += '"' + item[idx].replace(/"/g, '""') + '",';
                            } else {
                                line += item[idx] + ',';
                            }
                        }
                    }
            
                    line = line.slice(0, -1);
                    str += line + '\r\n';
                }*/
        
                window.open("data:text/csv;charset=utf-8," + encodeURIComponent(str));
            } else {
                alert("There was a problem generating the report.  This is likely due to missing or invalid data in the tables below.");
            }
        } else {
            alert("One or more tracts must be selected first.")
        }
    });

    $('#checkScaleSync').click(function () {
        if ($("#checkScaleSync").get(0).checked) {
            syncLevel = true;
            mapExtent = null;
            syncMaps();
        } else {
            syncLevel = false;
        }
    });
    $('#checkLocSync').click(function () {
        if ($("#checkLocSync").get(0).checked) {
            syncLoc = true;
            syncMaps();
        } else {
            syncLoc = false;
        }
    });

    $('#baseMapSelected').change(function () {
        changeBaseMap(this.selectedIndex);
    });

    $('.print-button').button({ icons: { primary: 'ui-icon-print' }, text: false }).click(function () {
        $(this).blur().button('refresh');
        var $pane = $('#dialog-print');
        
        if ($pane.dialog('isOpen')) {
            //if (printMapIndex === parseInt(this.id.replace('print', ''), 10)) {
                $pane.dialog('close');
            //} else {
            //    printMapIndex = parseInt(this.id.replace('print', ''), 10);
            //    $pane.dialog("option", "position", { my: "right top", at: "right bottom", of: $(this) });
            //}
        } //else {
            printMapIndex = parseInt(this.id.replace('print', ''), 10);
            $pane.dialog("option", "position", { my: "right top", at: "right bottom", of: $(this) }).dialog('open'); 
        //}
    });
    

    // Find District/Address button and pane
    $('.geocode-btn').button({ icons: { primary: 'ui-icon-flag' }, text: false }).click(function () {
        $(this).blur().button('refresh');
        var $pane = $('#dialog-geocode');
        
        if ($pane.dialog('isOpen') && geocodeMapIndex === parseInt(this.id.replace('geocode', ''), 10)) {
            $pane.dialog('close');
        } else {
            geocodeMapIndex = parseInt(this.id.replace('geocode', ''), 10);
            $pane.dialog('open');
        }        
    });
    //$('#close-geocode-pane').click(function () {
    //    $('#geocode-pane').hide();
    //});
    //$('#geocode-pane').draggable({ containment: 'parent', handle: '.ui-dialog-titlebar' }).hide().css('left', '80px');

    $('#geocode-go').button({ icons: { primary: 'ui-icon-search' }, text: false }).click(function () {
        startFindAddress();
    });    
    $('#geocode-clear').button({ icons: { primary: 'ui-icon-trash' }, text: false }).click(function () {
        $('#address-text').val('');
        $('#find-address-msg').html('');
        locateGfx[geocodeMapIndex].clear();
    });    
    $('#address-text').keypress(function (e) {
        if (e.which === 13) {
            $(this).blur();
            startFindAddress();
        }
    });
    
    $('#school-go').button({ icons: { primary: 'ui-icon-search' }, text: false }).click(function () {
        startFindDistrict();
    });
    $('#school-clear').button({ icons: { primary: 'ui-icon-trash' }, text: false }).click(function () {
        $('#search-text').val('');
        $('#find-school-msg').html('');
        locateGfx[geocodeMapIndex].clear();
    });
    $('#search-text').keypress(function (e) {
        if (e.which === 13) {
            $(this).blur();
            startFindDistrict();
        }
    });    
    for (i = 0, il = SEARCH.length; i < il; i += 1) {
        $searchSel.append('<option value="' + i + '">' + SEARCH[i].title + '</option>');
    }

    $('a.content-pane-close-btn').hover(function () { $(this).addClass("ui-state-hover"); }, function () { $(this).removeClass("ui-state-hover"); });


    $('#toc-clear-go').on('click', function() {
        $('#toc-search').val(''); 
    });
    
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function( ul, items ) {
            var that = this, currentCategory = "";
            $.each( items, function( index, item ) {
                if ( item.category !== currentCategory ) {
                    ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                    currentCategory = item.category;
                }
                that._renderItemData( ul, item );
            });
        }
    });

    jqueryReadyChecks += 1;
    finalizeJQueryIfReady();
});

function finalizeJQueryIfReady() { 'use strict';
    esri.config.defaults.io.proxyUrl = PROXY_PAGE;
    if (jqueryReadyChecks === 2) {
        var m;
        for (m = 0; m < 3; m += 1) {
            createMap(m);
        }
    }
}

function startFindAddress() { 'use strict';
    locateGfx[geocodeMapIndex].clear();
    $('#find-address-msg').html('');
    var address = { "SingleLine": $("#address-text").val() },
        options = {
            address: address,
            outFields: ["*"]
        };
    locator.outSpatialReference = maps[0].spatialReference;
    locator.addressToLocations(options);
}

function showGeocodeResults(candidates) { 'use strict';
    if ($.isEmptyObject(candidates)) {
        $('#find-address-msg').html('No results were found');
        return;
    }

    var geom = null, candidate, zoomLevel = 12, symbol = new esri.symbol.SimpleMarkerSymbol();
    //var infoTemplate = new esri.InfoTemplate("Location", "Address: ${address}<br />Score: ${score}<br />Source locator: ${locatorName}");

    symbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE);
    symbol.setColor(new dojo.Color([153, 0, 51, 1]));
    symbol.setSize(10);

    dojo.every(candidates, function (candidate) {
        if (candidate.score > 80 && geom === null) {
            //var attributes = { address: candidate.address, score: candidate.score, locatorName: candidate.attributes.Loc_name };
            geom = candidate.location;
            //var graphic = new esri.Graphic(geom, symbol, attributes, infoTemplate);
            var displayText, font, textSymbol, graphic = new esri.Graphic(geom, symbol);
            //add a graphic to the map at the geocoded location
            locateGfx[geocodeMapIndex].add(graphic);
            //add a text symbol to the map listing the location of the matched address.
            displayText = candidate.address;
            font = new esri.symbol.Font("14pt", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLD, "Helvetica");

            textSymbol = new esri.symbol.TextSymbol(displayText, font, new dojo.Color("#666633"));
            textSymbol.setOffset(0, 8);
            locateGfx[geocodeMapIndex].add(new esri.Graphic(geom, textSymbol));
            
            if (candidate.attributes.MatchLevel === "Postal") {                
                    zoomLevel = 10;
            } else if (candidate.attributes.MatchLevel === "POI") {            
                if (candidate.address.indexOf("County") > -1) {
                    zoomLevel = 7;
                } else {
                    zoomLevel = 9;    
                }
            }
        }
    });
    
    if (geom === null) {
        $('#find-address-msg').html('No results were found');
    } else {
        mapCount = geocodeMapIndex;
        maps[geocodeMapIndex].centerAndZoom(geom, zoomLevel);
    }
}


function startFindDistrict() { 'use strict';
    locateGfx[geocodeMapIndex].clear();
    schoolResults = [];
    var query, queryTask, $searchSel = $('#search-type'),
        MY = SEARCH[$searchSel.get(0).selectedIndex],
        searchText = $("#search-text").val();
        
    $('#find-school-msg').html('');

    if (searchText === "") {
        $('#find-school-msg').html('Enter part of a ' + MY.title + ' name in the box above');
    } else {
        if (MY.filter) {
            
        } else {
            $('#find-school-msg').html('Searching for: ' + searchText);
            queryTask = new esri.tasks.QueryTask(SEARCH_SVC + "FeatureServer/" + MY.index);
            query = new esri.tasks.Query();

            query.returnGeometry = true;
            query.outSpatialReference = maps[0].spatialReference;
            query.where = "LOWER(" + MY.compareField + ") LIKE LOWER('%" + searchText + "%')";
            query.outFields = [MY.idField, MY.compareField];

            queryTask.execute(query, function (results) {
                schoolResults = results.features;
                if (schoolResults.length > 0) {
                    if (schoolResults.length === 1) {
                        zoomToResult(0);
                        $('#find-school-msg').html('Found: ' + schoolResults[0].attributes[MY.compareField]);
                    } else {
                        var i, il, $msgDiv = $('#find-school-msg'),
                            $candList = $('<ul type="disc"></ul>'),
                            myCounty = "";
                        $msgDiv.html('<p>The following ' + MY.title + ' match your search:</p>');
                        $msgDiv.append($candList);
                        for (i = 0, il = schoolResults.length; i < il; i += 1) {
                            $candList.append('<li><a href="javascript:zoomToResult(' + i + ');">' + schoolResults[i].attributes[MY.compareField] + '</a></li>');
                        }
                    }
                } else {
                    $('#find-school-msg').html('Could not find any matches for "' + searchText + '".');
                }
            });
        }
    }
}

function zoomToResult(index) { 'use strict';
    locateGfx[geocodeMapIndex].clear();
    mapCount = geocodeMapIndex;
    maps[geocodeMapIndex].setExtent(schoolResults[index].geometry.getExtent().expand(1.2), true);
    locateGfx[geocodeMapIndex].add(new esri.Graphic(schoolResults[index].geometry,
                                 new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                                                                  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                                                  new dojo.Color([0, 0, 255]), 2), new dojo.Color([255, 255, 25, 0])),
                                 null, null));
}

function roundToDecimal(val, places) { 'use strict';
    var ret;
    
    
    if((val+"").indexOf('.') !== -1) {
        ret = parseFloat(Math.round(val * 100) / 100).toFixed(places);     
    } else {
        ret = val;
    }
    
    return ret;
}
