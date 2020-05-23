import fs from 'fs'

class MissingParent extends Error {}
class NoPermission extends Error {}
class StaleLock extends Error {}

export default class Lockfile {
	private filePath: string
	private lockPath: string
	private lock: fs.promises.FileHandle | null

	constructor(path: string) {
		this.filePath = path
		this.lockPath = `${path}.lock`
		this.lock = null
	}

	public async holdForUpdate () {
		try {
			if (this.lock === null) {
				const flags = fs.constants.O_RDWR | fs.constants.O_CREAT | fs.constants.O_EXCL
				this.lock = await fs.promises.open(this.lockPath, flags)
			}
			return true
		} catch (err) {
			switch (err.code) {
				case 'EEXIST':
					return false
				case 'ENOENT':
					throw new MissingParent(err.message)
				case 'EACCES':
					throw new NoPermission(err.message)
				default:
					throw err
			}
		}
	}

	public async write(data: string) {
		if (this.lock === null) {
			throw new StaleLock(`Not holding lock on file: ${this.lockPath}`)
		}
		await this.lock.write(data)
	}

	public async commit() {
		if (this.lock === null) {
			throw new StaleLock(`Not holding lock on file: ${this.lockPath}`)
		}
		await this.lock.close()
		await fs.promises.rename(this.lockPath, this.filePath)
		this.lock = null
	}
}