export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
const blobURL = URL.createObjectURL(file);
const img = await createImageBitmap(await (await fetch(blobURL)).blob());
URL.revokeObjectURL(blobURL);
return img;
}