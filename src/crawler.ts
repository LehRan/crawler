import axios from "axios";
import * as cheerio from "cheerio";
import { mkdir, writeFile } from "node:fs/promises";
import { ImageSaver } from "./imageSaver";
import { ImageInfo } from "./types/imageInfo";
import PQueue from "p-queue";
import { logError } from "./utils";

export class Crawler {
  readonly images: ImageInfo[] = [];
  readonly visitUrls = new Set<string>();
  readonly queue: PQueue = new PQueue({ concurrency: 10 });

  async crawl(
    url: string,
    depth: number,
    outputFolder: string,
    indexFileName: string
  ) {
    console.log("Crawling started.");
    try {
      this.queue.add(async () => await this.crawlPage(url, depth));
      await this.queue.onIdle();

      await mkdir(outputFolder, { recursive: true });
      await this.createIndexFile(outputFolder, indexFileName);

      console.log("Crawling first step of following links completed!");
      console.log(`Downloading ${this.images.length} images...`);

      const imageSaver = new ImageSaver(this.images, outputFolder);
      await imageSaver.downloadImages();

      console.log("Crawling completed!");
    } catch (error) {
      logError(error, `Error during crawling:`);
    }
  }

  private async crawlPage(url: string, depth: number) {
    if (this.visitUrls.has(url) || depth < 1) return;
    this.visitUrls.add(url);
    console.log(`Crawling ${url} (depth ${depth})`);

    let $: cheerio.CheerioAPI;
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        maxContentLength: 2000000,
      });
      const html = response.data;
      $ = cheerio.load(html);
    } catch (error) {
      return logError(error, `Crawling ${url} (depth ${depth}) - failed`);
    }

    this.extractImageLinks($, url, depth);
    this.extractPageLinks($, url, depth);
  }

  private async createIndexFile(outputFolder: string, indexFileName: string) {
    const indexFilePath = `${outputFolder}/${indexFileName}`;
    await writeFile(
      indexFilePath,
      JSON.stringify({ images: this.images }, null, 2)
    );
    console.log("Index file availale at " + indexFilePath);
  }

  private extractImageLinks($: cheerio.CheerioAPI, url: string, depth: number) {
    $("img").each((i, elem) => {
      const imgSrc = $(elem).attr("src");
      const imgSrcFullPath = this.getFullPath(imgSrc, url);
      if (!imgSrcFullPath) return;

      this.images.push({
        index: this.images.length,
        url: imgSrcFullPath,
        page: url,
        depth,
      });
    });
  }

  private extractPageLinks($: cheerio.CheerioAPI, url: string, depth: number) {
    $("a").each((i, elem) => {
      const href = $(elem).attr("href");
      const hrefFullPath = this.getFullPath(href, url);
      if (!hrefFullPath) return;

      if (!this.visitUrls.has(hrefFullPath)) {
        this.queue.add(
          async () => await this.crawlPage(hrefFullPath, depth - 1)
        );
      }
    });
  }

  private getFullPath(src: string | undefined, url: string) {
    if (src === undefined) return;

    try {
      return new URL(src, url).toString();
    } catch (error) {
      console.warn(`Encountred invalid path ${src} in ${url}. Skipping.`);
    }
  }
}
