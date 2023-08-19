import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom react hook to fetch data using axios
 */
export default function useGet(url, initialState = null) {
	const [data, setData] = useState(initialState);
	const [isLoading, setLoading] = useState(false);
	const [refreshToggle, setRefreshToggle] = useState(false);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const response = await axios.get(url);
			setData(response.data);
			setLoading(false);
		}
		fetchData();
	}, [url, refreshToggle]);

	function refresh() {
		setRefreshToggle(!refreshToggle);
	}

	return { data, isLoading, refresh };
}
