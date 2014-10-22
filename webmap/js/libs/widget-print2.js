vgis.namespace("widget.print");

vgis.widget.print = function (params) {
    'use strict';
    
    var printDijit,
        $parentDiv;

    params = params || {
        map: {},
        divToAttachTo: "",
        customTitle: VIEWER_TITLE,
        legendLayers: []
        
    };

    function start() {
        $parentDiv = $("#" + params.divToAttachTo).parent();
        // get print templates from the export web map task
        var printInfo = esri.request({
            "url": PRINT_URL,
            "content": { "f": "json" }
        });
        printInfo.then(handlePrintInfo, handleError);
    }

    function end() {
        printDijit.destroy(); // this destroys the divToAttachTo
        $parentDiv.append("<div id='" + params.divToAttachTo + "' style='text-align:center;'></div>");
    }

    function handlePrintInfo(resp) {
        var layoutTemplate, templateNames, templateLabels, mapOnlyIndex, templates, f, r, re;

        layoutTemplate = dojo.filter(resp.parameters, function (param, idx) {
            return param.name === "Layout_Template";
        });

        if (layoutTemplate.length === 0) {
            console.log("print service parameters name for templates must be \"Layout_Template\"");
            return;
        }
        templateNames = layoutTemplate[0].choiceList;
        templateLabels = dojo.clone(layoutTemplate[0].choiceList);
		
        //make user friendly names
        f = ["A3 Portrait", "A3 Landscape", "A4 Portrait", "A4 Landscape", "Letter ANSI A Portrait", "Letter ANSI A Landscape", "Tabloid ANSI B Portrait", "Tabloid ANSI B Landscape", "MAP_ONLY"];
        r = ["A3 Portrait - 11.69 x 16.54 (in)", "A3 Landscape - 16.54 x 11.69 (in)", "A4 Portrait - 8.3 x 11.7 (in)", "A4 Landscape - 11.7 x 8.3 (in)", "ANSI A Portrait - 8.5 x 11 (in)", "ANSI A Landscape 11 x 8.5 (in)", "ANSI B Portrait 11 x 17 (in)", "ANSI B Landscape 17 x 11 (in)", "Map Image (No Text) 8.3 x 11.46 (in)"];

        re = $.map(f, function (v, i) {
            return new RegExp('\\b' + v + '\\b', 'g');
        });

        //jQuery('#colCenterAddress').val(function (i, val) {
        $.each(templateLabels, function (i, val) {
            $.each(f, function (j, v) {
                val = val.replace(re[j], r[j]);
            });
            templateLabels[i] = val;
        });

        // create a print template for each choice
        templates = dojo.map(templateNames, function (ch, index) {
            var plate = new esri.tasks.PrintTemplate();
            plate.layout = ch;
            plate.label = templateLabels[index];
            plate.format = "PDF";
            plate.layoutOptions = {
                "authorText": VIEWER_TITLE,
                "copyrightText": "copyright test",
                "legendLayers": params.legendLayers,
                "titleText": params.customTitle,
                "scalebarUnit": "Miles"
            };
            return plate;
        });

        // create the print dijit
        printDijit = new esri.dijit.Print({
            map: maps[printMapIndex],
            templates: templates,
            url: PRINT_URL
        }, dojo.byId(params.divToAttachTo));
        printDijit.startup();
    }

    function handleError(err) {
        console.log("Printer failed: ", err);
    }

    return {
        start: start,
        end: end
    };
};
