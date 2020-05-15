import Entity from './entity'
import Entry from "./entry"

export default class Tree extends Entity {
	public entries: Entry[]

	constructor(entries: Entry[]) {
		super('tree', Tree.generateData(entries, '100644'))
		this.entries = entries
	}

	private static generateData (input: Entry[], mode: string) {
		let totalLength = 0
		const entries = input
			.sort((a, b) => a.name.localeCompare(b.name)) // sort by name
			.map(entry => {
				let b1 = Buffer.from(`${mode} ${entry.name}\0`) // encode as normal string and append a null byte
				// encodes a string as hex. for example '00ce' is a string of 4 bytes; 
				// this is encoded to Buffer<00, ce>, a buffer of 2 hex bytes
				let b2 = Buffer.from(entry.oid, 'hex')
				totalLength += b1.length + b2.length
				return Buffer.concat([b1, b2], b1.length + b2.length)
			})
		return Buffer.concat(entries, totalLength)
	}
}