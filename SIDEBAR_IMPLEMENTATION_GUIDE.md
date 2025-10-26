# Collapsible Sidebar Implementation Guide

## Overview
The dashboard now features a fully responsive collapsible sidebar with smooth animations, proper accessibility, and state persistence.

## Key Features

### 1. Toggle Mechanism
- **Desktop**: Hover rail on the right edge of the sidebar to expand/collapse
- **Mobile**: Slide-in overlay with hamburger menu toggle
- **Keyboard Shortcut**: `Ctrl/Cmd + B` to toggle sidebar
- Uses the `SidebarTrigger` component in the header for manual toggling

### 2. Sidebar States

#### Expanded State (Desktop)
- Width: 256px (16rem)
- Shows logo image `/skie.png`
- Displays full navigation labels with icons
- Shows group labels (Navigation, Quick Actions, More)

#### Collapsed State (Desktop)
- Width: 48px (3rem)
- Shows only logo icon
- Displays only icons for navigation
- Tooltips appear on hover showing full item names
- Group labels hidden

#### Mobile State
- Overlay sheet that slides in from left
- Full width navigation
- Closes on navigation
- Backdrop blur effect

### 3. Responsive Design

#### Desktop (lg and above)
- Collapsible icon mode
- Hover rail for easy expansion
- Persistent state saved in cookies
- Smooth width transitions (300ms)

#### Tablet (md to lg)
- Full sidebar on larger tablets
- Adaptive spacing and touch targets

#### Mobile (below md)
- Sheet overlay pattern
- Hamburger menu trigger
- Backdrop dismissal
- Touch-friendly interactions

### 4. Visual Design
- Background: `bg-[#1c1917]` (stone-950)
- Border: Right border with 50% opacity
- Logo: Animated with hover scale effect
- Navigation: Rounded items with hover states
- Active state: Highlighted with background color
- Smooth transitions on all state changes

### 5. Accessibility Features

#### ARIA Labels
- Toggle button has proper `sr-only` labels
- Tooltips provide context in collapsed state
- Keyboard navigation supported

#### Keyboard Support
- Tab navigation through all items
- Enter/Space to activate links
- `Ctrl/Cmd + B` global shortcut
- Focus visible states

#### Screen Reader
- Semantic navigation structure
- Descriptive labels for all actions
- State announcements

### 6. State Persistence
- Sidebar state saved to cookies
- 7-day expiration
- Automatic restoration on page load
- Cookie name: `sidebar:state`

## Implementation Details

### Main Components

#### SidebarProvider
```tsx
<SidebarProvider defaultOpen={true}>
  <div className="min-h-screen flex w-full">
    <AppSidebar />
    <MainContent />
  </div>
</SidebarProvider>
```

#### AppSidebar Structure
1. **SidebarHeader**: Logo and branding
2. **SidebarContent**: Navigation groups
3. **SidebarRail**: Hover area for expansion

### Navigation Configuration
Located in `DashboardLayout.tsx`:
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: IconLayoutDashboard },
  { name: 'Upload', href: '/dashboard/upload', icon: IconUpload },
  // ... more items
];
```

### Styling Classes

#### Responsive Padding
- Mobile: `px-3 sm:px-4`
- Tablet: `md:px-6`
- Desktop: `lg:mx-[35px]`

#### Sidebar Transitions
- Width: `transition-[width] duration-300 ease-in-out`
- Opacity: `transition-opacity duration-300`
- Transform: `transition-transform duration-200`

## Usage

### Adding New Navigation Items
```tsx
{
  name: 'New Page',
  href: '/dashboard/new-page',
  icon: IconName
}
```

### Customizing Collapse Behavior
Change `collapsible` prop in Sidebar component:
- `"icon"`: Desktop collapse to icons
- `"offcanvas"`: Hide completely when collapsed
- `"none"`: Always visible, no collapse

### Adjusting Widths
Edit CSS variables in `sidebar.tsx`:
```typescript
const SIDEBAR_WIDTH = "16rem";        // Expanded
const SIDEBAR_WIDTH_ICON = "3rem";    // Collapsed
const SIDEBAR_WIDTH_MOBILE = "18rem"; // Mobile
```

## Browser Support
- Modern browsers with CSS custom properties
- Flexbox support required
- Transforms and transitions supported
- Cookie API available

## Performance Considerations
- Smooth 60fps animations
- GPU-accelerated transforms
- Efficient re-renders with React context
- Minimal layout shifts

## Testing Checklist
- [ ] Toggle works on all breakpoints
- [ ] Keyboard shortcut functions
- [ ] Tooltips show in collapsed state
- [ ] Mobile overlay slides smoothly
- [ ] State persists on page refresh
- [ ] Active route highlighting works
- [ ] Accessible via keyboard
- [ ] Screen reader announces changes

## Troubleshooting

### Sidebar not collapsing
- Check `collapsible` prop is set to `"icon"` or `"offcanvas"`
- Verify SidebarProvider wraps the layout
- Check browser console for errors

### State not persisting
- Verify cookies are enabled
- Check cookie name matches `SIDEBAR_COOKIE_NAME`
- Ensure domain allows cookie storage

### Mobile overlay not showing
- Check viewport is below `md` breakpoint (768px)
- Verify Sheet component is rendering
- Check z-index conflicts

## Future Enhancements
- Custom themes for sidebar
- User preference sync across devices
- Nested navigation support
- Pin favorite items
- Search within navigation
