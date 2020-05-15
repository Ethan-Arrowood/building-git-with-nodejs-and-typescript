import crypto from 'crypto'

export default class Entity {
	private data: Buffer

	public type: string
	public oid: string

	constructor(type: string, data: Buffer) {
		this.type = type
		this.data = data
		this.oid = this.setOid()
	}

	private setOid () {
		const str = this.data
		const header = Buffer.from(`${this.type} ${str.length}\0`)
		const content = Buffer.concat([header, str], header.length + str.length)
		const shasum = crypto.createHash('sha1')
		const oid = shasum.update(content).digest('hex')
		return oid
	}

	public toString () {
		return this.data
	}
}