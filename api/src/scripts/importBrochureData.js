import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");
const publicImageDir = path.join(rootDir, "public/images/brochure-products");
const serviceSlugAliases = {
  "badge-and-dome-printing": "badge-dome-printing",
  "rubber-stamps": "stamp",
  "engraving-and-marking": "engraving-marking",
  keychains: "keychain",
  "corporate-gifts": "corporate-gift",
  "laser-and-cnc-cutting": "laser-cnc-cutting",
};

const brochureServices = [
  {
    name: "Designing",
    products: [
      "Social Media Creatives",
      "Logos (Brand Identity)",
      "Brochures Design",
      "Certificates Design",
      "Calligraphy & Vector Art",
      "Flyers Design",
      "Invitations Cards Design",
      "Car Wrap Design",
      "Letterhead Design",
      "Banners Design",
      "Business Cards Design",
      "Posters Design",
      "LED Signages Design",
      "Product Packaging Labels & Stickers Design",
    ],
  },
  {
    name: "Flex Printing",
    products: [
      "Normal Flex Printing",
      "Black Back Flex Printing",
      "Star Flex Printing",
      "Backlit Flex Printing",
      "One Way Vision Printing",
      "Roll Up Standee",
      "Canopy Standee",
      "Graffiti Wall Printing",
    ],
  },
  {
    name: "Vinyl Printing",
    products: [
      "Vinyl Printing",
      "Frosted Filming",
      "Retro Vinyl Printing",
      "3M Vinyl Printing",
      "Transparent Vinyl Printing",
      "Night Glow Vinyl",
      "Vinyl Foam Board",
      "Floor Graphics Printing",
      "Table Top Printing",
      "Cutout Standees",
      "Sun Board Standee",
      "Car Branding",
      "Wallpaper Printing",
      "Bus Branding",
    ],
  },
  {
    name: "UV Printing",
    products: [
      "UV Vinyl Printing",
      "UV Fabric Printing",
      "UV Canvas Printing",
      "UV Translite Printing",
      "UV Acrylic Printing",
      "UV Foam Printing",
      "UV ACP Printing",
    ],
  },
  {
    name: "Screen Printing",
    products: [
      "Polycarbonate Sticker Printing",
      "Polycarbonate Labels Printing",
      "Sun Pack Printing",
      "Bottle Printing",
      "Plastic Crate Printing",
      "Vinyl Tag Printing",
      "Polyester Printing",
      "School Bag Printing",
      "Umbrella Printing",
      "Membrane Keypads",
      "Control Panel Sticker",
      "PP Box Printing",
      "Corrugate Box Printing",
      "Metal QR Code Printing",
      "Textile Printing",
      "Glass Printing",
      "Wooden Printing",
      "SS Plate Printing",
      "MS Plate Printing",
      "Aluminum Plate Printing",
    ],
  },
  {
    name: "Digital Printing",
    products: [
      "Texture Paper Printing",
      "Sticker Paper Printing",
      "NT Paper Printing",
      "Transparent Paper Printing",
      "Product Label Printing",
      "Tag Printing",
      "Coupon Printing",
      "Wristband Printing",
      "Certificate Printing",
      "Tent Cards Printing",
      "Invitation Cards Printing",
      "Menu Card Printing",
      "Danglers Printing",
      "Barcode Sticker Printing",
      "Safety Signage Poster Printing",
      "Door Hangers Printing",
      "Vehicle Parking Sticker Printing",
      "Cable Tag Printing",
      "Roll Labels Printing",
      "Packaging Sticker Printing",
      "Custom Car Stickers",
      "PVC ID Card Printing",
      "Lanyard Printing",
      "Industrial Packaging Label",
    ],
  },
  {
    name: "Offset Printing",
    products: [
      "Pawati Book Printing",
      "Gift Voucher Printing",
      "Packaging Sleeves",
      "Wrapping Paper",
      "Seal Stickers",
      "Ticket Printing",
      "Bookmark Printing",
      "Rack Card Printing",
      "Header Card Printing",
      "Shelf Wobblers Printing",
      "Bottle Neck Tags Printing",
      "Swing Tags Printing",
      "Tree Tag Printing",
      "Cloth Tag Printing",
      "Business Card Printing",
      "Envelope Printing",
      "Brochure Printing",
      "Leaflet Printing",
      "Letterhead Printing",
      "Register Printing",
      "Bank Form Printing",
      "Prospectus Printing",
      "Stationery Printing",
      "Pharmacy Literature Printing",
      "Scratch Card Printing",
      "Box Printing",
      "Synthetic Tags",
      "Report Card Printing",
      "File Printing",
      "Hospital File Printing",
      "Pocket Folder Printing",
      "Prescription Pad Printing",
      "Medical Pouch Printing",
      "Calendar Printing",
      "Diary Printing",
      "Parking Valet Tag Printing",
      "Card Sheet Printing",
      "Bill Book Printing",
      "Receipt Book Printing",
      "Notebook Printing",
      "Catalogue Printing",
      "Notepads Printing",
    ],
  },
  { name: "Photo Frame", products: ["Wooden Photo Frame", "Sparkle Photo Frame", "Acrylic Photo Frame"] },
  {
    name: "Badge & Dome Printing",
    products: [
      "Dome Sticker",
      "SS Dome Sticker",
      "Paper Printing",
      "Acrylic Epoxy Badge Printing",
      "SS Metal Epoxy Badge",
      "Pin Button Badge",
      "Magnet Button Badge",
    ],
  },
  { name: "Bag Printing", products: ["Nonwoven Bag Printing", "Paper Bag Printing"] },
  {
    name: "Rubber Stamps",
    products: [
      "Pre Ink Stamp",
      "Sun Stamp",
      "Colop Stamp",
      "Trodat Stamp",
      "Numbering Stamp",
      "Colop Numbering Stamp",
      "Dolphin Numbering Stamp",
      "Dater Stamp",
      "Colop Dater Stamp",
      "Dolphin Dater Stamp",
    ],
  },
  {
    name: "Engraving & Marking",
    products: [
      "Industrial Objects Printing",
      "Automotive Parts Printing",
      "Electrical Components Printing",
      "Cosmetics Bottle Printing",
      "Appliances Printing",
      "White Goods Printing",
    ],
  },
  {
    name: "Keychains",
    products: ["Dome Keychain", "Acrylic Keychain", "SS Keychain", "Badge Keychain", "Rexene Leather Keychain"],
  },
  {
    name: "Corporate Gifts",
    products: [
      "Mug Printing",
      "Cap Printing",
      "T Shirt Printing",
      "Mouse Pad Printing",
      "Flasks Bottle Printing",
      "Pen Printing",
      "Diaries Printing",
      "Shirt Embroidery",
      "Tumblers Printing",
      "Card Holder Printing",
      "Reflective Safety Printing",
      "Mobile Laptop Stand",
      "Employee Gift Stand",
    ],
  },
  {
    name: "Industrial Name Plates",
    products: [
      "Gold Laser Plates",
      "Silver Laser Plates",
      "ABS Plastic Marking",
      "Automobile Parts Marking",
      "Metal Parts Marking",
      "SS Etching Plates",
      "Traffolyte Name Plate",
      "Leather Marking",
      "QR Code Plates",
      "Black Stainless Marking",
      "Bulb Marking",
      "Watch Case",
      "SS Marking",
      "Hardware Tool Marking",
      "Polymer Material Marking",
      "Anodised Aluminum Plates",
      "PVC Ferrule Printing",
      "Heat Shrink Tube",
      "Marking Strip",
      "Safety Label",
    ],
  },
  {
    name: "Signage",
    products: [
      "Standee Signages",
      "Sun Board Signages",
      "Pylon Signages",
      "Fabric Signages",
      "Backlight Board Signages",
      "Clip-on Board",
      "Night Glow Signages",
      "Acrylic Sandwich",
      "White Board",
      "2D LED Signages",
      "3D LED Signages",
      "Magnetic Signages",
      "Easel Standee",
      "SS Letter Signages",
      "Acrylic Letter Signages",
      "MS Letter Signages",
      "Crystal Signages",
      "Profile Bending Signages",
      "Liquid Letter Signages",
      "Lobby Signages",
      "Retro Signages",
      "Scrolling Signages",
      "Industrial Display Signages",
      "Acrylic Folder Signages",
      "Acrylic Magnetic Folder Signages",
      "Acrylic Name Board Signages",
      "Acrylic First Aid Box",
      "Acrylic Suggestion Box",
      "Acrylic Customized Box",
      "Acrylic Name Plate",
      "Neon Signages",
      "3D Acrylic LED Lamp",
      "ACP Gate Signages",
      "QR Code Standee",
      "MS Frame Backlight",
      "ACP Signages",
      "Acrylic Signages",
      "Wooden Name Plates",
    ],
  },
  {
    name: "Premium Signages",
    products: [
      "Way Finding Signage",
      "Free Hand Signage",
      "Directory Signage",
      "Table Top Signage",
      "Home Name Plates",
      "Plaque",
      "Awards",
      "Hangers",
      "3D Sign",
      "2D Sign",
      "Acrylic Sign",
    ],
  },
  {
    name: "Safety Signages",
    products: [
      "Vinyl Safety Signage",
      "Emergency Safety Signage",
      "Warning Safety Signage",
      "Fire Safety Signage",
      "Prohibition Signage",
      "Recycle Signage",
      "Safety Floor Signage",
      "Road Signage",
      "Night Glow Signage",
      "No Parking Signage",
      "Emergency Exit Signage",
      "Wear Safety Helmet Signage",
      "Main Switch Signage",
    ],
  },
  {
    name: "Laser & CNC Cutting",
    products: [
      "MDF Cutting",
      "MDF Engraving",
      "ACP Cutting",
      "Acrylic Jali Cutting",
      "ACP Jali Cutting",
      "MS Jali Cutting",
      "SS Jali Cutting",
      "Acrylic Cutting",
      "Acrylic Engraving",
    ],
  },
  {
    name: "Trophies & Medals",
    products: [
      "Acrylic Trophies",
      "Wooden Trophies",
      "Plastic Frame Trophies",
      "Metal Frame Trophies",
      "Foil Trophies",
      "Metal Trophies",
      "ABS Trophies",
      "Flag Trophies",
      "Cups Trophies",
      "Medals",
      "Silver Certificate",
      "Golden Certificate",
    ],
  },
];

