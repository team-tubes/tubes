import { useEffect, useState } from "react";
import ReportCard from "../components/ReportCard";

async function getReports(offset, limit) {
  console.log("Reports win");

  const reports = await fetch(
    `https://api.infra.nz/api/complaints?${
      offset ? "offset=" + offset + "&" : ""
    }${limit ? "limit=" + limit : ""}`,
    {
      method: "GET",
    }
  );

  if (reports.status != 200) {
    return [];
  }

  return await reports.json();
}

export default function AllReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState();

  useEffect(() => {
    getReports().then((reports) => {
      console.log(reports);
      setReports(reports);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>loading...</div>;
  console.log({ reports });
  const elements = reports.map(({ id, ...rest }) => (
    <ReportCard key={id} {...rest} />
  ));

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="px-6  grid grid-cols-3 grid-rows-auto gap-4 p-4">
        {elements}
      </div>
    </div>
  );
}
