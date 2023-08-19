import React, { useContext, useState } from "react";
import IssueList from "../components/IssueList";
import Search from "../components/Search";
import { AppContext } from "../context/AppContextProvider";

export default function UploadPage() {
  const { issues, loading } = useContext(AppContext);
  const [query, setQuery] = useState("");

  if (loading) return <div>loading...</div>;

  const search = (currIssues) => {
    const matched = new Map(
      [...currIssues].filter(
        ([k, v]) => k.toLowerCase().indexOf(query.toLowerCase()) > -1
      )
    );

    return matched;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="px-6  flex justify-center flex-col items-center w-full">
        <div className="h-12" />
        <div className="md:mb-2">
          <div className="flex flex-col items-start  rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
            <h6 className="flex-grow font-extrabold md:text-xl md:py-3 text-purple-200">
              Upload Document
            </h6>
            <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <div className="my-2">
              <p className="font-medium my-2 text-sm md:text-md text-gray-200">
                Name
              </p>
              <input
                type="text"
                id="default-search"
                className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                placeholder="E.g. building-consent-p71829R	"
                required
              />
              <p className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200">
                Location
              </p>
              <input
                type="text"
                id="default-search"
                className="block bg-neutral-800 w-full p-4 placeholder:text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                placeholder="E.g. 27D Te Waerenga Rd, Hamurana Springs	"
                required
              />
              <p className="mt-8 font-medium my-2 text-sm md:text-md text-gray-200">
                File
              </p>
              <input
                type="file"
                id="default-search"
                className="block bg-neutral-800 w-full p-4 text-neutral-400 text-md text-white border border-gray-600 text-md min-w-[500px] rounded-lg "
                placeholder="E.g. building-consent-p71829R	"
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
