export default async function () {
	let res = ''
	for await (const chunk of process.stdin) {
		res += chunk
	}
	return res
}