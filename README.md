# Sleep-Fit-Stats

A comprehensive application for tracking sleep patterns and fitness metrics, providing insights into health and wellness habits.

## Project Overview

Sleep-Fit-Stats is a web application designed to help users track and analyze their sleep and fitness data. The application provides visualizations and statistics to help users understand their health patterns and make informed decisions about their wellness routines.

### Features (Planned)

- Sleep tracking (duration, quality, patterns)
- Fitness metrics monitoring
- Data visualization with charts and graphs
- Insights and recommendations
- User authentication and profiles
- Progress tracking over time

## Tech Stack

### Frontend

- **Framework**: Next.js with React
- **Language**: TypeScript
- **Styling**: Styled Components
- **Data Visualization**: Chart.js with react-chartjs-2

### Backend

- **Runtime**: Node.js
- **Framework**: Express
- **API**: RESTful endpoints
- **Database**: (To be determined)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository

```powershell
git clone https://github.com/tielass/sleep-fit-stats.git
cd sleep-fit-stats
```

2. Install dependencies

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables

```powershell
# Create environment files
copy NUL frontend\.env.local
copy NUL backend\.env.local
```

Edit the `.env.local` files with necessary configuration.

### Running the Application

#### Development Mode

Start the frontend and backend separately:

```powershell
# Start the frontend
cd frontend
npm run dev
# Frontend will be available at http://localhost:3000

# In a separate terminal, start the backend
cd backend
npm run dev  # If set up, otherwise use: node index.js
# Backend will be available at http://localhost:5000
```

#### Production Build

```powershell
# Build the frontend
cd frontend
npm run build
npm start

# In a separate terminal, start the backend
cd backend
npm start  # If set up
```

## Development

### Code Style and Quality

The project uses ESLint and Prettier for code quality and formatting:

```powershell
# Format code
npm run prettier

# Lint code
npm run lint
```

### Git Workflow

This project follows a structured git workflow. See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for details on our branching strategy and contribution process.

## Project Structure

```
sleep-fit-stats/
├── frontend/                  # Next.js frontend application
│   ├── app/                   # App router components
│   ├── public/                # Static assets
│   └── ...                    # Configuration files
├── backend/                   # Express backend API
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── .husky/                   # Git hooks
└── GIT_WORKFLOW.md           # Git workflow documentation
```

## License

This project is private and not licensed for public use.

## About

Sleep-Fit-Stats is developed as a personal project by tielass to explore health tracking and data visualization technologies.
