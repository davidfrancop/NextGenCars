# Checklist Proyecto NextGenCars

## Backend
- [x] Unificar PrismaClient en db.ts + context.ts
- [x] Limpiar index.ts y habilitar GraphiQL
- [x] Configurar .env backend (DATABASE_URL, JWT_SECRET)
- [x] Implementar resolvers DashboardStats
- [x] Implementar resolvers Vehicles CRUD
- [x] Implementar resolvers Clients CRUD
- [x] Implementar resolvers Users CRUD + loginUser
- [x] Implementar recentWorkOrders

### Work Orders
- [ ] Modelo y relaciones revisados
  - [ ] Definir modelo y relaciones en Prisma (WorkOrder ↔ Client ↔ Vehicle)
- [ ] CRUD completo en backend
- [ ] Validaciones de negocio (estado, coherencia)
- [ ] Cálculo de ingresos en aggregate

### Appointments
- [x] appointmentsThisWeek implementado
- [ ] CRUD citas backend
  - [ ] Validar horarios y recursos disponibles
- [ ] Validaciones horarios/recursos
- [ ] Agrupaciones para métricas

### Inspecciones
- [ ] Definir tipos de inspección (entrada taller, cambio aceite, etc.)
- [ ] Definir checklist técnica por tipo
- [ ] Vincular a WorkOrder
- [ ] Generar informe PDF
  - [ ] Subir PDF a la ficha del WorkOrder

---

## Frontend
- [x] Vite + React + TS + Tailwind + Apollo
- [x] Configurar VITE_API_URL
- [x] Dashboards por rol
- [x] SummaryCards conectadas
- [x] RecentOrdersTable conectado
- [x] AppointmentsChart corregido y conectado
- [x] Login funcional con JWT

### Roles y rutas
- [x] Redirección por rol en login
- [x] RoleGuard/PrivateRoute implementados
  - [x] Implementar `RoleGuard` para restringir rutas según rol
  - [x] Integrar `RoleGuard` en `PrivateRoute` o wrapper equivalente
  - [x] Probar acceso con todos los roles (admin, mechanic, frontdesk)
  - [x] Mostrar mensaje o redirección en acceso no autorizado
- [x] Proteger rutas según rol
- [x] Sidebar dinámico por rol

### Usuarios
- [x] Listado Users
- [x] CreateUser con hash
- [ ] EditUser
  - [ ] Crear componente `EditUser` con formulario y validaciones
  - [ ] Validar email único y formato en edit
  - [ ] Añadir toasts de éxito/error
- [ ] DeleteUser
  - [ ] Implementar `DeleteUser` con confirmación modal
  - [ ] Añadir toasts de éxito/error
- [ ] Validaciones y toasts

### Clientes
- [x] Listado Clients
- [ ] Refactor Personal/Company (DB primero)
  - [ ] Mantener tabla única `clients` con campo `type` (enum PERSONAL|COMPANY)
  - [ ] Añadir columnas `company_name`, `vat_number`, `contact_person` (nullable)
  - [ ] Definir validaciones por tipo:
    - [ ] PERSONAL ⇒ `first_name`, `last_name` obligatorios
    - [ ] COMPANY ⇒ `company_name` obligatorio; `vat_number` validado según país
  - [ ] Migrar datos existentes asignando `type` por defecto
  - [ ] Añadir índices por tipo y campos clave
  - [ ] Actualizar resolvers y schema GraphQL (queries con filtro `type`)
  - [ ] Ajustar mutaciones `createClient`/`updateClient` para campos condicionales
  - [ ] QA: probar creación/edición/listado por tipo
- [ ] Navegación – Sidebar
  - [ ] Submenú Clients → All / Personal / Company
  - [ ] Filtrar listados según `type` desde URL y UI
  - [ ] Botón “Add client” con selector de tipo
- [ ] Formularios
  - [ ] Create/Edit PersonalClient (campos persona)
  - [ ] Create/Edit CompanyClient (campos empresa)
  - [ ] Mantener datos al cambiar tipo
  - [ ] Toasts y validaciones diferenciadas por tipo
- [x] CreateClient
- [x] EditClient
- [x] DeleteClient
- [ ] Validaciones y toasts
  - [ ] Validar email, teléfono y campos obligatorios según tipo
  - [ ] Mostrar toasts de éxito/error

### Vehículos
- [x] Listado Vehicles
- [x] CreateVehicle
- [ ] EditVehicle
  - [ ] Crear componente `EditVehicle` con formulario y validaciones
  - [ ] Validar matrícula única y formato
  - [ ] Añadir toasts de éxito/error
- [x] DeleteVehicle
- [ ] Validaciones y toasts

### Work Orders (UI)
- [ ] Página listado WorkOrders
  - [ ] Definir ruta `/workorders`
  - [ ] Añadir enlace en Sidebar con control por rol
  - [ ] Implementar tabla con paginación y búsqueda
- [ ] Crear/Editar/Borrar WorkOrder
  - [ ] Formulario para crear
  - [ ] Formulario para editar
  - [ ] Confirmación al eliminar
- [ ] Detalle WorkOrder
- [ ] Integración con Dashboard

### Appointments (UI)
- [ ] Página listado/calendario citas
  - [ ] Definir ruta `/appointments`
  - [ ] Añadir enlace en Sidebar con control por rol
  - [ ] Vista calendario y tabla
- [ ] Crear/Editar/Cancelar cita
  - [ ] Formulario para crear cita
  - [ ] Formulario para editar cita
  - [ ] Confirmación al cancelar
- [ ] Filtros por estado y mecánico

---

## DevOps
- [ ] Seed de datos con usuarios demo bcrypt
- [ ] Prisma migrations consistentes
- [ ] CORS configurado en Yoga
- [ ] CI con lint/build/typecheck
- [ ] Firewall configurado para acceso externo
