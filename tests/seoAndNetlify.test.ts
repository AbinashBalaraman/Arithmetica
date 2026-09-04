// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const INDEX_HTML_PATH = path.resolve(process.cwd(), 'index.html');
const ROBOTS_PATH = path.resolve(process.cwd(), 'public/robots.txt');
const SITEMAP_PATH = path.resolve(process.cwd(), 'public/sitemap.xml');
const MANIFEST_PATH = path.resolve(process.cwd(), 'public/manifest.json');
const FAVICON_PATH = path.resolve(process.cwd(), 'public/favicon.svg');
const OG_IMAGE_PATH = path.resolve(process.cwd(), 'public/og-image.svg');
const NETLIFY_TOML_PATH = path.resolve(process.cwd(), 'netlify.toml');

describe('Tier 1: HTML Head Metadata & Canonical Link', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  it('contains descriptive, keyword-rich title with Arithmetica brand', () => {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    expect(titleMatch).not.toBeNull();
    const title = titleMatch![1];
    expect(title).toContain('Arithmetica');
    expect(title.toLowerCase()).toContain('natural numbers');
  });

  it('contains canonical URL pointing to production domain', () => {
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    expect(canonicalMatch).not.toBeNull();
    expect(canonicalMatch![1]).toBe('https://arithmetica.netlify.app/');
  });

  it('contains meta description and meta keywords', () => {
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].length).toBeGreaterThan(30);

    const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
    expect(keywordsMatch).not.toBeNull();
    expect(keywordsMatch![1]).toContain('arithmetica');
    expect(keywordsMatch![1]).toContain('factor pairs');
  });

  it('contains dual theme-color definitions for light and dark modes', () => {
    const lightThemeMatch = html.match(
      /<meta\s+name=["']theme-color["']\s+media=["']\([^)]*light[^)]*\)["']\s+content=["']([^"']+)["']/i
    );
    expect(lightThemeMatch).not.toBeNull();
    expect(lightThemeMatch![1]).toBe('#FAF8F5');

    const darkThemeMatch = html.match(
      /<meta\s+name=["']theme-color["']\s+media=["']\([^)]*dark[^)]*\)["']\s+content=["']([^"']+)["']/i
    );
    expect(darkThemeMatch).not.toBeNull();
    expect(darkThemeMatch![1]).toBe('#141412');
  });

  it('links to favicon.svg and manifest.json in head', () => {
    expect(html).toContain('href="/favicon.svg"');
    expect(html).toContain('href="/manifest.json"');
  });
});

