### Langware.AI Web Crawler

A simple CLI Web Crawler.
It crawls and download all images it finds on the way.
The results is placed in a folder called `images` which also contains `index.json` - a json file that shows the list of the collected image.

## Installation

```bash
$ npm install
```

## Running the app

```bash
$ crawl <start_url> <depth>
```
- `start_url` - page where crawling starts 
- `depth` - the crawl child pages depth where 1 is only the page 