import Author from './author'
import Entity from './entity'

export default class Commit extends Entity {
	public treeOid: string
	public author: Author
	public message: string

	constructor(treeOid: string, author: Author, message: string) {
		super('commit', Commit.generateData(treeOid, author, message))
		this.treeOid = treeOid
		this.author = author
		this.message = message
	}

	private static generateData(treeOid: string, author: Author, message: string) {
		const lines = [
			`tree ${treeOid}`,
			`author ${author.toString()}`,
			`committer ${author.toString()}`,
			"",
			message
		].join("\n")
	
		return Buffer.from(lines)
	}
}