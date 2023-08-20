import { Route, Routes } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import MapPage from "./pages/MapPage";
import IssuePage from "./pages/IssuePage";
import ReportPage from "./pages/ReportPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import AllReportsPage from "./pages/AllReportsPage";
import "mapbox-gl/dist/mapbox-gl.css";
import UploadPage from "./pages/UploadPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MapPage />} />
        <Route path="issues">
          <Route index element={<IssuePage />} />
          <Route path=":id" element={<IssueDetailPage />} />
        </Route>
        <Route path="report" element={<ReportPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="reports" element={<AllReportsPage />} />
      </Route>
    </Routes>
  );
}
