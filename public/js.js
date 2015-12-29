var marker_data
var maps_data = {}
var chapters = {}
var features_data = [] // for markers

// create map
mapboxgl.accessToken = 'pk.eyJ1IjoibWlyYWpyIiwiYSI6ImNpaW5zZno4NDAxZXN0cGtwaG00YXR0dm0ifQ.yn876ryJaHQ_WeAfsMhKgA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v8',
    center: [-122.163881, 37.425917],
    zoom: 15.5,
    bearing: 27,
    pitch: 45
});

// when the map is done loading, make the ajax call to the json
map.on('style.load', function () {
    $.ajax({
        type: 'GET',
        url: 'maps_data.json',
        data: { get_param: 'value'},
        dataType: 'json',
        complete: function(data){
            marker_data = data;
        }
    });
});

// parse JSON data only after the map's style has loaded
$(document).ajaxComplete(function(){            
    marker_data = $.parseJSON(marker_data.responseText)
    maps_data = marker_data[0].maps_data
    for (i = 0; i < maps_data.length; i++) {
        append_to_features(i)
    }

    // create the lefthand pane info
    create_chapters();

    //create markers for map
    create_map_features();

    map.addSource("markers", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features_data
        }
    });
    map.addLayer({
        "id": "markers",
        "type": "symbol",
        "source": "markers",
        "layout": {
            "icon-image": "{marker-symbol}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        },
        "paint": {
            "text-size": 12,
        }
    });
});


//create info for markers
function create_map_features() {
    for (i = 0; i < maps_data.length; i++) { 
        features_data[i] = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [maps_data[i].lng, maps_data[i].lat]
            },
            "properties": {
                "title": maps_data[i].caption,
                "marker-color": "#63b6e5",
                "marker-symbol": "star",
                "marker-size": "large"
            }
        }
    }
}

// add individual element of JSON data to pane on left
function append_to_features(i) {
    $('#features').append("<section id=" + maps_data[i].title + "><i><h4 id='date'>" + maps_data[i].time + "</h4></i><h2>" + maps_data[i].caption + "</h2><h3>" + maps_data[i].location_message + "</h3><img class='the_img' src=" + maps_data[i].url + "><p>" + maps_data[i].message + "</p></section>")
}

// define map behavior for each chapter
function create_chapters() {
    for (i = 0; i < maps_data.length; i++) { 
        chapters[maps_data[i].title] = {
            // bearing: maps_data[i].bearing,
            bearing: random_bearing(),
            center: [maps_data[i].lng, maps_data[i].lat],
            zoom: random_zoom(),
            pitch: random_pitch()
            // zoom: maps_data[i].zoom,
            // pitch: maps_data[i].pitch
        }
    }
}

// On every scroll event, check which element is on screen
window.onscroll = function() {
    var chapterNames = Object.keys(chapters);
    for (var i = 0; i < chapterNames.length; i++) {
        var chapterName = chapterNames[i];
        if (isElementOnScreen(chapterName)) {
            setActiveChapter(chapterName);
            break;
        }
    }
};

// 'toyon' hardcoded -- todo: update this function to be called once json data has been parsed
var activeChapterName = 'toyon';
function setActiveChapter(chapterName) {
    if (chapterName === activeChapterName) return;

    map.flyTo(chapters[chapterName]);

    document.getElementById(chapterName).setAttribute('class', 'active');
    document.getElementById(activeChapterName).setAttribute('class', '');

    activeChapterName = chapterName;
}

function isElementOnScreen(id) {
    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
}

/* Functions for random camera angles */

function random_bearing() {
    var bearing_options = [0, 45, 90, 135, 180, 225, 270, 315];
    return bearing_options[Math.floor(Math.random() * bearing_options.length)];
}

function random_zoom() {
    var zoom_options = [14.5, 15.0, 15.5, 16];
    return zoom_options[Math.floor(Math.random() * zoom_options.length)];
}

function random_pitch() {
    var pitch_options = [20, 25, 30, 40, 50, 60];
    return pitch_options[Math.floor(Math.random() * pitch_options.length)];
}