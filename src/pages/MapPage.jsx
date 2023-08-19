import { PolygonLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { _GeoJSONLoader } from "@loaders.gl/json";

import { Map, useControl, NavigationControl } from "react-map-gl";

import { WaterOutageMarkers } from "../layers/WaterOutageMarkers";
import { WaterPipeLayer } from "../layers/WaterPipeLayer";
import { FireHydrantLayer } from "../layers/FireHydrantLayer";
import { InternetLayer } from "../layers/InternetLayer";
import { SuburbAirQualityLayer } from "../layers/SuburbAirQualityLayer";

import maplibregl from "maplibre-gl";

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

const landCover = [
  [
    [-123.0, 49.196],
    [-123.0, 49.324],
    [-123.306, 49.324],
    [-123.306, 49.196],
  ],
];

// Fetch air quality data once.

export function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function MapPage({ mapStyle = MAP_STYLE }) {
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
            new PolygonLayer({
              id: "ground",
              data: landCover,
              stroked: false,
              getPolygon: (f) => f,
              getFillColor: [0, 0, 0, 0],
            }),
          ]}
        />
        
        <SuburbAirQualityLayer />
        <InternetLayer />
        <WaterPipeLayer />
        <FireHydrantLayer />

        <WaterOutageMarkers />
        <NavigationControl />
      </Map>
    </div>
  );
}
