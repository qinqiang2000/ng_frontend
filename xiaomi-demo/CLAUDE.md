# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaxFlow Pro is a Next.js-based tax invoice management platform for multinational enterprises. The application provides unified tax rules engines, invoice processing, and compliance management solutions across different global jurisdictions.

## Development Commands

### Common Development Tasks
- `npm run dev` - Start development server (cross-env NODE_ENV=development next dev -H 0.0.0.0 -p 3000)
- `npm run build` - Build production version (cross-env NODE_ENV=production next build)
- `npm run start` - Start production server with PM2 (pm2 start ecosystem.config.js)
- `npm run start:sit` - Start with SIT environment via PM2
- `npm run status` - Check PM2 application status (pm2 status taxflow-pro)
- `npm run stop` - Stop PM2 application (pm2 stop taxflow-pro)
- `npm run delete` - Delete PM2 application (pm2 delete taxflow-pro)
- `npm run restart` - Restart PM2 application (pm2 restart taxflow-pro)

### Code Quality and Testing
- `npm run lint` - Run ESLint (next lint)
- `npm run lint:fix` - Run ESLint with auto-fix (next lint --fix)
- `npm run type-check` - Run TypeScript type checking (tsc --noEmit)

### Build and Deployment
- `npm run export` - Export static files
- `npm run build:analyze` - Build with bundle analysis (ANALYZE=true)

**Important**: Always run `npm run lint` and `npm run type-check` before committing code changes.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom configuration
- **Icons**: RemixIcon (ri-* classes)
- **Charts**: Recharts for data visualization
- **Maps**: React Google Maps API (@react-google-maps/api)
- **Flow Visualization**: ReactFlow for audit document flows
- **File Upload**: React Dropzone for file handling
- **Process Manager**: PM2 for production process management
- **Node**: Node.js >=16.0.0, npm >=8.0.0

### Process Management
The application uses PM2 for production process management with the following configuration:
- **Configuration File**: `ecosystem.config.js` - PM2 ecosystem configuration
- **Application Name**: `taxflow-pro` - Used for PM2 process identification
- **Environment Support**: Development, staging, and production environments
- **Logging**: Structured logs in `logs/` directory (info.log, out.log, error.log)
- **Auto-restart**: Automatic restart on crashes with memory limit protection (1GB)
- **Process Monitoring**: Built-in monitoring and status reporting

### PM2 Management Commands
```bash
# Direct PM2 commands (if needed)
pm2 status                    # View all processes
pm2 logs taxflow-pro         # View logs
pm2 monit                    # Real-time monitoring
pm2 reload taxflow-pro       # Zero-downtime reload
pm2 delete taxflow-pro       # Remove process
```

### Directory Structure

The project follows a clean separation between client-side and server-side code:

