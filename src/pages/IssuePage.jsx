import React, { useContext, useState } from 'react';
import IssueList from '../components/IssueList';
import Search from '../components/Search';
import { AppContext } from '../context/AppContextProvider';
import suburbs from '../assets/suburbs.json';

export default function IssuePage() {
	const { outages, outagesLoading, refresh } = useContext(AppContext);
	const [searchParam] = useState(['suburb']);
	const [query, setQuery] = useState('');

	if (outagesLoading) return <div>loading...</div>;

	const suburbsData = suburbs.data;

	function buildIssueMap(outages) {
		const issueMap = new Map();
		for (const currSuburb of suburbsData) {
			issueMap.set(currSuburb, []);
		}
		for (const outage of outages) {
			const suburb = outage.location
				.split(',')
				.slice(1)[0]
				.trim()
				.toLowerCase();
			const issue = {
				...outage,
				type: 'outage',
			};
			if (issueMap.has(suburb)) {
				issueMap.get(suburb).push(issue);
				// console.log("has suburb: " + suburb)
			} else {
				// console.log("no suburb: " + suburb)
			}
		}
		return issueMap;
	}

	const search = (issues) => {
		const issueMap = buildIssueMap(issues);
		const matched = new Map(
			[...issueMap].filter(
				([k, v]) => k.toLowerCase().indexOf(query.toLowerCase()) > -1
			)
		);

		return matched;
	};

	return (
		<div className="w-full flex justify-center">
			<div className="container mx-auto px-2 md:px-36 flex justify-center flex-col items-center">
				<div className="h-12" />
				<Search value={query} setValue={setQuery}/>
				<IssueList issuesMap={search(outages)} />
			</div>
		</div>
	);
}
