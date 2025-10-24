# Responsive Dashboard CSS Reference

## CSS Architecture

This document provides a complete reference for all CSS classes, custom properties, and responsive utilities used in the dashboard layout.

---

## CSS Custom Properties (Variables)

### Sidebar Dimensions
```css
:root {
  --sidebar-width: 16rem;           /* 256px - Full sidebar width */
  --sidebar-width-mobile: 18rem;    /* 288px - Mobile overlay width */
  --sidebar-width-icon: 3rem;       /* 48px - Collapsed sidebar width */
}
```

### Usage Example
```tsx
<div style={{ width: 'var(--sidebar-width)' }} />
```

---

## Breakpoint System

### Tailwind Breakpoints Used

```css
/* Mobile First Approach */

/* Default (Mobile): 0 - 639px */
/* All base styles apply here */

/* Small (sm): 640px+ */
@media (min-width: 640px) {
  .sm\:block { display: block; }
  .sm\:px-4 { padding-left: 1rem; padding-right: 1rem; }
}

/* Medium (md): 768px+ */
@media (min-width: 768px) {
  .md\:flex { display: flex; }
  .md\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .md\:rounded-xl { border-radius: 0.75rem; }
}

/* Large (lg): 1024px+ */
@media (min-width: 1024px) {
  .lg\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\:block { display: block; }
}

/* Extra Large (xl): 1280px+ */
@media (min-width: 1280px) {
  .xl\:block { display: block; }
}
```

---

## Layout Classes

### Container
```css
/* Main wrapper */
.min-h-screen {
  min-height: 100vh;  /* Full viewport height */
}

.min-h-svh {
  min-height: 100svh;  /* Small viewport height (iOS safe) */
}

.flex {
  display: flex;
}

.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1 1 0%;  /* Grow and shrink, 0% base */
}

.flex-col {
  flex-direction: column;
}
```

### Sidebar Container
```css
/* Sidebar wrapper */
.peer {
  /* Creates a reference for sibling selectors */
}

.hidden {
  display: none;
}

.md\:block {
  @media (min-width: 768px) {
    display: block;
  }
}

/* Sidebar gap element (pushes content) */
.relative {
  position: relative;
}

.h-svh {
  height: 100svh;
}

.transition-\[width\] {
  transition-property: width;
}

.duration-200 {
  transition-duration: 200ms;
}

.ease-linear {
  transition-timing-function: linear;
}
```

---

## Responsive Padding Utilities

### Header Padding
```css
/* Mobile: 12px */
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/* Small: 16px (640px+) */
.sm\:px-4 {
  @media (min-width: 640px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Medium: 24px (768px+) */
.md\:px-6 {
  @media (min-width: 768px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* Large: Margin instead (1024px+) */
.lg\:mx-\[35px\] {
  @media (min-width: 1024px) {
    margin-left: 35px;
    margin-right: 35px;
  }
}
```

### Content Padding
```css
/* Scales with screen size */
.p-3 {
  padding: 0.75rem;  /* 12px */
}

.sm\:p-4 {
  @media (min-width: 640px) {
    padding: 1rem;  /* 16px */
  }
}

.md\:p-6 {
  @media (min-width: 768px) {
    padding: 1.5rem;  /* 24px */
  }
}

.lg\:p-8 {
  @media (min-width: 1024px) {
    padding: 2rem;  /* 32px */
  }
}
```

---

## Sidebar State Classes

### Data Attributes
```css
/* Applied dynamically based on state */
[data-state="expanded"] {
  /* Sidebar is open */
}

[data-state="collapsed"] {
  /* Sidebar is closed */
}

[data-collapsible="offcanvas"] {
  /* Collapsible type: offcanvas */
}

[data-collapsible="icon"] {
  /* Collapsible type: icon-only */
}

[data-mobile="true"] {
  /* Mobile sheet mode */
}
```

