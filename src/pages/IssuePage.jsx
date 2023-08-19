import React, { useContext } from 'react';
import IssueList from '../components/IssueList';
import Search from '../components/Search';
import { AppContext } from '../context/AppContextProvider';

export default function IssuePage() {
	const { outages, outagesLoading, refresh } = useContext(AppContext);

	if (outagesLoading) return <div>loading...</div>;

	function buildIssueMap(outages) {
		const issueMap = new Map();
		for (const outage of outages) {
			const suburb = outage.location.split(',').slice(1)[0].trim();
			const issue = {
				...outage,
				type: 'outage',
			};
			if (!issueMap.has(suburb)) {
				issueMap.set(suburb, []);
			}
			issueMap.get(suburb).push(issue);
		}
		return issueMap;
	}

	return (
		<div className="w-full flex justify-center">
			<div className="container mx-auto px-2 md:px-36 flex justify-center flex-col items-center">
				<div className="h-12" />
				<Search />
				<IssueList issues={buildIssueMap(outages)} />
			</div>
		</div>
	);
}
