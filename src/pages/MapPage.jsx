import {
  AmbientLight,
  LightingEffect,
  _SunLight as SunLight,
} from "@deck.gl/core";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { scaleThreshold } from "d3-scale";
import "mapbox-gl/dist/mapbox-gl.css";
import maplibregl from "maplibre-gl";
import React, { useEffect, useState } from "react";
import { Map } from "react-map-gl";
import chorus_data from "../InternetLayer";
import MapToolTip from "../components/MapToolTip";
import Modal from "../components/Modal";
import {loadSuburbsAndLocalities } from '../data_parsers/SuburbsLocalities'
import {getAirQuality, setAirQualityData} from '../data_parsers/AirQuality'

// Source data GeoJSON
const DATA_URL = "./Water_Hydrant.geojson"; // eslint-disable-line
const AIR_QUALITY_DATA_URL = './Air_Quality.geojson';

const COLOR_SCALE = scaleThreshold()
  .domain([
    -0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2,
  ])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38],
  ]);

const INITIAL_VIEW_STATE = {
  latitude: -36.8509,
  longitude: 174.7645,
  zoom: 11,
  maxZoom: 24,
  pitch: 45,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true,
});

const landCover = [
  [
    [-123.0, 49.196],
    [-123.0, 49.324],
    [-123.306, 49.324],
    [-123.306, 49.196],
  ],
];


// Fetch air quality data once.
fetch(AIR_QUALITY_DATA_URL)
.then((response) => {
	return response.json();
})
.then((json) => {
	setAirQualityData(json);
});


export default function MapPage({ data = DATA_URL, mapStyle = MAP_STYLE }) {
  const [internetData, setInternetData] = useState();

  useEffect(() => {
    const asyncFn = async () => {
      const internet_geometry_data = await chorus_data();
      setInternetData({
        type: "FeatureCollection",
        name: "Internet Layer",
        crs: {
          properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
          type: "name",
        },
        features: internet_geometry_data,
      });
    };
    asyncFn();
  }, []);

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    new PolygonLayer({
      id: "ground",
      data: landCover,
      stroked: false,
      getPolygon: (f) => f,
      getFillColor: [0, 0, 0, 0],
    }),
    new GeoJsonLayer({
      id: "geojson",
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: (f) => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: (f) => COLOR_SCALE(f.properties.growth),
      getLineColor: [255, 255, 255],
      pickable: true,
    }),
    new GeoJsonLayer({
      id: "geojson2",
      data: internetData,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: (f) => 0,
      getFillColor: [255, 255, 255],
      getLineColor: [255, 255, 255],
      pickable: true,
    }),
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
	<>
	<Modal/>
    <DeckGL
      layers={layers}
      effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={() => MapToolTip()}
      onHover={(info, event) =>
        {
          if(info === undefined || info.coordinate === undefined)
            return;
  
          let coordinates = info.coordinate;
          getAirQuality(coordinates[0], coordinates[1])
        }}
    >
      <Map
        reuseMaps
        mapLib={maplibregl}
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        onLoad={(e) => {
          e.target.addLayer(mapboxBuildingLayer);
          loadSuburbsAndLocalities(e.target);
        }}
      />
    </DeckGL></>
  );
}
