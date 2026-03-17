# AI Backend Rules

You are a senior backend engineer building a scalable production-grade system using:

- Node.js
- Express
- Prisma
- MongoDB
- TypeScript

You MUST follow these rules strictly when generating code.

---

# 🧠 GENERAL PRINCIPLES

- Always follow clean architecture
- Keep code modular, scalable, and maintainable
- Never mix responsibilities between layers
- Use Prisma for ALL database operations
- Use async/await (no callbacks)
- Use TypeScript strictly (no plain JS)

---

# 🧱 PROJECT STRUCTURE (STRICT)

Follow this structure exactly:

/src
  /models
    <module>.model.ts
  /services
    <module>.service.ts
  /controllers
    <module>.controller.ts
  /routes
    <module>.routes.ts
  /validations
    <module>.validation.ts
  /middlewares
  /config
  /utils
  app.ts
  server.ts

---

# 📦 FILE NAMING RULES

- File naming MUST follow:
  <module>.<layer>.ts

Examples:
- product.model.ts
- product.service.ts
- product.controller.ts
- product.routes.ts
- product.validation.ts

---

# 📦 MODULE CONSISTENCY RULE

For every module, ALWAYS create:

- models/<module>.model.ts
- services/<module>.service.ts
- controllers/<module>.controller.ts
- routes/<module>.routes.ts
- validations/<module>.validation.ts

No file should be skipped unless explicitly told.

---

# 🔄 REQUEST FLOW (MANDATORY)

Every request MUST follow:

Route → Middleware → Controller → Service → Prisma → Response

---

# ❌ FORBIDDEN

- No database access in routes
- No business logic in controllers
- No direct Prisma usage in controllers
- No skipping validation layer

---

# 📦 LAYER RESPONSIBILITIES

## Models
- Define data access using Prisma
- No business logic

## Services
- Contain ALL business logic
- Interact with Prisma via models

## Controllers
- Handle request and response
- Call service functions only

## Routes
- Define API endpoints
- Attach middleware

## Validations
- Validate request data using Zod or Joi

---

# 🗄️ DATABASE RULES (PRISMA + MONGODB)

- Always use Prisma Client
- Never use raw MongoDB queries
- Use ObjectId correctly

---

# 📊 DATA DESIGN RULES

- Use JSON fields for:
  - themes
  - homepage configuration

- Use references (IDs) for:
  - users
  - orders

- Embed small repeated data when appropriate

---

# 🔐 AUTHENTICATION RULES

- Use JWT authentication
- Protect admin routes
- Roles must include:
  - admin
  - staff
  - customer

---

# 🧾 API STANDARDS

Use REST conventions:

GET    /api/<resource>  
POST   /api/<resource>  
GET    /api/<resource>/:id  
PUT    /api/<resource>/:id  
DELETE /api/<resource>/:id  

---

# 📤 RESPONSE FORMAT

Success:
{
  "success": true,
  "data": {},
  "message": "Optional"
}

Error:
{
  "success": false,
  "message": "Error message"
}

---

# 🎨 DYNAMIC SYSTEM RULES

Theme:
- Store theme config as JSON
- Only ONE active theme

Homepage:
- Store sections as JSON array
- Section order matters

Never hardcode frontend data

---

# 🧩 MIDDLEWARE RULES

Create reusable middleware for:
- Authentication
- Error handling
- Validation

---

# ⚙️ CODE QUALITY RULES

- Use ES modules (import/export)
- Use strict typing in TypeScript
- Avoid using "any"
- Use meaningful variable names
- Keep functions small and reusable
- Avoid duplication
- Use environment variables (.env)

---

# 🔁 DEVELOPMENT WORKFLOW

For every feature:

1. Define Prisma model
2. Generate Prisma client
3. Create all required layer files
4. Implement service logic
5. Implement controller
6. Add routes
7. Add validation
8. Test API

---

# 🚫 STRICT ANTI-PATTERNS

Do NOT:

- Put business logic in controllers
- Access database in routes
- Hardcode data
- Skip validation
- Create large monolithic files
- Expose raw error messages

---

# 🔥 MODULE PRIORITY ORDER

Build modules in this order:

1. Auth
2. Users / Customers
3. Products
4. Orders
5. Themes
6. Homepage
7. Payments
8. Coupons
9. Complaints / Tickets
10. Inventory / Purchase Orders

---

# 📈 SCALABILITY RULES

- Always implement pagination for list APIs
- Support filtering and sorting
- Design code for future extensions

---

# 🎯 FINAL INSTRUCTION

Always generate code that:

- Follows this structure exactly
- Uses TypeScript strictly
- Separates concerns properly
- Uses Prisma correctly
- Is clean and production-ready