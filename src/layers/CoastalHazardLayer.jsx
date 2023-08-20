import { load } from "@loaders.gl/core";
import { _GeoJSONLoader } from "@loaders.gl/json";
import { GeoJsonLayer } from "deck.gl";
import { useEffect, useState } from "react";
import { DeckGLOverlay } from "../pages/MapPage";

// Purpose:The coastal inundation hazard layers map describes the areas exposed to extreme water levels caused by storm tides, wave setup and sea-level rise
// Coastal Inundation 100 yr return 2m sea level rise
// source: https://catalogue.data.govt.nz/dataset/coastal-inundation-100-yr-return-2m-sea-level-rise1/resource/a716fbef-c027-4c2f-8ce2-0389d96a8cc5?view_id=a34f5eb1-8217-40d0-8dd2-ff24bb2d7a15
export const CoastalHazardLayer = ({ visible }) => {
  const [coastalHazardData, setCoastalHazardData] = useState();

  useEffect(() => {
    (async () => {
      const data = await load(
        "Coastal_Inundation_100_yr_return_2m_sea_level_rise.geojson",
        _GeoJSONLoader
      );
      setCoastalHazardData(data);
    })();
  }, []);


  return (
    <>
      <DeckGLOverlay
        layers={[
          new GeoJsonLayer({
            id: "coastalHazard",
            data: coastalHazardData?.features || [],
            getPolygon: (d) => d.geometry.coordinates,
            getFillColor: [0, 0, 205, 20],
            getLineColor: [0, 0, 205, 50],
            pickable: true,
            stroked: true,
            getLineWidth: 1,
            lineWidthScale: 3,
            filled: true,
            visible: visible,
          }),
        ]}
      />
    </>
  );
};
