function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var suburbData = {};

export function loadSuburbsAndLocalitiesLayerAsync(map) {
  fetch("./SuburbBorders.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const layerSourceName = `suburbslocalities1`;

      // add layer to map
      map.addSource(layerSourceName, {
        type: "geojson",
        data: data,
      });

      // Fill
      map.addLayer({
        id: layerSourceName + "fill",
        type: "fill",
        source: layerSourceName,
        layout: {},
        paint: {
          "fill-color": getRandomColor(),
          "fill-opacity": 0.7,
        },
      });

      // Outline
      map.addLayer({
        id: layerSourceName + "outline",
        type: "line",
        source: layerSourceName,
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });

      suburbData = data;

      /*
         * Each suburb can be individually rendered and customized, very performance heavy tho.
         data.features.forEach((feature) =>
         {
             const suburbName = feature.properties.name;
             const layerSourceName = `suburbslocalities${suburbName}${i++}`;
 
         });
         */
    });

  /*
    fetch('./SuburbBorders2.geojson')
    .then((response) =>
    {
      return response.json();
    })
    .then((data) =>
    {  
        const layerSourceName = `suburbslocalities2`;
    
        // add layer to map
        map.addSource(layerSourceName,
        {
          'type': 'geojson',
          'data': data
        });
    
        // Fill
         map.addLayer({
          'id': layerSourceName + 'fill',
          'type': 'fill',
          'source': layerSourceName,
          'layout': {},
          'paint': {
            'fill-color': getRandomColor(),
            'fill-opacity': 0.05
          }
        });
    
        // Outline
        map.addLayer({
          'id': layerSourceName + 'outline',
          'type': 'line',
          'source': layerSourceName,
          'layout': {},
          'paint': {
            'line-color': '#000',
            'line-width': 1
          }
        });

        data.features.forEach((feature) =>
        {
          suburbData.features.push(feature);
        })

        /*
        * Each suburb can be individually rendered and customized, very performance heavy tho.
        data.features.forEach((feature) =>
        {
            const suburbName = feature.properties.name;
            const layerSourceName = `suburbslocalities${suburbName}${i++}`;

        });
        */
  //});
}

export function loadSuburbsAndLocalities(map) {
  loadSuburbsAndLocalitiesLayerAsync(map);
}

function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

  let x = point[0],
    y = point[1];

  let inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0],
      yi = vs[i][1];
    let xj = vs[j][0],
      yj = vs[j][1];

    let intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function getSuburbAt(longitude, latitude) {
  if (suburbData === undefined || suburbData.features === undefined) {
    return {
      name: "Loading",
      data: {},
    };
  }

  // Check if inside
  let features = suburbData.features;
  for (let featureIndex in features) {
    let feature = features[featureIndex];

    if (feature.geometry === undefined) continue;

    let geometry = feature.geometry;
    let coordinates = geometry.coordinates;

    if (coordinates === undefined || coordinates.length == 0) continue;

    let coordinates0 = coordinates[0];

    if (coordinates0 === undefined || coordinates0.length == 0) continue;

    if (inside([longitude, latitude], coordinates0)) {
      return {
        name: feature.properties.name,
        data: feature,
      };
    }
  }

  return {
    name: "Nothing",
    data: {},
  };
}

export default {
  loadSuburbsAndLocalities,
  loadSuburbsAndLocalitiesLayerAsync,
  getSuburbAt,
};
