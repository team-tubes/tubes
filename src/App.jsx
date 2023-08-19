import { Route, Routes } from 'react-router-dom';
import MainLayout from './pages/MainLayout';
import MapPage from './pages/MapPage';
import IssuePage from './pages/IssuePage';
import ReportPage from './pages/ReportPage';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<MainLayout />}>
				<Route index element={<MapPage />} />
				<Route path="/issues" element={<IssuePage />} />
				<Route path="/report" element={<ReportPage />} />
			</Route>
		</Routes>
	);
}
