import Entity from './entity'

export default class Blob extends Entity {
	constructor(data: Buffer) {
		super('blob', data)
	}
}