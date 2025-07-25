# API Endpoints Documentation

## Base URL
```
Production: https://your-vercel-domain.vercel.app
Development: http://localhost:5000
```

## Authentication
La mayoría de endpoints requieren autenticación via cookies JWT. Los tokens se envían automáticamente en las requests.

---

## 🔐 Authentication Routes (`/auth`)

### Google OAuth Login
```http
GET /auth/google
```
**Descripción**: Inicia el flujo de autenticación con Google OAuth  
**Response**: Redirección a Google OAuth

### Google OAuth Callback
```http
GET /auth/google/callback
```
**Descripción**: Callback de Google OAuth  
**Response**: Redirección al frontend con token

---

## 👤 User Routes (`/api`)

### 1. Register User
```http
POST /api/register
```
**Request Body**:
## 📝 Notes for Frontend Developers

1. **Authentication**: All protected routes require cookies to be sent with requests
2. **CORS**: Configure your frontend origin in the backend's `ALLOWED_ORIGINS`
3. **Content-Type**: Always send `application/json` for POST/PUT requests
4. **Error Handling**: Check response status codes and handle error messages appropriately
5. **Timestamps**: All timestamps are in ISO format without timezone info
6. **Decimals**: Prices are returned as strings to maintain precision (e.g., "500.00")
7. **Bulk Operations**: Products creation supports both single objects and arrays
8. **File Uploads**: Currently not implemented - `img_url` expects direct URLs
9. **Product Codes**: Codes are generated automatically when creating products (format: CATEGORYNAME001)
10. **Build Codes**: Codes are generated automatically when creating builds (format: BUILD001)
11. **Code Generation**: Use `/adm/code/prod` for products and `/adm/code/build` for builds to generate codes for existing items without codes
  "user": "username",
  "pass": "password123",
  "email": "user@example.com"
}
```
**Response Success (200)**:
```json
{
  "mensaje": "Usuario, perfil y dirección creados con éxito"
}
```
**Response Error (400/401)**:
```json
{
  "error": "Datos incompletos" // o "Usuario o Email ya existentes"
}
```

### 2. Login User
```http
POST /api/login
```
**Request Body**:
```json
{
  "user": "username",
  "pass": "password123"
}
```
**Response Success (200)**:
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "jwt_token_here"
}
```
**Response Error (401)**:
```json
{
  "error": "Contraseña incorrecta" // o "Usuario no existe"
}
```

### 3. Logout User
```http
GET /api/logout
```
**Auth Required**: ✅  
**Response Success (200)**:
```json
{
  "mensaje": "Ha cerrado sesión exitosamente"
}
```

### 4. Get User Data
```http
GET /api/user
```
**Auth Required**: ✅  
**Response Success (200)**:
```json
{
  "message": "Datos del usuario",
  "user": {
    "userData": {
      "id": 1,
      "username": "usuario1",
      "email": "user@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "nickname": "juanp",
      "birth_date": "1990-01-01",
      "phone": "123456789"
    },
    "orders": [
      {
        "id": 1,
        "state": "PENDIENTE",
        "total_price": "1500.00",
        "time_order": "2025-07-25T10:30:00"
      }
    ],
    "order_detail": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 5,
        "count": 2,
        "price_unit": "500.00",
        "total": "1000.00",
        "product_name": "RTX 4070"
      }
    ],
    "wishlist": [
      {
        "id": 5,
        "name": "RTX 4070",
        "price": "500.00",
        "description": "Tarjeta gráfica"
      }
    ],
    "addresses": [
      {
        "id": 1,
        "street": "Av. Principal 123",
        "city": "La Paz",
        "province": "La Paz",
        "reference": "Casa blanca",
        "is_default": true
      }
    ]
  }
}
```

### 5. Update User Profile
```http
POST /api/user/profile/data
```
**Auth Required**: ✅  
**Request Body**:
```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "nickname": "juanp",
  "birthdate": "1990-01-01",
  "phone": "123456789"
}
```
**Response Success (200)**:
```json
{
  "message": "Perfil actualizado con éxito"
}
```

