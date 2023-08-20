import { useEffect, useState } from "react";
import { GeoJsonLayer } from "deck.gl";
import { DeckGLOverlay } from "../pages/MapPage";
import {_GeoJSONLoader} from '@loaders.gl/json';
import {load} from '@loaders.gl/core';
import { scaleThreshold } from "d3-scale";


export const AverageDailyTrafficLayer = ({ visible }) => {
  const [averageDailyTrafficData, setaverageDailyTrafficData] = useState()
  
  useEffect(() => {
	(async () => {
		const tsData = await load("TrafficService.json", _GeoJSONLoader);
		setaverageDailyTrafficData(tsData)
	})()
  }, []);

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
              visible: visible
            }),
          ]}
        />
    </>
  );
};

