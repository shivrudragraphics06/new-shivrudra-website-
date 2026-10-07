import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.SHIVRUDRA_PLAYWRIGHT_DIR
  ? pathToFileURL(path.join(process.env.SHIVRUDRA_PLAYWRIGHT_DIR, "index.mjs")).href
  : "playwright");
const browser = await chromium.launch({ headless: true, executablePath: process.env.SHIVRUDRA_BROWSER });
const base = process.env.SHIVRUDRA_TEST_URL || "http://127.0.0.1:5089";
const titles = [
  "Choosing the Right Signage for Your Business", "A Guide to High-Quality Digital Printing",
  "Corporate Gifts That Make an Impression", "Designing a Brand That Stands Out",
  "Making Your Storefront Work Harder", "Why Print Quality Matters", "Materials for Outdoor Signs",
  "Packaging for Growing Brands", "Acrylic Lettering Explained", "Bringing Your Brand to Events",
  "Office Signage Essentials", "Your Next Printing Project",
];
const rows = titles.map((title, index) => ({
  id: index + 1, title, slug: "article-" + index, author: index % 2 ? "Shivrudra Graphics" : "Design Studio",
  publish_date: "2026-10-07T09:00:00Z",
  excerpt: "Practical ideas for clear communication, thoughtful materials and a strong first impression.",
  content: "Your brand deserves thoughtful design and lasting quality.\n\nStart with the right materials and a clear message.",
  featured_image_url: index === 2 ? null : "/api/public/media/blogs/" + index + "/image",
}));

try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 960 } });
    await page.route("**/api/public/blogs", route => route.fulfill({ json: rows }));
    await page.route("**/api/public/media/blogs/**", route => route.fulfill({
      contentType: "image/png",
      body: fs.readFileSync("src/assets/services/" + (route.request().url().includes("/0/") ? "Signage.png" : "Digital Printing.png")),
    }));
    await page.goto(base + "/blogs", { waitUntil: "domcontentloaded" });
    await page.getByText(titles[0], { exact: true }).waitFor();
    assert.equal(await page.locator("main article").count(), 9);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (process.env.SHIVRUDRA_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SHIVRUDRA_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SHIVRUDRA_SCREENSHOT_DIR, "blogs-" + width + ".png"), fullPage: true });
    }
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    assert.equal(await page.locator("main article").count(), 3);
    await page.getByRole("searchbox", { name: "Search blogs" }).fill("no match at all");
    await page.getByText("No articles match your search.", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Clear search", exact: true }).click();
    await page.getByRole("searchbox", { name: "Search blogs" }).fill("Corporate Gifts");
    assert.equal(await page.locator("main article").count(), 1);
    await page.getByRole("link", { name: "Read More", exact: true }).click();
    await page.getByRole("heading", { name: titles[2], exact: true }).waitFor();
    await page.getByText("Your brand deserves thoughtful design and lasting quality.", { exact: true }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if (process.env.SHIVRUDRA_SCREENSHOT_DIR) {
      await page.screenshot({ path: path.join(process.env.SHIVRUDRA_SCREENSHOT_DIR, "article-" + width + ".png"), fullPage: true });
    }
    await page.close();
    console.log("PASS " + width + "px: cards, search, empty results, pagination, article layout, and no overflow.");
  }
} finally {
  await browser.close();
}
