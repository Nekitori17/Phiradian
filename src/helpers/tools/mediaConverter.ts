import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";

/**
 * Converts an image (from URL or Buffer) to a specified format
 * and returns it as a Discord AttachmentBuilder instance.
 *
 * @param url - Optional URL of the image to convert.
 * @param buffer - Optional Buffer containing image data.
 * @param format - Output image format (e.g., png, jpeg, webp).
 * @returns An AttachmentBuilder with the converted image, or undefined if error occurs.
 */
export default async ({
  url,
  buffer,
  format,
}: {
  url?: string;
  buffer?: Buffer;
  format: keyof sharp.FormatEnum | sharp.AvailableFormatInfo;
}) => {
    let fileInputBuffer: Buffer;

    if (url) {
      const fileResponse = await fetch(url)

      if (!fileResponse.ok)
        throw new Error(`Failed to fetch image from URL: ${fileResponse.statusText}`);

      const fileDataArrayBuffer = await fileResponse.arrayBuffer();
      fileInputBuffer = Buffer.from(fileDataArrayBuffer);
    }
    else if (buffer) {
      fileInputBuffer = Buffer.from(buffer);
    }
    else {
      throw new Error("No url or buffer provided");
    }

    const fileConverted = await sharp(fileInputBuffer)
      .toFormat(format)
      .toBuffer();

    // Generate unique file name based on timestamp + high-res time
    const fileName: string = `${Date.now()}_${(
      process.hrtime.bigint() / 1000000n
    ).toString()}.${format}`;

    return new AttachmentBuilder(fileConverted, {
      name: fileName,
    });

};
