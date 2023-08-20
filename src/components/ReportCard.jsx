import React from "react";

export default function ReportCard({
  description,
  location: { lng, lat, address },
}) {
  return (
    <div className="h-full">
      <div className="h-full flex flex-col rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
        <div className="my-2">
          <p className="font-semibold my-2 text-purple-200 text-sm md:text-md text-gray-200">
            {address ? address : `${lat}, ${lng}`}
          </p>
          <p className="font-medium my-2 text-sm md:text-md text-gray-200">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
