import fs from 'fs'
import path from 'path'
import Lockfile from './lockfile'

class LockDenied extends Error {}

export default class Refs {
	public pathname: string

	private headPath: string

	constructor(pathname: string) {
		this.pathname = pathname
		this.headPath = path.join(pathname, 'HEAD')
	}

	public async updateHead(oid: string) {
		const lockfile = new Lockfile(this.headPath)

		if (!(await lockfile.holdForUpdate())) {
			throw new LockDenied(`Could not acquire lock on file: ${this.headPath}`)
		}

		await lockfile.write(oid)
		await lockfile.write("\n")
		await lockfile.commit()
	}

	public async readHead() {
		try {
			await fs.promises.access(this.headPath, fs.constants.F_OK | fs.constants.R_OK)
			return (await fs.promises.readFile(this.headPath, 'utf8')).trim()
		} catch (err) {
			return null
		}
	}
}