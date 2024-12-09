export function parseDuration(duration: string): string {
    const regex = /P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
    const [, hours = "0", minutes = "0", seconds = "0"] = regex.exec(duration) || [];
    return `${hours}h ${minutes}m ${seconds}s`.replace(/(?:0h\s)?(?:0m\s)?(?:0s)?/, "").trim();
}