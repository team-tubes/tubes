import { Marker, Popup } from "react-map-gl";
import { useState, useEffect } from "react";
import { format, parseISO, intervalToDuration } from "date-fns";

import { get_auckland_council_water_outages } from "../layers/WaterLayer";

export const WaterOutageMarkers = () => {
  const [waterOutageData, setWaterOutageData] = useState([]);

  useEffect(() => {
    get_auckland_council_water_outages().then((data) =>
      setWaterOutageData(data)
    );
  }, []);

  return (
    <>
      {waterOutageData.map((outage) => {
        return <WaterOutageMarker key={outage.outageId} {...outage} />;
      })}
    </>
  );
};

const WaterOutageMarker = (outage) => {
  const {
    latitude,
    longitude,
    location,
    startDate,
    outageType,
    outage_data: { description, duration },
  } = outage;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const durationFormat = intervalToDuration({
    start: 0,
    end: duration * 60 * 1000,
  });

  const start = parseISO(startDate);

  return (
    <>
      <Marker
        pickable={true}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setIsPopupOpen(true);
        }}
        style={{ zIndex: 100 }}
        latitude={latitude}
        longitude={longitude}
        color="red"
      >
        {isPopupOpen && (
          <Popup
            style={{ zIndex: 100 }}
            className="text-gray-700 text-neutral-100 focus:outline-none font-space-mono"
            closeOnClick={true}
            latitude={latitude}
            longitude={longitude}
            onClose={() => {
              setIsPopupOpen(false);
            }}
          >
            <div className="m-3  flex flex-col justfiy-start ">
              <span className="text-purple-200 font-semibold text-lg">{location}</span>
              <span className="">{description}</span>
              <br />
              <p className="flex flex-row w-full">
                <span className="text-purple-200 font-semibold mr-1">Agency: </span> Watercare
              </p>
              <p className="flex flex-row w-full">
                <span className="text-purple-200 font-semibold mr-1">Type: </span> {outageType}
              </p>
              <span className="">
                <span className="text-purple-200 font-semibold"> Est Duration:</span>{" "}
                {durationFormat.days ? `${durationFormat.days} days,` : ""}{" "}
                {durationFormat.hours} hours
              </span>
              <span className="">
                <span className="text-purple-200 font-semibold"> Start:</span>{" "}
                {format(start, "HH:mm eee do MMM yyyy")}
              </span>
            </div>
          </Popup>
        )}
      </Marker>
    </>
  );
};

export default WaterOutageMarkers;
