# 🧭 Dashboard Roadmap - NextGenCars `control/`

Este roadmap cubre la implementación visual y funcional del panel administrativo (`control/`) de NextGenCars, centrado en diseño oscuro, visualización de datos, y experiencia responsive.

---

## ✅ 5C – Dashboard visual (estado actual)

### 5C.1. Layout general
- [x] Fondo oscuro técnico tipo garaje
- [x] Sidebar con links por rol
- [x] Componente `Layout.tsx` estructurado

### 5C.2. SummaryCards (`SummaryCards.tsx`)
- [x] Datos reales desde `dashboardStats` (GraphQL)
- [x] Íconos informativos
- [x] Diseño responsive (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`)

### 5C.3. Tabla de órdenes recientes (`RecentOrdersTable.tsx`)
- [x] Query real (`recentWorkOrders`)
- [x] Estilo visual limpio y adaptativo
- [x] Hover, sombreado y feedback

### 5C.4. Responsive completo
- [x] Sidebar fijo en escritorio
- [x] Sidebar oculto con botón ☰ / ✖️ en móvil
- [x] `Layout.tsx` con `pt-16` y sin `ml-60` en desktop

### 5C.5. Login visual (sin cambios)
- [x] Diseño perfecto confirmado
- [x] Fondo oscuro, logo oficial, layout limpio y funcional

---

## ⚠️ Pendiente: 5C.6. Conectar gráfico a datos reales

### 5C.6. AppointmentsChart (`AppointmentsChart.tsx`)
- [ ] Crear query GraphQL `appointmentsThisWeek`
- [ ] Resolver en backend con citas reales por día
- [ ] Reemplazar `data` mock por datos del backend
- [ ] Usar `useQuery` para mostrarlo en tiempo real
- [ ] Mantener estilo visual actual (Recharts, fondo oscuro)

---

## 🔜 5D – Próximos módulos funcionales

### 5D.1. Gestión de usuarios
- [ ] Tabla de usuarios (`Users.tsx`)
- [ ] Editar usuario (cambio de contraseña incluido)
- [ ] Eliminar usuario
- [ ] Conexión completa a backend GraphQL

### 5D.2. Gestión de órdenes de trabajo
- [ ] Listado con filtros por estado y fecha
- [ ] Crear nueva orden (cliente + vehículo + tareas)
- [ ] Ver y actualizar orden

### 5D.3. Gestión de empresas (flotas)
- [ ] Listado de empresas
- [ ] Crear/editar empresa
- [ ] Asociar vehículos y clientes a empresa
- [ ] Integrar con flujo de registro

---

📌 Última actualización: `2025-08-03`