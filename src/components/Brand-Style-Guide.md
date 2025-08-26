# SkieShare Brand Style Guide

## Color System

### Analytics Color Palette

Our analytics icons use a carefully crafted 4-color system that provides clear visual hierarchy and semantic meaning:

#### Light Theme
- **Red** (`hsl(0 65% 51%)`) - Alerts, errors, critical metrics
- **Yellow** (`hsl(45 85% 47%)`) - Warnings, pending states, attention needed
- **Green** (`hsl(142 71% 45%)`) - Success, positive metrics, completed actions
- **Purple** (`hsl(262 80% 50%)`) - Neutral data, information, secondary metrics

#### Dark Theme
- **Red** (`hsl(0 75% 65%)`) - Enhanced visibility for dark backgrounds
- **Yellow** (`hsl(48 95% 65%)`) - Vibrant yet accessible warning color
- **Green** (`hsl(142 69% 58%)`) - Clear success indication
- **Purple** (`hsl(262 83% 68%)`) - Sophisticated neutral data color

### Brand Colors

#### Primary Brand Colors
- **Primary**: Deep charcoal (`hsl(0 0% 9%)`) / Light grey (`hsl(0 0% 95%)`)
- **Secondary**: Clean white (`hsl(210 20% 96%)`) / Dark grey (`hsl(0 0% 12%)`)
- **Accent**: Professional blue (`hsl(217 91% 60%)`) / Bright blue (`hsl(217 91% 65%)`)

#### Status Colors
- **Success**: `hsl(142 71% 45%)` / `hsl(142 69% 58%)`
- **Warning**: `hsl(45 85% 47%)` / `hsl(48 95% 65%)`
- **Error**: `hsl(0 65% 51%)` / `hsl(0 75% 65%)`
- **Info**: `hsl(217 91% 60%)` / `hsl(217 91% 65%)`

## Typography

### Font Hierarchy
- **Headings**: Inter, system-ui, sans-serif
- **Body Text**: Inter, system-ui, sans-serif
- **Code/Monospace**: 'Fira Code', 'Monaco', monospace

### Font Weights
- **Light**: 300 (large headings only)
- **Regular**: 400 (body text)
- **Medium**: 500 (subheadings, labels)
- **Semibold**: 600 (card titles, buttons)
- **Bold**: 700 (main headings)

### Font Sizes
- **Display**: 3.5rem (56px) - Hero headings
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headings
- **H3**: 1.5rem (24px) - Card titles
- **Body**: 1rem (16px) - Main content
- **Small**: 0.875rem (14px) - Captions, metadata

## Spacing System

### Base Unit: 8px
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Component Specifications

### Analytics Cards
```css
.analytics-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px hsl(0 0% 0% / 0.1);
}
```

### Icon Containers
```css
.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: hsl(var(--analytics-[color]-bg));
  border: 1px solid hsl(var(--analytics-[color]) / 0.2);
}
```

### Interactive States
- **Hover Scale**: 1.02x
- **Focus Ring**: 2px solid accent color with 2px offset
- **Transition**: 300ms cubic-bezier(0.4, 0, 0.2, 1)

## Accessibility Standards

### Contrast Ratios (WCAG AA Compliant)
- **Normal Text**: Minimum 4.5:1
- **Large Text**: Minimum 3:1
- **Interactive Elements**: Minimum 4.5:1

### Color Coding Logic
- **Red**: Errors, alerts, critical issues, negative metrics
- **Yellow**: Warnings, pending states, caution required
- **Green**: Success, positive metrics, completed actions
- **Purple**: Neutral information, secondary data, general metrics

### Focus Management
- All interactive elements have visible focus indicators
- Focus rings use brand accent color with appropriate contrast
- Tab order follows logical content flow

## Implementation Guidelines

### CSS Custom Properties
Use CSS custom properties for consistent theming:
```css
color: hsl(var(--analytics-red));
background: hsl(var(--analytics-red-bg));
```

### Hover Effects
Apply consistent hover transformations:
```css
transform: translateY(-2px) scale(1.02);
box-shadow: 0 8px 25px hsl(var(--color) / 0.15);
```

### Responsive Considerations
- Icons scale down on mobile (40px containers vs 48px desktop)
- Padding adjusts for touch targets (minimum 44px)
- Text sizes adapt for readability

## Usage Examples

### Analytics Dashboard Cards
```jsx
<Card className="analytics-card analytics-card-green">
  <div className="icon-container icon-container-green">
    <Download className="analytics-icon analytics-icon-green" />
  </div>
  <h3>Total Downloads</h3>
  <p className="status-success">1,234 downloads</p>
</Card>
```

### Status Indicators
```jsx
<Badge className="status-success">Active</Badge>
<Badge className="status-warning">Pending</Badge>
<Badge className="status-error">Failed</Badge>
<Badge className="status-info">Processing</Badge>
```

## Brand Voice & Personality

### Visual Characteristics
- **Modern**: Clean lines, generous whitespace, contemporary typography
- **Professional**: Sophisticated color palette, consistent spacing
- **Accessible**: High contrast, clear hierarchy, inclusive design
- **Trustworthy**: Secure feeling through consistent visual language

### Design Principles
1. **Clarity**: Every element serves a purpose
2. **Consistency**: Unified visual language across all components
3. **Accessibility**: Inclusive design for all users
4. **Performance**: Optimized for fast loading and smooth interactions

## File Organization

### Color Definitions
- Primary colors: `src/index.css` (CSS custom properties)
- Component styles: Individual component files
- Utility classes: Tailwind configuration

### Component Structure
- Analytics icons: `src/components/dashboard/Analytics.tsx`
- Brand components: `src/components/ui/` directory
- Theme context: `src/contexts/ThemeContext.tsx`

## Quality Assurance

### Testing Checklist
- [ ] All colors meet WCAG AA contrast requirements
- [ ] Hover states work in both light and dark themes
- [ ] Focus indicators are visible and consistent
- [ ] Icons are distinguishable for colorblind users
- [ ] Responsive behavior works across all screen sizes
- [ ] Reduced motion preferences are respected

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

*This style guide ensures consistent, accessible, and professional visual design across the SkieShare platform.*