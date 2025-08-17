# Mini Seller Console

## Features

### Core Requirements (MVP)

- **Leads List**: Display leads from local JSON data with search, filter, and sort functionality
- **Lead Detail Panel**: Slide-over panel with inline editing for status and email (with validation)
- **Convert to Opportunity**: Transform qualified leads into opportunities
- **Opportunities Table**: Simple table displaying converted opportunities
- **UX/States**: Loading states, empty states, and error handling

### Nice-to-Haves (All Implemented)

- **Persistent Filters**: Filter and sort preferences saved to localStorage
- **Optimistic Updates**: Real-time UI updates with rollback on failure
- **Responsive Design**: Adaptive layout for desktop and mobile devices

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: Redux Toolkit for predictable state management
- **Development**: ESLint for code quality

## Architecture

### State Management

- **Redux Toolkit**: Modern Redux with simplified API
- **Slices**: Separate slices for leads and opportunities
- **Async Thunks**: Handle API-like operations with simulated latency
- **Optimistic Updates**: Immediate UI feedback with error rollback

### Design Patterns

- **Container/Presentation**: Smart components manage state, presentational components focus on UI
- **Custom Hooks**: Typed Redux hooks for better developer experience
- **Error Boundaries**: Graceful error handling throughout the application
- **Responsive Design**: Mobile-first approach with progressive enhancement

### Prerequisites

- Node.js (v20.18.0 or higher)
- npm or yarn
- Docker & Docker Compose

### Quick Start (Local Development)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Samuel-A-Santos/mini-seller-console
   cd mini-seller-console
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/Samuel-A-Santos/mini-seller-console
   cd mini-seller-console
   ```

2. **Run with Docker Compose**

   ```bash
   # Option 1: Using npm scripts
   npm run docker:prod

   # Option 2: Direct docker-compose
   docker-compose up --build
   ```

3. **Open in browser**
   Navigate to `http://localhost:3000`

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Docker Commands

```bash
# Production environment
npm run docker:prod

# Development environment
npm run docker:dev

# Stop all containers
npm run docker:stop

# Complete cleanup
npm run docker:clean

# Health check
npm run docker:health
```

## Usage

### Managing Leads

1. **Search & Filter**: Use the search bar to find leads by name or company
2. **Status Filter**: Filter leads by status (New, Contacted, Qualified, Unqualified)
3. **Sorting**: Click column headers to sort by name, company, or score
4. **View Details**: Click any lead row to open the detail panel

### Lead Detail Panel

1. **Edit Email**: Click "Edit" next to the email field, validate, and save
2. **Update Status**: Change lead status with the dropdown editor
3. **Convert to Opportunity**: Click the conversion button (disabled for unqualified leads)

### Opportunities

- View all converted opportunities in a dedicated table
- See opportunity stage, amount, and creation date
- Track total opportunity value

### Customization

- You can modify the `src/data/leads.json` to change for any dataset you want

## File Structure

```
mini-seller-console/
├── public/
├── src/
│   ├── components/     # React components
│   │   ├── __tests__/  # Component tests
│   │   ├── LeadsList.tsx
│   │   ├── LeadDetailPanel.tsx
│   │   ├── OpportunitiesTable.tsx
│   │   ├── ResponsiveLayout.tsx
│   │   └── TestingControls.tsx
│   ├── store/          # Redux store and slices
│   │   ├── slices/
│   │   │   ├── __tests__/  # Slice tests
│   │   │   ├── leadsSlice.ts
│   │   │   └── opportunitiesSlice.ts
│   │   └── index.ts
│   ├── types/          # TypeScript definitions
│   ├── hooks/          # Custom hooks
│   ├── test/           # Test configuration
│   ├── data/           # Sample data
│   ├── main.tsx        # Application entry point
│   ├── App.tsx         # Root component
│   └── index.css       # Global styles
├── scripts/            # Docker convenience scripts
│   ├── docker-start.sh     # Production deployment
│   ├── docker-dev.sh       # Development environment
│   └── health-check.sh     # Health monitoring
├── Dockerfile          # Production container
├── Dockerfile.dev      # Development container
├── docker-compose.yml  # Container orchestration
├── nginx.conf          # Web server config
├── .dockerignore       # Docker ignore patterns
├── DOCKER_SETUP.md     # Docker documentation
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript config
├── vitest.config.ts    # Test configuration
└── vite.config.ts      # Build configuration
```
