import {
  AmbientLight,
  LightingEffect,
  _SunLight as SunLight,
} from "@deck.gl/core";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { scaleThreshold } from "d3-scale";
import maplibregl from "maplibre-gl";
import React, { useEffect, useState } from "react";
import { Map, useControl, NavigationControl } from "react-map-gl";
import MapToolTip from "../components/MapToolTip";
import Modal from "../components/Modal";
import {WebMercatorViewport} from '@deck.gl/core';
import {intersect, booleanPointInPolygon, booleanIntersects, polygon, point, bboxPolygon, lineString,  buffer, getCoord, destination} from '@turf/turf'
import axios from 'axios'
import { IconLayer } from "deck.gl";
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {_GeoJSONLoader} from '@loaders.gl/json';
import {load} from '@loaders.gl/core';
import {loadSuburbsAndLocalities } from '../data_parsers/SuburbsLocalities'
import {getAirQuality, setAirQualityData} from '../data_parsers/AirQuality'
import chorus_data from "../layers/InternetLayer";
import { get_auckland_council_water_outages } from "../layers/WaterLayer";
import WaterOutageMarkers from "../layers/WaterOutageMarkers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { WaterPipeLayer } from "../layers/WaterPipeLayer";
import { FireHydrantLayer } from "../layers/FireHydrantLayer";

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

export function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function MapPage({ data = DATA_URL, mapStyle = MAP_STYLE }) {
  const [internetData, setInternetData] = useState();
  const [waterOutageData, setWaterOutageData] = useState([]);
  const [hydrantData, setHydrantData] = useState()
  
  useEffect(() => {
    get_auckland_council_water_outages().then((data) =>
      setWaterOutageData(data)
    );
  }, []);

//   useEffect(() => {
// 	console.log(getFeatures())
//   }, [])
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

	(async () => {
		const data = await load("Water_Hydrant_Central.geojson", _GeoJSONLoader)
		setHydrantData(data);
	})()
  }, []);

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ ambientLight, dirLight });
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });
  

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
    <div className="w-full h-full">
      <Map
        style={{ width: "100vw", height: "100vh" }}
        initialViewState={INITIAL_VIEW_STATE}
        reuseMaps
        mapboxAccessToken="pk.eyJ1Ijoic3NuZXZlcmEiLCJhIjoiY2xsaHB4c3JoMWM2ZDNkcGtzOXJyemE4dCJ9.1OH8vr4265s8adq2s3fCuA"
        mapLib={maplibregl}
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        onLoad={(e) => {
          e.target.addLayer(mapboxBuildingLayer);
          loadSuburbsAndLocalities(e.target);
        }}
      >
        <DeckGLOverlay
          layers={[
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
			
          ]}
        />

      	<WaterPipeLayer />
		<FireHydrantLayer />
        <DeckGLOverlay
          layers={[
            new PolygonLayer({
              id: "ground",
              data: landCover,
              stroked: false,
              getPolygon: (f) => f,
              getFillColor: [0, 0, 0, 0],
            }),
          ]}
        />

        <WaterOutageMarkers outage_data={waterOutageData} />
        <NavigationControl />
      </Map>
    </div>
  );
}
