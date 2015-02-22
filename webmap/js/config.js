/* Configuration file for the ROI webmap
    Copyright (C) 2015  Center for Regional Change, University of California, Davis

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
	
// Services Provider.  Uncomment the line to provide services from the map server
// Note that the active line will need to be switched when you move code between the development and production servers
// Additional comments here

// Production/Development switch.
var isProd = false; // Set to false to run the development site

if (isProd == false) {
	varSerProv = "http://crcdemo.caes.ucdavis.edu"; //Development Server
} else {
	varSerProv = "http://interact.regionalchange.ucdavis.edu" //Production Server;
};


// Location of the geocode service
var GEOCODE_URL = "http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer";

// Location of the print service
//var PRINT_URL = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
//var PRINT_URL = "http://mapserver.vestra.com/arcgis/rest/services/UCDavis/UCDPrintService/GPServer/Export%20Web%20Map";
//var PRINT_URL = "http://169.237.124.179/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
var PRINT_URL = varSerProv.concat("/arcgis/rest/services/ROI/ExportWebMap/GPServer/Export%20Web%20Map");

// For fixing an issue with the ESRI print return. 
// The first array element is your internal server address. The second is the external address to replace it with.
// Set this equal to null if no replacement is necessary --> var PRINT_PROXY_REPLACE = null;
//var PRINT_PROXY_REPLACE = ['vags101a', 'mapserver.vestra.com'];
var PRINT_PROXY_REPLACE = null;

var PROXY_PAGE = "/agsproxy/proxy.ashx";

// Titles that will display in various parts of the application
var VIEWER_TITLE = "Regional Opportunity Index Map";

// Default extent that the viewer will open to
var CA_EXTENT_JSON = { "xmin": -13793000, "ymin": 3686700, "xmax": -12800000, "ymax": 5300000, "spatialReference": { "wkid": 102100 } };

// Basemaps to be available.  First in the list is the default on viewer load.
var BASEMAPS = [{
        name: "Streets",
        url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
    }, {
        name: "Terrain",
        url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
    }, {
        name: "Aerial",
        url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    }, {
        name: "Grey Canvas",
        url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
    }];

// Operational maps for each of the 3 "tabs".
var OP_MAPS = [{
        name: "Map One",
        svcIndex: -1,
        lyrIndex: -1,
        lastSvcIndex: -1,
        lastLyrIndex: -1,
        selectedGraphics: {}
    }, {
        name: "Map Two",
        svcIndex: -1,
        lyrIndex: -1,
        lastSvcIndex: -1,
        lastLyrIndex: -1,
        selectedGraphics: {}
    }, {
        name: "Map Three",
        svcIndex: -1,
        lyrIndex: -1,
        lastSvcIndex: -1,
        lastLyrIndex: -1,
        selectedGraphics: {}
    }];
    
var SERVICES = [{
        name: "ROI Indices",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Overall_State/"),
        layerObs: [],
        defaultForMap: [0, 1],
        defaultLayerIndex: [0, 1]
    }, {
        name: "Education", 
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Educ_State/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Economy",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Econ_State/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Housing",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Housing_State/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Mobility",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Mobility_State/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Health",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Health_State/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Social-Political",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Civic_State/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Additional Data Layers",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Demog_State/"),
        layerObs: [],
        defaultForMap: [2],
        defaultLayerIndex: [1]
    }, {
        name: "Other",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/Other_State/"),
        layerObs: [],
        defaultForMap: [],
        defaultLayerIndex: []
    }, {
        name: "CalEnviroScreen",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/CES_State/"),
        layerObs: [],
        defaultForMap: [],
        defaultLayerIndex: []
    },{
        name: "Putting Youth on the Map",
        url: varSerProv.concat("/arcgis/rest/services/CA_ROI/PYOM_State/"),
        layerObs: [],
        defaultForMap: [],
        defaultLayerIndex: []
    }
	];

// format here is -- "z_index_field_name": "Related Layer's NAME in map service",
var zLayerLookup = {
    // people index
    "z_edppl_mean": "Education Opportunity: People",
    "z_ecppl_mean": "Economic Opportunity: People",
    "z_hsppl_mean": "Housing Opportunity: People",
    "z_moppl_mean": "Mobility/Transportation Opportunity: People",
    "z_enppl_mean": "Health/Environment Opportunity: People",
    "z_soppl_mean": "Civic Life Opportunity: People",
    "z_people_m": "Regional Opportunity Index: People",
    
    // places index
    "z_edplc_mean": "Education Opportunity: Place",
    "z_ecplc_mean": "Economic Opportunity: Place",
    "z_hsplc_mean": "Housing Opportunity: Place",
    "z_enplc_mean": "Health/Environment Opportunity: Place",
    "z_soplc_mean": "Civic Life Opportunity: Place",
    "z_place_mean": "Regional Opportunity Index: Place",
    
    // eduction people domain
    "z_postsec": "Education-People: College-Educated Adults, 2008-12 (%)",
    "z_prof_ela": "Education-People: English Proficiency, 2009-11 (%)",
    "z_prof_math": "Education-People: Math Proficiency, 2009-11 (%)",
    "z_truant": "Education-People: Elementary Truancy Rate, 2009-10 (%)",
    
    // eduction place domain
    "z_grad_rate": "Education-Place: High School Graduation Rate, 2009-11 (%)",
    "z_ucgrads": "Education-Place: UC/CSU Eligibility, 2009-11 (%)",
    "z_exp_ed": "Education-Place: Teacher Experience, 2009-11 (%)",
    "z_expsusp": "Education-Place: High School Discipline Rate, 2009-10 (%)",
    
    // econ people domain
    "z_emp": "Economy-People: Employment Rate, 2008-12 (%)",
    "z_above200fpl": "Economy-People: Minimum Basic Income, 2008-12 (%)",
    
    // econ place domain
    "z_jobs_pc5": "Economy-Place: Job Availability, 2011 (#)",
    "z_jobgr5": "Economy-Place: Job Growth, 2010-11 (%)",
    "z_hqjobrat": "Economy-Place: Job Quality, 2011 (%)",
    "z_banks_pc5": "Economy-Place: Bank Accessibility, 2013 (#)",
    "z_bizgr5": "Economy-Place: Business Growth, 2009-11 (%)",
    
    // housing people domain
    "z_ownhome": "Housing-People: Homeownership, 2008-12 (%)",
    "z_hsg30": "Housing-People: Housing Cost Burden, 2008-12 (%)",
    
    // housing place domain
    "z_occup1less": "Housing-Place: Housing Adequacy, 2008-12 (%)",
    "z_affhousing": "Housing-Place: Housing Affordability, 2008-12",
    
    // mobility people domain
    "z_vehicles": "Mobility/Trans-People: Vehicle Availability, 2008-12 (%)",
    "z_comm30": "Mobility/Trans-People: Commute Time, 2008-12 (%)",
    "z_hsi_rfc": "Mobility/Trans-People: Internet Access, 2013 (#)",
    
    // health/env people domain
    "z_hlthwt": "Health/Env-People: Infant Heath, 2009-11 (%)",    
    "z_teenb": "Health/Env-People: Births to Teens, 2009-11 (%)",
    "z_ypll_rate": "Health/Env-People: Years of Life Lost, 2009-11",
    
    // health/env place domain    
    "z_pncare": "Health/Env-Place: Prenatal Care, 2009-11 (%)",
    "z_foodaccess": "Health/Env-Place: Access to Supermarket, 2010 (%)",
    "z_hcprov_pc5": "Health/Env-Place: Health Care Availability, 2011 (#)",
    "z_pm25": "Health/Env-Place: Air Quality, 2007-09 (PM2.5)",
    
    // social/political people domain
    "z_voted10": "Civic Life-People: Voting Rates, 2010 (%)",
    "z_englishwell": "Civic Life-People: English Speakers, 2008-12 (%)",
    
    // social/political place domain    
    "z_sameres": "Civic Life-Place: Neighborhood Stability, 2008-12 (%)",
    "z_citizen": "Civic Life-Place: US Citizenship, 2008-12 (%)"
};

var SEARCH_SVC = varSerProv.concat("/arcgis/rest/services/ROI/Service_9_boundaries_v4/");
var SEARCH = [{
        title: "School Districts",
        index: 4,
        idField: "OBJECTID",
        compareField: "NAME10",
        filter: false
    },{
        title: "California Counties",
        index: 2,
        idField: "OBJECTID",
        compareField: "CntyNm",
        filter: false
    },{
        title: "Census Tracts",
        index: 3,
        idField: "OBJECTID",
        compareField: "GEOID10",
        filter: false
    },{
        title: "Cities and Census Designated Places",
        index: 1,
        idField: "OBJECTID",
        compareField: "NAME",
        filter: false
    },{
        title: "State Assembly",
        index: 5,
        idField: "OBJECTID",
        compareField: "AssemblyNa",
        filter: false
    },{
        title: "US Congressional",
        index: 6,
        idField: "OBJECTID",
        compareField: "CongrName",
        filter: false
    },{
        title: "State Senate",
        index: 7,
        idField: "OBJECTID",
        compareField: "SenateName",
        filter: false
    }];

var vgis = {
    /**
    * Using a namespace() method on your one global allows the assumption
    * that the namespace exists. That way, each file can call namespace() first to declare
    * the namespace the developers are using, knowing that they won't destroy the name-
    * space if it already exists. This approach also frees developers from the task of
    * checking to see whether the namespace exists before using. 
    * @param {string} ns The new namespace to add, e.g. "vgis.widget.basemap"
    * @returns {object} The newly created namespace.
    * @static
    */
    namespace: function (ns) {
        var parts = ns.split("."),
            object = this,
            i, len;
        for (i = 0, len = parts.length; i < len; i += 1) {
            if (!object[parts[i]]) {
                object[parts[i]] = {};
            }
            object = object[parts[i]];
        }
        return object;
    }
};