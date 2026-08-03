# StoreShot Studio Web

A modern, high-performance web experience for **StoreShot Studio** — a premium macOS and iOS utility designed to turn raw application UI into store-ready App Store and Google Play screenshot marketing assets.

Built entirely with pure **HTML5**, **CSS3**, and **Vanilla JavaScript** without external heavy dependencies or complex build tooling.

---

## 🌟 Key Highlights & Features

- **Liquid Glass Navigation Bar**:
  - Floating frosted glass aesthetic (`backdrop-filter: blur()`).
  - Active section scroll highlighting and mobile-responsive drawer menu.
  - Custom refined action buttons with bespoke directional arrow icons.
  - Precision `scroll-margin-top` anchor offsets that align cleanly under the header.

- **Interactive Hero Studio Editor**:
  - Live screenshot artboard simulator with real-time UI manipulation.
  - **Layer Inspector**: Interactive layer hierarchy (Product Preview, Headline, Background, Device Shadow).
  - **Platform Switcher**: Instant switching between **iPhone (iOS)** and **Android (Google Play)** frames & aspect ratios.
  - **Device Framing**: Toggle between Modern bezel-less frames and Classic framing.
  - **Color Engine**: Curated aesthetic preset swatches and custom native color picker with live gradient calculations.
  - **Canvas Controls**: In-place editable headline typography, interactive phone dragging, zoom in/out, and SVG asset export.

- **Interactive Feature & Workflow Highlights**:
  - **Feature Showcase Grid**: Dynamic device switching, color previews, and multi-format export size chips.
  - **Dynamic 3D Orbit Art**: Counter-rotating dual-axis orbit particles (purple and cyan) orbiting an angled device frame with floating glass workflow step badges.
  - **Mockup Gallery**: High-contrast glass showcase cards featuring habit tracker, finance, and travel app concepts.

- **Complete Legal & Compliance Suite (App Store & Google Play Ready)**:
  - **About Page** (`about.html`): Product story, core mission, and craftsmanship principles.
  - **Contact & Support** (`contact.html`): Direct support channels, privacy request workflows, and email contact links.
  - **Privacy Policy** (`privacy.html`): Transparent local-first data architecture disclosure, analytics, permissions, and GDPR/CCPA rights.
  - **Terms of Service** (`terms.html`): Comprehensive software licensing, acceptable use, subscription rules, and liability limitations.
  - **Legal Disclaimer** (`disclaimer.html`): Trademark attributions and independent developer notices for Apple Inc. and Google LLC.

---

## 📂 Project Structure

```text
StoreShot-Web/
├── index.html        # Main landing page (Hero, Interactive Studio, Features, Workflow, Showcase, CTA)
├── about.html        # Company overview, mission, and design philosophy
├── contact.html      # Customer support, inquiries, and privacy request routing
├── privacy.html      # App Store & Google Play compliant Privacy Policy
├── terms.html        # Comprehensive Terms of Service & Software License
├── disclaimer.html   # Platform trademark notices and legal disclaimers
├── styles.css        # Unified design system, glassmorphism, animations, & responsive styles
├── script.js         # Interactive Studio editor engine, orbit animations, & navigation logic
├── vercel.json       # Clean URL routing and deployment configuration
└── README.md         # Project documentation and developer guide
```

---

## 💻 Tech Stack

| Technology | Role |
| --- | --- |
| **HTML5** | Semantic structure, accessibility (`aria-*`), and metadata |
| **Vanilla CSS3** | Custom design tokens, glassmorphism, flexbox/CSS grid, keyframes, and media queries |
| **Vanilla JavaScript (ES6+)** | State management, DOM events, drag interactions, canvas styling, and orbit physics |
| **Google Fonts** | *Plus Jakarta Sans* (display & headings) and *Inter* (body & interface) |
| **Vercel** | Static hosting with zero-config clean URL rewrite support |

---

## 📄 License

&copy; StoreShot Studio. All rights reserved. Available for personal and portfolio use.