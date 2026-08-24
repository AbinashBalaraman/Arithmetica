# Contributing to Natural Numbers & Multiplication Tables Explorer

Thank you for your interest in contributing! We appreciate your support in making this educational tool better for learners, educators, and math enthusiasts.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and collaborative in all discussions and pull requests.

---

## How to Contribute

### Reporting Bugs
1. Search existing issues to ensure the bug hasn't already been reported.
2. Open a new issue with a clear title, description, steps to reproduce, and screenshots or screen recordings where applicable.
3. Specify your browser, operating system, and device resolution.

### Suggesting Enhancements
1. Open a feature request issue describing the proposed enhancement.
2. Detail the educational or functional motivation for the change and how it benefits users.

### Submitting Pull Requests
1. **Fork** the repository and clone it to your local machine.
2. Create a new branch with a descriptive name:
   ```bash
   git checkout -b feature/interactive-gcd-visualizer
   # or
   git checkout -b fix/mobile-table-overflow
   ```
3. Install dependencies and run the local development server:
   ```bash
   npm install
   npm run dev
   ```
4. Implement your changes. Ensure code adheres to the project's formatting and component structure.
5. Verify that the build and type-checker pass with zero warnings or errors:
   ```bash
   npm run lint
   npm run build
   ```
6. Commit your changes using concise, descriptive commit messages:
   ```bash
   git commit -m "feat: add prime factor decomposition tree view"
   ```
7. Push your branch to your fork and submit a **Pull Request** to `main`.

---

## Development Guidelines

- **Component Design**: Keep UI components modular, accessible, and responsive across viewport sizes.
- **Styling**: Use standard Tailwind CSS utility classes and adhere to the Natural Tones palette (`#FAF8F5`, `#4A4A38`, `#E8E4DE`, `#5A5A40`).
- **Mathematical Accuracy**: Always verify formula derivations against mathematical ground truth in `src/utils/mathUtils.ts`.
- **Keyboard Accessibility**: Ensure all interactive cards and modals support proper tab indexing and keyboard shortcuts (`Escape`, `ArrowLeft`, `ArrowRight`).

---

Thank you for your contribution!
