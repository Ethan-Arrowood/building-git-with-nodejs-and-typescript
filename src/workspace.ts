import fs from 'fs'
import path from 'path'

export default class Workspace {
	private ignore = ['.', '..', '.git']

	public pathname: string

	constructor (pathname: string) {
		this.pathname = pathname
	}

	public async listFiles () {
		const dirFiles = await fs.promises.readdir(this.pathname)
		return dirFiles.filter(x => this.ignore.indexOf(x) === -1)
	}

	public async readFile (filePath: string) {
		return await fs.promises.readFile(path.join(this.pathname, filePath))
	}
}