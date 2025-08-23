# Checklist Unificado – NextGenCars (Actualizado)

## **Fase 5C – Funcionalidades núcleo**

### **5C.8 – Redirigir por rol en login**
- [x] Implementado
- [x] Test con roles no-admin

### **5C.9 – 🔐 Protección de rutas según rol**
- [x] Implementar `RoleGuard`
- [x] Integrar en `PrivateRoute` o wrapper
- [x] Probar acceso con `admin`, `mechanic`, `frontdesk`
- [x] Redirección o mensaje en acceso no autorizado

### **5C.10 – Sidebar dinámico por rol**
- [x] Implementado

### **5C.11 – Gestión de usuarios (CRUD completo)**
- [x] Listado de usuarios
- [x] CreateUser con hash
- [x] EditUser con validaciones y toasts
- [x] DeleteUser con confirmación modal y toasts
- [x] Validar email único y formato en edición
- [x] QA CRUD usuarios

### **5C.12 – Gestión de clientes (refactor + formularios)**
- [x] Listado clientes
- [x] CreateClient
- [x] EditClient
- [x] DeleteClient
- [x] Campo `type` (PERSONAL|COMPANY) + migración DB
- [x] Validaciones por tipo (campos obligatorios)
- [x] Formulario adaptado por tipo
- [x] Validaciones y toasts
- [x] QA CRUD clientes

### **5C.13 – Gestión de vehículos**
- [x] Listado vehículos
- [x] CreateVehicle
- [x] DeleteVehicle
- [x] EditVehicle con validaciones (matrícula única y formato)
- [x] Añadir toasts éxito/error
- [x] QA CRUD vehículos

### **5C.14 – Revisión y actualización total**
- [ ] Verificación de todos los CRUD
- [ ] Test de formularios y datos
- [ ] Ajustes visuales menores

---

## **Fase 6 – Work Orders & Appointments**

### **6.1 – Work Orders backend**
- [ ] Modelo y relaciones Prisma (WorkOrder ↔ Client ↔ Vehicle)
- [ ] CRUD backend
- [ ] Validaciones de negocio
- [ ] Cálculo de ingresos en aggregate

### **6.2 – Work Orders frontend**
- [ ] Listado con paginación y búsqueda
- [ ] Formulario crear/editar/borrar
- [ ] Detalle de WorkOrder
- [ ] Integración con dashboard

### **6.3 – Appointments backend**
- [ ] CRUD citas backend
- [ ] Validar horarios y recursos
- [ ] Agrupaciones para métricas

### **6.4 – Appointments frontend**
- [ ] Vista calendario y tabla
- [ ] Crear/editar/cancelar cita
- [ ] Filtros por estado y mecánico

### **6.5 – Ficha Cliente–Vehículo (Summary) – MVP** **🔒 Bloqueado hasta 6.1–6.4**
- **Backend (sin migraciones):** Queries `clientSummary(client_id)` y `vehicleSummary(vehicle_id)` con:
  - Cliente completo + vehículos del cliente
  - Detalle del vehículo (make/model, **registration date**, year, plate, VIN, HSN/TSN, fuel/drive/transmission, km, TÜV)
  - **Historial de servicios** derivado de *WorkOrders cerradas* (fecha = `end_date | start_date | created_at`, km actual, descripción, coste si hay factura)
- **Frontend:** Página `ClientVehicleSummary` con secciones:
  - Header cliente (tipo, contacto, dirección, contadores, última visita)
  - Lista de vehículos (tarjetas) + detalle del vehículo
  - Timeline + tabla del historial (descendente) con paginación
  - Acciones rápidas: editar cliente/vehículo, crear cita/OW
- **Navegación:** enlaces “Ficha” desde Clientes y Vehículos  
  Rutas: `/clients/:clientId/summary`, `/vehicles/:vehicleId/summary`
