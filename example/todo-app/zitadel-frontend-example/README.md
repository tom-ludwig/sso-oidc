# Zitadel Authentication Example with React

A exmpale React application demonstrating authentication with Zitadel.

## Screenshots

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Zitadel instance** running on `http://localhost:8080`
    - `docker/podman compose up -d`
- **API server** running on `http://localhost:8089` (Using Zitadel middleware to protect some endpoints)
    - `go run .`

## 🛠️ Installation

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Zitadel Setup

1. **Create a new application** in your Zitadel console
2. **Configure the application** with these settings:
    - **Application Type**: Web
    - **Authentication Method**: PKCE
    - **Redirect URIs**: `http://localhost:5173/callback`
    - **Post Logout Redirect URIs**: `http://localhost:5173`

3. **Update the configuration** in `src/App.tsx`:
   ```typescript
   const config: ZitadelConfig = {
     authority: "http://localhost:8080",
     client_id: "YOUR_CLIENT_ID", // Replace with your actual client ID
     redirect_uri: "http://localhost:5173/callback",
     post_logout_redirect_uri: "http://localhost:5173",
     scope: "openid profile email",
   };
   ```
4. Create another application of type: **API**
5. Create and download a key, and place it under the backend folder and call it `key.json`.

### Environment Variables (Optional)

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_ZITADEL_AUTHORITY=http://localhost:8080
VITE_ZITADEL_CLIENT_ID=your_client_id_here
VITE_API_BASE_URL=http://localhost:8080/api
```

### API Integration

The app expects these API endpoints (optional):

```
GET  /api/healthz           # Health check
GET  /api/tasks             # Get user tasks
POST /api/tasks             # Create new task
```

**Authentication errors**: Ensure your Zitadel client ID and redirect URIs match exactly.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Zitadel Documentation](https://docs.zitadel.com/)
