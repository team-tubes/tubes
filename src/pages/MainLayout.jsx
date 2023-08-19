import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
	return (
		<div className="flex flex-col relative min-h-screen min-w-screen bg-neutral-700 text-white font-space-mono">
			<Navbar />
			<Outlet />
		</div>
	);
}