### Group Data Selectors
```css
/* Hide text when sidebar collapsed */
.group-data-\[collapsible\=icon\]\:hidden {
  .group[data-collapsible="icon"] & {
    display: none;
  }
}

/* Center icons when collapsed */
.group-data-\[collapsible\=icon\]\:justify-center {
  .group[data-collapsible="icon"] & {
    justify-content: center;
  }
}

/* Adjust width when collapsed */
.group-data-\[collapsible\=offcanvas\]\:w-0 {
  .group[data-collapsible="offcanvas"] & {
    width: 0;
  }
}

/* Move sidebar off-screen */
.group-data-\[collapsible\=offcanvas\]\:left-\[calc\(var\(--sidebar-width\)\*-1\)\] {
  .group[data-collapsible="offcanvas"] & {
    left: calc(var(--sidebar-width) * -1);
  }
}
```

---

## Responsive Visibility

### Hide on Mobile
```css
.hidden {
  display: none;
}

.sm\:block {
  @media (min-width: 640px) {
    display: block;
  }
}

.md\:flex {
  @media (min-width: 768px) {
    display: flex;
  }
}
```

### Show on Mobile Only
```css
.md\:hidden {
  @media (min-width: 768px) {
    display: none;
  }
}
```

### Example Usage
```tsx
{/* Storage popover - hidden on mobile */}
<div className="hidden sm:block">
  <StoragePopover />
</div>

{/* Mobile logo - hidden on desktop */}
<div className="md:hidden flex items-center">
  <img src="/logo.png" alt="Logo" />
</div>
```

---

## Size Utilities

### Height
```css
.h-0 {
  height: 0;
}

.md\:h-2 {
  @media (min-width: 768px) {
    height: 0.5rem;  /* 8px */
  }
}

.h-7 {
  height: 1.75rem;  /* 28px */
}

.h-8 {
  height: 2rem;  /* 32px */
}

.sm\:h-8 {
  @media (min-width: 640px) {
    height: 2rem;
  }
}

.h-9 {
  height: 2.25rem;  /* 36px */
}

.sm\:h-9 {
  @media (min-width: 640px) {
    height: 2.25rem;
  }
}

.h-10 {
  height: 2.5rem;  /* 40px */
}

.sm\:h-10 {
  @media (min-width: 640px) {
    height: 2.5rem;
  }
}

.h-16 {
  height: 4rem;  /* 64px - Header height */
}
```

### Width
```css
.w-full {
  width: 100%;
}

.w-auto {
  width: auto;
}

.min-w-0 {
  min-width: 0;  /* Allows flex items to shrink below content size */
}

.w-7 {
  width: 1.75rem;  /* 28px */
}

.w-8 {
  width: 2rem;  /* 32px */
}

.sm\:w-10 {
  @media (min-width: 640px) {
    width: 2.5rem;
  }
}
```

---

## Gap Utilities

### Responsive Gaps
```css
.gap-1 {
  gap: 0.25rem;  /* 4px */
}

.sm\:gap-1 {
  @media (min-width: 640px) {
    gap: 0.25rem;
  }
}

.gap-2 {
  gap: 0.5rem;  /* 8px */
}

.sm\:gap-2 {
  @media (min-width: 640px) {
    gap: 0.5rem;
  }
}

.gap-4 {
  gap: 1rem;  /* 16px */
}

.sm\:gap-4 {
  @media (min-width: 640px) {
    gap: 1rem;
  }
}
```

---

## Transitions

### Standard Transitions
```css
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.ease-linear {
  transition-timing-function: linear;
}
```

### Custom Transition Properties
```css
.transition-\[width\,height\,padding\] {
  transition-property: width, height, padding;
}

.transition-\[left\,right\,width\] {
  transition-property: left, right, width;
}
```

---

## Typography

### Font Sizes
```css
.text-xs {
  font-size: 0.75rem;    /* 12px */
  line-height: 1rem;     /* 16px */
}

.text-sm {
  font-size: 0.875rem;   /* 14px */
  line-height: 1.25rem;  /* 20px */
}

.text-base {
  font-size: 1rem;       /* 16px */
  line-height: 1.5rem;   /* 24px */
}

.text-2xl {
  font-size: 1.5rem;     /* 24px */
  line-height: 2rem;     /* 32px */
}

.sm\:text-3xl {
  @media (min-width: 640px) {
    font-size: 1.875rem;  /* 30px */
    line-height: 2.25rem; /* 36px */
  }
}
```

