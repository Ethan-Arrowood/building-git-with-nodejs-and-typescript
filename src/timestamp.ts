export default function timestamp (date: Date) {
	const seconds = Math.round(date.getTime() / 1000)
	const timezoneOffsetNum = date.getTimezoneOffset()
	const timezoneOffsetStr = timezoneOffsetNum >= 0
		? `+${timezoneOffsetNum.toString().padStart(4, '0')}`
		: `-${(timezoneOffsetNum * -1).toString().padStart(4, '0')}`
	return `${seconds} ${timezoneOffsetStr}`
}