describe('Tier 1: Open Graph & Twitter Social Cards', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  it('contains valid Open Graph metadata (og:type, og:url, og:title, og:image)', () => {
    expect(html).toMatch(/<meta\s+property=["']og:type["']\s+content=["']website["']/i);
    expect(html).toMatch(
      /<meta\s+property=["']og:url["']\s+content=["']https:\/\/arithmetica\.netlify\.app\/["']/i
    );
    expect(html).toMatch(/<meta\s+property=["']og:title["']\s+content=["'][^"']*Arithmetica[^"']*["']/i);
    expect(html).toMatch(
      /<meta\s+property=["']og:image["']\s+content=["']https:\/\/arithmetica\.netlify\.app\/og-image\.svg["']/i
    );
    expect(html).toMatch(/<meta\s+property=["']og:image:width["']\s+content=["']1200["']/i);
    expect(html).toMatch(/<meta\s+property=["']og:image:height["']\s+content=["']630["']/i);
  });

  it('contains valid Twitter Card metadata (summary_large_image, title, image)', () => {
    expect(html).toMatch(/<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i);
    expect(html).toMatch(
      /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*Arithmetica[^"']*["']/i
    );
    expect(html).toMatch(
      /<meta\s+name=["']twitter:image["']\s+content=["']https:\/\/arithmetica\.netlify\.app\/og-image\.svg["']/i
    );
  });
});

describe('Tier 1 & Tier 2: Structured Data (JSON-LD) Validation', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  it('contains valid schema.org WebApplication and EducationalApplication JSON-LD', () => {
    const jsonLdMatch = html.match(
      /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i
    );
    expect(jsonLdMatch).not.toBeNull();

    const jsonStr = jsonLdMatch![1].trim();
    let parsed: any;
    expect(() => {
      parsed = JSON.parse(jsonStr);
    }).not.toThrow();

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('WebApplication');
    expect(parsed.applicationCategory).toBe('EducationalApplication');
    expect(parsed.name).toBe('Arithmetica');
    expect(parsed.url).toBe('https://arithmetica.netlify.app/');
    expect(Array.isArray(parsed.featureList)).toBe(true);
    expect(parsed.featureList.length).toBeGreaterThanOrEqual(5);
    expect(parsed.offers?.price).toBe('0');
  });
});

describe('Tier 1: Search Engine Discovery Assets (robots.txt & sitemap.xml)', () => {
  it('public/robots.txt exists and allows crawling with canonical sitemap directive', () => {
    expect(fs.existsSync(ROBOTS_PATH)).toBe(true);
    const robots = fs.readFileSync(ROBOTS_PATH, 'utf8');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://arithmetica.netlify.app/sitemap.xml');
  });

  it('public/sitemap.xml exists with valid XML and canonical location', () => {
    expect(fs.existsSync(SITEMAP_PATH)).toBe(true);
    const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset');
    expect(sitemap).toContain('<loc>https://arithmetica.netlify.app/</loc>');
    expect(sitemap).toContain('<changefreq>');
    expect(sitemap).toContain('<priority>');
  });

  it('public/manifest.json is valid web manifest with standalone display and branding', () => {
    expect(fs.existsSync(MANIFEST_PATH)).toBe(true);
    const manifestStr = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(manifestStr);
    expect(manifest.name).toContain('Arithmetica');
    expect(manifest.short_name).toBe('Arithmetica');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#FAF8F5');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
  });

  it('public/favicon.svg and public/og-image.svg are valid vector graphics', () => {
    expect(fs.existsSync(FAVICON_PATH)).toBe(true);
    const favicon = fs.readFileSync(FAVICON_PATH, 'utf8');
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('viewBox="0 0 64 64"');

    expect(fs.existsSync(OG_IMAGE_PATH)).toBe(true);
    const ogImage = fs.readFileSync(OG_IMAGE_PATH, 'utf8');
    expect(ogImage).toContain('<svg');
    expect(ogImage).toContain('width="1200"');
    expect(ogImage).toContain('height="630"');
    expect(ogImage).toContain('Arithmetica');
  });
});

describe('Tier 1 & Tier 2: Netlify Configuration (netlify.toml)', () => {
  it('netlify.toml configures publish directory and SPA fallback routing', () => {
    expect(fs.existsSync(NETLIFY_TOML_PATH)).toBe(true);
    const toml = fs.readFileSync(NETLIFY_TOML_PATH, 'utf8');
    expect(toml).toContain('publish = "dist"');
    expect(toml).toContain('from = "/*"');
    expect(toml).toContain('to = "/index.html"');
    expect(toml).toContain('status = 200');
  });

  it('netlify.toml defines immutable long-term caching for /assets/*', () => {
    const toml = fs.readFileSync(NETLIFY_TOML_PATH, 'utf8');
    expect(toml).toContain('for = "/assets/*"');
    expect(toml).toContain('Cache-Control = "public, max-age=31536000, immutable"');
  });

  it('netlify.toml defines HTTP security headers on general routes', () => {
    const toml = fs.readFileSync(NETLIFY_TOML_PATH, 'utf8');
    expect(toml).toContain('X-Frame-Options = "DENY"');
    expect(toml).toContain('X-Content-Type-Options = "nosniff"');
    expect(toml).toContain('Referrer-Policy = "strict-origin-when-cross-origin"');
    expect(toml).toContain('Permissions-Policy');
  });

  it('netlify.toml provides revalidation caching for discovery assets (robots, sitemap, manifest)', () => {
    const toml = fs.readFileSync(NETLIFY_TOML_PATH, 'utf8');
    expect(toml).toContain('for = "/robots.txt"');
    expect(toml).toContain('for = "/sitemap.xml"');
    expect(toml).toContain('for = "/manifest.json"');
  });
});
