import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.SHIVRUDRA_PLAYWRIGHT_DIR
  ? pathToFileURL(path.join(process.env.SHIVRUDRA_PLAYWRIGHT_DIR, "index.mjs")).href
  : "playwright");
const browser = await chromium.launch({ headless: true, executablePath: process.env.SHIVRUDRA_BROWSER });
const base = process.env.SHIVRUDRA_TEST_URL || "http://127.0.0.1:5088";
const image = fs.readFileSync("src/assets/client logos/boi.png");
const rows = {
  services: [],
  clients: [{ id: 999, name: "Admin Client Test", logo_url: "/api/public/media/clients/999/logo" }],
  industries: [{ id: 999, name: "Admin Industry Test", image_url: "/api/public/media/industries/999/image", short_description: "Industry database description" }],
  gallery: [{ id: 999, title: "Admin Gallery Test", category: "Custom Category", image_url: "/api/public/media/gallery/999/image" }],
  testimonials: [{ id: 999, client_name: "Admin Reviewer Test", designation: "Director", company_name: "Test Company", testimonial: "Database testimonial text", rating: 4, image_url: "/api/public/media/testimonials/999/image" }],
  blogs: [{ id: 999, title: "Admin Blog Test", slug: "admin-blog-test", excerpt: "Database blog excerpt", content: "Database full article text\n<script>unsafe()</script>", author: "Admin Author", featured_image_url: "/api/public/media/blogs/999/image" }],
};

try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/api/public/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/public/media/")) return route.fulfill({ contentType: "image/png", body: image });
      const key = url.pathname.split("/").pop();
      return route.fulfill({ json: rows[key] || [] });
    });

    for (const [url, text] of [["/clients", "Admin Client Test"], ["/industries", "Admin Industry Test"], ["/gallery", "Admin Gallery Test"], ["/blogs", "Admin Blog Test"]]) {
      await page.goto(base + url);
      if (url === "/clients") await page.getByAltText(text).waitFor();
      else await page.getByText(text, { exact: true }).first().waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Overflow on ${url}`);
      const media = page.locator('img[src*="/api/public/media/"]').first();
      await media.waitFor();
      await page.waitForFunction(() => [...document.images].some(img => img.src.includes("/api/public/media/") && img.complete && img.naturalWidth > 0));
    }

    await page.goto(base + "/gallery");
    await page.getByRole("button", { name: "Custom Category", exact: true }).click();
    await page.getByRole("button", { name: /Admin Gallery Test/ }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Close image preview" }).click();

    await page.goto(base + "/blogs");
    await page.getByRole("link", { name: "Read More" }).click();
    await page.waitForURL("**/blogs/admin-blog-test");
    await page.getByText(/Database full article text/).waitFor();
    assert.equal(await page.locator("article script").count(), 0);

    await page.goto(base + "/");
    await page.getByText('"Database testimonial text"', { exact: true }).waitFor();
    await page.getByText("Director | Test Company", { exact: true }).waitFor();
    await page.getByText("Admin Industry Test", { exact: true }).waitFor();
    await page.locator('img[src*="testimonials/999"]').waitFor();

    await page.goto(base + "/clients");
    await page.getByAltText("Admin Client Test").waitFor();
    rows.clients = [];
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.getByAltText("Admin Client Test").waitFor({ state: "detached" });
    assert.equal(await page.getByAltText("Bank of India", { exact: true }).count(), 0);
    rows.clients = [{ id: 999, name: "Admin Client Test", logo_url: "/api/public/media/clients/999/logo" }];
    await page.evaluate(() => window.dispatchEvent(new StorageEvent("storage", { key: "shivrudra_public_content_changed" })));
    await page.getByAltText("Admin Client Test").waitFor();

    const editor = await context.newPage();
    await editor.addInitScript(() => localStorage.setItem("admin_token", "fixture-token"));
    await editor.route("**/api/admin/clients", route => {
      if (route.request().method() === "POST") {
        rows.clients.push({ id: 1000, name: "Saved Client Test", logo_url: "/api/public/media/clients/1000/logo" });
        return route.fulfill({ json: { id: 1000 } });
      }
      return route.fulfill({ json: rows.clients });
    });
    await editor.route("**/api/public/media/**", route => route.fulfill({ contentType: "image/png", body: image }));
    await editor.goto(base + "/shivrudra_graphics-myadmin/clients");
    await editor.getByRole("button", { name: "Add Client", exact: true }).click();
    await editor.getByLabel("Client Name", { exact: true }).fill("Saved Client Test");
    await editor.locator('input[type="file"]').setInputFiles("src/assets/client logos/boi.png");
    await editor.getByRole("button", { name: "Save Product", exact: true }).click();
    await editor.getByText("Client added successfully.", { exact: true }).waitFor();
    await page.bringToFront();
    await page.getByAltText("Saved Client Test").waitFor();
    await editor.close();
    rows.clients = [{ id: 999, name: "Admin Client Test", logo_url: "/api/public/media/clients/999/logo" }];

    const originalGallery = rows.gallery;
    rows.gallery = [];
    await page.goto(base + "/gallery");
    await page.waitForFunction(() => document.querySelectorAll('main button img').length === 0);
    rows.gallery = originalGallery;
    assert.deepEqual(errors, []);
    if (process.env.SHIVRUDRA_SCREENSHOT_DIR) {
      await page.goto(base + "/blogs");
      await page.getByText("Admin Blog Test", { exact: true }).waitFor();
      fs.mkdirSync(process.env.SHIVRUDRA_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.SHIVRUDRA_SCREENSHOT_DIR, `blogs-${viewport.width}.png`), fullPage: true });
    }
    await context.close();
    console.log(`PASS ${viewport.width}px: content, images, gallery filters/preview, blog navigation, escaped article content, testimonials, empty lists, focus refresh, and no overflow.`);
  }
} finally {
  await browser.close();
}
