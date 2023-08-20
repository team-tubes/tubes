import React, { useState, useEffect } from "react";
import useGet from "../hooks/useGet";
export const AppContext = React.createContext();
import chorus_data_no_poly from "../assets/chorus_data_mock_no_poly.json";
import vector_data from "../assets/vector_data_mock.json";
import { v4 as uuidv4 } from "uuid";
import suburbs from "../assets/suburbs.json";
import axios from "axios";

const WATERCARE_BASE_URL = "https://api.infra.nz/api";

export function getInitialState(key) {
  const context = localStorage.getItem(key);
  return context ? JSON.parse(context) : [];
}

export default function AppContextProvider({ children }) {
  // each outage has lat, long, date, location, type data
  const [issues, setIssues] = useState(null);
  const [idToSuburb, setIdToSuburb] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buildIssueMap() {
      const issueMap = new Map();
      const idSuburbMap = {};
      const suburbsData = suburbs.data;
      const waterIssues = await getSuburbsData();
      const internetIssues = chorus_data_no_poly;
      const powerIssues = vector_data.features;

      const internetIssuesList = [];
      const powerIssuesList = [];

      for (const currSuburb of suburbsData) {
        const suburbId = uuidv4();
        idSuburbMap[suburbId] = currSuburb;
        issueMap.set(currSuburb, {
          id: suburbId,
          waterIssues: [],
          powerIssues: [],
          internetIssues: [],
          files: [],
        });
      }

      // process water issues
      for (const waterIssue of waterIssues) {
        let suburb = waterIssue.location
          .split(",")
          .slice(1)[0]
          .trim()
          .toLowerCase();
        suburb = processString(suburb);
        const issue = {
          ...waterIssue,
        };
        if (issueMap.has(suburb)) {
          issueMap.get(suburb).waterIssues.push(issue);
        }
      }

      // Process internet issues
      for (const internetIssue of internetIssues) {
        const point = internetIssue.sites[0].point;
        const data = JSON.parse(point);
        const coordinate = data["coordinates"];
        const issue = {
          ...internetIssue,
          coordinate,
        };
        internetIssuesList.push(issue);
      }

      // Process power issues
      console.log(powerIssues);
      for (const powerIssue of powerIssues) {
        const coordinate = powerIssue?.geometry?.coordinates[0][0];
        // const location = await fetchLocation(coordinate[1], coordinate[0]);
        const issue = {
          ...powerIssue,
          coordinate,
        };
        powerIssuesList.push(issue);
      }

      console.log(powerIssuesList);
      console.log(internetIssuesList);

      // add the issues to the hashmap and get suburb
      const powerPromises = powerIssuesList.map((issue) =>
        fetchLocation(issue.coordinate[1], issue.coordinate[0])
      );
      const powerRes = await Promise.allSettled(powerPromises);

      const internetPromises = internetIssuesList.map((issue) =>
        fetchLocation(issue.coordinate[1], issue.coordinate[0])
      );
      const internetRes = await Promise.allSettled(internetPromises);

      console.log(powerRes);
      console.log(internetRes);
      for (let i = 0; i < powerIssues.length; i++) {
        const issue = powerIssues[i];
        const suburb = powerRes[i]?.value?.address?.suburb?.toLowerCase();
        console.log(suburb);
        if (issueMap.has(suburb)) {
          issueMap.get(suburb).powerIssues.push(issue);
        }
      }

      for (let i = 0; i < internetIssues.length; i++) {
        const issue = internetIssues[i];
        const suburb = internetRes[i]?.value?.address?.suburb?.toLowerCase();
        const address = internetRes[i]?.value?.address;
        console.log(suburb);
        if (issueMap.has(suburb)) {
          issueMap.get(suburb).internetIssues.push({ ...issue, address });
        }
      }

      setIdToSuburb(idSuburbMap);
      setIssues(issueMap);
      localStorage.setItem("idSuburbMap", JSON.stringify(idSuburbMap));
      localStorage.setItem(
        "issues",
        JSON.stringify(Object.fromEntries(issueMap))
      );
      setLoading(false);
    }

    const issues = localStorage.getItem("issues");
    if (issues) {
      setIssues(new Map(Object.entries(getInitialState("issues"))));
      setIdToSuburb(getInitialState("idSuburbMap"));
      setLoading(false);
    } else {
      buildIssueMap();
    }
  }, []);

  function processString(string) {
    const words = string.split(" ");
    if (words[0] === "st") {
      words[0] = "saint";
    }
    return words.join(" ");
  }

  async function getSuburbsData() {
    try {
      const res = await axios.get(`${WATERCARE_BASE_URL}/watercare/all`);
      const data = res.data;
      return data;
    } catch (err) {
      console.err(err);
    }
  }

  async function fetchLocation(lat, lng) {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = res.data;
      return data;
    } catch (err) {
      console.err(err);
    }
  }

  const context = {
    issues,
    setIssues,
    loading,
    idToSuburb,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
