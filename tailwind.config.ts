import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Script-specific colors
                script: {
                    bg: "hsl(var(--script-bg))",
                    text: "hsl(var(--script-text))",
                    character: "hsl(var(--character-name))",
                    stage: "hsl(var(--stage-direction))",
                    user: "hsl(var(--user-line))",
                    current: "hsl(var(--current-line))",
                },
                // Performance colors
                success: "hsl(var(--success))",
                warning: "hsl(var(--warning))",
                info: "hsl(var(--info))",
            },
            fontFamily: {
                script: ["JetBrains Mono", "Courier New", "monospace"],
                theatrical: ["Playfair Display", "serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-primary": "var(--gradient-primary)",
                "gradient-accent": "var(--gradient-accent)",
                "gradient-bg": "var(--gradient-bg)",
            },
            boxShadow: {
                theatrical: "var(--shadow-theatrical)",
                glow: "var(--shadow-glow)",
                script: "var(--shadow-script)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [tailwindcssAnimate],
} satisfies Config;
