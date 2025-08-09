# ROADMAP_NextGenCars

## Fase 5C – Funcionalidades núcleo

### 5C.8 – Redirigir por rol en login
✅ Completado – falta test con roles no-admin.

### 5C.9 – 🔐 Protección de rutas según rol
⏳ Pendiente
- Implementar `RoleGuard`.
- Integrar en `PrivateRoute` o wrapper.
- Probar acceso con `admin`, `mechanic`, `frontdesk`.
- Redirección o mensaje en acceso no autorizado.

### 5C.10 – Sidebar dinámico por rol
✅ Completado.

### 5C.11 – Gestión de usuarios (CRUD completo)
⏳ Pendiente:
- **EditUser** con validaciones y toasts.
- **DeleteUser** con confirmación modal y toasts.
- Validar email único y formato en edición.
- QA: crear, editar y borrar usuarios correctamente.

### 5C.12 – Gestión de clientes (refactor + formularios)
⏳ Pendiente:
- DB: Campo `type` (PERSONAL | COMPANY) + campos extra (`company_name`, `vat_number`, etc.).
- Validaciones por tipo (campos obligatorios).
- Migración de datos existentes.
- **Flujo creación**:
  - Botón “New Client” abre selector tipo (`PERSONAL` | `COMPANY`).
  - Redirige a `CreateClient.tsx` o `CreateCompany.tsx` según elección.
- Formulario Create/Edit separados para cada tipo.
- Sidebar → “Clients” único (lista global con filtro tipo select).
- Toasts y validaciones.

### 5C.13 – Gestión de vehículos
⏳ Pendiente:
- **EditVehicle** con validaciones (matrícula única y formato).
- Añadir toasts éxito/error.

✅ Completado: Listado, CreateVehicle, DeleteVehicle.

### 5C.14 – Revisión y actualización total
⏳ Pendiente:
- Verificación de todos los CRUD (clientes, vehículos, usuarios).
- Test de formularios y datos.
- Ajustes visuales menores antes de pasar a WorkOrders/Appointments.

---

## Fase 6 – Work Orders & Appointments

### 6.1 – Work Orders backend
⏳ Pendiente:
- Definir modelo y relaciones (WorkOrder ↔ Client ↔ Vehicle).
- CRUD backend.
- Validaciones de negocio.
- Cálculo de ingresos en aggregate.

### 6.2 – Work Orders frontend
⏳ Pendiente:
- Listado con paginación y búsqueda.
- Formulario crear/editar/borrar.
- Detalle de WorkOrder.
- Integración con dashboard.

### 6.3 – Appointments backend
⏳ Pendiente:
- CRUD citas.
- Validar horarios y recursos.
- Agrupaciones para métricas.

✅ Completado: `appointmentsThisWeek`.

### 6.4 – Appointments frontend
⏳ Pendiente:
- Vista calendario y tabla.
- Crear/editar/cancelar cita.
- Filtros por estado y mecánico.

---

## Fase 7 – Inspecciones

### 7.1 – Definir tipos de inspección
⏳ Pendiente:
- Entrada taller.
- Cambio de aceite.

### 7.2 – Checklist técnico por tipo
⏳ Pendiente:
- Vincular a WorkOrder.
- Generar PDF y subirlo a ficha del WorkOrder.

---

## Fase 8 – DevOps

### 8.1 – Configuración y mantenimiento
⏳ Pendiente:
- Seed de datos con usuarios demo bcrypt.
- Migrations consistentes.
- CORS en Yoga.
- CI con lint/build/typecheck.
- Firewall para acceso externo.