function toSlug(value) {
  return slugify(value.replace(/&/g, "and"), { lower: true, strict: true });
}

function serviceSlug(name) {
  const slug = toSlug(name);
  return serviceSlugAliases[slug] || slug;
}

function descriptionFor(name) {
  return `${name} solutions from Shivrudra Graphics.`;
}

async function getBrochureImages() {
  await fs.mkdir(publicImageDir, { recursive: true });
  const entries = await fs.readdir(publicImageDir, { withFileTypes: true }).catch(() => []);
  const images = [];

  for (const entry of entries) {
    if (!entry.isFile() || !/\.(jpe?g|png|webp)$/i.test(entry.name)) continue;
    images.push(`/images/brochure-products/${entry.name}`);
  }

  return images.sort();
}

async function upsertService(service, sortOrder) {
  const slug = serviceSlug(service.name);
  await pool.execute(
    `INSERT INTO services (name, slug, short_description, description, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       short_description = VALUES(short_description),
       description = VALUES(description),
       sort_order = VALUES(sort_order),
       is_active = 1`,
    [service.name, slug, descriptionFor(service.name), descriptionFor(service.name), sortOrder],
  );

  const [rows] = await pool.execute("SELECT id FROM services WHERE slug = ?", [slug]);
  return rows[0].id;
}

