declare module 'applescript' {
	function execString(
		script: string,
		callback: (err: Error | null, result: any) => void,
	): void

	export { execString }
}
declare module 'tailwindcss-rtl' {}
