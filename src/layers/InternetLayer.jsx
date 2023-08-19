import { Popup } from "react-map-gl";
import { useEffect, useState } from "react";
import { format, fromUnixTime } from "date-fns";
import { GeoJsonLayer } from "deck.gl";
import { DeckGLOverlay } from "../pages/MapPage";
import { _GeoJSONLoader } from "@loaders.gl/json";

export const InternetLayer = () => {
  const [internetData, setInternetData] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState();
  const [coordinates, setCoordinates] = useState();

  useEffect(() => {
    (async () => {
      setInternetData({
        type: "FeatureCollection",
        name: "Internet Layer",
        features: await fetch_chorus_api_data(),
      });
    })();
  }, []);



  return (
    <>
      <DeckGLOverlay
        layers={[
          new GeoJsonLayer({
            id: "internet-layer",
            data: internetData,
            getFillColor: [255, 0, 0, 20],
            getLineColor: [255, 0, 0, 50],
            pickable: true,
            stroked: true,
            getLineWidth: 1,
            lineWidthScale: 3,
            filled: true,
            onClick: (e) => {
              console.log(e);
              setCoordinates(e.coordinate);
              setIsPopupOpen(true);
              setSelectedRegion(e.object);
            },
          }),
        ]}
      />

      {isPopupOpen && (
        <Popup
          style={{ zIndex: 100 }}
          className="text-gray-700 text-neutral-100 focus:outline-none font-space-mono"
          closeOnClick={true}
          latitude={coordinates?.[1] || 0}
          longitude={coordinates?.[0] || 0}
          onClose={() => {
            setIsPopupOpen(false);
            setCoordinates(undefined);
            setSelectedRegion(undefined);
          }}
        >
          <div className="m-3  flex flex-col justfiy-start ">
            <span className="text-purple-200 font-semibold text-lg">
              {selectedRegion.role} Issue
            </span>
            <p className="flex flex-row w-full">{selectedRegion.description}</p>
            <p className="flex flex-row w-full">
              <span className="text-purple-200 font-semibold mr-1">Reported at: </span>{" "}
              {format(
                fromUnixTime(selectedRegion.start_time),
                "HH:mm eee do MMM yyyy"
              )}
            </p>
            <p className="flex flex-row w-full">
              <span className="text-purple-200 font-semibold mr-1">
                Estimated Restored by:{" "}
              </span>{" "}
              {format(
                fromUnixTime(selectedRegion.rest_time),
                "HH:mm eee do MMM yyyy"
              )}
            </p>
            <p className="flex flex-row w-full">
              <span className="text-purple-200 font-semibold mr-1">Impacted Services: </span>{" "}
              {selectedRegion.impact}
            </p>
          </div>
        </Popup>
      )}
    </>
  );
};

function format_chorus_api_data(data) {
  const formattedData = data.reduce(
    (acc, { sites, ...rest }) => [
      ...acc,
      ...sites.slice(0, 1).map((site) => ({ // designed to support more, but only one to stop z fighting
        ...rest,
        ...site,
        type: "Feature",
        geometry: JSON.parse(site.poly),
      })),
    ],
    []
  );

  return formattedData;
}

async function fetch_chorus_api_data() {
  return fetch("https://api.infra.nz/api/chorus")
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      return format_chorus_api_data(json);
    });
}
