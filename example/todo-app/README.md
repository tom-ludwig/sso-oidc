# Zitadel Authentication Example

This example demonstrates how to implement authentication and authorization using Zitadel. It covers the flow of signing
in a user via frontend redirection and authorizing that user through secure backend API calls to Zitadel.

- The frontend is registered as a User Agent in the Zitadel console.
- The backend is registered as a standard API resource.
- When a user signs in via the frontend, they are redirected to Zitadel for authentication.
- After successful login, the frontend obtains an access token, which is used to interact with the backend API.
- The backend validates the access token and checks the user’s roles (e.g., admin) to determine permissions.

- Authenticated users can view a to-do list.
- Users with the admin role can add new items to the list.

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/98939e0b-b8d6-4c69-8e80-b00bcf777941" style="border-radius: 12px;" width="100%"></td>
    <td><img src="https://github.com/user-attachments/assets/7c7d84cd-5102-4720-8004-fe6e7181cf1a" style="border-radius: 12px;" width="100%"></td>
    <td><img src="https://github.com/user-attachments/assets/0b606c39-5e13-46f0-9290-28abb1d7fb0f" style="border-radius: 12px;" width="100%"></td>
  </tr>
</table>

## Setup

### Zitadel

1. Start Zitadel: `docker/podman compose up -d`
2. Login Zitadel `http://localhost:8080/ui/console`, with Email: `zitadel-admin@zitadel.localhost` Password:
   `Password1!`
3. Create a new instance via the UI
4. Create a two applications
    - A react app of type `User Agent`, copy the user id into the react apps config.
    - A api-app(OCID standard) and create a key and download it, place it in the backend directory and call it
      `key.json`
5. Start the backend `make start-backend` (or `go run .`)
6. Start the frontend `make start-frontend` (or `npm run dev`)
7. Visit `localhost:5173` and Log in with the existing user.
8. If you want to create a task with the user, create a admin role in the zitadel UI and assign it to your user.
