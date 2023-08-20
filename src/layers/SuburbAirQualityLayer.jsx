import { useEffect, useState } from "react";
import { DeckGLOverlay } from "../pages/MapPage";
import { GeoJsonLayer } from "deck.gl";
import { load } from "@loaders.gl/core";
import { _GeoJSONLoader } from "@loaders.gl/json";

export const SuburbAirQualityLayer = ({ visible }) =>
{  
    const [suburbData, setSuburbData] = useState();
    const [airQualityData, setAirQualityData] = useState();  

    useEffect(() => {
      (async() => {
        setSuburbData(await load("Suburb_Borders.geojson", _GeoJSONLoader));
        setAirQualityData(await load("Air_Quality.geojson", _GeoJSONLoader));
      })();
    }, []);  

    return (
      <>
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
              visible: visible,
              getElevation: (f) => Math.random(),
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
                return [val, 0, 255 * (1 - normal), 70];
              },
              getLineColor: [0, 0, 0, 170],
              getLineWidth: 1,
              lineWidthScale: 3,
              pickable: true,
            }),
          ]}
        />
      )}
      </>
    );
};

function getClosestAirPointData(airGeojsonData, longitude, latitude) {
  if (
    airGeojsonData === undefined ||
    airGeojsonData === null ||
    airGeojsonData.features === undefined
  )
    return null;

  let features = airGeojsonData.features;
  let closestPoint = features[0];
  let closestPointDist = 100000;

  for (const feature of features) {
    let geometry = feature.geometry;

    let coordinates = geometry.coordinates;
    let long = coordinates[0];
    let lat = coordinates[1];

    let longOffset = long - longitude;
    let latOffset = lat - latitude;

    let distance = Math.sqrt(longOffset * longOffset + latOffset * latOffset);

    if (distance < closestPointDist) {
      closestPoint = feature;
      closestPointDist = distance;
    }
  }

  return closestPoint;
}

function getAirQuality(airGeojsonData, longitude, latitude) {
  let airQualityData = getClosestAirPointData(
    airGeojsonData,
    longitude,
    latitude
  );

  return airQualityData.properties;
}