### Text Utilities
```css
.whitespace-nowrap {
  white-space: nowrap;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## Positioning

### Sticky Header
```css
.sticky {
  position: sticky;
}

.top-0 {
  top: 0;
}

.z-40 {
  z-index: 40;  /* Above content, below modals */
}
```

### Fixed Sidebar
```css
.fixed {
  position: fixed;
}

.inset-y-0 {
  top: 0;
  bottom: 0;
}

.left-0 {
  left: 0;
}

.right-0 {
  right: 0;
}
```

---

## Overflow

### Scroll Containers
```css
.overflow-auto {
  overflow: auto;
}

.overflow-hidden {
  overflow: hidden;
}

/* Custom scrollbar styling */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-track-background {
  scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
}
```

---

## Flex Utilities

### Direction
```css
.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.sm\:flex-row {
  @media (min-width: 640px) {
    flex-direction: row;
  }
}
```

### Alignment
```css
.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.sm\:items-center {
  @media (min-width: 640px) {
    align-items: center;
  }
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}
```

### Wrapping
```css
.flex-wrap {
  flex-wrap: wrap;
}

.flex-nowrap {
  flex-wrap: nowrap;
}
```

---

## Border Radius

### Responsive Borders
```css
.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;  /* 8px */
}

.md\:rounded-xl {
  @media (min-width: 768px) {
    border-radius: 0.75rem;  /* 12px */
  }
}

.rounded-tl-xl {
  border-top-left-radius: 0.75rem;
}

.rounded-tr-xl {
  border-top-right-radius: 0.75rem;
}
```

---

## Backdrop Effects

### Blur
```css
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}
```

---

## Complete Example: Responsive Header

```tsx
<header className="
  /* Base (Mobile) */
  border-b border-white/10
  bg-stone-950
  backdrop-blur-xl
  sticky top-0 z-40
  shadow-xl
  mx-0

  /* Medium (Tablet+) */
  md:rounded-tl-xl
  md:rounded-tr-xl
">
  <div className="
    /* Base (Mobile) */
    flex items-center justify-between
    h-16
    px-3

    /* Small (640px+) */
    sm:px-4

    /* Medium (768px+) */
    md:px-6

    /* Large (1024px+) */
    lg:mx-[35px]
  ">
    {/* Content */}
  </div>
</header>
```

---

## Performance Considerations

### GPU Acceleration
```css
/* Use these properties for smooth animations */
transform: translateX(0);
opacity: 1;
will-change: transform;  /* Use sparingly */
```

### Efficient Transitions
```css
/* Prefer specific properties over 'all' */
transition-property: width, height, padding;  /* Good */
transition-property: all;                     /* Less efficient */
```

---

## Media Query Reference

### Standard Queries
```css
/* Mobile Portrait */
@media (max-width: 639px) { }

/* Mobile Landscape / Small Tablet */
@media (min-width: 640px) and (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1280px) { }
```

### Orientation
```css
@media (orientation: portrait) {
  /* Mobile portrait styles */
}

@media (orientation: landscape) {
  /* Landscape tablet/phone styles */
}
```

### Hover Support
```css
@media (hover: hover) {
  /* Only apply hover effects on devices that support hover */
  .hover\:bg-accent:hover {
    background-color: hsl(var(--accent));
  }
}
```

---

## Summary

This CSS reference provides:
- ✅ Complete breakpoint system
- ✅ Responsive utility classes
- ✅ Sidebar state management styles
- ✅ Performance-optimized transitions
- ✅ Mobile-first approach
- ✅ Touch-friendly sizing
- ✅ GPU-accelerated animations
- ✅ Accessible focus states

All styles follow modern CSS best practices and are optimized for cross-browser compatibility.
