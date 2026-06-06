---
name: Empower & Protect
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#574048'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#8b7079'
  outline-variant: '#debec8'
  surface-tint: '#b4136d'
  primary: '#b10e6b'
  on-primary: '#ffffff'
  primary-container: '#d23284'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb0cd'
  secondary: '#674bb5'
  on-secondary: '#ffffff'
  secondary-container: '#ab8ffe'
  on-secondary-container: '#3f1e8c'
  tertiary: '#615a5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a7278'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e4'
  primary-fixed-dim: '#ffb0cd'
  on-primary-fixed: '#3e0022'
  on-primary-fixed-variant: '#8c0053'
  secondary-fixed: '#e8ddff'
  secondary-fixed-dim: '#cebdff'
  on-secondary-fixed: '#21005e'
  on-secondary-fixed-variant: '#4f319c'
  tertiary-fixed: '#eae0e6'
  tertiary-fixed-dim: '#cec4ca'
  on-tertiary-fixed: '#1f1a1e'
  on-tertiary-fixed-variant: '#4b454a'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
  safety-xp: '#DB2777'
  verified-teal: '#2DD4BF'
  mission-gold: '#FBBF24'
  glass-surface: rgba(255, 255, 255, 0.7)
  glass-border: rgba(255, 255, 255, 0.4)
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  xp-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '800'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style
This design system focuses on the intersection of personal safety and community empowerment. The brand personality is **resilient, welcoming, and motivating**. It moves away from the clinical or fear-based aesthetics typical of security apps, opting instead for a gamified experience that celebrates proactive safety habits.

The chosen design style is **Soft Glassmorphism**. This approach uses translucent layers, subtle background blurs, and vibrant accents to create a sense of depth and modernity. The interface feels lightweight and approachable, reducing the anxiety often associated with security platforms while maintaining a high level of functional clarity.

## Colors
The palette is dominated by **Vibrant Pink (#EC4899)**, serving as the primary driver for action and energy. A **Soft Purple (#A78BFA)** provides a calming counterpoint, used primarily for secondary actions and gamification milestones. 

The background is predominantly white or very light pink washes to ensure the "glass" elements pop. For the gamified elements, specific semantic colors are introduced: **Safety XP** uses a deeper pink for high-contrast progress tracking, while **Mission Gold** is reserved for rewards and special achievements.

## Typography
The design system employs **Plus Jakarta Sans** for headlines to inject a friendly, optimistic, and modern character. Its rounded terminals and geometric structure make it highly legible and approachable. 

**Inter** is utilized for body text and UI labels to provide a grounded, neutral, and highly functional reading experience. For gamification metrics, such as XP counts and level numbers, use the **xp-display** style to ensure these values feel distinct and rewarding.

## Layout & Spacing
The layout follows a **fluid grid system** that adapts to mobile-first usage. On mobile devices, use a 4-column grid with 20px side margins. For tablet and desktop, scale to an 8 or 12-column fixed grid with a maximum width of 1200px.

Spacing is based on an **8px linear scale**. Use "stack" spacing for vertical rhythm: `stack-sm` for related items within a card, `stack-md` between distinct components, and `stack-lg` for section headers. Cards should utilize internal padding of at least 20px to maintain the airy, "glassy" feel.

## Elevation & Depth
Depth in this design system is achieved through **Soft Glassmorphism** rather than traditional drop shadows. Surfaces should use a combination of `backdrop-filter: blur(12px)` and a semi-transparent white background.

To define hierarchy:
1.  **Level 0 (Base):** Subtle radial gradients of soft pink and purple.
2.  **Level 1 (Cards/Missions):** Translucent white surface (70% opacity) with a 1px solid white border (40% opacity).
3.  **Level 2 (Active/Floating):** Increased blur (20px) and a very faint, soft pink ambient shadow to indicate interactivity or high priority.

## Shapes
The shape language is consistently **Rounded**, reinforcing the "friendly and approachable" brand pillars. 

- **Cards & Containers:** Use 1rem (16px) corner radius.
- **Buttons & Chips:** Use fully rounded (pill-shaped) edges to encourage interaction.
- **Progress Bars:** Use rounded caps for both the track and the active indicator to create a soft, non-technical appearance.

## Components

### Gamification Elements
- **Safety XP Bars:** Use a thick (12px) horizontal track. The unfilled portion should be a low-opacity version of the secondary color, while the filled portion uses a vibrant pink-to-purple gradient.
- **Verification Badges:** Small, circular elements with a "verified-teal" background and a white checkmark icon. Surround the badge with a soft white glow for "Elite" status levels.
- **Mission Cards:** Large-format glass containers with a primary icon on the left, a "Reward" label in the top right (using Mission Gold), and a clear "Start" button at the bottom.

### Inputs & Actions
- **Primary Buttons:** Bold pink background with white text. Use a slight horizontal gradient (Primary to XP-pink) to add depth.
- **Input Fields:** Semi-transparent white backgrounds with a 1px border that turns purple on focus.
- **Checkboxes:** When selected, they should transform into a small pink heart or a "safety shield" icon instead of a standard checkmark to reinforce the platform's theme.

### Feedback & Status
- **Level-Up Modals:** Use full-screen background blurs with floating geometric shapes (confetti style) in brand colors. 
- **Safety Levels:** Display the current level as a prominent "Level X" badge with a circular progress ring surrounding the user's avatar.