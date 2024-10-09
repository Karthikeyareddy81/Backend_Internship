# Backend_Internship
This Node.js backend uses Express, MongoDB, and JWT for user and admin management. Users can register, log in, and upload assignments, while admins manage assignments. Secure authentication with JWT and bcrypt for password hashing is implemented. CORS support and protected routes are also included.

1. Modules & Setup:
    Express.js is used for creating the server, CORS allows cross-origin requests, MongoClient connects to MongoDB, bcrypt hashes passwords, and JclientWT manages authentication.
    Middleware is applied for JSON parsing and CORS setup.
2. Database Connection:
    The app connects to MongoDB using MongoClient, and credentials are stored directly in the code (not recommended for production; use environment variables instead).
3. JWT Authentication:
    A secret key is defined for JWT signing.
    The authenticateToken middleware protects routes by verifying JWTs sent with requests.
4. User Registration & Login:
    Registration: Users register with a username and hashed password. Duplicate users are checked.
    Login: Users log in with credentials. If valid, a JWT is returned.
5. Admin Registration & Login:
    Admins follow the same flow as users for registration and login, using separate routes and collections.
6. Assignments:
    Users can upload assignments, specifying an admin to review them.
    Admins can view assignments assigned to them and change their status (accept/reject).
7. Server Start:
    The server listens on port 8080.
Key Points:
    Security: Passwords are hashed, JWT is used for auth, but sensitive info like DB credentials should be stored securely (use environment variables).
    Best Practices: Implement input validation, environment variables, logging, and security middleware (like rate limiting).