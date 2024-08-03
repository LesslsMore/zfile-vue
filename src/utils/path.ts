export const baseName = (fullName: string) => {
	return fullName.split(".").slice(0, -1).join(".")
}
