This project is a backend application based on a microservices architecture, built with Node.js, Express, MongoDB, Docker, and Docker Compose.

The system uses:

an API Gateway as a single entry point,

a Service Discovery for dynamic service registration,

multiple business microservices, each handling a specific domain.

All external API calls go through the Gateway (port 5000).

Client (Postman / Frontend)
        |
        v
     API Gateway (5000)
        |
        v
 Service Discovery (4000)
        |
 -------------------------------------------------
 |        |        |        |        |           |
User   Nutrition Planning  Event   Forum     Product
3005     3000       3001     3002    3003        3004
