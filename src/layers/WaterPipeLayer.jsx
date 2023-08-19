import { Marker, Popup } from "react-map-gl";
import { useEffect, useRef, useState } from "react";
import { format, parseISO, intervalToDuration } from "date-fns";
import { GeoJsonLayer } from "deck.gl";
import { DeckGLOverlay } from "../pages/MapPage";
import {_GeoJSONLoader} from '@loaders.gl/json';
import {buffer} from '@turf/turf'
import {load} from '@loaders.gl/core';


export const WaterPipeLayer = () => {
  const [waterPipeData, setWaterPipeData] = useState()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedPipe, setSelectedPipe] = useState()
  const [coordinates, setCoordinates] = useState()
  const [timerValue, setTimerValue] = useState(1);
  const [animation] = useState({});
  const incrementingRef = useRef(true)
  const startBlue = [144,222,255];
  const endBlue = [1,155,220];
  const animate = () => {
    setTimerValue(prevValue => {
      const newValue = incrementingRef.current ? prevValue + 1 : prevValue - 1;
      if (newValue >= 100) incrementingRef.current = false
      else if (newValue <= 1) incrementingRef.current = true
      return newValue;
    });
    animation.id = window.requestAnimationFrame(animate);
  }
  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation]);

  useEffect(() => {
	(async () => {
		const wpData = await load("Water_Pipe_Central.geojson", _GeoJSONLoader);
		setWaterPipeData({...(wpData), features: wpData.features.map(feature => buffer(feature, (feature.properties.NOM_DIA_MM || 10) * 5, {units: "millimeters"})).filter(f => !!f)})
	})()
  }, []);
  return (
    <>
        <DeckGLOverlay
          layers={[	
          new GeoJsonLayer({
            id: "geojson3",
            data: waterPipeData?.features || [],
            extruded: true,
            getFillColor: (f) => startBlue.map((color, index) => Math.round(color + (endBlue[index] - color) * ((timerValue * f.properties.NOM_DIA_MM / 500) / 100))),
            pickable: true,
            stroked: false,
            filled: true,
            lineJointRounded: true,
            getElevation: (f) => f.properties.NOM_DIA_MM / 100,
            
            updateTriggers: {getFillColor: [timerValue]},
            // getLineWidth: (f) => f.properties.NOM_DIA_MM * 10 ,
            onClick: e => {setCoordinates(e.coordinate); setIsPopupOpen(true); setSelectedPipe(e.object)}
            }),
          ]}
        />
      
        {isPopupOpen && (
          <Popup
            style={{ zIndex: 100 }}
            className="text-gray-700 focus:outline-none"
            closeOnClick={true}
            latitude={coordinates?.[1] || 0}
            longitude={coordinates?.[0] || 0}
            onClose={() => {
              setIsPopupOpen(false);
              setCoordinates(undefined);
              setSelectedPipe(undefined)
            }}
          >
            <div className="m-3  flex flex-col justfiy-start ">
              <span className="font-semibold text-lg">{selectedPipe.properties.FAC_DESC === "Not Applicable" ? "Water Pipe: " + selectedPipe.properties.USE_AREAID : "Water Pipe: "+selectedPipe.properties.FAC_DESC}</span>
              <p className="flex flex-row w-full">
                <span className="font-semibold mr-1">Installed: </span> {new Date(selectedPipe.properties.INSTALLED).toDateString()}
              </p>
              <p className="flex flex-row w-full">
                <span className="font-semibold mr-1">Material: </span> {selectedPipe.properties.MATERIAL}
              </p>
              <p className="flex flex-row w-full">
                <span className="font-semibold mr-1">Position: </span> {selectedPipe.properties.POSITION}
              </p>
              <p className="flex flex-row w-full">
                <span className="font-semibold mr-1">Length: </span> {selectedPipe.properties.SHAPE_Length.toFixed(2) + "m"}
              </p>
              <p className="flex flex-row w-full">
                <span className="font-semibold mr-1">Diameter: </span> {selectedPipe.properties.NOM_DIA_MM.toFixed(2) + "mm"}
              </p>
              
              
            </div>
          </Popup>
        )}
    </>
  );
};

