# Online Testing App (Docker Fixed Version)

This version includes the fix for Spring Boot JAR manifest (spring-boot:repackage).

## How to run

1. Build and start all services:
   ```bash
   docker compose up --build
   ```

2. Access the app:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080
   - MySQL: localhost:3306 (user: root, password: root)

3. Login credentials:
   - admin / admin123 (ROLE_ADMIN)
   - user / user123 (ROLE_USER)

Enjoy!
