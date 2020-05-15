export default class Entry {
	public oid: string
	public name: string

	constructor (name: string, oid: string) {
		this.name = name
		this.oid = oid
	}
}