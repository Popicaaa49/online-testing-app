# Online Testing App

Aplicatie completa de testare online cu Spring Boot 3, React 18, MySQL si WebSockets (STOMP + SockJS). Administratorii pot crea/edita/sterge teste grila, iar participantii pot sustine testele in timp real si pot vedea rezultatele instantaneu. Toate operatiile sensibile sunt protejate de autentificare pe sesiune web cu CSRF.

## Functionalitati principale
- Management complet al testelor (persistenta JPA: teste, intrebari, raspunsuri, rezultate).
- Validari server-side (minim o intrebare, minim doua optiuni, un singur raspuns corect).
- Submisii de teste cu calcul scor + salvare istorica + broadcast live catre toti clientii.
- Flux live prin WebSockets (`/topic/tests` si `/topic/submissions`) pentru lista de teste si feed-ul de activitate.
- UI React cu dashboard: lista teste, editor vizual grila, runner cu rezultat instant, feed live.
- Sesiuni JDBC + Spring Security (ROLE_ADMIN pentru CRUD, ROLE_USER pentru rularea testelor).

## Cum rulezi local
1. Asigura-te ca Docker + Docker Compose ruleaza.
2. Din radacina proiectului:
   ```bash
   docker compose up --build
   ```
3. Acceseaza:
   - Frontend: http://localhost:5173
   - Backend REST: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - MySQL: `localhost:3306` (user `root`, parola `root`, baza `online_testing`)

## Autentificare implicita
- Administrator: `admin / admin123`
- Utilizator: `user / user123`

## Endpoints utile
- `GET /api/tests` – lista sumar teste (public).
- `GET /api/tests/{id}` – detalii test (fara raspunsuri corecte pt. utilizatori).
- `POST /api/tests` – create test (ROLE_ADMIN).
- `PUT /api/tests/{id}` / `DELETE /api/tests/{id}` – administrare test (ROLE_ADMIN).
- `POST /api/tests/{id}/submit` – trimitere raspunsuri (ROLE_USER sau ROLE_ADMIN).
- WebSocket endpoint: `/ws` cu topicuri `/topic/tests` si `/topic/submissions`.

Enjoy!