async function upsertProduct(serviceId, productName, sortOrder, imageUrl) {
  const slug = toSlug(productName);
  await pool.execute(
    `INSERT INTO products (service_id, name, slug, short_description, description, main_image_url, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       service_id = VALUES(service_id),
       name = VALUES(name),
       short_description = VALUES(short_description),
       description = VALUES(description),
       main_image_url = COALESCE(NULLIF(products.main_image_url, ''), VALUES(main_image_url)),
       sort_order = VALUES(sort_order),
       is_active = 1`,
    [
      serviceId,
      productName,
      slug,
      descriptionFor(productName),
      descriptionFor(productName),
      imageUrl || null,
      sortOrder,
    ],
  );

  const [rows] = await pool.execute("SELECT id FROM products WHERE slug = ?", [slug]);
  const productId = rows[0].id;

  if (imageUrl) {
    const [existing] = await pool.execute("SELECT id FROM product_images WHERE product_id = ? AND image_url = ? LIMIT 1", [
      productId,
      imageUrl,
    ]);
    if (!existing[0]) {
      await pool.execute(
        "INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, 0)",
        [productId, imageUrl, productName],
      );
    }
  }
}

async function importGalleryImage(imageUrl, index) {
  const [existing] = await pool.execute("SELECT id FROM gallery_images WHERE image_url = ? LIMIT 1", [imageUrl]);
  if (existing[0]) return;

  await pool.execute(
    "INSERT INTO gallery_images (title, category, image_url, alt_text, sort_order, is_active) VALUES (?, 'Brochure', ?, ?, ?, 1)",
    [`Brochure Product ${index + 1}`, imageUrl, `Brochure Product ${index + 1}`, index],
  );
}

async function main() {
  const images = await getBrochureImages();
  let imageIndex = 0;

  for (const [serviceIndex, service] of brochureServices.entries()) {
    const serviceId = await upsertService(service, serviceIndex);
    for (const [productIndex, productName] of service.products.entries()) {
      const imageUrl = images[imageIndex % images.length];
      await upsertProduct(serviceId, productName, productIndex, imageUrl);
      imageIndex += 1;
    }
  }

  for (const [index, imageUrl] of images.entries()) {
    await importGalleryImage(imageUrl, index);
  }

  await cleanupDuplicateServices();

  console.log(
    `Imported ${brochureServices.length} brochure categories, ${brochureServices.reduce(
      (sum, item) => sum + item.products.length,
      0,
    )} products, and ${images.length} images.`,
  );
  process.exit(0);
}

async function cleanupDuplicateServices() {
  for (const [duplicateSlug, canonicalSlug] of Object.entries(serviceSlugAliases)) {
    const [duplicateRows] = await pool.execute("SELECT id FROM services WHERE slug = ?", [duplicateSlug]);
    const [canonicalRows] = await pool.execute("SELECT id FROM services WHERE slug = ?", [canonicalSlug]);
    const duplicate = duplicateRows[0];
    const canonical = canonicalRows[0];

    if (!duplicate || !canonical || duplicate.id === canonical.id) continue;

    await pool.execute("UPDATE products SET service_id = ? WHERE service_id = ?", [canonical.id, duplicate.id]);
    await pool.execute("DELETE FROM services WHERE id = ?", [duplicate.id]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
