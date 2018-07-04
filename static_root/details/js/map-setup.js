//Inititalizes the map for each record details page


var mapHandles = [];

function map_handler() {
    // for point editing maps
    ISSFGeometryField = L.GeometryField.extend({
        addTo: function (map) {
            mapHandles.push(map);
            L.GeometryField.prototype.addTo.call(this, map);
            map.setZoom(2);
            //map.setOptions({continuousWorld: false});
            //configureMap(map);
        }
        // See source to override more stuff...
    });

    //*************** Leaflet JS fix **************/
    //on map creation, remember to save a list of handles to map objects
    //for details pages
    $(".bt-edit").on('click', function () {
        invalidateMaps();
    });
    //for contribute page
    $(".tab-title>a").on('click', function () {
        invalidateMaps();
    });
    //for geog scope subform toggle
    $(".FormSetToggler li").on('click', function () {
        invalidateMaps();
    });
}

function invalidateMaps() {
    for (var i = 0; i < mapHandles.length; i++) {
        if (mapHandles[i]) {
            L.Util.requestAnimFrame(mapHandles[i].invalidateSize, mapHandles[i], !1, mapHandles[i]._container);
        }
    }
}

function map_init_basic_ext(map, options, dataurl, icon) {
    //without this the map will not load unless the accordion is already active when the page loads
    $('dd.accordion-navigation').on('mapReload', function () {
        invalidateMaps();
    });

    mapHandles.push(map);

    configureMap(map);

    // populate map with markers
    var markers = L.markerClusterGroup({
        spiderfyDistanceMultiplier: 2,
        maxClusterRadius: 30,
        iconCreateFunction: function (cluster) {
            var childCount = cluster.getChildCount();
            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: 'marker-cluster marker-cluster-large',
                iconSize: new L.Point(32, 32)
            });
        }
    });

    $.getJSON(dataurl, function (data) {
        for (var i = 0; i < data.features.length; i++) {
            mrk = L.marker([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]], {icon: icon});
            markers.addLayer(mrk);
        }
    });
    map.addLayer(markers);
    // hack: if you do this without a pause, getBounds returns invalid bounds because the underlying vectors are not initialized!
    setTimeout(function () {
        map.panTo(markers.getBounds().getCenter());
    }, 2000);
}

