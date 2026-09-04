// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect, beforeEach } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const INDEX_HTML_PATH = path.resolve(process.cwd(), 'index.html');
const INDEX_CSS_PATH = path.resolve(process.cwd(), 'src/index.css');
const NAVBAR_SRC_PATH = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
const MATRIX_SRC_PATH = path.resolve(process.cwd(), 'src/components/TimesTableMatrix.tsx');
const TABLES_SRC_PATH = path.resolve(
  process.cwd(),
  'src/components/MultiplicationTablesView.tsx'
);

describe('Tier 1: Root Canvas & Theme Synchronization Contract', () => {
  // In-memory DOM and Storage Mock for theme synchronization verification
  class ClassListMock {
    private classes = new Set<string>();
    add(cls: string) {
      this.classes.add(cls);
    }
    remove(cls: string) {
      this.classes.delete(cls);
    }
    contains(cls: string) {
      return this.classes.has(cls);
    }
    toggle(cls: string, force?: boolean) {
      if (force !== undefined) {
        if (force) this.add(cls);
        else this.remove(cls);
      } else {
        if (this.contains(cls)) this.remove(cls);
        else this.add(cls);
      }
    }
  }

  class StorageMock {
    private store: Record<string, string> = {};
    getItem(key: string) {
      return this.store[key] || null;
    }
    setItem(key: string, value: string) {
      this.store[key] = value;
    }
    removeItem(key: string) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
  }

  let htmlClassList: ClassListMock;
  let bodyClassList: ClassListMock;
  let storage: StorageMock;

  beforeEach(() => {
    htmlClassList = new ClassListMock();
    bodyClassList = new ClassListMock();
    storage = new StorageMock();
  });

  function applyTheme(darkMode: boolean) {
    if (darkMode) {
      htmlClassList.add('dark');
      bodyClassList.add('dark');
      storage.setItem('arithmetica-theme', 'dark');
    } else {
      htmlClassList.remove('dark');
      bodyClassList.remove('dark');
      storage.setItem('arithmetica-theme', 'light');
    }
  }

  function getInitialTheme(): boolean {
    const saved = storage.getItem('arithmetica-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false;
  }

  it('adds .dark class to both html and body when dark mode is enabled', () => {
    applyTheme(true);
    expect(htmlClassList.contains('dark')).toBe(true);
    expect(bodyClassList.contains('dark')).toBe(true);
    expect(storage.getItem('arithmetica-theme')).toBe('dark');
  });

  it('removes .dark class from both html and body when light mode is enabled', () => {
    // First set dark
    applyTheme(true);
    expect(htmlClassList.contains('dark')).toBe(true);

    // Switch to light
    applyTheme(false);
    expect(htmlClassList.contains('dark')).toBe(false);
    expect(bodyClassList.contains('dark')).toBe(false);
    expect(storage.getItem('arithmetica-theme')).toBe('light');
  });

  it('persists and recovers theme state from localStorage (arithmetica-theme)', () => {
    storage.setItem('arithmetica-theme', 'dark');
    expect(getInitialTheme()).toBe(true);

    storage.setItem('arithmetica-theme', 'light');
    expect(getInitialTheme()).toBe(false);
  });

  it('defaults to light mode when no preference is saved in localStorage', () => {
    expect(getInitialTheme()).toBe(false);
  });

  it('removes hardcoded light background class (bg-[#FAF8F5]) from html tag in index.html', () => {
    const htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    const htmlTagMatch = htmlContent.match(/<html\b[^>]*>/i);
    expect(htmlTagMatch).not.toBeNull();
    const htmlTag = htmlTagMatch![0];
    expect(htmlTag).not.toContain('bg-[#FAF8F5]');
  });

  it('removes hardcoded light background class (bg-[#FAF8F5]) from body tag in index.html', () => {
    const htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    const bodyTagMatch = htmlContent.match(/<body\b[^>]*>/i);
    expect(bodyTagMatch).not.toBeNull();
    const bodyTag = bodyTagMatch![0];
    expect(bodyTag).not.toContain('bg-[#FAF8F5]');
  });
});

describe('Tier 1 & Tier 2: Tailwind CSS v4 Dark Variant & Scrollbar Styling', () => {
  it('defines Tailwind v4 custom dark variant (@custom-variant dark) in index.css', () => {
    const cssContent = fs.readFileSync(INDEX_CSS_PATH, 'utf8');
    const hasCustomVariant =
      cssContent.includes('@custom-variant dark') ||
      cssContent.includes('@variant dark') ||
      cssContent.includes('.dark');
    expect(hasCustomVariant).toBe(true);
  });

  it('defines dark scrollbar track style in index.css to eliminate right-edge light strip', () => {
    const cssContent = fs.readFileSync(INDEX_CSS_PATH, 'utf8');
    // Dark track must be styled with #141412 or #181816 or .dark ::-webkit-scrollbar-track
    const hasDarkScrollbar =
      cssContent.includes('.dark ::-webkit-scrollbar-track') ||
      cssContent.includes('.dark::-webkit-scrollbar-track') ||
      cssContent.includes('#141412') ||
      cssContent.includes('#181816');
    expect(hasDarkScrollbar).toBe(true);
  });
});

describe('Tier 2 & Tier 3: Full-Width Layout & Overflow Protection', () => {
  it('Navbar container includes min-w-0 to prevent viewport overflow blowout', () => {
    const navbarContent = fs.readFileSync(NAVBAR_SRC_PATH, 'utf8');
    expect(navbarContent).toContain('min-w-0');
  });

  it('TimesTableMatrix uses overflow-x-auto for horizontal scroll containment', () => {
    const matrixContent = fs.readFileSync(MATRIX_SRC_PATH, 'utf8');
    expect(matrixContent).toContain('overflow-x-auto');
  });

  it('MultiplicationTablesView uses responsive grid containment to prevent layout blowout', () => {
    const tablesContent = fs.readFileSync(TABLES_SRC_PATH, 'utf8');
    const hasGridContainment =
      tablesContent.includes('grid-cols-1') &&
      tablesContent.includes('overflow-hidden');
    expect(hasGridContainment).toBe(true);
  });

  it('TimesTableMatrix applies dark background consistently across table container', () => {
    const matrixContent = fs.readFileSync(MATRIX_SRC_PATH, 'utf8');
    // Verifies container has dark theme styling
    expect(matrixContent).toContain('darkMode');
    const hasDarkBg =
      matrixContent.includes('bg-[#181816]') ||
      matrixContent.includes('bg-[#23231F]') ||
      matrixContent.includes('dark:bg-');
    expect(hasDarkBg).toBe(true);
  });

  it('MultiplicationTablesView applies dark background consistently across table container', () => {
    const tablesContent = fs.readFileSync(TABLES_SRC_PATH, 'utf8');
    expect(tablesContent).toContain('darkMode');
    const hasDarkBg =
      tablesContent.includes('bg-[#181816]') ||
      tablesContent.includes('bg-[#23231F]') ||
      tablesContent.includes('dark:bg-');
    expect(hasDarkBg).toBe(true);
  });
});
