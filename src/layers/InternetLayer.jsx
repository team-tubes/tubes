import { Marker, Popup } from "react-map-gl";
import { useEffect, useState } from "react";
import { format, parseISO, intervalToDuration, fromUnixTime } from "date-fns";
import { GeoJsonLayer } from "deck.gl";
import { DeckGLOverlay } from "../pages/MapPage";
import { _GeoJSONLoader } from "@loaders.gl/json";
import { buffer } from "@turf/turf";
import { load } from "@loaders.gl/core";
import chorus_data from "./InternetSource";

export const InternetLayer = () => {
  const [internetData, setInternetData] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState();
  const [coordinates, setCoordinates] = useState();

  useEffect(() => {
    (async () => {
      const internet_geometry_data = await chorus_data();
      setInternetData({
        type: "FeatureCollection",
        name: "Internet Layer",
        features: internet_geometry_data,
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
