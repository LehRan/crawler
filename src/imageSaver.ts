import { ImageInfo } from "./types/imageInfo";
import { writeFile } from "node:fs/promises";
import axios from "axios";
import path from "node:path";
import PQueue from "p-queue";
import { logError } from "./utils";

export class ImageSaver {
  imagesSaved: number = 0;
  readonly totalImages: number;
  readonly queue: PQueue = new PQueue({ concurrency: 10 });

  constructor(
    private images: ImageInfo[],
    private outputFolder: string,
  ) {
    this.totalImages = images.length;
  }

  async downloadImages() {
    const downloadImageTasks = this.images.map(
      (image) => async () => await this.downloadImage(image),
    );
    await this.queue.addAll(downloadImageTasks);
    console.log();
  }

  private async downloadImage(image: ImageInfo) {
    try {
      const response = await axios.get(image.url, {
        responseType: "arraybuffer",
        timeout: 5000,
        maxContentLength: 2000000,
      });
      const extName = path.extname(image.url);
      await writeFile(
        `${this.outputFolder}/${image.index}${extName}`,
        response.data,
      );
    } catch (error) {
      logError(error, `Failed to download/ save image ${image.url}`)
    }
    process.stdout.write(
      `\rDownloading Images (${++this.imagesSaved}/${this.totalImages})`,
    );
  }
}
