import { Marker, Popup } from "react-map-gl";
import { useEffect, useState } from "react";
import { format, parseISO, intervalToDuration } from "date-fns";
import { GeoJsonLayer, SimpleMeshLayer } from "deck.gl";
import { DeckGLOverlay } from "../pages/MapPage";
import { _GeoJSONLoader } from "@loaders.gl/json";
import { buffer } from "@turf/turf";
import { load } from "@loaders.gl/core";
import { OBJLoader } from "@loaders.gl/obj";
import { eventBus } from "../utils/utils";

export const FireHydrantLayer = () => {
  const [fireHydrantData, setHydrantData] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFireHydrant, setSelectedFireHydrant] = useState();
  const [coordinates, setCoordinates] = useState();
  useEffect(() => {
    (async () => {
      const data = await load("Water_Hydrant_Central.geojson", _GeoJSONLoader);
      setHydrantData(data);
    })();
  }, []);

  // close any previously fire hydrant popups.
  eventBus.on("openMapPopup", () =>
  {
    if(isPopupOpen)
      setIsPopupOpen(false);
  });

  return (
    <>
      <DeckGLOverlay
        layers={[
          new SimpleMeshLayer({
            id: "fire-hydrant-layer",
            data: fireHydrantData?.features || [],
            loaders: [OBJLoader, _GeoJSONLoader],
            getColor: (d) => [255, 0, 0, 255],
            getOrientation: (d) => [0, 0, 90],
            getPosition: (d) => {
              return d.geometry.coordinates;
            },
            mesh: "fire-hydrant.obj",
            sizeScale: 0.1,
            minzoom: 19,
            onClick: (e) => {
              setCoordinates(e.coordinate); 
              eventBus.dispatch("openPopup", {}); 
              setIsPopupOpen(true); 
              setSelectedFireHydrant(e.object);
            },
            pickable: true,
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
            setSelectedFireHydrant(undefined);
          }}
        >
          <div className="m-3  flex flex-col justfiy-start ">
             <span className="text-purple-200 font-semibold text-lg">
                Fire Hydrant {selectedFireHydrant.properties.OBJECTID}
              </span>
              <p className="flex flex-row w-full">
                <span className="text-purple-200 font-semibold mr-1">Installed: </span> {new Date(selectedFireHydrant.properties.INSTALLED).toDateString()}
              </p>
              <p className="flex flex-row w-full">
                <span className="text-purple-200 font-semibold mr-1">Status: </span> {selectedFireHydrant.properties.STATUS === "OP" ? "Operational" : "Not Operational"}
              </p>
          </div>
        </Popup>
      )}
    </>
  );
};