### 6. Create Order
```http
POST /api/user/createorder
```
**Request Body**:
```json
{
  "total": 1500.00,
  "details": [
    {
      "prod_id": 5,
      "count": 2,
      "price": 500.00,
      "total": 1000.00
    }
  ],
  "info": {
    "nombres": "Juan Pérez",
    "email": "juan@example.com",
    "celular": 123456789,
    "ci": 12345678,
    "direccion": "Av. Principal 123",
    "referencia": "Casa blanca",
    "comprobante": 456789
  }
}
```
**Response Success (201)**:
```json
{
  "message": "Nueva orden creada",
  "order_id": 1
}
```

### 7. Cancel Order
```http
POST /api/user/cancel-orders
```
**Auth Required**: ✅  
**Request Body**:
```json
{
  "order_id": 1
}
```
**Response Success (200)**:
```json
{
  "message": "PEDIDO CANCELADO",
  "order_id": 1
}
```

### 8. Add to Favorites
```http
POST /api/user/add-favorite
```
**Auth Required**: ✅  
**Request Body**:
```json
{
  "prod_id": 5
}
```
**Response Success (200)**:
```json
{
  "message": "PRODUCTO AGREGADO A FAVORITOS",
  "user_id": 1,
  "prod_id": 5
}
```

### 9. Remove from Favorites
```http
POST /api/user/delete-favorite
```
**Auth Required**: ✅  
**Request Body**:
```json
{
  "prod_id": 5
}
```
**Response Success (200)**:
```json
{
  "message": "PRODUCTO ELIMINADO DE FAVORITOS",
  "prod_id": 5
}
```

### 10. Add Address
```http
POST /api/user/address
```
**Auth Required**: ✅  
**Request Body**:
```json
{
  "street": "Av. Secundaria 456",
  "city": "Cochabamba",
  "province": "Cochabamba",
  "reference": "Edificio azul",
  "is_default": false
}
```
**Response Success (201)**:
```json
{
  "message": "Dirección añadida exitosamente",
  "address_id": 2
}
```

---

## 🛍️ Products Routes (`/api`)

### 1. Get All Products
```http
GET /api/products
```
**Response Success (200)**:
```json
[
  {
    "id": 1,
    "name": "RTX 4070",
    "code": "GPU001",
    "description": "Tarjeta gráfica de alta gama",
    "price": "500.00",
    "img_url": "https://example.com/rtx4070.jpg",
    "relevant": true,
    "stock": 10,
    "category_id": 1
  }
]
```

### 2. Get All Builds
```http
GET /api/gamerBuilds
```
**Response Success (200)**:
```json
[
  {
    "id": 1,
    "name": "Gaming Build Pro",
    "description": "Build para gaming de alta gama",
    "price": "1500.00",
    "img_url": "https://example.com/build1.jpg",
    "relevant": true,
    "code": "BUILD001",
    "components": [
      {
        "product_id": 5,
        "quantity": 1,
        "product_name": "RTX 4070"
      },
      {
        "product_id": 8,
        "quantity": 2,
        "product_name": "16GB DDR4 RAM"
      }
    ]
  }
]
```

---

## 🔧 Admin Routes (`/adm`)

### Authentication

