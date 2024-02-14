import { exit } from "process";
import { Crawler } from "./crawler";

function main() {
  if (process.argv.length !== 4) {
    console.log(
      "Welcome to The-WebCrawler. Please provide a start URL and depth.",
      process.argv,
    );
    exit();
  }

  const start_url = process.argv[2]; // page where crawling starts
  const depth = parseInt(process.argv[3]); // Depth as a command-line argument
  const outputFolder = "./images"; // Folder to save images and index.json
  const indexFileName = "index.json";

  const crawler = new Crawler();
  crawler.crawl(start_url, depth, outputFolder, indexFileName);
}

main();
