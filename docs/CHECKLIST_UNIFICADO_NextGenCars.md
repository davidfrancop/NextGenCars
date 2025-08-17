# Checklist Unificado – NextGenCars

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
- [ ] EditVehicle con validaciones (matrícula única y formato)
- [ ] Añadir toasts éxito/error
- [ ] QA CRUD vehículos

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
