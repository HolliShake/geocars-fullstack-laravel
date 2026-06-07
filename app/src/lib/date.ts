/**
 * Formats a Date object to 12-hour time (e.g., 02:30 PM)
 * @param date Date object
 * @returns string in 12-hour time format
 */
export function to12HourTime(time: string): string {
	// Accepts 'HH:mm:ss' or 'HH:mm'
	const parts = time.split(':');
	if (parts.length < 2) return '';
	const hours = parseInt(parts[0], 10);
	const minutes = parseInt(parts[1], 10);
	if (isNaN(hours) || isNaN(minutes)) return '';
	const ampm = hours >= 12 ? 'PM' : 'AM';
	let displayHour = hours % 12;
	displayHour = displayHour ? displayHour : 12; // the hour '0' should be '12'
	const minutesStr = minutes < 10 ? '0' + minutes : minutes;
	return `${displayHour}:${minutesStr} ${ampm}`;
}



