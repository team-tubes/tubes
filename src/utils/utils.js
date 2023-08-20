export function titleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] =
			splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	// Directly return the joined string
	return splitStr.join(' ');
}

// handle events between components
export const eventBus = {
	on(event, callback) {
		document.addEventListener(event, (e) => callback(e.data));
	},

	dispatch(event, data) {
		document.dispatchEvent(new CustomEvent(event, { data: data }));
	},
	remove(event, callback) {
		document.removeEventListener(event, callback);
	}
};