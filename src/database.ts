import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import zlib from 'zlib'
import util from 'util'

import Entity from './entity'

export default class Database {
	public pathname: string

	constructor (pathname: string) {
		this.pathname = pathname
	}

	public async store (obj: Entity) {
		const str = obj.toString() // remember this returns the data buffer
		const header = Buffer.from(`${obj.type} ${str.length}\0`)
		const content = Buffer.concat([header, str], header.length + str.length)
		await this.writeObject(obj.oid, content)
	}

	private async writeObject(oid: string, content: Buffer) {
		const objectPath = path.join(this.pathname, oid.substring(0, 2), oid.substring(2))
		if (await this.fileExists(objectPath)) return
		const dirName = path.dirname(objectPath)
		const tempPath = path.join(dirName, this.generateTempName())

		const flags = fs.constants.O_RDWR | fs.constants.O_CREAT | fs.constants.O_EXCL

		const getFileDescriptor = async () => {
			try {
				return await fs.promises.open(tempPath, flags)
			} catch (err) {
				if (err.code === 'ENOENT') {
					await fs.promises.mkdir(dirName)
					return await fs.promises.open(tempPath, flags)
				} else if (err.code === 'EEXIST') {
					return await fs.promises.open(tempPath, flags)
				} else {
					throw err
				}
			}
		}

		const file = await getFileDescriptor()

		const deflate: any = util.promisify(zlib.deflate)
		const compressed = await deflate(content, { level: zlib.constants.Z_BEST_SPEED })

		await file.write(compressed)
		await file.close()

		await fs.promises.rename(tempPath, objectPath)
	}

	private generateTempName () {
		return `tmp_obj_${crypto.randomBytes(8).toString('hex')}` // hex ensures we only get characters 0-9 and a-f
	}

	private async fileExists(path: string) {
		try {
			await fs.promises.access(path, fs.constants.F_OK)
			return true
		} catch (err) {
			return false
		}
	}
}