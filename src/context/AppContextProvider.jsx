import React from 'react';
import useGet from '../hooks/useGet';
export const AppContext = React.createContext();

const WATERCARE_BASE_URL = 'https://api.watercare.co.nz';

export default function AppContextProvider({ children }) {
	// each outage has lat, long, date, location, type data
	const {
		data: outages,
		isLoading: outagesLoading,
		refresh: refreshOutages,
	} = useGet(`${WATERCARE_BASE_URL}/outages/all`, []);

	const context = {
		outages,
		outagesLoading,
		refreshOutages,
	};

	return (
		<AppContext.Provider value={context}>{children}</AppContext.Provider>
	);
}
