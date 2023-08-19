import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

export function NavItem({ icon, path, text }) {
	return (
		<NavLink
			className={({ isActive, isPending }) =>
				clsx(
					'flex flex-col font-bold items-center text-sm md:text-md px-6 hover:border-b-blue-200 hover:text-blue-300',
					isActive
						? 'text-blue-200  '
						: 'text-white'
				)
			}
			to={path}
		>
			{text}
		</NavLink>
	);
}
