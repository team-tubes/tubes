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
import {WebMercatorViewport} from '@deck.gl/core';
import {intersect, booleanPointInPolygon, booleanIntersects, polygon, point, bboxPolygon, lineString,  buffer, getCoord, destination} from '@turf/turf'
import axios from 'axios'
import { IconLayer } from "deck.gl";
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {OBJLoader} from '@loaders.gl/obj';
import {_GeoJSONLoader} from '@loaders.gl/json';
import {load} from '@loaders.gl/core';

// Source data GeoJSON
const DATA_URL = "./Water_Hydrant.geojson"; // eslint-disable-line

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

const getFeatures = async () => {
	const bbox = [
		174.74103163875924,
		-36.86561176914162,
		174.78514718230426,
		-36.83101520970452
	];
	const geojson = await axios.get("Water_Pipe.geojson")
	const filtered = {...geojson.data, features: geojson.data.features.filter(feature => {
		if (feature.geometry.type === "Point") {
			return booleanPointInPolygon(point(feature.geometry.coordinates), bboxPolygon(bbox));
		} else if (feature.geometry.type === "Polygon" || feature.type === "MultiPolygon") {
			return booleanIntersects(polygon(feature.geometry.coordinates), bboxPolygon(bbox))
		} else if (feature.geometry.type === "LineString") {
			return booleanIntersects(lineString(feature.geometry.coordinates), bboxPolygon(bbox))

		}
		return false
	})
}
	console.log(filtered.features)
}


// getFeatures()

function normalizeVector(vector) {
	const magnitude = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
	return [vector[0] / magnitude, vector[1] / magnitude];
  }

export default function MapPage({ data = DATA_URL, mapStyle = MAP_STYLE }) {
  const [internetData, setInternetData] = useState();
  const [hydrantData, setHydrantData] = useState()
  const [waterPipeData, setWaterPipeData] = useState()

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
		const wpData =await load("Water_Pipe_Central.geojson", _GeoJSONLoader);
		console.log(wpData)
		setWaterPipeData({...(wpData), features: wpData.features.map(feature => buffer(feature, (feature.properties.NOM_DIA_MM || 10) * 5, {units: "millimeters"})).filter(f => !!f)})
	})()
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
	new SimpleMeshLayer({
		id: 'fire-hydrant-layer',
		data: hydrantData?.features || [],
		loaders: [OBJLoader, _GeoJSONLoader],
		getColor: d => [255, 0, 0, 255],
		getOrientation: d => [0, 0, 80],
		getPosition: d => { return d.geometry.coordinates},
		mesh: 'fire-hydrant.obj',
		sizeScale: 0.1,
		
		}),
	
	new GeoJsonLayer({
		id: "geojson3",
		data: waterPipeData?.features || [],
		extruded: true,
		getFillColor: [135,206,235, 200],
		getLineColor: [135,206,235],
		pickable: true,
		stroked: false,
		filled: true,
		getElevation: (f) => f.properties.NOM_DIA_MM / 100,
		// getLineWidth: (f) => f.properties.NOM_DIA_MM * 10 ,

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
	{/* <Modal/> */}
    <DeckGL
      layers={layers}
      effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={() => MapToolTip()}
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
    </DeckGL></>
  );
}
