# MAISON NUE — Fashion E-Commerce Store

A full-stack fashion e-commerce project: a Node.js/Express/MongoDB backend API
and a vanilla HTML/CSS/JS storefront (no framework, no build step).

## Features

**Backend (`/backend`)**
- User registration & login with JWT authentication (passwords hashed with bcrypt)
- Product catalog with category filtering and search
- Cart-to-order checkout flow with stock deduction
- Admin-only routes for creating/updating/deleting products and managing orders
- MongoDB via Mongoose

**Frontend (`/frontend`)**
- Boutique-style storefront (ivory/wine palette, hang-tag styled product cards)
- Product grid with category filters, live search, and size selection
- Persistent cart (localStorage) with a slide-out bag drawer
- Sign in / create account modal, checkout flow that posts real orders to the API
- Fully responsive, no build tooling required — just static files

## Project structure

```
ecommerce-fashion-store/
├── backend/
│   ├── config/db.js            MongoDB connection
│   ├── models/                 User, Product, Order (Mongoose schemas)
│   ├── middleware/auth.js      JWT auth + admin guard
│   ├── controllers/            Route handler logic
│   ├── routes/                 Express routers
│   ├── seed/seedProducts.js    Sample fashion product data
│   ├── server.js               App entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit .env with your MongoDB URI + JWT secret
npm run seed               # loads sample products into the database
npm run dev                 # starts the API on http://localhost:5000
```

You'll need a MongoDB instance — either install MongoDB locally, or create a
free cluster at MongoDB Atlas and paste its connection string into `.env` as
`MONGO_URI`.

### 2. Frontend

The frontend is static, so no build step is required. From the `frontend`
folder, serve it with any static server, for example:

```bash
cd frontend
npx serve .
# or: python3 -m http.server 5500
```

Then open the printed local URL in your browser. The frontend calls the API
at `http://localhost:5000/api` — update `API_BASE` at the top of
`frontend/js/app.js` if your backend runs elsewhere.

## API overview

| Method | Route                    | Auth        | Description                  |
|--------|---------------------------|-------------|-------------------------------|
| POST   | /api/auth/register         | —           | Create an account             |
| POST   | /api/auth/login             | —           | Log in, returns JWT           |
| GET    | /api/auth/me                | user        | Current user profile          |
| GET    | /api/products                | —           | List products (filter/search) |
| GET    | /api/products/:id             | —           | Product detail                |
| POST   | /api/products                  | admin       | Create a product              |
| PUT    | /api/products/:id                | admin       | Update a product              |
| DELETE | /api/products/:id                  | admin       | Delete a product              |
| POST   | /api/orders                          | user        | Place an order from the cart  |
| GET    | /api/orders/my                        | user        | My order history               |
| GET    | /api/orders                            | admin       | All orders                     |
| PUT    | /api/orders/:id/status                   | admin       | Update order status            |

## Notes

- To make a user an admin, update their `role` field to `"admin"` directly in
  MongoDB (e.g. via MongoDB Compass or the `mongosh` shell) — there's no
  self-serve admin signup by design.
- Product images in the seed data are hotlinked from Unsplash for demo
  purposes; swap in your own hosted images for production.
- This is a learning/starter scaffold — for production you'd want things like
  input validation middleware, rate limiting, a real payment gateway
  integration, and HTTPS.

## License

MIT — do whatever you like with it.
