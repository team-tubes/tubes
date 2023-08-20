import { Marker, Popup } from "react-map-gl";
import { useState, useEffect } from "react";
import { format, parseISO, intervalToDuration } from "date-fns";
import { eventBus } from "../utils/utils";

export const WaterOutageMarkers = ({ visible }) => {
  const [waterOutageData, setWaterOutageData] = useState([]);

  useEffect(() => {
    get_auckland_council_water_outages().then((data) =>
      setWaterOutageData(data)
    );
  }, []);

  return (
    <>
      {visible && waterOutageData.map((outage) => {
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

  const current = new Date();
  const isUnderway = current.getTime() > start.getTime();

  // close any previously open water outage markers.
  eventBus.on("openMapPopup", () =>
  {
    if(isPopupOpen)
      setIsPopupOpen(false);
  });

  return (
    <>
      <Marker
        pickable={true}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          eventBus.dispatch("openMapPopup", {});
          setIsPopupOpen(true);
        }}
        style={{ zIndex: 20 }}
        latitude={latitude}
        longitude={longitude}
        color={isUnderway ? "red" : "orange"}
      >
        {isPopupOpen && (
          <Popup
            style={{ zIndex: 20 }}
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
              {isUnderway && (
                <span className="text-purple-200 font-semibold"> Currently underway
                </span>
              )}
            </div>
          </Popup>
        )}
      </Marker>
    </>
  );
};

async function get_auckland_council_water_outages() {
  //Get all outages
  const response = await fetch("https://api.infra.nz/api/watercare/all");
  const all_outages = await response.json();

  //We then want to get the specific water outages data
  const all_outages_with_data = await Promise.all(
    all_outages.map(async (item) => ({
      ...item,
      outage_data: await get_water_outage_data_specific(item.outageId),
    }))
  );
  return all_outages_with_data;
}

function get_water_outage_data_specific(outage_id) {
  //Get all outages
  return fetch("https://api.infra.nz/api/watercare/" + outage_id)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}