function configureMap(map) {
    // remove default layers
    map.eachLayer(function (Layer) {
        map.removeLayer(Layer)
    });

    // add history control
    new L.control.navbar().addTo(map);

    // custom TileLayer required for Bing
    var BingLayer = L.TileLayer.extend({
        getTileUrl: function (tilePoint) {
            this._adjustTilePoint(tilePoint);
            return L.Util.template(this._url, {
                s: this._getSubdomain(tilePoint),
                q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
            });
        },
        _quadKey: function (x, y, z) {
            var quadKey = [];
            for (var i = z; i > 0; i--) {
                var digit = '0';
                var mask = 1 << (i - 1);
                if ((x & mask) != 0) {
                    digit++;
                }
                if ((y & mask) != 0) {
                    digit++;
                    digit++;
                }
                quadKey.push(digit);
            }
            return quadKey.join('');
        }
    });

    // setup basemaps
    // var mqAttr = 'basemap data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, ' +
    //     '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>, ' +
    //     'basemap &copy; <a href="http://mapquest.com" target="_blank">MapQuest</a>';
    // var mqUrl = 'https://otile1-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png';
    // var mqOSM = L.tileLayer(mqUrl, {attribution: mqAttr, noWrap: true});
    // mqOSM.addTo(map);
    var mbAttr = 'basemap data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>, ' +
        'basemap &copy; <a href="http://mapbox.com" target="_blank">Mapbox</a>';
    var mbUrl = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';
    var mbGrayscale = L.tileLayer(mbUrl, {id: 'examples.map-20v6611k', attribution: mbAttr, noWrap: true});
    var mbNaturalEarth = L.tileLayer(mbUrl, {
        id: 'mapbox.natural-earth-hypso-bathy',
        attribution: mbAttr,
        noWrap: true
    });
    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttr = 'basemap data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors, ' +
        'basemap &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>';
    var osm = L.tileLayer(osmUrl, {attribution: osmAttr, noWrap: true});
    osm.addTo(map);
    var esriAttr = 'basemap &copy; <a href="http://esri.com" target="_blank">Esri</a>';
    var esriUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/{id}/MapServer/tile/{z}/{y}/{x}';
    var esriImagery = L.tileLayer(esriUrl, {id: 'World_Imagery', attribution: esriAttr, noWrap: true});
    var esriStreet = L.tileLayer(esriUrl, {id: 'World_Street_Map', attribution: esriAttr, noWrap: true});
    var esriOcean = L.tileLayer(esriUrl, {id: 'Ocean_Basemap', attribution: esriAttr, noWrap: true});
    var esriNatGeo = L.tileLayer(esriUrl, {id: 'NatGeo_World_Map', attribution: esriAttr, noWrap: true});
    var bingKey = 'Al1mXkJObbAqh8s8TkCwTnIYZOemobAiJZSVaPklNXPS_ErYDtPButHlPDJrznFf';
    var bingAttr = 'basemap &copy; <a href="http://bing.com/maps" target="_blank">Bing Maps</a>';
    var bingAerialUrl = 'https://t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1398&key=' + bingKey;
    var bingRoadsUrl = 'https://t{s}.tiles.virtualearth.net/tiles/r{q}.jpeg?g=1398&key=' + bingKey;
    var bingAerial = new BingLayer(bingAerialUrl, {
        subdomains: ['0', '1', '2', '3', '4'],
        attribution: bingAttr,
        noWrap: true
    });
    var bingRoads = new BingLayer(bingRoadsUrl, {
        subdomains: ['0', '1', '2', '3', '4'],
        attribution: bingAttr,
        noWrap: true
    });
    var baseLayers = {
        "OpenStreetMap": osm,
        // "MapQuest OSM": mqOSM,
        "Mapbox Grayscale": mbGrayscale,
        "Mapbox Natural Earth": mbNaturalEarth,

        "Esri Imagery": esriImagery,
        "Esri Street": esriStreet,
        "Esri Ocean": esriOcean,
        "Esri National Geographic": esriNatGeo,
        "Bing Aerial": bingAerial,
        "Bing Roads": bingRoads
    };
    var mrUrl = 'http://geo.vliz.be/geoserver/MarineRegions/wms';

    // setup overlay layers
    var mrAttr = 'marine regions &copy; <a href="http://Marineregions.org" target="_blank">Marineregions.org</a>';
    var mrEEZ = L.tileLayer.wms(mrUrl, {
        layers: 'MarineRegions:eez',
        attribution: mrAttr,
        format: 'image/png',
        transparent: true,
        noWrap: true
    });
    var mrLME = L.tileLayer.wms(mrUrl, {
        layers: 'MarineRegions:lme',
        attribution: mrAttr,
        format: 'image/png',
        transparent: true,
        noWrap: true
    });
    var mrFAO = L.tileLayer.wms(mrUrl, {
        layers: 'MarineRegions:fao',
        attribution: mrAttr,
        format: 'image/png',
        transparent: true,
        noWrap: true
    });
    var overlayLayers = {
        "Exclusive Economic Zones": mrEEZ,
        "Large Marine Ecosystems": mrLME,
        "FAO Fishing Areas": mrFAO
    };

    // add basemaps and overlays
    //L.control.layers(baseLayers, overlayLayers, {position: 'bottomleft'}).addTo(map);

    // add transparent tooltip markers for key geographic scopes
    var scopeIcon = new L.DivIcon({
        className: 'scope-icon', iconSize: [32, 32],
        opacity: 0
    });
    L.marker([-10, -10], {
        icon: scopeIcon, title: 'Global scope', zIndexOffset: 1000,
        clickable: true
    }).addTo(map);
    L.marker([-40, 65], {
        icon: scopeIcon, title: 'Geographic scope not specific',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([23, 23], {
        icon: scopeIcon, title: 'Regional scope - Africa',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([45, 90], {
        icon: scopeIcon, title: 'Regional scope - Asia',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([15, -70], {
        icon: scopeIcon, title: 'Regional scope - Caribbean',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([50, 15], {
        icon: scopeIcon, title: 'Regional scope - Europe',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([-21, -55], {
        icon: scopeIcon, title: 'Regional scope - Latin America',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([49, -111], {
        icon: scopeIcon, title: 'Regional scope - North America',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
    L.marker([-18, 154], {
        icon: scopeIcon, title: 'Regional scope - Oceania',
        zIndexOffset: 1000, clickable: true
    }).addTo(map);
}

//containerID is the name (automatically generated by Django) of the Leaflet widget that creates the point on the map
function getAddress(address, pointField, containerID, url) {

    var $form = $('<form action="' + url + '" method="post">');
    var $address1 = $('<input name="address1" type="text">');
    var $address2 = $('<input name="address2" type="text">');
    var $city_town = $('<input name="city_town" type="text">');
    var $prov_state = $('<input name="prov_state" type="text">');
    var $postal_code = $('<input name="postal_code" type="text">');
    var $country = $('<input name="country" type="text">');

    $address1.val(address.address1);
    $address2.val(address.address2);
    $city_town.val(address.city_town);
    $prov_state.val(address.prov_state);
    $postal_code.val(address.postal_code);
    $country.val(address.country);

    $form.append($address1);
    $form.append($address2);
    $form.append($city_town);
    $form.append($prov_state);
    $form.append($postal_code);
    $form.append($country);

    $form.ajaxSubmit(function (responsedata) {

        if (responsedata) {
            console.log("getAddress Response: " + responsedata);
            var latitude = responsedata.split(",")[1];
            var longitude = responsedata.split(",")[0];

            var map = null;
            for (var i = 0; i < mapHandles.length; i++) {
                if (mapHandles[i]) {
                    if (mapHandles[i]._container.id === containerID) {
                        map = mapHandles[i];
                        break;
                    }
                }
            }

            var markerFound = false;
            if (map) {
                for (var l in map._layers) {
                    if (map._layers[l]._icon) {
                        console.log("Has _icon prop.");
                        if (map._layers[l]._icon.className.indexOf("leaflet-marker-icon") >= 0) {
                            //map.removeLayer(map._layers[l]);
                            map._layers[l].setLatLng(L.latLng(latitude, longitude));
                            markerFound = true;
                            break;
                        }
                    }
                }
            }

            if (!markerFound) {
                L.marker(L.latLng(latitude, longitude)).addTo(map);
            }

            map.panTo(new L.LatLng(latitude, longitude));

            //Change underlying map coordinates
            $(pointField).val('{ "type": "Point", "coordinates": [' + longitude + ', ' + latitude + ' ] }');
        }
        else {
            alert("Address not found; please check your entries and try again.");
        }
    });
}