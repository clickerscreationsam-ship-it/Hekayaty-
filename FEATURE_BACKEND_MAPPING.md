# HEKAYATY (حكاياتي) — FEATURE-TO-BACKEND MAPPING

This document maps all 24 existing frontend page components and features to their authoritative database entities and API routes.

| Frontend Page / Component | Route | Primary Data Sources | Backend API Endpoint |
| :--- | :--- | :--- | :--- |
| **Home Page** | `/` | Featured comics, characters, latest news, world previews | `GET /api/comics?featured=true`<br>`GET /api/characters?limit=6`<br>`GET /api/news?limit=3`<br>`GET /api/worlds` |
| **Discover Page** | `/discover` | Curated universe highlights, spotlights, recent releases | `GET /api/discover` |
| **Comics Hub** | `/comics` | All comic series and issues, filter by world & genre | `GET /api/comics`<br>`GET /api/series` |
| **Comic Detail** | `/comics/:id` | Comic issue details, chapter list, character links | `GET /api/comics/:id`<br>`GET /api/series/:seriesId` |
| **Comic Reader** | `/read/:id` | High-res page sequence with access entitlement check | `GET /api/comics/:id/pages`<br>`POST /api/user/progress` |
| **Stories Hub** | `/stories` | Prose stories, reading times, authors | `GET /api/stories` |
| **Story Detail** | `/stories/:id` | Full prose chapter text, word count, lore links | `GET /api/stories/:id` |
| **Characters Hub** | `/characters` | Character grid with alignment, power, and world filters | `GET /api/characters` |
| **Character Detail** | `/characters/:id` | Lore dossier, power meters, relations, comic history | `GET /api/characters/:id` |
| **Worlds Hub** | `/worlds` | The 5 realms (Zalamar, Nova Qadim, Al-Marid, Void, Syrra) | `GET /api/worlds` |
| **World Detail** | `/worlds/:id` | World locations, organizations, history, linked heroes | `GET /api/worlds/:id` |
| **Hekayaty Selected** | `/selected` | Community & selected spotlighted works | `GET /api/comics?classification=hekayaty_selected`<br>`GET /api/stories?classification=hekayaty_selected` |
| **Timeline** | `/timeline` | Multi-era chronological nexus with event filtering | `GET /api/timeline` |
| **Encyclopedia** | `/encyclopedia` | Artifacts, technologies, organizations, and creatures | `GET /api/encyclopedia` |
| **Encyclopedia Detail**| `/encyclopedia/:id` | Single lore entry with cross-references | `GET /api/encyclopedia/:id` |
| **News & Releases** | `/news` | Platform updates, publishing dates, editorials | `GET /api/news` |
| **News Detail** | `/news/:id` | Full editorial article content | `GET /api/news/:id` |
| **Events** | `/events` | Conventions, creator sessions, competitions | `GET /api/events` |
| **Card Game** | `/card-game` | Hero and villain battle cards showcase | `GET /api/cards` |
| **Community** | `/community` | Fan art, creator discussions, showcase | `GET /api/community` |
| **Profile** | `/profile` | User reading history, favorites, collections, orders | `GET /api/auth/me`<br>`GET /api/user/progress`<br>`GET /api/user/favorites`<br>`GET /api/orders` |
| **Search Overlay** | (Modal) | Global instant search across characters, comics, lore | `GET /api/search?q=:query` |
| **Notifications** | (Drawer) | User alerts for new issues, releases, order updates | `GET /api/notifications` |
