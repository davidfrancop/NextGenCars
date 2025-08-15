# Checklist Unificado – NextGenCars

## **Fase 5C – Funcionalidades núcleo**

### **5C.8 – Redirigir por rol en login**
✅ Completado – Falta test con roles no-admin.

### **5C.9 – 🔐 Protección de rutas según rol**
❌ Falta:
- Implementar `RoleGuard`.
- Integrar en `PrivateRoute` o wrapper.
- Probar acceso con `admin`, `mechanic`, `frontdesk`.
- Redirección o mensaje en acceso no autorizado.

### **5C.10 – Sidebar dinámico por rol**
✅ Completado.

### **5C.11 – Gestión de usuarios (CRUD completo)**
⚠️ Parcial:
- `EditUser` existe pero sin validaciones ni toasts.
- `DeleteUser` existe pero sin confirmación modal ni toasts.
- Backend con CRUD funcional, pero sin validación de email único/formato.
- QA pendiente.

### **5C.12 – Gestión de clientes (refactor + formularios)**
⚠️ Parcial:
- CRUD básico completo.
- Falta campo `type` (PERSONAL|COMPANY) y migración DB.
- Falta validaciones por tipo (campos obligatorios).
- Falta refactor en formularios y UI adaptada.
- Backend sin validaciones condicionales.

### **5C.13 – Gestión de vehículos**
⚠️ Parcial:
- CRUD básico completo.
- Falta `EditVehicle` con validación de matrícula única y formato.
- Backend sin validaciones.

### **5C.14 – Revisión y actualización total**
❌ Falta:
- Verificación de todos los CRUD.
- Test de formularios y datos.
- Ajustes visuales menores.

---

## **Fase 6 – Work Orders & Appointments**

### **6.1 – Work Orders backend**
❌ Falta:
- Modelo y relaciones Prisma (WorkOrder ↔ Client ↔ Vehicle).
- CRUD backend.
- Validaciones de negocio.
- Cálculo de ingresos en aggregate.

### **6.2 – Work Orders frontend**
❌ Falta:
- Listado con paginación y búsqueda.
- Formulario crear/editar/borrar.
- Detalle de WorkOrder.
- Integración con dashboard.

### **6.3 – Appointments backend**
❌ Falta:
- CRUD citas backend.
- Validar horarios y recursos.
- Agrupaciones para métricas.

### **6.4 – Appointments frontend**
❌ Falta:
- Vista calendario y tabla.
- Crear/editar/cancelar cita.
- Filtros por estado y mecánico.

---

## **Fase 7 – Inspecciones**

### **7.1 – Definir tipos de inspección**
❌ Falta:
- Entrada taller.
- Cambio de aceite.

### **7.2 – Checklist técnico por tipo**
❌ Falta:
- Vincular a WorkOrder.
- Generar PDF y subirlo a ficha del WorkOrder.

---

## **Fase 8 – DevOps**

### **8.1 – Configuración y mantenimiento**
❌ Falta:
- Seed de datos con usuarios demo bcrypt.
- Migrations consistentes.
- CORS en Yoga.
- CI con lint/build/typecheck.
- Firewall para acceso externo.