- **Impresión/Export:** estilos de impresión (PDF navegador)
- **A11y & Perf:** AA (roles/aria/foco), <1s con hasta 100 entradas (paginación ≥50)
- **QA funcional:** 12–15 casos (sin servicios, múltiples vehículos, con/sin facturas, permisos)

### **6.6 – Service Records (Historial enriquecido) – Fase 2**
- **DB (migración):** `service_records` (vehicle_id, date, km, description, work_order_id?)
- **Backend:** CRUD + query paginada por vehículo/fechas; *hook* al cerrar OW → upsert de `service_record`
- **Frontend:** alta manual, filtros avanzados, export CSV, coste agregado si hay factura

---

## **Fase 7 – Inspecciones**

### **7.1 – Definir tipos de inspección**
- [ ] Entrada taller
- [ ] Cambio de aceite

### **7.2 – Checklist técnico por tipo**
- [ ] Vincular a WorkOrder
- [ ] Generar PDF y subirlo a ficha del WorkOrder

---

## **Fase 8 – DevOps**

### **8.1 – Configuración y mantenimiento**
- [ ] Seed de datos con usuarios demo bcrypt
- [ ] Migrations consistentes
- [ ] CORS en Yoga
- [ ] CI con lint/build/typecheck
- [ ] Firewall para acceso externo
- [ ] **Seed adicional:** WorkOrders (cerradas/abiertas) y, cuando exista, `service_records` (para demo de la Ficha)

---

## Matriz de QA – 6.5 Ficha Cliente–Vehículo (MVP)

| # | Área | Caso | Pasos | Resultado esperado |
|---|------|------|-------|--------------------|
| 1 | Navegación | Enlace desde Clientes | En lista clientes → click “Ficha” | Abre `/clients/:id/summary` con datos del cliente y sus vehículos |
| 2 | Navegación | Enlace desde Vehículos | En lista vehículos → click “Ficha” | Abre `/vehicles/:id/summary` con vehículo + cliente asociado |
| 3 | Datos cliente | Render datos | Revisar tipo, nombre/razón, email, teléfono, dirección | Todos los campos visibles; vacíos mostrados como “—” |
| 4 | Lista vehículos | Varios vehículos | Cliente con ≥3 vehículos | Tarjetas con plate + make/model + km + badges |
| 5 | Detalle vehículo | Datos técnicos | Seleccionar un vehículo | Muestra make/model, **registration date**, year, plate, VIN, HSN/TSN, fuel/drive/transmission, km, TÜV |
| 6 | Historial | Sin servicios | Vehículo sin OW cerradas | Timeline “No service history yet” y tabla vacía |
| 7 | Historial | Con OW cerradas | Vehículo con 2–3 OW cerradas | Timeline descendente con fecha, desc, coste si factura; enlaces a OW |
| 8 | Historial | Orden abierta | Vehículo con OW abiertas | No aparecen en historial (solo cerradas) |
| 9 | Coste | Con factura | OW cerrada con invoice | Muestra coste total y badge “Paid/Unpaid” según invoice |
|10 | Rendimiento | 100 registros | Vehículo con 100 OW cerradas (seed) | Carga <1s; tabla paginada (p.ej. 25 por página) |
|11 | Accesibilidad | Teclado | Navegar con Tab/Shift+Tab | Foco visible; timeline y tabla accesibles; toasts con role correcto |
|12 | Accesibilidad | Lectores | Revisar landmarks y `aria-*` | Roles en header/main/nav; tabla con `scope="col"`; enlaces descriptivos |
|13 | Impresión | Vista impresión | Ctrl/Cmd+P en Summary | Diseño limpio (sin sidebar), A4, encabezado con cliente y vehículo |
|14 | Errores | Cliente/vehículo inexistente | Forzar id inválido | Mensaje claro y enlace “Volver” |
|15 | Permisos | Roles | Probar `mechanic/frontdesk` | Acceso según reglas; acciones bloqueadas si no tiene permiso |

