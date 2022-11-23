import * as sharp from 'sharp';

export class ImageResize {
  async resizeImage(image: any, width: number, height: number) {
    const resizedImage = await sharp(image)
      .resize(width, height)
      .toFormat('jpeg')
      .toBuffer();
    return resizedImage.toString('base64');
  }
}
