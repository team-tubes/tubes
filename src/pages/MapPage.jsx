import {
  AmbientLight,
  LightingEffect,
  _SunLight as SunLight,
} from "@deck.gl/core";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers";

import { scaleThreshold } from "d3-scale";
import maplibregl from "maplibre-gl";
import { useEffect, useState } from "react";
import { Map, useControl, NavigationControl } from "react-map-gl";

import chorus_data from "../layers/InternetLayer";
import { get_auckland_council_water_outages } from "../layers/WaterLayer";
import WaterOutageMarkers from "../layers/WaterOutageMarkers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { getAirQuality } from "../data_parsers/AirQuality";

// Source data GeoJSON
const DATA_URL = "./Water_Hydrant.geojson"; // eslint-disable-line
const AIR_QUALITY_DATA_URL = "./Air_Quality.geojson";

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

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColor() {
  return [
    randomIntFromInterval(0, 180),
    randomIntFromInterval(0, 0),
    randomIntFromInterval(0, 255),
  ];
}

// Fetch air quality data once.

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function MapPage({ data = DATA_URL, mapStyle = MAP_STYLE }) {
  const [internetData, setInternetData] = useState();
  const [waterOutageData, setWaterOutageData] = useState([]);
  const [suburbData, setSuburbData] = useState();
  const [airQualityData, setAirQualityData] = useState();
  useEffect(() => {
    get_auckland_council_water_outages().then((data) =>
      setWaterOutageData(data)
    );
    fetch("./SuburbBorders.geojson")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setSuburbData(data);
      });

    fetch(AIR_QUALITY_DATA_URL)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log({ data });
        setAirQualityData(data);
      });
  }, []);

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

        <DeckGLOverlay
          layers={[
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
          ]}
        />

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
        {airQualityData && (
          <DeckGLOverlay
            layers={[
              new GeoJsonLayer({
                id: "suburbGeo",
                data: suburbData,
                opacity: 0.1,
                stroked: true,
                filled: true,
                extruded: false,
                wireframe: false,
                getElevation: (f) => 0,
                getFillColor: (d) => {
                  const sumLatLng = d.geometry.coordinates[0].reduce(
                    (acc, curr) => ({
                      lng: acc.lng + curr[0],
                      lat: acc.lat + curr[1],
                    }),
                    { lng: 0, lat: 0 }
                  );
                  const avgLatLng = {
                    lat: sumLatLng.lat / d.geometry.coordinates[0].length,
                    lng: sumLatLng.lng / d.geometry.coordinates[0].length,
                  };
                  const airQ = getAirQuality(
                    airQualityData,
                    avgLatLng.lng,
                    avgLatLng.lat
                  );

                  const con = airQ.Concentration;

                  const normal = Math.min(
                    Math.max(0, (con - 6.5) / (14.1 - 6.5)),
                    1
                  );
                  const val = 255 * normal;
                  return [val, 0, 255 * (1 - normal)];
                },
                getLineColor: [0, 0, 0],
                getLineWidth: 1,
                lineWidthScale: 20,
                lineWidthMinPixels: 2,
                pickable: true,

                onClick: (d) => {
                  console.log({ d });
                },
              }),
            ]}
          />
        )}

        <WaterOutageMarkers outage_data={waterOutageData} />
        <NavigationControl />
      </Map>
    </div>
  );
}
