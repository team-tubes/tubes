import { useEffect, useState } from "react";
import { GeoJsonLayer } from "deck.gl";
import { DeckGLOverlay } from "../pages/MapPage";
import {_GeoJSONLoader} from '@loaders.gl/json';
import {load} from '@loaders.gl/core';
import { scaleThreshold } from "d3-scale";
import { eventBus, PopupHelper } from "../utils/utils";
import { Popup } from "react-map-gl";


export const AverageDailyTrafficLayer = ({ visible }) => {
  const [averageDailyTrafficData, setaverageDailyTrafficData] = useState()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedAdt, setSelectedAdt] = useState()
  const [coordinates, setCoordinates] = useState()

  useEffect(() => {
	(async () => {
		const tsData = await load("TrafficService.json", _GeoJSONLoader);
		setaverageDailyTrafficData(tsData)
	})()
  }, []);

  useEffect(() => {
    PopupHelper.POPUP_OPEN = isPopupOpen;
  }, [isPopupOpen]);

  eventBus.on("openMapPopup", () =>
  {
    if(isPopupOpen)
      setIsPopupOpen(false);
  });


  const getLineColor = (point) => {
    let adtCount = point.properties.adt;
    if (adtCount >= 5000) {
      return BAD_COLOR_SCALE(adtCount)
    } else {
      return [0, 0, 0, 0]
    }
  };

  const opacity = 150;

  const BAD_COLOR_SCALE = scaleThreshold()
  .domain([2400, 4000, 8800, 11200, 15000, 23200, 30000, 45400, 85000, 109400])
  .range([
    [254, 224, 139, opacity],
    [237, 203, 104, opacity],
    [227, 168, 111, opacity],
    [253, 174, 97, opacity],
    [255, 125, 84, opacity],
    [244, 109, 67, opacity],
    [242, 58, 48, opacity],
    [215, 48, 39, opacity],
    [189, 4, 4, opacity],
    [168, 0, 0, opacity]
  ]);

  return (
    <>
        <DeckGLOverlay
          layers={[	
            new GeoJsonLayer({
              id: 'averagedailytraffic',
              data: averageDailyTrafficData?.features || [],
              getPolygon: (d) => d.geometry.coordinates,
              getLineWidth: 25,
              getLineColor,
              visible: visible,
              pickable: true,
              onClick: e => {
                if(PopupHelper.POPUP_OPEN)
                  return;
                setCoordinates(e.coordinate); 
                eventBus.dispatch("openPopup", {}); 
                setIsPopupOpen(true); 
                setSelectedAdt(e.object);
                PopupHelper.POPUP_OPEN = true;
              },
            }),
          ]}
        />
        {isPopupOpen && (
          <Popup
            style={{ zIndex: 100 }}
            className="text-gray-700 focus:outline-none text-neutral-100 font-space-mono"
            closeOnClick={true}
            latitude={coordinates?.[1] || 0}
            longitude={coordinates?.[0] || 0}
            onClose={() => {
              setIsPopupOpen(false);
              setCoordinates(undefined);
              setSelectedAdt(undefined);
            }}
          >
            <div className="m-3 flex flex-col justfiy-start ">
              <span className="font-semibold text-lg text-purple-200">{selectedAdt.properties?.road_name}</span>
              <p className="flex flex-row w-full">
                <span className="text-purple-200 font-semibold mr-1">Average Daily Traffic: </span> {selectedAdt.properties?.adt}
              </p>  
            </div>
          </Popup>
        )}
    </>
  );
};

