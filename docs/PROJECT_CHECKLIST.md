# PROJECT_CHECKLIST – NextGenCars

> Última actualización: 13-08-2025

## Autenticación & Autorización
- [x] Login con GraphQL mutation (`loginUser`) y guardado de token.
- [x] Redirección a `/dashboard` y dashboard por rol (admin/frontdesk/mechanic).
- [x] `RoleProtectedRoute` con `<Outlet />` (sin `children`) y `Layout` integrado.
- [x] Rutas protegidas y redirecciones a `/login` / `/unauthorized`.

## Navegación / UI
- [x] `Sidebar` responsive:
  - [x] Lee `src/config/menuItems.ts` (prop `path`, `icon` como `ComponentType`).
  - [x] Filtra por rol real (token).
  - [x] Desktop: texto siempre visible; móvil: texto visible al abrir.
  - [x] Logout en el fondo, hover acotado al botón.
- [x] `Layout` en flex; sin “espaciador” que empuje el main.
- [x] Correcciones de botones (`type="button"`).

## Usuarios (5C.11)
- [x] Listado `Users.tsx`.
- [x] Borrado desde lista (con confirmación nativa y toasts).
- [ ] **EditUser.tsx** con validaciones + toasts.
- [ ] **DeleteUserButton.tsx** (modal propio) integrado en lista.
- [ ] QA E2E CRUD.

## Clientes (5C.12)
- [ ] Modelo con `type` (PERSONAL/COMPANY) y campos extra.
- [ ] Formularios por tipo y validaciones.
- [ ] Submenú en Sidebar (All/Personal/Company).
- [ ] Filtros en lista.
- [ ] QA CRUD + toasts.

## Vehículos (5C.13)
- [x] Listado/Create/Delete.
- [ ] **EditVehicle** con validaciones (matrícula única/formato) + toasts.
- [ ] QA CRUD.

## Work Orders & Appointments (Fase 6)
- [ ] Backend WorkOrders: modelo/relaciones/CRUD/validaciones/aggregates.
- [ ] Frontend WorkOrders: tabla, formularios, detalle, dashboard.
- [ ] Backend Appointments: CRUD, validación recursos/horarios, agrupaciones.
- [ ] Frontend Appointments: calendario, tabla, CRUD, filtros.

## Inspecciones (Fase 7)
- [ ] Definir tipos (entrada taller, cambio aceite).
- [ ] Checklist técnico por tipo; vincular a WorkOrder.
- [ ] Exportar PDF, adjuntar a WorkOrder.

## DevOps (Fase 8)
- [ ] Seed de datos demo (bcrypt).
- [ ] Migrations consistentes.
- [ ] CORS en Yoga.
- [ ] CI: lint/build/typecheck.
- [ ] Firewall/seguridad acceso externo.

---

## QA rápido (actual)
- [x] Login OK en admin/frontdesk/mechanic.
- [x] Sidebar muestra/oculta items por rol.
- [x] Navegación interna sin “apurruñar” dashboard.
- [x] Borrar usuario actualiza lista (refetch u optimista).
- [ ] Editar usuario (validaciones y toasts).
- [ ] Editar vehículo (validaciones y toasts).
- [ ] CRUD clientes por tipo + validaciones.

---

## Próximos pasos recomendados
1. **Cerrar 5C.11**: `EditUser.tsx` (validaciones, toasts) + integrar `DeleteUserButton` con modal y toasts.
2. **Empezar 5C.12**: refactor de clientes por tipo con campos extra y validaciones.
3. **5C.13**: `EditVehicle` con validaciones de matrícula.
4. **Preparar Fase 6**: definir modelo WorkOrder y endpoints (para no bloquear el frontend).