```
src/                        # Source code directory
├── app/                   # Next.js App Router pages (main app structure)
│   ├── globals.css        # Global CSS styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main dashboard page
│   ├── providers.tsx      # Context providers
│   ├── api/               # API routes
│   │   └── taxflow/       # TaxFlow API endpoints
│   │       └── [...slug]/ # Dynamic API route handler
│   ├── audited-requests/  # Audit request management with document flow visualization
│   │   └── [id]/          # Dynamic audit request pages with components, data, services, types
│   ├── audited-rules/     # Audited rules management
│   │   └── [id]/          # Dynamic audited rules pages
│   ├── invoice-requests/  # Invoice request management
│   │   └── [id]/          # Dynamic invoice request pages
│   ├── invoice-results/   # Invoice results viewing
│   ├── invoice-rules/     # Invoice rules management
│   │   └── [id]/          # Dynamic invoice rules pages
│   ├── release-center/    # Rule version releases
│   ├── rule-engines/      # Rules engine overview
│   ├── rule-groups/       # Rule groups management
│   ├── tax-compliance/    # Tax compliance features
│   ├── tax-rules/         # Tax rules management
│   ├── subscriptions/     # Corporate subscription management
│   └── subscription-settings/ # Subscription settings
├── client/                # Client-side (frontend) code
│   ├── components/        # Reusable UI components
│   │   ├── Header.tsx     # Main navigation with dropdowns
│   │   └── ui/            # UI components
│   │       ├── StatCard.tsx       # Statistics display cards
│   │       ├── StatusBadge.tsx    # Status indicator badges
│   │       ├── CountryRegionSelector.tsx  # Country/region selection
│   │       ├── DateTimePicker.tsx # Date/time picker component
│   │       ├── InvoiceTypeSelector.tsx    # Invoice type selection
│   │       ├── SubInvoiceTypeSelector.tsx # Sub-invoice type selection
│   │       ├── JEXLEditor.tsx     # JEXL expression editor
│   │       ├── Toast.tsx          # Toast notification
│   │       ├── ToastContainer.tsx # Toast container
│   │       ├── ExplanationModal.tsx # Business logic explanation modal
│   │       ├── JsonDataModal.tsx  # JSON data display modal
│   │       ├── JEXLExplanation.tsx # JEXL expression explanation
│   │       ├── Pagination.tsx     # Table pagination component
│   │       ├── PdfViewer.tsx      # PDF document viewer
│   │       └── PublishModal.tsx   # Rule publishing modal
│   ├── contexts/          # React contexts
│   │   └── CountryContext.tsx     # Country selection context
│   ├── hooks/             # Custom React hooks
│   │   └── useToast.ts            # Toast notification hook
│   ├── services/          # Client-side service layer (API calls)
│   │   ├── invoiceRequestService.ts # Invoice request service
│   │   ├── jexlExplanationService.ts # JEXL expression explanation
│   │   ├── releaseService.ts        # Release management service
│   │   └── ruleGroupService.ts      # Rule groups service
│   ├── lib/               # Client-side utilities and libraries
│   │   ├── paths.ts       # Path and URL utilities
│   │   └── i18n/          # Internationalization configuration
│   └── locales/           # Translation files (i18n)
│       ├── en/            # English translations
│       ├── zh/            # Chinese translations
│       ├── ja/            # Japanese translations
│       ├── de/            # German translations
│       ├── fr/            # French translations
│       └── es/            # Spanish translations
└── server/                # Server-side (backend) code
    ├── config/            # Server configuration
    ├── controllers/       # Request controllers
    ├── middleware/        # Server middleware
    ├── routes/            # API routes
    ├── services/          # Business logic services
    └── types/             # Server-side type definitions

config/                    # Configuration files
├── next.config.ts         # Next.js configuration (moved from root)
└── ecosystem.config.js    # PM2 process management configuration

next.config.ts             # Next.js configuration (root level)
public/                    # Static assets (Next.js requirement)
└── images/               # Static images (favicon, logos, etc.)
```

### Core Data Models
The application handles several key entities:

- **Jurisdiction**: Tax jurisdiction configuration (country_code, trade_area_code, province_code, city_code, is_mandatory)
- **TaxType**: Tax type definitions with i18n support
- **Rule**: Master rule table with expression logic, priority, and jurisdiction mapping
- **RuleVersion**: Version control for rules (Draft → InReview → Approved → Staged → Active → Deprecated → Retired)
- **Engine**: Rule engine assemblies by jurisdiction and tax type (Draft → Assembled → QAed → Staged → Active → Rollbackable)
- **Subscription**: Corporate subscriptions (MANDATORY, GROUP_ENFORCED, CUSTOM scopes)
- **InvoiceRequest**: Full invoice lifecycle (Draft → Submitted → Enriching → TaxDetermined → DraftGenerated → Validating → Validated → Queued → Delivered → Failed/Cancelled/Rejected)

### Key Features
- Multi-jurisdiction tax compliance management
- Real-time invoice processing statistics
- Rule engine version control and deployment
- Corporate subscription management with different scopes
- Comprehensive invoice request lifecycle tracking
- Document audit flow visualization with React Flow
- Rule group management and organization

### Component Patterns
- All components use TypeScript interfaces for props
- UI components support color theming (blue, green, orange, red, purple)
- StatusBadge and StatCard components are reusable across the application
- Header component uses state management for dropdown interactions

### Service Layer Architecture
- **API Communication**: All API calls use `getApiBasePath()` from `src/client/lib/paths.ts` to ensure consistent routing
- **Error Handling**: Service functions follow consistent error checking pattern - backend returns `errcode: '0000'` for successful responses, `errcode: '0'` as alternative success indicator
- **Data Transformation**: Raw API responses are transformed for UI consumption in service layer
- **Type Safety**: Comprehensive TypeScript interfaces for all API requests/responses
- **Request ID Generation**: Automatic random request ID appends to all API calls for tracing

### API Integration Patterns
```typescript
// Always use getApiBasePath for API calls
import { getApiBasePath } from '@/client/lib/paths';

const response = await fetch(getApiBasePath('/api/endpoint'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// Standard error checking pattern - backend returns errcode '0000' for success
if (result.errcode !== '0000') {
  throw new Error(result.message || 'API returned error');
}
```

