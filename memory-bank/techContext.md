# Tech Context

## Technologies used

1. Core Framework

   - Next.js 14.2.25 (App Router)
   - React 18
   - TypeScript 5

2. UI Libraries

   - Tailwind CSS 3.4
   - shadcn/ui components
   - Radix UI primitives
   - Framer Motion for animations
   - Lucide React for icons

3. State Management

   - Zustand 5.0.3
   - React DnD 16.0.1
   - React DnD HTML5 Backend

4. Backend Services

   - Supabase Auth
   - Supabase Database
   - Next.js API Routes

5. Editor Features
   - TipTap for rich text editing
   - Emoji Picker React

## Development setup

1. Environment Requirements

   - Node.js
   - npm/yarn
   - Git

2. Project Setup

   ```bash
   git clone <repository>
   npm install
   cp .env.example .env.local
   # Configure Supabase credentials
   npm run dev
   ```

3. Development Commands
   - `npm run dev`: Start development server
   - `npm run build`: Build production version
   - `npm run start`: Start production server
   - `npm run lint`: Run ESLint

## Technical constraints

1. Browser Support

   - Modern browsers with HTML5 drag-and-drop
   - ES6+ JavaScript support
   - CSS Grid and Flexbox support

2. Performance Requirements

   - Fast initial page load
   - Smooth drag-and-drop operations
   - Efficient state updates
   - Responsive design support

3. Security Considerations
   - Secure authentication flow
   - Protected API routes
   - XSS prevention
   - CSRF protection

## Dependencies

1. Core Dependencies

   ```json
   {
     "next": "14.2.25",
     "react": "^18",
     "react-dom": "^18",
     "typescript": "^5"
   }
   ```

2. UI Dependencies

   ```json
   {
     "tailwindcss": "^3.4.17",
     "class-variance-authority": "^0.7.1",
     "clsx": "^2.1.1",
     "framer-motion": "^12.6.2",
     "lucide-react": "^0.485.0"
   }
   ```

3. State Management

   ```json
   {
     "zustand": "^5.0.3",
     "react-dnd": "^16.0.1",
     "react-dnd-html5-backend": "^16.0.1"
   }
   ```

4. Backend Dependencies
   ```json
   {
     "@supabase/auth-helpers-nextjs": "^0.10.0",
     "@supabase/ssr": "^0.6.1",
     "@supabase/supabase-js": "^2.49.4"
   }
   ```
