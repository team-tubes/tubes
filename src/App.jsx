import React, {useCallback, useState} from 'react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import {scaleThreshold} from 'd3-scale';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FlyToInterpolator } from 'deck.gl';
import { bbox } from 'turf'


// Source data GeoJSON
const DATA_URL =
  './suburbs.geojson'; // eslint-disable-line

const COLOR_SCALE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196, 1000],
    [127, 205, 187, 1000],
    [199, 233, 180, 1000],
    [237, 248, 177, 1000],
    // zero
    [255, 255, 204, 1000],
    [255, 237, 160, 1000],
    [254, 217, 118, 1000],
    [254, 178, 76, 1000],
    [253, 141, 60, 1000],
    [252, 78, 42, 1000],
    [227, 26, 28, 1000],
    [189, 0, 38, 1000],
    [128, 0, 38, 1000]
  ]);

const INITIAL_VIEW_STATE = {
  latitude: -36.8509,
  longitude: 174.7645,
  zoom: 11,
  maxZoom: 24,
  pitch: 45,
  bearing: 0
};



const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

const landCover = [
  [
    [-123.0, 49.196],
    [-123.0, 49.324],
    [-123.306, 49.324],
    [-123.306, 49.196]
  ]
];

var geojsonData = [];

fetch(DATA_URL)
.then((response) =>
{
  return response.json();
})
.then((json) =>
{
  geojsonData = json;
});

function App({data = DATA_URL, mapStyle = MAP_STYLE}) {
  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ambientLight, dirLight});
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)

  const goToSuburb = useCallback((lon, lat) => {
    setViewState({...viewState,
      longitude: lon,
      latitude: lat,
      zoom: 15.5,
      transitionInterpolator: new FlyToInterpolator({speed:0.1})
    })
  })

  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    }),
    new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 0.01,
      blendMode: 'overlay',
      stroked: false,
      filled: true,
      extruded: false,
      wireframe: false,
      getLineWidth: 3,
      onClick: f => {
        console.log(f.object.properties.name)
        let suburbBbox = bbox(f.object.geometry)
        // Calculate the center of the bounding box
        const centerLatitude = (suburbBbox[1] + suburbBbox[3]) / 2; // Average latitude
        const centerLongitude = (suburbBbox[0] + suburbBbox[2]) / 2; // Average longitude
        goToSuburb(centerLongitude, centerLatitude)
      },
      getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: f => COLOR_SCALE((Math.random() * 1.8) - 0.6),
      getLineColor: [255, 255, 255],
      pickable: true
    })
  ];

  const mapboxBuildingLayer = {
    id: "3d-buildings",
    source: "carto",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 0,
    paint: {
      "fill-extrusion-color": "rgb(245, 242, 235)",
      "fill-extrusion-opacity": 0.4,
      "fill-extrusion-height": ["get", "render_height"],
    },
  };
  
  return (
    <DeckGL
      layers={layers}
      effects={effects}
      initialViewState={viewState}
      controller={true}
    >
      <Map 
        reuseMaps 
        mapLib={maplibregl} 
        mapStyle={mapStyle} 
        preventStyleDiffing={true} 
        onLoad={(e) => {
          e.target.addLayer(mapboxBuildingLayer);
        }}
      />
    </DeckGL>
  );
}

export default App