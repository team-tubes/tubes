import { MapboxOverlay } from "@deck.gl/mapbox";
import { _GeoJSONLoader } from "@loaders.gl/json";

import { Map, useControl, NavigationControl } from "react-map-gl";

import { Modal } from "../components/Modal";

import { WaterOutageMarkers } from "../layers/WaterOutageMarkers";
import { WaterPipeLayer } from "../layers/WaterPipeLayer";
import { FireHydrantLayer } from "../layers/FireHydrantLayer";
import { InternetLayer } from "../layers/InternetLayer";
import { SuburbAirQualityLayer } from "../layers/SuburbAirQualityLayer";

import maplibregl from "maplibre-gl";
import { ControlBox } from "../components/ControlBox";
import { useState } from "react";
import { Checkbox } from "../components/CheckBox";

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

export function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const allLayers = [
  {
    name: "Fire Hydrants",
    checked: true,
  },
  {
    name: "Internet",
    checked: true,
  },
  {
    name: "Water Outages",
    checked: true,
  },
  {
    name: "Water Pipes",
    checked: true,
  },
  {
    name: "Suburb Air Quality",
    checked: true,
  },
];

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

  const [activeLayers, setActiveLayers] = useState(allLayers);

  const updateCheckStatus = (index) => {
    setActiveLayers(
      activeLayers.map((layer, currentIndex) =>
        currentIndex === index ? { ...layer, checked: !layer.checked } : layer
      )
    );
  };

  const selectAll = () => {
    setActiveLayers(activeLayers.map((layer) => ({ ...layer, checked: true })));
  };
  const unSelectAll = () => {
    setActiveLayers(
      activeLayers.map((layer) => ({ ...layer, checked: false }))
    );
  };

  return (
    <div className="w-full h-full">
      <div className="absolute bg-white top-12 right-6 m-5 p-6 z-50 text-black">
        <h5 className="text-md font-semibold mb-4">Layer Control</h5>
        <div className="flex flex-row items-center mb-2">
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2 text-sm"
            onClick={selectAll}
          >
            Select All
          </button>
          <p className="font-bold text-indigo-800 hover:cursor-pointer text-sm" onClick={unSelectAll}>
            Clear
          </p>
        </div>

        {activeLayers.map((layer, index) => (
          <Checkbox
            key={layer.name}
            isChecked={layer.checked}
            checkHandler={() => updateCheckStatus(index)}
            label={layer.name}
            index={index}
          />
        ))}
      </div>
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
        <Modal />
        <SuburbAirQualityLayer visible={activeLayers[4].checked}/>
        <InternetLayer visible={activeLayers[1].checked}/>
        <WaterPipeLayer visible={activeLayers[3].checked}/>
        <FireHydrantLayer visible={activeLayers[0].checked}/>

        <WaterOutageMarkers visible={activeLayers[2].checked}/>
        <NavigationControl />
      </Map>
    </div>
  );
}
