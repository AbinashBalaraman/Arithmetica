# Arithmetica - Natural Numbers & Multiplication Tables Explorer

An interactive, responsive mathematics visualization tool built for exploring natural numbers, factor pair decompositions, custom multiplication tables, flashcard revisions, Pythagorean multiplication matrices, and number theory properties.


🚀 **Live App**: [https://arithmetica.netlify.app/](https://arithmetica.netlify.app/)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://arithmetica.netlify.app/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Understanding factors, multiples, and multiplication tables is fundamental to arithmetic and number theory. This application provides a modern, interactive environment to explore numbers from 1 to 1000+, generate customizable multiplication tables, practice flashcard revision, visualize geometric area models, inspect times tables, test factor recognition in an interactive quiz game, and discover prime factorizations.

---

## Key Features

### 1. Interactive Numbers Explorer
- **Dynamic Grid**: Browse natural numbers across configurable ranges (`1–50`, `1–100`, `1–200`, `1–500`, `1–1000`, or custom).
- **Infinite Scroll & Page-End Loader**: Smooth dynamic loading that automatically or manually loads the next 50 or 100 numbers at the end of the page without leaving your current view.
- **Comprehensive Filters**: Filter instantly by Prime, Composite, Perfect Squares ($x^2$), Perfect Cubes ($x^3$), Even, Odd, Multiples of $k$, or search directly for any specific integer or factor.
- **Quick-Access Shortcuts**: Instant test shortcuts for numbers like 27, 64, 12, 24, 36, 48, 72, 81, 100, 144.

### 2. Dedicated Multiplication Tables View (1 to 20+)
- **Pre-Configured Tables**: Instant access to standard multiplication tables 1 through 20 (or 1 to 10, 1 to 50, 1 to 100).
- **Customizable Range**: Customize the number of tables dynamically up to any number (e.g. up to 30, 50, 100, 200) with customizable multipliers up to 10, 12, 20, or 50.
- **Quick Table Finder & Copy**: Search for specific tables and copy any table's equations with one click.

### 3. Quick Revision View (1 to 100)
- **Focused Flashcard Grid**: Compact 1 to 100 numbers grid designed specifically for rapid mental arithmetic revision and memory drills.
- **Instant Factor Popup**: Clicking any number instantly shows a lightweight, focused factor popup box displaying only its factor pairs, divisors, and equations.

### 4. Factor Decomposition & Area Models
- **Factor Pairs**: Lists all distinct pairs $(a, b)$ such that $a \times b = N$, alongside complementary division statements ($N \div a = b$).
- **Geometric Array Visualizer**: Renders real-time 2D block arrays and area models demonstrating how rows and columns compose the target product.
- **Containing Tables Lookup**: Reverse-lookup showing which standard multiplication tables (e.g., Table of 3, Table of 9) contain the number as an exact product.
- **Prime Factorization**: Prime factor decomposition with exponential notation (e.g., $64 = 2^6$, $72 = 2^3 \times 3^2$).
- **Number Theory Metrics**: Divisor count ($\tau$), sum of divisors ($\sigma$), classification (Deficient, Abundant, Perfect), Roman numerals, and Binary/Hexadecimal representations.

### 5. Pythagorean Multiplication Matrix & Quiz
- **Crosshair Matrix**: Interactive multiplication table with configurable dimensions ($10\times10$, $12\times12$, $15\times15$, $20\times20$) and diagonal square highlighting.
- **Factor Quiz & Practice**: Timed practice mode challenging learners to identify all valid factor pairs for a randomly generated target number.

### 6. Design & Theming
- **Natural Tones Aesthetic (Default)**: Warm neutral canvas (`#FAF8F5`), refined charcoal-olive typography (`#4A4A38`), stone borders (`#E8E4DE`), and natural olive accents.
- **Dark Mode Support**: Seamless toggleable dark mode with warm charcoal backgrounds (`#141412`), gold accents (`#C29B38`), and eye-safe high contrast.
- **Responsive Layout**: Fluid layout on mobile, tablet, and ultra-wide screens with touch-friendly targets.
- **Keyboard Navigation**: Navigate smoothly using `ArrowLeft` (Previous), `ArrowRight` (Next), and `Esc` (Close modal).

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI component architecture and reactive state management |
| **TypeScript** | Static typing and interfaces for mathematical structures |
| **Vite 6** | Fast local development server and optimized production build |
| **Tailwind CSS v4** | Modern utility-first styling with custom typographic scale |
| **Framer Motion (`motion`)** | Smooth modal animations and state transitions |
| **Lucide Icons** | Vector icons for UI controls and navigation |
| **Canvas Confetti** | Celebration particles for quiz milestones |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/arithmetica-factors-explorer.git
   cd arithmetica-factors-explorer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## Pushing to GitHub

To publish this project to GitHub under a unique repository name:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all project files
git add .

# 3. Commit the changes
git commit -m "feat: complete arithmetica numbers explorer with tables, revision, and dark mode"

# 4. Set main branch
git branch -M main

# 5. Add your remote GitHub repository (replace with your unique repo name)
git remote add origin https://github.com/<your-username>/arithmetica-factors-explorer.git

# 6. Push to GitHub
git push -u origin main
```

---

## Building & Deployment

Arithmetica is a standalone, client-side web application built with React and Vite. It produces static web assets that can be hosted on any static host or web server (e.g. Netlify, Vercel, GitHub Pages, Cloudflare Pages, Nginx, or Docker).

### Build for Production
```bash
# Generate optimized production build in dist/
npm run build
# or using bun
bun run build
```

### Preview Local Build
```bash
npm run preview
# or using bun
bun run preview
```

> **Note**: Dedicated Netlify deployment settings, redirects, and automated continuous deployment configurations are maintained in the [`netlify`](https://github.com/AbinashBalaraman/Arithmetica/tree/netlify) branch.

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml                     # Automated CI build and type-checking
├── public/
│   ├── favicon.svg                    # Application icon
│   ├── manifest.json                  # Web application manifest
│   ├── og-image.svg                   # Open Graph social sharing image
│   ├── robots.txt                     # Crawler indexing rules
│   └── sitemap.xml                    # XML sitemap
├── src/
│   ├── components/
│   │   ├── FactorQuizGame.tsx         # Factor pair practice game with streaks
│   │   ├── FilterBar.tsx              # Range, category filters, and search bar
│   │   ├── MultiplicationTablesView.tsx # Customizable 1-20+ multiplication tables
│   │   ├── Navbar.tsx                 # Header bar, dark mode toggle, and view switcher
│   │   ├── NumberCard.tsx             # Natural number card with factors preview
│   │   ├── NumberDetailModal.tsx      # Modal with factor pairs, arrays, trees
│   │   ├── RevisionView.tsx           # Compact 1-100 revision grid with instant popups
│   │   └── TimesTableMatrix.tsx       # Interactive Pythagorean multiplication grid
│   ├── utils/
│   │   └── mathUtils.ts               # Prime factorization, divisors, and audio FX
│   ├── App.tsx                        # Main application orchestration & infinite scroll
│   ├── index.css                      # Global styles and Tailwind imports
│   ├── main.tsx                       # React root mount
│   └── types.ts                       # TypeScript interfaces and data models
├── index.html                         # HTML5 entry template
├── package.json                       # Project metadata and dependencies
├── tsconfig.json                      # TypeScript compiler configuration
├── vite.config.ts                     # Vite bundler configuration
└── README.md                          # Project documentation
```

---

## Mathematical Logic

The core calculation utility is located in `src/utils/mathUtils.ts`:

- **Divisor Enumeration**: Computes all divisors in $O(\sqrt{N})$ time complexity:
  $$\forall i \in [1, \lfloor\sqrt{N}\rfloor], \quad \text{if } N \pmod i = 0 \implies i \text{ and } \frac{N}{i} \text{ are factors}$$
- **Prime Factorization**: Generates prime components $(p, k)$ such that $N = \prod p_i^{k_i}$.
- **Aliquot Sum & Classification**: Calculates the sum of proper divisors $\sigma(N) - N$ to categorize numbers into Deficient, Abundant, or Perfect.

---

## Contributing

Contributions, issues, and feature requests are welcome!
Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for details on code standards and pull request guidelines.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

