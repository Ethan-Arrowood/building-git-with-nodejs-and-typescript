import timestamp from './timestamp'

export default class Author {
	public name: string
	public email: string
	public time: Date

	constructor(name: string, email: string, time: Date) {
		this.name = name
		this.email = email
		this.time = time
	}

	toString() {
		return `${this.name} <${this.email}> ${timestamp(this.time)}`
	}
}