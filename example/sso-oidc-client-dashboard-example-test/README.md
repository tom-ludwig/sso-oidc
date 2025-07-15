# SSO OIDC Client Dashboard

A React + Vite application with shadcn/ui components demonstrating OAuth OIDC authentication flow.

## Features

✅ **OAuth OIDC Flow**
- Token-based authentication with sessionStorage
- Automatic session checking with `session_id` cookie
- Calls to `/oauth/authorize` and `/oauth/token` endpoints
- Proper token management and expiry handling

✅ **Beautiful Dashboard**
- Built with shadcn/ui components
- Interactive charts using Recharts
- Fake data generation with Faker.js
- Responsive design

✅ **Authentication States**
- Loading screen during auth check
- Authentication required screen
- Protected dashboard content
- Token information display

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Auth Server

Edit `src/config/auth.ts` to match your auth server:

```typescript
export const AUTH_CONFIG = {
  // Your auth server base URL
  authServerUrl: 'https://your-auth-server.com',
  
  // OAuth client configuration
  clientId: 'your-client-id',
  
  // OAuth endpoints (adjust if different)
  endpoints: {
    authorize: '/oauth/authorize',
    token: '/oauth/token',
  },
  
  // OAuth scopes
  scopes: ['openid', 'profile', 'email'],
};
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Authentication Flow

### 1. **Token Check**
- App first checks for valid tokens in `sessionStorage`
- If tokens exist and are not expired, user sees dashboard

### 2. **Session Check**
- If no tokens, checks for `session_id` cookie
- Makes call to `/oauth/authorize` with session cookie
- If successful, receives authorization code

### 3. **Token Exchange**
- Exchanges authorization code for tokens via `/oauth/token`
- Stores `access_token` and `id_token` in `sessionStorage`
- Sets token expiry time

### 4. **Dashboard Access**
- User sees protected dashboard content
- Tokens are displayed in authentication details card
- Sign out clears tokens and session

## API Endpoints Expected

Your auth server should provide these endpoints:

### `/oauth/authorize`
- **Method**: GET
- **Headers**: `Cookie: session_id=<session_id>`
- **Response**: `{ "code": "auth_code_here" }` (if session valid)
- **Purpose**: Check session and return authorization code

### `/oauth/token`
- **Method**: POST
- **Body**: 
  ```json
  {
    "grant_type": "authorization_code",
    "code": "auth_code_here",
    "client_id": "your-client-id",
    "redirect_uri": "http://localhost:5173"
  }
  ```
- **Response**: 
  ```json
  {
    "access_token": "token_here",
    "id_token": "id_token_here",
    "token_type": "Bearer",
    "expires_in": 3600
  }
  ```

## Testing Authentication

### With Session Cookie
Set a session cookie in browser console:
```javascript
document.cookie = 'session_id=valid_session_id; path=/';
```

### Without Session Cookie
Clear the session cookie:
```javascript
document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
```

Then refresh the page to see different authentication states.

## Components Used

- **shadcn/ui**: Card, Button, Badge, Progress, Separator, Table, etc.
- **Recharts**: Line and Bar charts for data visualization
- **Faker.js**: Realistic fake data generation
- **React Router**: Client-side routing

## File Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── Dashboard.tsx       # Main dashboard component
├── config/
│   └── auth.ts            # OAuth configuration
├── lib/
│   ├── auth.ts            # Authentication logic
│   └── utils.ts           # Utility functions
└── main.tsx               # App entry point
```

## Development

The application automatically handles:
- Token expiry checking
- Session validation
- Error handling for failed auth requests
- Loading states during authentication
- Proper cleanup on sign out

Perfect for testing and demonstrating OAuth OIDC flows!
