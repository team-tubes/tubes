import { titleCase } from "../utils/utils";

export default function IssueCard({ suburb, issues }) {
	return (
		<div className="md:mb-2">
			<div className="flex flex-col rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
				<h6 className="flex-grow font-extrabold md:text-xl md:py-3 text-purple-200">
					{titleCase(suburb)}
				</h6>
				<hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
				<div className="my-2">
					<p className="font-medium my-2 text-sm md:text-md text-gray-200">
						{issues.length} Active Issues
					</p>
					<p className="font-medium my-2 text-sm md:text-md text-gray-200">
						{Math.round(Math.random() * 10000)} Assets Available
					</p>
				</div>
			</div>
		</div>
	);
}
