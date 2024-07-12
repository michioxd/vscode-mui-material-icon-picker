export async function copy(string: string) {
    await navigator.clipboard.writeText(string);
}