# ROADMAP_NextGenCars

> Última actualización: 13-08-2025

## Fase 5C – Funcionalidades núcleo

### 5C.8 – Redirigir por rol en login
✅ Completado  
- Redirección unificada a `/dashboard` con selección de dashboard por rol en el router.

### 5C.9 – 🔐 Protección de rutas según rol
✅ Completado  
- `RoleProtectedRoute` con `<Outlet />` y `Layout` integrado.
- Accesos:
  - `/users`, `/settings` → solo **admin**
  - `/vehicles` → **admin**, **frontdesk**, **mechanic**
  - `/clients` → **admin**, **frontdesk**
- Redirecciones limpias a `/unauthorized` y `/login` según corresponda.

### 5C.10 – Sidebar dinámico por rol
✅ Completado al 100%  
- `Sidebar` lee de `src/config/menuItems.ts`.
- Filtrado por rol, responsive (móvil/desktop), logout con hover acotado.
- Corrección de layout: no “apurruña” el dashboard.

### 5C.11 – Gestión de usuarios (CRUD completo)
⏳ Pendiente (en progreso)  
- [ ] **EditUser** con validaciones (username requerido, email formato/único) y toasts.
- [ ] **DeleteUser** con confirmación modal y toasts (componente base creado: `DeleteUserButton.tsx`).
- [ ] Integrar `EditUser` + `DeleteUserButton` en `Users.tsx` (acciones).
- [ ] QA E2E: crear → editar → borrar usuario.

✅ Hecho:
- Listado `Users.tsx` con borrado funcionando (mutation `deleteUser` usando `user_id`).
- Variante optimista con `update` de caché (opcional) para UX.

### 5C.12 – Gestión de clientes (refactor + formularios)
⏳ Pendiente  
- [ ] Modelo: campo `type` (**PERSONAL** | **COMPANY**).
- [ ] Campos extra: `company_name`, `vat_number`, etc.
- [ ] Validaciones por tipo.
- [ ] Migración de datos existentes.
- [ ] Formularios Create/Edit específicos por tipo.
- [ ] Sidebar con submenú: Clients → All / Personal / Company.
- [ ] Filtros en lista y toasts.

### 5C.13 – Gestión de vehículos
⏳ Pendiente  
- [ ] **EditVehicle** con validaciones (matrícula única/formato).
- [ ] Toasts éxito/error.

✅ Hecho:
- Listado, CreateVehicle y DeleteVehicle.

### 5C.14 – Revisión y actualización total
⏳ Pendiente  
- [ ] QA de CRUDs (clientes, vehículos, usuarios).
- [ ] Pruebas de formularios y datos.
- [ ] Ajustes UI menores previos a WorkOrders/Appointments.

---

## Fase 6 – Work Orders & Appointments

### 6.1 – Work Orders backend
⏳ Pendiente  
- [ ] Modelo y relaciones (WorkOrder ↔ Client ↔ Vehicle).
- [ ] CRUD backend.
- [ ] Validaciones de negocio.
- [ ] Agregaciones: ingresos, métricas.

### 6.2 – Work Orders frontend
⏳ Pendiente  
- [ ] Listado con paginación/búsqueda.
- [ ] Crear/editar/borrar.
- [ ] Vista detalle.
- [ ] Widgets en dashboard.

### 6.3 – Appointments backend
⏳ Pendiente  
- [ ] CRUD de citas.
- [ ] Validación de horarios/recursos.
- [ ] Agrupaciones para métricas.

✅ Hecho:
- `appointmentsThisWeek`.

### 6.4 – Appointments frontend
⏳ Pendiente  
- [ ] Vista calendario + tabla.
- [ ] Crear/editar/cancelar cita.
- [ ] Filtros por estado y mecánico.

---

## Fase 7 – Inspecciones

### 7.1 – Tipos de inspección
⏳ Pendiente  
- [ ] Entrada a taller.
- [ ] Cambio de aceite.

### 7.2 – Checklist técnico
⏳ Pendiente  
- [ ] Vincular a WorkOrder.
- [ ] Generar PDF y adjuntar al WorkOrder.

---

## Fase 8 – DevOps

### 8.1 – Configuración y mantenimiento
⏳ Pendiente  
- [ ] Seed con usuarios demo (bcrypt).
- [ ] Migrations consistentes.
- [ ] CORS en Yoga.
- [ ] CI: lint/build/typecheck.
- [ ] Firewall para acceso externo.
