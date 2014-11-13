// Services Provider.  Uncomment the line to provide services from the map server
// Note that the active line will need to be switched when you move code between the development and production servers
// Additional comments here
// varSerProv = "http://interact.regionalchange.ucdavis.edu" //Production Server
varSerProv = "http://crcdemo.caes.ucdavis.edu" //Development Server

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
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_8_Overall_v1/"),
        layerObs: [],
        defaultForMap: [0, 1],
        defaultLayerIndex: [0, 1]
    }, {
        name: "Education", 
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_1_Educ_v1/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Economy",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_2_Econ_v1/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Housing",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_3_Housing_v1/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Mobility",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_4_Mobility_v1/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Health",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_5_Health_v1/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Social-Political",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_6_SocialPolitical_v1/"),
        layerObs: [],
        defaultForMap: null,
        defaultLayerIndex: null
    }, {
        name: "Additional Data Layers",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_7_Other_v1/"),
        layerObs: [],
        defaultForMap: [2],
        defaultLayerIndex: [1]
    }, {
        name: "Other",
        url: varSerProv.concat("/arcgis/rest/services/ROI/Service_10_Other_v5/"),
        layerObs: [],
        defaultForMap: [],
        defaultLayerIndex: []
    }];

// format here is -- "z_index_field_name": "Related Layer's NAME in map service",
var zLayerLookup = {
    // people index
    "z_edppl_me": "Education Opportunity: People",
    "z_ecppl_me": "Economic Opportunity: People",
    "z_hsppl_me": "Housing Opportunity: People",
    "z_moppl_me": "Mobility/Transportation Opportunity: People",
    "z_enppl_me": "Health/Environment Opportunity: People",
    "z_soppl_me": "Civic Life Opportunity: People",
    "z_people_m": "Regional Opportunity Index: People",
    
    // places index
    "z_edplc_mean": "Education Opportunity: Place",
    "z_ecplc_mean": "Economic Opportunity: Place",
    "z_hsplc_mean": "Housing Opportunity: Place",
    "z_enplc_mean": "Health/Environment Opportunity: Place",
    "z_soplc_mean": "Civic Life Opportunity: Place",
    "z_place_mean": "Regional Opportunity Index: Place",
    
    // eduction people domain
    "z_postsec": "Education-People: College-Educated Adults, 2007-11 (%)",
    "z_prof_ela": "Education-People: English Proficiency, 2009-11 (%)",
    "z_prof_math": "Education-People: Math Proficiency, 2009-11 (%)",
    "z_truant": "Education-People: Elementary Truancy Rate, 2009-10 (%)",
    
    // eduction place domain
    "z_grad_rate": "Education-Place: High School Graduation Rate, 2009-11 (%)",
    "z_ucgrads": "Education-Place: UC/CSU Eligibility, 2009-11 (%)",
    "z_exp_ed": "Education-Place: Teacher Experience, 2009-11 (%)",
    "z_expsusp": "Education-Place: High School Discipline Rate, 2009-10 (%)",
    
    // econ people domain
    "z_emp": "Economy-People: Employment Rate, 2007-11 (%)",
    "z_above200fpl": "Economy-People: Minimum Basic Income, 2007-11 (%)",
    
    // econ place domain
    "z_jobs_pc5": "Economy-Place: Job Availability, 2011 (#)",
    "z_jobgr5": "Economy-Place: Job Growth, 2010-11 (%)",
    "z_hqjobrat": "Economy-Place: Job Quality, 2011 (%)",
    "z_banks_pc5": "Economy-Place: Bank Accessibility, 2013 (#)",
    "z_bizgr5": "Economy-Place: Business Growth, 2009-11 (%)",
    
    // housing people domain
    "z_ownhome": "Housing-People: Homeownership, 2007-11 (%)",
    "z_hsg30": "Housing-People: Housing Cost Burden, 2007-11 (%)",
    
    // housing place domain
    "z_occup1less": "Housing-Place: Housing Adequacy, 2007-11 (%)",
    "z_affhousing": "Housing-Place: Housing Affordability, 2007-11",
    
    // mobility people domain
    "z_vehicles": "Mobility/Trans-People: Vehicle Availability, 2007-11 (%)",
    "z_comm30": "Mobility/Trans-People: Commute Time, 2007-11 (%)",
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
    "z_englishwell": "Civic Life-People: English Speakers, 2007-11 (%)",
    
    // social/political place domain    
    "z_sameres": "Civic Life-Place: Neighborhood Stability, 2007-11 (%)",
    "z_citizen": "Civic Life-Place: US Citizenship, 2007-11 (%)"
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