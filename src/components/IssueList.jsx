import IssueCard from './IssueCard';

export default function IssueList({ issues }) {
	let keys = Array.from( issues.keys() );

	console.log(keys);
	return (
		<div className="grid w-full grid-flow-row gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8 md:mt-6">
			{keys.map((issueObjects) => (
				<IssueCard key={issueObjects[0].suburb} issue={issueObjects} />
			))}
		</div>
	);
}
