import React, { useContext, useState } from 'react';
import IssueList from '../components/IssueList';
import Search from '../components/Search';
import { AppContext } from '../context/AppContextProvider';

export default function IssuePage() {
	const { issues, loading } = useContext(AppContext);
	const [query, setQuery] = useState('');

	if (loading) return <div>loading...</div>;

	const search = (currIssues) => {
		const matched = new Map(
			[...currIssues].filter(
				([k, v]) => k.toLowerCase().indexOf(query.toLowerCase()) > -1
			)
		);

		return matched;
	};

	return (
		<div className="w-full max-w-[1600px] mx-auto">
			<div className="px-6  flex justify-center flex-col items-center">
				<div className="h-12" />
				<Search value={query} setValue={setQuery} />
				<IssueList issuesMap={search(issues)} />
			</div>
		</div>
	);
}
