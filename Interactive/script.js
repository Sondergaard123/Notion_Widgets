/*
  Example: https://github.com/tombatossals/angular-leaflet-directive/blob/master/examples/0601-mixed-geojson-events-example.html
  Angular Leaflet Directive: https://github.com/tombatossals/angular-leaflet-directive
  Leaflet: https://github.com/Leaflet/Leaflet
*/

// Ää Öö Üü ß
// Kosovo: CS-KM, Somaliland, Northern Cyprus

// Title and icon only needed on CodePen
document.title = 'German Interactive Map';
var link = document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'shortcut icon';
link.href = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/93930/de-flag.ico';
document.getElementsByTagName('head')[0].appendChild(link);

angular.module("app", ["leaflet-directive"])
.controller('GermanMapCtrl', ["$scope", "$http", function($scope, $http) {
  $scope.showCenterCoords = false;
  $scope.countriesGeoJson = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/93930/countries.geo.json?v=11";
  $scope.countriesJson = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/93930/countries.json?v=11";
  // Events: https://github.com/tombatossals/angular-leaflet-directive/blob/master/src/services/events/leafletGeoJsonEvents.js
  $scope.$on("leafletDirectiveMap.geojsonMouseover", function(event, feature, leafletEvent) {
    countryMouseover(feature, leafletEvent);
  });
  $scope.$on("leafletDirectiveMap.geojsonClick", function(event, featureSelected, leafletEvent) {
    countryClick(featureSelected, leafletEvent);
  });
  var continentProperties = {
    "150": {
      name: 'Europe',
      colors: [ '#F00', '#C33', '#900', '#F33', '#F66' ]
    },
    "019": {
      name: 'America',
      colors: [ '#069', '#366', '#036', '#39C', '#69C' ]
    },
    "002": {
      name: 'Africa',
      colors: [ '#0C0', '#393', '#090', '#3F3', '#6F6' ]
    },
    "142": {
      name: 'Asia',
      colors: [ '#FC0', '#C93', '#990', '#FC3', '#FC6' ]
    },
    "009": {
      name: 'Oceania',
      colors: [ '#C06', '#936', '#906', '#C39', '#C69' ]
    }
  };
  angular.extend($scope, {
    center: {
      lat: 57.0168, // 40.8471
      lng: 15.6445, // 14.0625
      zoom: 1 // 2
    },
    legend: {
      colors: [ '#F00', '#069', '#0C0', '#FC0', '#C06' ],
      labels: [ 'Europe', 'America', 'Africa', 'Asia', 'Oceania' ]
    },
    defaults: {
      // Unlabeled Map
      // http://mc.bbbike.org/mc/?num=2&mt0=mapnik&mt1=mapquest-eu
      tileLayer: "http://{s}.tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png"
    }
  });
  function selectCountry(country, event, color, fillColor) {
    var layer = event.target;
    layer.setStyle({
      weight: 2,
      color: color,
      fillColor: fillColor
    });
    layer.bringToFront();
  }
  // Click function, called from the Leaflet Map Events
  function countryClick(country, event) {
    selectCountry(country, event, '#444', '#fff');
    $scope.selectedCountry = country;
    $scope.selectedCountryData = $scope.countries[country.id];
    console.log("click: ", country.properties.name);
    console.log($scope.selectedCountryData);
  }
  // Mouse over function, called from the Leaflet Map Events
  function countryMouseover(country, event) {
    selectCountry(country, event, '#666', '#ddd');
  }
  // Get a country paint color from the continents array of colors
  function getColor(country) {
    if (!country || !country["region-code"]) {
      return "#FFF";
    }
    var colors = continentProperties[country["region-code"]].colors;
    var index = country["alpha-3"].charCodeAt(0) % colors.length;
    return colors[index];
  }
  function style(country) {
    return {
      fillColor: getColor($scope.countries[country.id]),
      weight: 1, // 2
      opacity: 1,
      color: 'White',
      //dashArray: '0', // '3'
      fillOpacity: 0.7
    };
  }
  // Get the countries data from a JSON
  //$http.get("json/all.json").success(function(data, status) {
  $http.get($scope.countriesJson).success(function(data, status) {
    // Put the countries on an associative array
    $scope.countries = {};
    for (var i = 0; i < data.length; i++) {
      var country = data[i],
          id = country['alpha-3'];
      country['alpha-3'] = country['alpha-3'].replace('_', '');
      country.flag = (function(name) {
        if (name == null) { return ''; }
        if (name.indexOf('_') != -1) { return name; }
        return name.toLowerCase();
      })(country['alpha-2']);
      $scope.countries[id] = country;
    }
    // Get the countries geojson data from a JSON
    //$http.get("json/countries.geo.json").success(function(data, status) {
    $http.get($scope.countriesGeoJson).success(function(data, status) {
      angular.extend($scope, {
        geojson: {
          data: data,
          style: style,
          resetStyleOnMouseout: true
        },
        selectedCountry: {},
        selectedCountryData: {}
      });
      for (var item in data) {
        if (!$scope.countries[data[item].id]) {
          console.log(data[item]);
        }
      }
    });
  });
}]);
