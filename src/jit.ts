#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import Blob from './blob'
import Workspace from './workspace'
import Database from './database'
import Entry from './entry'
import Tree from './tree'
import readStdin from './readStdin'
import Author from './author'
import Commit from './commit'
import Refs from './refs'

async function jit() {
	const command = process.argv[2]

	switch (command) {
		case 'init': {
			const inputPath = process.argv[3] || process.cwd()
			const rootPath = path.resolve(inputPath)
			const gitPath = path.join(rootPath, ".git")
			for (let dir of ["objects", "refs"]) {
				await fs.promises.mkdir(path.join(gitPath, dir), { "recursive": true })
			}

			console.log(`initialized empty jit repo in ${gitPath}`)
			break
		}
		case 'commit': {
			const rootPath = process.cwd()
			const gitPath = path.join(rootPath, '.git')
			const dbPath = path.join(gitPath, 'objects')

			const workspace = new Workspace(rootPath)
			const database = new Database(dbPath)
			const refs = new Refs(gitPath)

			const workspaceFiles = await workspace.listFiles()

			const entries = await Promise.all(workspaceFiles.map(async path => {
				const data = await workspace.readFile(path)
				const blob = new Blob(data)

				await database.store(blob)
				return new Entry(path, blob.oid)
			}))

			const tree = new Tree(entries)

			await database.store(tree)

			const parent = await refs.readHead()
			const name = process.env['GIT_AUTHOR_NAME'] || ''
			const email = process.env['GIT_AUTHOR_EMAIL'] || ''
			const author = new Author(name, email, new Date())
			const message = await readStdin()

			const commit = new Commit(parent, tree.oid, author, message)
			await database.store(commit)
			await refs.updateHead(commit.oid)

			const fd = await fs.promises.open(path.join(gitPath, 'HEAD'), fs.constants.O_WRONLY | fs.constants.O_CREAT)
			await fd.write(`${commit.oid}\n`)
			await fd.close()

			const isRoot = parent === null ? "(root-commit) " : ""
			console.log(`[${isRoot}${commit.oid}] ${message.substring(0, message.indexOf("\n"))}`)
			break
		}
		default: {
			console.log(`jit: '${command}' is not a jit command`)
		}
	}
}

jit()