### 1. Admin Login
```http
POST /adm/admLogin
```
**Request Body**:
```json
{
  "email": "admin@example.com",
  "pass": "adminpass123"
}
```
**Response Success (200)**:
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "jwt_admin_token"
}
```

### 2. Admin Logout
```http
GET /adm/admLogout
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
{
  "mensaje": "Ha cerrado sesión exitosamente"
}
```

### 3. Create Admin
```http
POST /adm/create
```
**Auth Required**: ✅ (Admin)  
**Request Body**:
```json
{
  "email": "newadmin@example.com",
  "pass": "newadminpass",
  "type": "SUPER_ADMIN"
}
```
**Response Success (200)**:
```json
{
  "Mensaje": "ADMIN 2 REGISTRADO CON EXITO"
}
```

---

### Products Management

### 4. Get Products (Admin)
```http
GET /adm/products
```
**Response**: Same as `/api/products`

### 5. Create Product(s)
```http
POST /adm/products/create
```
**Auth Required**: ✅ (Admin)  
**Descripción**: Crea uno o múltiples productos. El código se genera automáticamente basado en la categoría.

**Request Body** (Single Product):
```json
{
  "name": "RTX 4080",
  "description": "Tarjeta gráfica premium",
  "price": 800.00,
  "img_url": "https://example.com/rtx4080.jpg",
  "relevant": true,
  "stock": 5,
  "category_id": 1
}
```
**Request Body** (Multiple Products):
```json
[
  {
    "name": "RTX 4080",
    "description": "Tarjeta gráfica premium",
    "price": 800.00,
    "img_url": "https://example.com/rtx4080.jpg",
    "relevant": true,
    "stock": 5,
    "category_id": 1
  },
  {
    "name": "RTX 4090",
    "description": "Tarjeta gráfica extrema",
    "price": 1200.00,
    "img_url": "https://example.com/rtx4090.jpg",
    "relevant": true,
    "stock": 3,
    "category_id": 1
  }
]
```
**Response Success (201)**:
```json
{
  "message": "Se crearon 2 producto(s) exitosamente con códigos automáticos"
}
```

### 6. Update Product
```http
PUT /adm/products/update/:id
```
**Auth Required**: ✅ (Admin)  
**Request Body**:
```json
{
  "name": "RTX 4070 Ti",
  "description": "Tarjeta gráfica actualizada",
  "price": 600.00,
  "img_url": "https://example.com/rtx4070ti.jpg",
  "relevant": true,
  "stock": 8,
  "category_id": 1
}
```
**Response Success (200)**:
```json
{
  "message": "Producto actualizado exitosamente"
}
```

### 7. Delete Product
```http
DELETE /adm/products/delete/:id
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
{
  "message": "Producto eliminado exitosamente"
}
```

---

### Builds Management

### 8. Get Builds (Admin)
```http
GET /adm/builds
```
**Response**: Same as `/api/gamerBuilds`

### 9. Create Build
```http
POST /adm/builds/createBuild
```
**Auth Required**: ✅ (Admin)  
**Descripción**: Crea un nuevo build. El código se genera automáticamente con formato BUILD001, BUILD002, etc.

**Request Body**:
```json
{
  "name": "Workstation Pro",
  "description": "Build para trabajo profesional",
  "price": 2000.00,
  "img_url": "https://example.com/workstation.jpg",
  "relevant": true,
  "components": [
    {
      "product_id": 15,
      "quantity": 1
    },
    {
      "product_id": 20,
      "quantity": 2
    }
  ]
}
```
**Response Success (201)**:
```json
{
  "message": "Build creada exitosamente con código automático",
  "buildId": 5,
  "code": "BUILD005"
}
```

### 10. Update Build
```http
PUT /adm/builds/update/:id
```
**Auth Required**: ✅ (Admin)  
**Request Body**: Same as Create Build  
**Response Success (200)**:
```json
{
  "message": "Build actualizada exitosamente"
}
```

### 11. Delete Build
```http
DELETE /adm/builds/delete/:id
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
{
  "message": "Build eliminada exitosamente"
}
```

---

### Users Management

### 12. Get All Users
```http
GET /adm/users
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
[
  {
    "id": 1,
    "username": "usuario1",
    "email": "user1@example.com",
    "created_at": "2025-07-25T10:00:00",
    "rol": "CUSTOMER"
  }
]
```

### 13. Get User by ID
```http
GET /adm/users/:id
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
{
  "id": 1,
  "username": "usuario1",
  "email": "user1@example.com",
  "created_at": "2025-07-25T10:00:00",
  "rol": "CUSTOMER",
  "first_name": "Juan",
  "last_name": "Pérez",
  "nickname": "juanp",
  "birth_date": "1990-01-01",
  "phone": "123456789"
}
```

---

### Orders Management

### 14. Get All Orders
```http
GET /adm/orders
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
[
  {
    "id": 1,
    "user_id": 123,
    "state": "PENDIENTE",
    "total_price": "1250.00",
    "time_order": "2025-07-25T10:30:00",
    "username": "usuario1",
    "email": "user@email.com",
    "nombres": "Juan Pérez",
    "celular": 123456789,
    "ci": 12345678,
    "direccion": "Av. Principal 123"
  }
]
```

### 15. Get Order by ID
```http
GET /adm/orders/:id
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
{
  "id": 1,
  "user_id": 123,
  "state": "PENDIENTE",
  "total_price": "1250.00",
  "time_order": "2025-07-25T10:30:00",
  "username": "usuario1",
  "email": "user@email.com",
  "nombres": "Juan Pérez",
  "celular": 123456789,
  "ci": 12345678,
  "direccion": "Av. Principal 123",
  "referencia": "Casa blanca",
  "banco": "Banco Nacional",
  "comprobante": 456789,
  "details": [
    {
      "id": 1,
      "product_id": 5,
      "count": 2,
      "price_unit": "500.00",
      "total": "1000.00",
      "product_name": "RTX 4070",
      "product_description": "Tarjeta gráfica..."
    }
  ]
}
```

### 16. Update Order Status
```http
PUT /adm/orders/update/:id
```
**Auth Required**: ✅ (Admin)  
**Request Body**:
```json
{
  "state": "PROCESANDO"
}
```
**Available States**: `PENDIENTE`, `PROCESANDO`, `ENVIADO`, `ENTREGADO`, `CANCELADO`

**Response Success (200)**:
```json
{
  "message": "Estado de orden actualizado exitosamente"
}
```

### 17. Delete Order
```http
DELETE /adm/orders/delete/:id
```
**Auth Required**: ✅ (Admin)  
**Response Success (200)**:
```json
{
  "message": "Orden eliminada exitosamente"
}
```

---

### Code Generation

### 18. Generate Product Codes
```http
POST /adm/code/prod
```
**Auth Required**: ✅ (Admin)  
**Descripción**: Genera códigos automáticos para todos los productos que no tienen código. El formato es: CATEGORY_NAME + número incremental de 3 dígitos (ej: GPU001, CPU002)

**Response Success (200)**:
```json
{
  "message": "Se generaron códigos para 15 productos exitosamente",
  "totalUpdated": 15
}
```
**Response Error (400)**:
```json
{
  "error": "No se encontraron categorías"
}
```

### 19. Generate Build Codes
```http
POST /adm/code/build
```
**Auth Required**: ✅ (Admin)  
**Descripción**: Genera códigos automáticos para todos los builds que no tienen código. El formato es: BUILD + número incremental de 3 dígitos (ej: BUILD001, BUILD002)

**Response Success (200)**:
```json
{
  "message": "Se generaron códigos para 8 builds exitosamente",
  "totalUpdated": 8
}
```
**Response No Content (200)**:
```json
{
  "message": "No hay builds sin código para procesar",
  "totalUpdated": 0
}
```

---

## 🌐 Health Check

### Database Connection Test
```http
GET /
```
**Response Success (200)**:
```json
{
  "message": "Conexión exitosa a la base de datos"
}
```
**Response Error (400)**:
```json
{
  "error": "FALLO EN BASE DE DATOS"
}
```

---

## 🚫 Common Error Responses

### 401 Unauthorized
```json
{
  "error": "Token no existente"
}
```

### 404 Not Found
```json
{
  "error": "Recurso no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor"
}
```

---

## 📝 Notes for Frontend Developers

1. **Authentication**: All protected routes require cookies to be sent with requests
2. **CORS**: Configure your frontend origin in the backend's `ALLOWED_ORIGINS`
3. **Content-Type**: Always send `application/json` for POST/PUT requests
4. **Error Handling**: Check response status codes and handle error messages appropriately
5. **Timestamps**: All timestamps are in ISO format without timezone info
6. **Decimals**: Prices are returned as strings to maintain precision (e.g., "500.00")
7. **Bulk Operations**: Products creation supports both single objects and arrays
8. **File Uploads**: Currently not implemented - `img_url` expects direct URLs