### Configuration Notes
- Next.js configured with API rewrites for `/xm-demo/:path*` routes
- Static export (`output: "export"`) is commented out for development proxy functionality
- Images are unoptimized for static deployment
- TypeScript uses strict mode with path mapping (@/* for root imports)
- ESLint configured with Next.js defaults, warnings for unused vars and no-explicit-any
- Tailwind scans app/, components/, libs/, pages/, and hooks/ directories
- Development server runs on all interfaces (0.0.0.0) port 3000
- API proxy requires NEXT_PUBLIC_API_URL environment variable
- Supports NEXT_PUBLIC_BASE_PATH for nginx prefix proxy deployments
- API rewrites configured for `/xm-demo/:path*` pattern with automatic reqid generation
- Webpack configured with canvas fallbacks for Konva/document processing support

### Code Style
- Use 'use client' directive for client-side components
- Follow existing component structure and naming conventions
- Implement proper TypeScript interfaces for all props
- Use Tailwind CSS utility classes consistently
- RemixIcon classes follow ri-* pattern
- **Indentation**: Use 4 spaces for all files in the `src/` directory. Maintain consistent indentation throughout the project.

### Permission Handling for New Pages
When creating new pages that require permission checks, follow the pattern from `src/app/invoice-requests/page.tsx`:

```typescript
import YourInnerPage from './innerPage';
import ServerAuthGuard from '@/server/components/ServerAuthGuard';

interface PageProps {
  searchParams: Promise<{ domain?: string }>;
}

export default async function YourPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const domain = params?.domain;

  return (
    <ServerAuthGuard pathname="/your-page-path" domain={domain}>
      <YourInnerPage />
    </ServerAuthGuard>
  );
}
```

**Key Points**:
- Use `ServerAuthGuard` component to wrap pages requiring authentication
- Pass the `pathname` prop for proper permission checking
- Extract `domain` from searchParams and pass to the guard
- Create a separate `innerPage.tsx` component for the actual page content
- The guard handles session validation, permission checks, and error states automatically

## Environment Setup
- Requires NEXT_PUBLIC_API_URL environment variable for API proxy functionality
- Local development port 3000 may be occupied (我本地开发已经占用3000端口)
- Development proxy routes require proper basePath configuration

## Common Development Patterns

### Date/Time Formatting
```typescript
import { formatDisplayTime, formatDateOnly } from '@/client/services/invoiceRequestService';

// Format full datetime: "2025-01-14 10:25:44"
const formattedDateTime = formatDisplayTime(apiDateTime);

// Format date only: "2025-01-14"
const formattedDate = formatDateOnly(apiDateTime);
```

### Currency Display
```typescript
import { formatCurrencyAmount, getCurrencySymbol } from '@/client/services/invoiceRequestService';

// Format with currency symbol: "$1,000"
const formattedAmount = formatCurrencyAmount(1000, 'USD');

// Get symbol only: "$"
const symbol = getCurrencySymbol('USD');
```

### JEXL Expression Handling
```typescript
import { explainJexlExpression } from '@/client/services/jexlExplanationService';

// Get business logic explanation for JEXL expressions
const explanation = await explainJexlExpression(jexlCode, contextData);
```

### Status Management
The application uses consistent status mappings for different entities:
- **Invoice Requests**: 10 statuses (Draft → FullyInvoiced)
- **Invoice Results**: 7 statuses (InvoiceReady → DeliverFailed)
- **Rule Versions**: 7 states (Draft → Retired)
- **Engine States**: 6 states (Draft → Rollbackable)

## Project Structure Guidelines

### Separation of Concerns
- **Client-side code**: All browser-side code lives in `src/client/`
- **Server-side code**: All server-side code lives in `src/server/`
- **Configuration**: All config files live in `config/`
- **Next.js App Structure**: App Router pages and API routes live in `src/app/`

### Import Path Guidelines
- Use `@/client/*` for importing client-side modules
- Use `@/server/*` for importing server-side modules
- Use `@/config/*` for importing configuration files
- Use `@/*` for root-level imports (backwards compatibility)
- Pages in `src/app/` use relative imports or `@/client/*` for client components

## Component Reuse Guidelines
- **Always check `src/client/components/ui/` first** before creating new components
- **Use existing Toast system** (`useToast` hook) for all user notifications
- **Follow established patterns** from similar pages in the codebase
- **Reuse before creating** - only build new components when existing ones don't fit

## API Integration Rules
- When integrating APIs into the project, all request URLs must be built using the utility method `getApiBasePath` defined in `src/client/lib/paths.ts`. This ensures that the root path for API calls is consistent across environments (development, staging, production).

## Additional Development Resources

### API Documentation
The `apifox-doc/` directory contains OpenAPI specifications and documentation:
- `ng.openapi.json` - Main API specification
- `ai-ng.openapi.json` - AI-related API endpoints
- `jexl-ng.openapi.json` - JEXL expression API endpoints

### Development Prompts
The `prompts/` directory contains business requirement documentation for key features:
- Invoice results management and reporting
- Release center functionality and version control
- Tax authority filing performance metrics
- Business logic explanation for JEXL expressions

### Docker Support
Docker configuration available in `docker/Dockerfile` for containerized deployments.

### Deployment Scripts
Automated deployment scripts available in `scripts/deploy.sh`.

## Logging System

The application uses Winston for server-side logging with automatic daily rotation.

### Log Files
All logs are written to the `logs/` directory:
- `info.log` - Current day's all-level logs (JSON format)
- `error.log` - Current day's error logs (JSON format)
- Historical files with date suffix (auto-rotation at 20MB or daily)

### Log Format
Timestamp format: `YYYY-MM-DD HH:mm:ss,SSS` (comma-separated milliseconds)

Logs are in JSON format for ELK Stack compatibility:
```json
{
  "@timestamp": "2025-08-05 09:24:42,967",
  "level": "INFO",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/taxflow/invoice",
  "statusCode": 200,
  "duration": 125
}
```

### Using the Logger

Import the logger in any server-side file:
```typescript
import logger from '@/server/utils/logger';
```

#### Basic Usage
```typescript
// Information logging
logger.info('Server started', { port: 3000 });

// Warning logging
logger.warn('Slow query detected', { duration: 5000 });

// Error logging
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack
});

// Debug logging (only in development)
logger.debug('Cache hit', { key: 'user_123' });
```

### Configuration
Logger configuration is managed in `src/server/config/logger.ts` with support for environment variables:

```bash
# .env configuration (optional)
LOG_DIR=./logs                     # Log directory (default: ./logs)
LOG_LEVEL=info                     # Log level: debug, info, warn, error
```

### Log Rotation
- **Daily Rotation**: New log files created each day (info-YYYY-MM-DD.log)
- **Automatic**: System checks for date changes every hour
- **No Size Limit**: Files grow unlimited per day (manual cleanup needed for very high volume)

### Logging Best Practices
1. **Always use logger instead of console.log/console.error** in server-side code
2. **Include context** in logs for better debugging (user ID, request ID, etc.)
3. **Use appropriate log levels**:
   - `info`: General information, successful operations
   - `warn`: Warning conditions, degraded performance
   - `error`: Error conditions, failures
   - `debug`: Detailed debugging information (dev only)
4. **Avoid logging sensitive data** (passwords, tokens, full credit card numbers)
5. **Log performance metrics** for API endpoints (duration, status codes)

### Common Logging Patterns

#### API Request Logging
```typescript
const startTime = Date.now();
logger.info('API request received', {
  method: request.method,
  url: request.url
});

// ... handle request ...

logger.info('API request completed', {
  method: request.method,
  url: request.url,
  statusCode: response.status,
  duration: Date.now() - startTime
});
```

#### Error Handling
```typescript
try {
  // ... code that might throw ...
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'createInvoice',
    userId: session.userId
  });
  return errorResponse();
}
```

#### Session Operations
```typescript
logger.info('User login', {
  userId: user.id,
  orgId: user.orgId
});

logger.warn('Session expired', {
  sessionId: sessionId.substring(0, 8) + '...'
});
```

### Log Files Structure
```
logs/
├── info.log              # Current day's logs (soft link, if supported)
├── error.log             # Current day's error logs (soft link, if supported)
├── info-2025-08-05.log   # Historical info logs (daily rotation)
├── error-2025-08-05.log  # Historical error logs (daily rotation)
└── README.md             # Documentation
```

### ELK Integration
The JSON format is optimized for Elasticsearch ingestion via Filebeat:
- All logs include `@timestamp` field
- Structured metadata for filtering and aggregation
- Stack traces preserved in error logs

## Project Information
- **Project Name**: taxflow-pro (v1.0.0)
- **Description**: TaxFlow Pro - 智能税务发票处理系统
- **Title**: Readdy Site (Generated by Readdy)
- **Repository**: git+https://github.com/taxflow-pro/frontend.git
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.