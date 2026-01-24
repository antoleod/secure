import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'public');

const landingPaths = [
  'es/prestamo-dinero-bruselas/index.html',
  'fr/pret-argent-bruxelles/index.html',
  'nl/geld-lenen-brussel/index.html',
  'en/loan-money-brussels/index.html',
];

describe('static SEO assets', () => {
  it('has required public files', () => {
    const required = [
      'robots.txt',
      'sitemap.xml',
      'CNAME',
      'manifest.webmanifest',
      'privacy/index.html',
      'terms/index.html',
      'cookies/index.html',
      'responsible-lending/index.html',
      ...landingPaths,
    ];

    required.forEach((file) => {
      const full = join(publicDir, file);
      expect(existsSync(full), `${file} should exist in public/`).toBe(true);
    });
  });

  it('includes hreflang and canonical tags on each landing page', () => {
    landingPaths.forEach((file) => {
      const html = readFileSync(join(publicDir, file), 'utf8');
      expect(html).toMatch(/rel="canonical"/);
      expect(html).toMatch(/hreflang="es"/);
      expect(html).toMatch(/hreflang="fr"/);
      expect(html).toMatch(/hreflang="nl"/);
      expect(html).toMatch(/hreflang="en"/);
      expect(html).toMatch(/hreflang="x-default"/);
    });
  });

  it('robots.txt points to sitemap', () => {
    const robots = readFileSync(join(publicDir, 'robots.txt'), 'utf8');
    expect(robots).toContain('Sitemap: https://secure.oryxen.tech/sitemap.xml');
  });

  it('sitemap lists multilingual URLs', () => {
    const sitemap = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8');
    landingPaths.forEach((file) => {
      const url = `https://secure.oryxen.tech/${file.replace('/index.html', '/')}`;
      expect(sitemap).toContain(url);
    });
  });
});
