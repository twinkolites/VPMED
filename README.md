# vpmed - Medical Equipment Repair and Maintenance Services

A professional website for vpmed, providing medical equipment repair and maintenance services to hospitals, clinics, and healthcare facilities.

## Project Structure

```
src/
├── assets/
│   └── images/          # Place your work photos here
├── components/
│   └── Layout/          # Header, Footer, Layout components
├── pages/               # Main website pages
│   ├── Home.tsx         # Landing page with trust-focused messaging
│   ├── Services.tsx     # Services and process explanation
│   ├── Gallery.tsx      # Work samples and equipment photos
│   └── Contact.tsx      # Contact form and information
├── types/               # TypeScript type definitions
├── utils/               # Utility functions (image helpers)
└── App.tsx              # Main routing setup
```

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling (professional medical theme)
- **React Router** for navigation
- **Professional Design**: Green/red color scheme with medical-style UI

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **View the website:**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## Adding Your Photos

### Step 1: Organize Your Images
Place your work photos in the `src/assets/images/` folder with descriptive names:
```
src/assets/images/
├── autoclave-repair.jpg
├── hospital-bed.jpg
├── iv-stands.jpg
├── stretcher-welding.jpg
├── patient-monitor.jpg
└── medical-furniture.jpg
```

### Step 2: Update Gallery Data
Edit `src/pages/Gallery.tsx` to reference your actual image files:
```typescript
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Your Work Title',
    description: 'Description of the repair work',
    imageUrl: '/src/assets/images/your-photo.jpg', // Update this path
    category: 'before-after', // or 'equipment' or 'work-process'
    alt: 'Alt text for accessibility'
  }
];
```

### Step 3: Replace Placeholders with Real Images
In your gallery component, replace the placeholder divs with actual img tags:
```jsx
<img 
  src={item.imageUrl} 
  alt={item.alt}
  className="w-full h-full object-cover"
/>
```

## Customization

### Colors and Branding
The website uses CSS custom properties defined in `src/index.css`:
- `--vpmed-green`: #16a34a (primary green)
- `--vpmed-red`: #dc2626 (accent red)
- Custom button classes: `.btn-primary`, `.btn-secondary`, `.btn-outline`

### Contact Information
Update contact details in:
- `src/components/Layout/Footer.tsx`
- `src/pages/Contact.tsx`

### Business Information
Modify business details throughout the components to match your specific:
- Service area
- Operating hours
- Social media links
- Email addresses

## Important Notes

- **Service Model**: Website emphasizes appointment-only service (not 24/7)
- **Professional Focus**: Content targets hospitals, clinics, healthcare facilities
- **Trust Building**: Includes safety disclaimers and service confirmations
- **Mobile Responsive**: Fully responsive design for all devices

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready for deployment.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Support

For technical questions about this website setup, refer to:
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**vpmed** - Professional Medical Equipment Repair and Maintenance Services