> **Datos semilla de QA:** 1 cliente COMPANY con 3 vehículos (uno sin servicios, dos con 2–3 OW cerradas), 1 cliente PERSONAL con 1 vehículo y 1 OW abierta.

---

## Wireframes (texto) – 6.5 Ficha Cliente–Vehículo

**A) Vista desde Cliente (`/clients/:clientId/summary`)**

```
[Header Cliente]
┌────────────────────────────────────────────────────────────┐
│ ACME GmbH (COMPANY)     · contacto@acme.com · +49 123 456  │
│ Dirección: Straße 1, Berlín, 10115, DE                     │
│ [Vehículos: 3]  [Servicios (24m): 4]  [Última visita: 2025-05-12]
│ [Editar cliente] [Nuevo vehículo] [Nueva cita] [Nueva OW]  │
└────────────────────────────────────────────────────────────┘

[Contenido a dos columnas]
┌───────────────Izquierda──────────────┬──────────────Derecha───────────────┐
│ Lista de Vehículos (tarjetas)        │ Detalle del Vehículo seleccionado  │
│ ┌──────────────┐ ┌──────────────┐    │ ┌─────────────────────────────────┐ │
│ │ Plate · ...  │ │ Plate · ...  │    │ │ Make/Model · Plate · VIN        │ │
│ │ Badges       │ │ Badges       │    │ │ Registration Date · Year · HSN  │ │
│ └──────────────┘ └──────────────┘    │ │ TSN · Fuel · Drive · Transm.    │ │
│ ...                                   │ │ KM · TÜV                        │ │
│                                       │ │ [Editar vehículo] [Nueva OW]    │ │
│                                       │ └─────────────────────────────────┘ │
└───────────────────────────────────────┴────────────────────────────────────┘

[Historial de Servicios]
┌────────────────────────────────────────────────────────────┐
│ Timeline (desc): [2025-06-03] Cambio aceite · 68.000 km     │
│                       [WO#123] · Coste: 120 € (Paid)        │
│                    [2024-12-10] Pastillas freno · 62.000 km │
│ Tabla (paginada): Fecha | KM | Descripción | Estado | Coste │
└────────────────────────────────────────────────────────────┘
```

**B) Vista desde Vehículo (`/vehicles/:vehicleId/summary`)**
- Igual que la anterior, pero **abre ya** con el vehículo seleccionado y el header incluye un sub-bloque con datos del cliente y botones: “Ver cliente”, “Editar cliente”.

**Responsive**
- En móvil, la lista de vehículos pasa a carrusel vertical; el detalle va debajo; la tabla del historial usa scroll horizontal con columnas esenciales visibles.

**Impresión**
- Oculta navegación y botones; cabecera con logo/cliente/vehículo; timeline condensado; tabla completa; número de página en pie.

---

## DoR / DoD (para 6.5)

**Definition of Ready**
- CRUDs de clientes/vehículos listos (5C.12–5C.13).
- Work Orders y Appointments operativos (6.1–6.4).
- Datos seed con OW cerradas para demo/QA.
- Decidido: columnas visibles en tabla y métricas en header.

**Definition of Done**
- Acceso desde Clientes/Vehículos a la Ficha.
- Carga <1s con 100 entradas; paginación en tabla.
- A11y AA (roles/aria/foco), teclado OK.
- Impresión lista y legible.
- QA matriz (15 casos) pasada.


## 🔑 Patrón unificado de eliminación (Delete)

Todas las entidades (Users, Clients, Vehicles y futuras) deben seguir siempre este flujo para eliminación:

**Página → <Delete /> → Delete.tsx → useMutation(Apollo) → backend → ConfirmDialog + Toast**

- La página **NO importa directamente useMutation**.
- Solo importa el componente común `<Delete />` y le pasa `mutation`, `variables`, mensajes y `onCompleted` (para refetch si aplica).
- `Delete.tsx` contiene:
  - ConfirmDialog (OK / Cancel).
  - Ejecución de la mutación vía Apollo.
  - Manejo de Toast de éxito o error.
