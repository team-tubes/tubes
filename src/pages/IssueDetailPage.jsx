import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext, getInitialState } from '../context/AppContextProvider';
import { titleCase } from '../utils/utils';

const dayNames = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

export default function IssueDetailPage() {
	const { id } = useParams();
	const { idToSuburb, issues, loading, setIssues } = useContext(AppContext);
	const [suburb, setSuburb] = useState('');
	const [waterIssues, setWaterIssues] = useState([]);
	const [internetIssues, setInternetIssues] = useState([]);
	const [powerIssues, setPowerIssues] = useState([]);
	const [files, setFiles] = useState([]);
	const [error, setError] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		let currIssues = issues;
		let currIdToSuburb = idToSuburb;
		currIssues = new Map(Object.entries(getInitialState('issues')));
		currIdToSuburb = getInitialState('idSuburbMap');
		if (currIdToSuburb.length == 0) {
			setError(true);
			return;
		}
		const suburb = currIdToSuburb[id];
		const suburbData = currIssues.get(suburb);
		setSuburb(suburb);
		setWaterIssues(suburbData.waterIssues);
		setInternetIssues(suburbData.internetIssues);
		setPowerIssues(suburbData.powerIssues);
		setFiles(suburbData.files);

		console.log(suburbData);
	}, []);

	if (error)
		return (
			<div>Cannot fetch issues, please go back to the homepage :/</div>
		);

	if (loading) return false;

	const getETA = (issue) => {
		const templateString = issue?.add_desc;
		if (!templateString) return 'N/A';
		const timeOfArrivalIndex = templateString.indexOf('time of arrival is');
		const textAfterETA = templateString.slice(
			timeOfArrivalIndex + 'time of arrival is'.length
		);

		if (textAfterETA) {
			return textAfterETA;
		} else {
			return 'N/A - check later for an update';
		}
	};

	const getDateString = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	const getDateStringFromEpoch = (epoch) => {
		var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
		d.setUTCSeconds(epoch);
		return d.toLocaleString();
	};

	const getNumIssues = () => {
		return waterIssues.length + powerIssues.length + internetIssues.length;
	};

	return (
		<div className="w-full max-w-[1600px] mx-auto">
			<div className="px-6 flex flex-col ">
				<div className="h-12" />
				<h1 className="font-bold text-xl lg:text-5xl mb-5">
					{titleCase(suburb)}
				</h1>
				<h6 className="flex-grow font-extrabold md:text-xl md:py-3 text-purple-200 mb-3">
					{getNumIssues()} issues
				</h6>
				{internetIssues.map((issue, idx) => (
					<div key={idx} className="mb-2 md:mb-8">
						<div className="flex flex-col rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
							<p className="text-gray-200 font-bold text-lg">
								{`🌐 Internet Issue`}
							</p>
							<hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-2" />

							<p className="mb-2">{`Estimated Start: ${getDateStringFromEpoch(
								issue.start_time
							)}`}</p>
							<p className="mb-5">{`Estimated Restoration: ${getETA(
								issue
							)}`}</p>

							<p className="mb-2">{`Location: ${issue?.address?.road}, ${issue?.address?.suburb}, ${issue?.address?.state} ${issue?.address?.postcode}`}</p>
							<p className="mb-2">{`Description: ${issue.description}`}</p>
							<p className="mb-2">{`Services Affected: Up to ${issue.sites.reduce(
								(accumulator, object) =>
									accumulator + object.impact,
								0
							)} (estimated)`}</p>
							<p className="mb-2">
								Status:{' '}
								{issue.status === 'N'
									? 'Under Action'
									: 'Unknown'}
							</p>
						</div>
					</div>
				))}

				{waterIssues.map((issue, idx) => (
					<div key={idx} className="mb-2 md:mb-8">
						<div className="flex flex-col rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
							<p className="text-gray-200 font-bold text-lg">
								{`🚰 Water Issue`}
							</p>
							<hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-2" />

							<p className="mb-2">{`Estimated Start: ${getDateString(
								issue.startDate
							)}`}</p>
							<p className="mb-5">{`Estimated Restoration: ${getDateString(
								issue.endDate
							)}`}</p>

							<p className="mb-2">{`Location: ${issue.location}`}</p>
							<p className="mb-2">{`Outage Type: ${issue.outageType}`}</p>
						</div>
					</div>
				))}

				{powerIssues.map((issue, idx) => (
					<div key={idx} className="mb-2 md:mb-8">
						<div className="flex flex-col rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
							<p className="text-gray-200 font-bold text-lg">
								{`⚡ Power Issue`}
							</p>
							<hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 my-2" />

							<p className="mb-2">{`Outage Type: ${issue.properties.outageType}`}</p>
						</div>
					</div>
				))}

				<div className="mb-2 md:mb-8">
					<div className="flex flex-col rounded-xl bg-neutral-800 py-2 px-5 relative shadow-md hover:cursor-pointer">
						<h6 className="flex-grow font-extrabold md:text-xl md:py-3 text-purple-200">
							{`${files.length} Files Available`}
						</h6>
						<hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />
						<div className="my-2">
							<p className="font-medium my-2 text-sm md:text-lg text-gray-200">
								{`🌉 0 Bridge Schematic`}
							</p>
							<p className="font-medium my-2 text-sm md:text-lg text-gray-200">
								{`🛣️ 0 Highway Data`}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
