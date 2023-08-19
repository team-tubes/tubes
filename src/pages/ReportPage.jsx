import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../context/AppContextProvider";

export default function ReportPage() {
  const { issues, loading } = useContext(AppContext);
  const [query, setQuery] = useState("");

  const [lat, setLat] = useState();
  const [lng, setLng] = useState();

  navigator.geolocation.getCurrentPosition((pos) => {
    setLat(pos.coords.latitude);
    setLng(pos.coords.longitude);
  });

  if (loading) return <div>loading...</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="px-6  flex justify-center flex-col items-center w-full">
        <div className="h-12" />
        <div className="md:mb-2">
          <div className="flex flex-col items-start  rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
            <h6 className="flex-grow font-extrabold md:text-xl md:py-3 text-purple-200">
              Submit issue
            </h6>
            <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <div className="my-2">
              <div className="grid lg:grid-cols-2 gap-x-10 my-2">
                <label
                  htmlFor="fname"
                  className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                >
                  First Name
                </label>

                <input
                  type="text"
                  id="fname"
                  className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                  placeholder=""
                  required
                />

                <label
                  htmlFor="lname"
                  className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lname"
                  className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                  placeholder=""
                  required
                />
              </div>

              <div className="h-8"></div>
              <label
                className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                placeholder="example@example.com"
                required
              />

              <div className="h-8"></div>
              <label
                className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200"
                htmlFor="address"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                placeholder="E.g. 27D Te Waerenga Rd, Hamurana Springs	"
                required
              />

              <div className="h-8"></div>
              <div className="grid lg:grid-cols-[15%_75%] gap-x-10">
                <label
                  htmlFor="country"
                  className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                >
                  Country
                </label>

                <input
                  type="number"
                  id="country"
                  className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                  value="64"
                  required
                />

                <label
                  htmlFor="phone"
                  className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                >
                  Phone number
                </label>
                <input
                  type="number"
                  id="phone"
                  className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                  placeholder=""
                  required
                />
              </div>

              <div className="h-8"></div>
              <div className="grid lg:grid-cols-2 gap-x-10">
                <label
                  htmlFor="fname"
                  className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                >
                  Latitude
                </label>

                <input
                  type="numebr"
                  id="lat"
                  className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                  placeholder=""
                  value={lat}
                  required
                />

                <label
                  htmlFor="lng"
                  className="font-medium my-2 text-sm md:text-md text-gray-200 lg:row-start-1"
                >
                  Longitude
                </label>
                <input
                  type="number"
                  id="lng"
                  className="block bg-neutral-800 p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md w-full rounded-lg"
                  placeholder=""
                  value={lng}
                  required
                />
              </div>

              <div className="h-8"></div>
              <label
                className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200"
                htmlFor="description"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                placeholder="The water is not working"
                required
              />

              <button className="px-4 py-3 mt-6 m-0 ml-auto self-end bg-purple-200 text-neutral-700 block w-auto rounded-md">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
