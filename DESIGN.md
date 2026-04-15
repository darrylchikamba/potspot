# PotSpot - Design System

The application uses the **"Tactical Observer"** design system extracted from the Stitch project.

## Typography
- **Display & Headlines:** Space Grotesk
- **Body & Titles:** Public Sans 
- **Labels:** Space Grotesk

## Core Colour Palette
- **Background:** `#0e0e10`
- **Surface:** `#0e0e10`
- **Surface Container High:** `#1f1f22`
- **Primary:** `#f8a826` (Amber)
- **Primary Container:** `#df9305`
- **Secondary:** `#e2e2e2`
- **Error/Hazard:** `#ff7351`
- **Error Dim:** `#d53d18`
- **Tertiary:** `#ff734a`

## Design Guidelines

### 1. Overview & Creative North Star
**Creative North Star: "The Tactical Observer"**

This design system moves away from the "friendly SaaS" aesthetic toward a high-fidelity, industrial utility interface. It is inspired by rugged field equipment, emergency dispatch consoles, and heavy-duty urban machinery. We are not building a social network; we are building a tool for civic intervention.

The "Tactical Observer" look is achieved through **Functional Brutalism**: intentional asymmetry, heavy typographic weights, and a layout that prioritizes high-contrast "glanceability" over decorative softness. We utilize a dark, low-light environment to reduce eye strain for field workers while using high-energy amber accents to signal urgency.

---

### 2. Colors & Surface Logic

The palette is rooted in a "Blacked-Out" utility aesthetic, using a spectrum of charcoals to define space rather than lines.

#### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts. To separate a report card from the main feed, shift the card from `surface` to `surface-container-high`. This creates a sophisticated, seamless environment that feels like a single piece of machined hardware.

#### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to create depth:
*   **Base Layer:** `surface` (#0e0e10) - The primary canvas.
*   **Sectional Layer:** `surface-container-low` (#131315) - Large background sections.
*   **Interactive Layer:** `surface-container-high` (#1f1f22) - Cards, report items, and modal bodies.
*   **Focus Layer:** `surface-container-highest` (#252528) - Active states or popped-out elements.

#### The "Glass & Gradient" Rule
To prevent the app from feeling "flat" or "cheap," use subtle gradients. Main Action Buttons should use a linear gradient from `primary` (#f8a826) to `primary-container` (#df9305) at a 135-degree angle. For floating map overlays, use **Glassmorphism**: a background of `surface-container-high` at 80% opacity with a `backdrop-blur-md` effect.

---

### 3. Typography: Industrial Voice

The typography system is built on the tension between the geometric precision of **Space Grotesk** and the utilitarian clarity of **Public Sans**.

*   **Display & Headlines (Space Grotesk):** These are your "Warning Signs." They should be bold and chunky. Use `display-lg` for urgent hazard counts and `headline-md` for location names. The tight kerning and wide stance of Space Grotesk convey authority.
*   **Body & Titles (Public Sans):** Used for descriptions and data. Public Sans provides the neutral, objective tone of a technical manual.
*   **Labels (Space Grotesk):** Used for metadata (e.g., "DISTANCE: 2.4KM"). These should always be uppercase with a slight letter-spacing increase (+0.05em) to mimic stamped metal plates.

---

### 4. Elevation & Depth

We avoid the "shadow-heavy" look of consumer apps. Instead, we use **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural "inset" look, resembling a screen embedded in a dashboard.
*   **Ambient Shadows:** For floating action buttons (FABs), use an extra-diffused shadow: `shadow-[0_20px_50px_rgba(0,0,0,0.5)]`. The shadow should feel like ambient occlusion, not a harsh drop shadow.
*   **The "Ghost Border" Fallback:** If a divider is required for accessibility, use the "Ghost Border" method: `border: 1px solid hsla(var(--outline-variant), 0.15)`. Never use 100% opaque borders.

---

### 5. Components

#### Buttons
*   **Primary (Hazard):** Sharp corners (`rounded-sm`), `bg-primary`, `text-on-primary`. Use an inner shadow (inset) to give it a "pressed-in" tactile feel.
*   **Secondary (Utility):** `bg-secondary-container`, `text-on-secondary-container`. This should look like a muted toggle switch.
*   **Tertiary (Ghost):** No background, `text-primary`. Use only for low-priority actions like "Cancel."

#### Status Indicators (High Urgency)
*   **The "Hazard Pulse":** For unverified high-risk potholes, use a small 8px circle with the `tertiary` (#ff734a) color and a CSS pulse animation to draw immediate attention.

#### Input Fields
*   **Rugged Inputs:** Use `surface-container-highest` as the background. On focus, do not use a glow. Instead, change the background to `surface-bright` and add a `2px solid primary` bottom border only.

#### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Execution:** Use a `mb-3` (12px) vertical margin and a subtle shift in surface color to define where one report ends and the next begins. The "List" should feel like a deck of stacked cards, not a spreadsheet.

#### Custom Component: The "Hazard Gauge"
A custom progress bar using a skewed, striped "warning tape" pattern (amber/black) to show the progress of a utility repair, reinforcing the urban utility theme.

---

### 6. Do's and Don'ts

#### Do
*   **Do** use asymmetrical layouts for hero sections (e.g., large left-aligned headline with a right-aligned status badge).
*   **Do** use high-contrast status colors. A pothole isn't "Red"; it is `error_dim` (#d53d18).
*   **Do** utilize `rounded-sm` (0.125rem) for a precision-engineered, rugged feel.

#### Don't
*   **Don't** use "Soft" rounded corners (xl or full) unless it's for a circular notification badge.
*   **Don't** use pure white text. Always use `on-surface` (#fefbfe) to maintain the cinematic, high-end dark mode.
*   **Don't** use standard Tailwind `gap` utilities without considering the "Surface Shift" first. Separation should be visual (color), not just spatial (empty air).

---

### 7. Interaction States

*   **Hover:** Surfaces should "lift" by shifting to the next highest container tier (e.g., `surface-container-high` -> `surface-container-highest`).
*   **Active/Tap:** A brief flash of the `primary` color at 10% opacity across the component to provide tactile feedback without breaking the dark aesthetic.
*   **Loading:** Use a skeleton screen that mimics the "ghost border" logic—low opacity, high-contrast shapes that shimmer with a `primary-dim` gradient.
