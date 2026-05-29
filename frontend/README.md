# Frontend Inventory Dashboard

SPA moderna desarrollada con Vue 3 + Vite + Pinia para la prueba tecnica de inventario. Consume el backend Spring Boot disponible en `http://localhost:8080/api`.

## Stack

- Vue 3
- JavaScript
- Vite
- Vue Router
- Pinia
- Axios
- Naive UI
- Font Awesome
- Vitest
- Playwright

## Instalacion

```bash
npm install
```

## Variables de entorno

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Comandos

```bash
npm run dev
npm run build
npm run test:unit
npm run test:e2e
```

## Credenciales

```txt
admin / admin123
user / user123
```

## Estructura

```txt
src/
  api/
  assets/styles/
  components/base/
  components/layout/
  components/products/
  components/purchases/
  composables/
  router/
  services/
  stores/
  utils/
  views/
```

## Decisiones tecnicas

- Axios se encapsula en `src/api/apiClient.js`.
- El JWT se persiste en `localStorage` y se inyecta por interceptor.
- Pinia concentra la logica de autenticacion, productos y compras.
- `product.store.js` usa cache simple en memoria con expiracion de 2 minutos.
- Los componentes se enfocan en presentacion y delegan logica a stores, services y composables.

## Manejo de errores

- `401`: sesion expirada o no autorizada.
- `404`: producto no encontrado.
- `409`: stock insuficiente.
- `422`: datos invalidos.
- red o timeout: feedback con opcion de reintento.

## Evidencias sugeridas

- Login exitoso
- Dashboard de productos
- Vista detalle
- Modal de inventario
- Compra exitosa
- Historial de compras
