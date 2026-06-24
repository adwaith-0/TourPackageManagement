/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Brand Colors ──────────────────────────
        "primary":                "#0A2342",
        "secondary":              "#D4A853",
        "accent":                 "#E8622A",

        // ── Surface Colors ────────────────────────
        "surface":                "#f8f9fb",
        "surface-bright":         "#f8f9fb",
        "surface-dim":            "#d9dadc",
        "surface-variant":        "#e1e2e4",
        "surface-container":      "#edeef0",
        "surface-container-low":  "#f2f4f6",
        "surface-container-high": "#e7e8ea",
        "surface-container-highest": "#e1e2e4",
        "surface-container-lowest":  "#ffffff",
        "background":             "#f8f9fb",

        // ── On-Surface / Text Colors ──────────────
        "on-surface":             "#191c1e",
        "on-surface-variant":     "#44474e",
        "on-background":          "#191c1e",
        "on-primary":             "#ffffff",

        // ── Primary Container ─────────────────────
        "primary-container":      "#0a2342",
        "on-primary-container":   "#768baf",
        "primary-fixed":          "#d5e3ff",
        "primary-fixed-dim":      "#b2c7ef",
        "on-primary-fixed":       "#021c3a",
        "on-primary-fixed-variant": "#324768",
        "inverse-primary":        "#b2c7ef",

        // ── Secondary Container ───────────────────
        "secondary-container":    "#fdcd74",
        "on-secondary-container": "#785601",
        "secondary-fixed":        "#ffdea6",
        "secondary-fixed-dim":    "#eec068",
        "on-secondary":           "#ffffff",
        "on-secondary-fixed":     "#271900",
        "on-secondary-fixed-variant": "#5d4200",

        // ── Tertiary ──────────────────────────────
        "tertiary":               "#1f0500",
        "tertiary-container":     "#441200",
        "tertiary-fixed":         "#ffdbcf",
        "tertiary-fixed-dim":     "#ffb59a",
        "on-tertiary":            "#ffffff",
        "on-tertiary-container":  "#e66028",
        "on-tertiary-fixed":      "#380d00",
        "on-tertiary-fixed-variant": "#812900",

        // ── Outline ───────────────────────────────
        "outline":                "#74777e",
        "outline-variant":        "#c4c6cf",

        // ── Inverse ───────────────────────────────
        "inverse-surface":        "#2e3132",
        "inverse-on-surface":     "#f0f1f3",

        // ── Surface Tint ──────────────────────────
        "surface-tint":           "#4a5f81",

        // ── Error ─────────────────────────────────
        "error":                  "#ba1a1a",
        "error-container":        "#ffdad6",
        "on-error":               "#ffffff",
        "on-error-container":     "#93000a",
      },

      borderRadius: {
        DEFAULT: "0.125rem",
        lg:      "0.25rem",
        xl:      "0.5rem",
        "2xl":   "0.75rem",
        full:    "9999px",
      },

      spacing: {
        "xs":             "4px",
        "base":           "8px",
        "sm":             "12px",
        "md":             "16px",
        "lg":             "24px",
        "xl":             "32px",
        "2xl":            "48px",
        "gutter":         "24px",
        "margin-mobile":  "16px",
        "max-width":      "1280px",
      },

      fontFamily: {
        "display-lg":        ["Plus Jakarta Sans", "sans-serif"],
        "display-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg":       ["Plus Jakarta Sans", "sans-serif"],
        "headline-md":       ["Plus Jakarta Sans", "sans-serif"],
        "body-lg":           ["Inter", "sans-serif"],
        "body-md":           ["Inter", "sans-serif"],
        "body-sm":           ["Inter", "sans-serif"],
        "label-md":          ["Inter", "sans-serif"],
        "price":             ["JetBrains Mono", "monospace"],
        "price-display":     ["JetBrains Mono", "monospace"],
      },

      fontSize: {
        "display-lg": ["48px", {
          lineHeight:    "56px",
          letterSpacing: "-0.02em",
          fontWeight:    "700",
        }],
        "display-lg-mobile": ["32px", {
          lineHeight:    "40px",
          letterSpacing: "-0.02em",
          fontWeight:    "700",
        }],
        "headline-lg": ["32px", {
          lineHeight:    "40px",
          letterSpacing: "-0.01em",
          fontWeight:    "600",
        }],
        "headline-md": ["24px", {
          lineHeight:  "32px",
          fontWeight:  "600",
        }],
        "body-lg": ["18px", {
          lineHeight: "28px",
          fontWeight: "400",
        }],
        "body-md": ["16px", {
          lineHeight: "24px",
          fontWeight: "400",
        }],
        "body-sm": ["14px", {
          lineHeight: "20px",
          fontWeight: "400",
        }],
        "label-md": ["14px", {
          lineHeight:    "16px",
          letterSpacing: "0.01em",
          fontWeight:    "600",
        }],
        "price-display": ["20px", {
          lineHeight: "24px",
          fontWeight: "700",
        }],
      },

      boxShadow: {
        "soft":     "0px 4px 20px rgba(10, 35, 66, 0.05)",
        "elevated": "0px 12px 32px rgba(10, 35, 66, 0.08)",
      },
    },
  },
  plugins: [],
}