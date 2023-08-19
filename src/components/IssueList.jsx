import IssueCard from './IssueCard';

export default function IssueList({ issuesMap }) {
	let keys = Array.from(issuesMap.keys());

	return (
		<div className="grid w-full grid-flow-row gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8 md:mt-6">
			{keys.map((key) => (
				<IssueCard key={key} suburb={key} issues={issuesMap.get(key)} />
			))}
		</div>
	);
}
