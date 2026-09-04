 Ecommerce App

This repository contains a Django ecommerce application with two separate Django projects:

- `chichie_store`
- `myapp`

The main shopping experience is implemented in `chichie_store` and its `shop` app.

 How the store works

- The store displays products using Django templates in `chichie_store/shop/templates`.
- Product information is stored in models inside `chichie_store/shop/models.py`.
- Customers can browse products, view details, add items to the cart, and complete actions using the `shop` views.
- The cart page collects selected products and shows the current cart contents.
- Templates like `home.html`, `product.html`, `products.html`, and `cart.html` render the store pages.

 Project structure

- `chichie_store/` - the Django project containing settings, URLs, and the `shop` app.
- `chichie_store/shop/` - the ecommerce app for products, cart logic, views, admin, and templates.
- `chichie_store/shop/static/` - static assets such as CSS and images used by the store.
- `chichie_store/shop/templates/shop/` - app-specific templates for rendering the store UI.
- `myapp/` - a separate Django project present in the workspace; it is not part of the main store implementation.

 Running the store

1. Open a terminal in `chichie_store`.
2. Run migrations: `python manage.py migrate`.
3. Start the development server: `python manage.py runserver`.
4. Visit the local URL shown in the terminal to see the store pages.

 Notes

- The store is based on Django views and template rendering.
- Most of the shopping flow is handled by the `shop` app inside `chichie_store`.
- `myapp` appears to be a separate project and is not required for viewing the store UI.
