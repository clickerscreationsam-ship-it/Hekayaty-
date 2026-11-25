# HEKAYATY (حكاياتي) — REST API CONTRACT SPECIFICATION

Base Path: `/api`
All requests and responses use `application/json` unless noted otherwise.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Description**: Registers a new user account.
- **Request Body**:
  ```json
  {
    "email": "reader@hekayaty.com",
    "password": "StrongPassword123!",
    "displayName": "أحمد قارئ الخيال",
    "role": "reader"
  }
  ```
- **Response 201**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "reader@hekayaty.com",
      "displayName": "أحمد قارئ الخيال",
      "role": "reader"
    },
    "message": "تم إنشاء الحساب بنجاح"
  }
  ```

### `POST /api/auth/login`
- **Description**: Authenticates user credentials and establishes a session cookie or bearer token.
- **Request Body**:
  ```json
  {
    "email": "reader@hekayaty.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response 200**:
  ```json
  {
    "token": "sess_9f81a7b8c...",
    "user": {
      "id": 1,
      "email": "reader@hekayaty.com",
      "displayName": "أحمد قارئ الخيال",
      "role": "reader"
    }
  }
  ```

### `GET /api/auth/me`
- **Description**: Retrieves authenticated user profile and entitlements.
- **Headers**: `Cookie: session_token=...` or `Authorization: Bearer <token>`
- **Response 200**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "reader@hekayaty.com",
      "displayName": "أحمد قارئ الخيال",
      "role": "reader",
      "avatarUrl": null
    },
    "subscription": {
      "status": "active",
      "plan": "حكاياتي بلس"
    }
  }
  ```

### `POST /api/auth/logout`
- **Description**: Invalidates session token and clears auth cookie.

---

## 2. Content & Lore Endpoints

### `GET /api/worlds`
- **Query Params**: `alignment` ('light'|'dark'|'neutral')
- **Response 200**: List of all worlds with Arabic and English lore.

### `GET /api/worlds/:id`
- **Response 200**: Detailed world profile with linked characters, comics, and history.

### `GET /api/characters`
- **Query Params**: `worldId`, `alignment`, `search`, `classification`
- **Response 200**: Filtered list of characters.

### `GET /api/characters/:id`
- **Response 200**: Character dossier with combat stats, affiliations, and comic appearances.

### `GET /api/series`
- **Query Params**: `worldId`, `classification`
- **Response 200**: Series catalog.

### `GET /api/comics`
- **Query Params**: `seriesId`, `worldId`, `featured`, `new`
- **Response 200**: Comics list with metadata, cover images, and rating.

### `GET /api/comics/:id`
- **Response 200**: Comic metadata, issue information, previous/next issue pointers.

### `GET /api/comics/:id/pages`
- **Protection**: Session required. Server validates that the comic is `is_free === true`, or user holds an active entitlement or active subscription.
- **Response 200**:
  ```json
  {
    "comicId": "comic_1",
    "totalPages": 32,
    "pages": [
      { "pageNumber": 1, "imageUrl": "/assets/comics/c1_p1.jpg" }
    ]
  }
  ```
- **Response 403**: `{ "error": "محتوى مدفوع يتطلب اشتراكاً أو شراء فردياً" }`

### `GET /api/stories`
- **Query Params**: `worldId`, `classification`, `featured`
- **Response 200**: Illustrated prose stories list.

### `GET /api/stories/:id`
- **Response 200**: Story metadata and full prose content (protected if premium).

### `GET /api/timeline`
- **Query Params**: `era`, `category`, `worldId`
- **Response 200**: Chronological event sequence.

### `GET /api/encyclopedia`
- **Query Params**: `category`, `search`
- **Response 200**: Lore entries for artifacts, tech, orgs, and creatures.

### `GET /api/cards`
- **Response 200**: Hero and Villain battle cards with game stats and rarities.

---

## 3. User Progress, Collections & Engagement

### `GET /api/user/progress`
- **Response 200**: Array of `{ contentType, contentId, progress, isCompleted, updatedAt }`.

### `POST /api/user/progress`
- **Request Body**: `{ "contentType": "comic", "contentId": "comic_1", "progress": 15, "isCompleted": false }`
- **Response 200**: `{ "success": true }`

### `GET /api/user/favorites`
- **Response 200**: List of favorite content IDs and metadata.

### `POST /api/user/favorites/toggle`
- **Request Body**: `{ "contentType": "character", "contentId": "c1" }`
- **Response 200**: `{ "favorited": true }`

### `GET /api/user/collections` & `POST /api/user/collections`
- Manage custom reading lists and portfolios.

---

## 4. Commerce & Subscriptions

### `GET /api/shop/products`
- **Response 200**: Active physical & digital products with server prices in EGP.

### `POST /api/orders/checkout`
- **Request Body**:
  ```json
  {
    "items": [
      { "productId": 1, "quantity": 1 }
    ],
    "shippingAddress": { "city": "القاهرة", "details": "..." },
    "paymentMethod": "card"
  }
  ```
- **Response 201**: `{ "orderId": 42, "totalEgp": 150.00, "status": "paid" }`

### `GET /api/subscriptions/plans`
- **Response 200**: Available subscription tiers and monthly/annual prices.
