# 🎨 Sacco Design System

A beautiful, modern design system built for the Sacco fantasy football draft assistant.

## 🎯 Design Philosophy

- **Dark Mode First**: Default dark theme for better eye comfort and modern aesthetics
- **Green Primary**: `#38bd7d` as the primary brand color representing growth and success
- **Accessibility**: High contrast ratios and clear typography
- **Modern UI**: Glass effects, gradients, and smooth animations

## 🎨 Color Palette

### Primary Colors
```css
primary-50:  #f0fdf4
primary-100: #dcfce7
primary-200: #bbf7d0
primary-300: #86efac
primary-400: #4ade80
primary-500: #38bd7d  /* Main brand color */
primary-600: #16a34a
primary-700: #15803d
primary-800: #166534
primary-900: #14532d
primary-950: #052e16
```

### Dark Theme Colors
```css
dark-50:   #f8fafc
dark-100:  #f1f5f9
dark-200:  #e2e8f0
dark-300:  #cbd5e1
dark-400:  #94a3b8
dark-500:  #64748b
dark-600:  #475569
dark-700:  #334155
dark-800:  #1e293b
dark-900:  #0f172a
dark-950:  #020617  /* Background */
```

### Gray Scale
```css
gray-50:   #f9fafb
gray-100:  #f3f4f6
gray-200:  #e5e7eb
gray-300:  #d1d5db
gray-400:  #9ca3af
gray-500:  #6b7280
gray-600:  #4b5563
gray-700:  #374151
gray-800:  #1f2937
gray-900:  #111827
gray-950:  #030712
```

## 🔤 Typography

### Font Families
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for code/data)

### Font Weights
- 300: Light
- 400: Regular
- 500: Medium
- 600: Semibold
- 700: Bold

### Text Colors
- **Primary Text**: `text-gray-100`
- **Secondary Text**: `text-gray-400`
- **Muted Text**: `text-gray-500`
- **Accent Text**: `text-primary-400`

## 🧩 Components

### Buttons

#### Primary Button
```html
<button class="btn-primary">
  Primary Action
</button>
```

#### Secondary Button
```html
<button class="btn-secondary">
  Secondary Action
</button>
```

#### Ghost Button
```html
<button class="btn-ghost">
  Ghost Action
</button>
```

### Input Fields
```html
<input class="input" placeholder="Enter text..." />
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</div>
```

### Glass Effect
```html
<div class="glass">
  Glass morphism effect
</div>
```

### Gradients
```html
<!-- Primary gradient -->
<div class="gradient-primary">
  Primary gradient background
</div>

<!-- Dark gradient -->
<div class="gradient-dark">
  Dark gradient background
</div>
```

## ✨ Effects & Animations

### Shadows
```css
/* Glow effect with primary color */
shadow-glow: 0 0 20px rgba(56, 189, 125, 0.3)
shadow-glow-lg: 0 0 40px rgba(56, 189, 125, 0.4)
```

### Animations
```css
/* Fade in */
animate-fade-in: fadeIn 0.5s ease-in-out

/* Slide up */
animate-slide-up: slideUp 0.3s ease-out

/* Slow pulse */
animate-pulse-slow: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite
```

## 🎯 Usage Guidelines

### Spacing
- Use consistent spacing with Tailwind's spacing scale
- Common spacing: `space-y-4`, `space-y-6`, `space-y-8`
- Padding: `p-4`, `p-6`, `p-8`
- Margins: `mb-4`, `mt-6`, `mx-auto`

### Layout
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Flex**: `flex items-center justify-between`

### Backgrounds
- **Main Background**: `bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950`
- **Card Background**: `bg-dark-900`
- **Glass Background**: `bg-dark-900/80 backdrop-blur-sm`

## 🚀 Quick Start

1. **Import the design system**:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
   ```

2. **Use the component classes**:
   ```html
   <button class="btn-primary">Get Started</button>
   <input class="input" placeholder="Email" />
   <div class="card">Content</div>
   ```

3. **Apply the dark theme**:
   ```html
   <div class="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
     <!-- Your content -->
   </div>
   ```

## 🎨 Component Examples

### Authentication Form
```html
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <div class="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow">
        <!-- Icon -->
      </div>
      <h2 class="mt-6 text-3xl font-bold text-gray-100">Welcome</h2>
    </div>
    <form class="space-y-6">
      <input class="input" placeholder="Email" />
      <button class="btn-primary w-full">Sign In</button>
    </form>
  </div>
</div>
```

### Dashboard Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="text-xl font-semibold text-gray-100">Analytics</h3>
  </div>
  <div class="card-body">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-lg p-6">
        <!-- Card content -->
      </div>
    </div>
  </div>
</div>
```

## 🔧 Customization

### Adding New Colors
```javascript
// In tailwind.config.js
colors: {
  custom: {
    500: '#your-color',
    // ... other shades
  }
}
```

### Adding New Components
```css
/* In index.css */
@layer components {
  .custom-component {
    @apply /* your styles */;
  }
}
```

## 📱 Responsive Design

- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Grid**: Responsive grid layouts with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## ♿ Accessibility

- **Color Contrast**: All text meets WCAG AA standards
- **Focus States**: Clear focus indicators on interactive elements
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Keyboard Navigation**: All interactive elements are keyboard accessible

---

*This design system is built with Tailwind CSS and optimized for the Sacco fantasy football draft assistant.*
