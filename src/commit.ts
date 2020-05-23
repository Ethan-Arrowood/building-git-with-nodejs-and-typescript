import Author from './author'
import Entity from './entity'

export default class Commit extends Entity {
	public parent: string | null
	public treeOid: string
	public author: Author
	public message: string

	constructor(parent: string | null, treeOid: string, author: Author, message: string) {
		super('commit', Commit.generateData(parent, treeOid, author, message))
		this.parent = parent
		this.treeOid = treeOid
		this.author = author
		this.message = message
	}

	private static generateData(parent: string | null, treeOid: string, author: Author, message: string) {
		const lines = []

		lines.push(`tree ${treeOid}`)
		if (parent !== null) lines.push(`parent ${parent}`)
		lines.push(`author ${author.toString()}`)
		lines.push(`committer ${author.toString()}`)
		lines.push("")
		lines.push(message)

		const data = lines.join("\n")
	
		return Buffer.from(data)
	}
}