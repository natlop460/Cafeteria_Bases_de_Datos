# Cafetería B&B - Sistema de Gestión
## Proyecto 2 - TPA-3002 Bases de Datos

---

## Descripción

Sistema de gestión para Cafetería B&B implementado con arquitectura de microservicios utilizando Docker. El proyecto integra bases de datos relacionales (MySQL) y no relacionales (MongoDB) con un backend en Node.js y frontend en React.

---

## Tecnologías

- Backend: Node.js + Express
- Base de datos relacional: MySQL 8.0
- Base de datos NoSQL: MongoDB 6.0
- Frontend: React 18
- Contenedores: Docker + Docker Compose

---

## Requisitos Previos

1. **Docker Desktop instalado y en ejecución**:
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/engine/install/

2. Puertos disponibles: 3000, 4000, 3306, 27017, 8080, 8081
3. Mínimo 4GB de RAM disponible

---

## Instalación y Ejecución

### 1. Extracción del proyecto

Descomprimir el archivo `proyecto2-estudiante.zip` en una ubicación de fácil acceso.

### 2. Abrir terminal en el directorio del proyecto

**Windows:**
- Método 1: Abrir el Explorador de archivos, navegar a la carpeta `docker-cafeteria-bb`, hacer clic derecho en un espacio vacío y seleccionar "Abrir en Terminal" o "Git Bash Here"
- Método 2: Presionar Win + R, escribir `cmd`, presionar Enter, y navegar usando:
  ```cmd
  cd C:\ruta\a\docker-cafeteria-bb
  ```

**macOS:**
- Método 1: Abrir Finder, navegar a la carpeta `docker-cafeteria-bb`, hacer clic derecho y seleccionar "Nueva Terminal en esta Carpeta"
- Método 2: Abrir Terminal y ejecutar:
  ```bash
  cd /ruta/a/docker-cafeteria-bb
  ```

**Linux:**
- Método 1: Abrir el gestor de archivos, navegar a `docker-cafeteria-bb`, hacer clic derecho y seleccionar "Abrir terminal aquí"
- Método 2: Abrir terminal y ejecutar:
  ```bash
  cd /ruta/a/docker-cafeteria-bb
  ```

### 3. Inicializar los servicios

Ejecutar el siguiente comando en la terminal:

```bash
docker-compose up --build
```

Nota: Este comando es idéntico en Windows, macOS y Linux.

### 4. Verificación del sistema

Tiempo de inicialización: aproximadamente 2-3 minutos.

El sistema estará operativo cuando:
- Frontend esté accesible en http://localhost:3000
- phpMyAdmin esté accesible en http://localhost:8080
- Mongo Express esté accesible en http://localhost:8081
- No aparezcan mensajes de error en la terminal

---

## Acceso a los Servicios

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|------------|
| Frontend | http://localhost:3000 | - | - |
| API Backend | http://localhost:4000 | - | - |
| phpMyAdmin (MySQL) | http://localhost:8080 | root | cafeteria2025 |
| Mongo Express (MongoDB) | http://localhost:8081 | admin | admin123 |

---

## Configuración de Conexión a Base de Datos

### MySQL

```
Host: localhost
Puerto: 3306
Base de datos: cafeteria_bb
Usuario: root
Contraseña: cafeteria2025
```

### MongoDB

```
Host: localhost
Puerto: 27017
Base de datos: cafeteria_nosql
Usuario: admin
Contraseña: admin123
```

---

## Comandos Docker Útiles

### Iniciar servicios en segundo plano
```bash
docker-compose up -d
```

### Visualizar logs en tiempo real
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f [nombre_servicio]
```

Servicios disponibles: `cafeteria_frontend`, `cafeteria_backend`, `cafeteria_mysql`, `cafeteria_mongodb`, `cafeteria_phpmyadmin`, `cafeteria_mongoexpress`

### Reiniciar todos los servicios
```bash
docker-compose restart
```

### Reiniciar un servicio específico
```bash
docker-compose restart [nombre_servicio]
```

### Detener servicios
```bash
docker-compose down
```

### Reinicio completo (elimina todos los datos y volúmenes)
```bash
docker-compose down -v
docker-compose up --build
```

Advertencia: Este comando eliminará todos los datos almacenados en las bases de datos.

### Ver estado de los contenedores
```bash
docker-compose ps
```

---

## Solución de Problemas Comunes

### El frontend muestra error de conexión
- Esperar 30-60 segundos adicionales. MySQL puede estar en proceso de inicialización.
- Verificar que Docker Desktop esté en ejecución.
- Reiniciar el servicio backend:
  ```bash
  docker-compose restart cafeteria_backend
  ```

### phpMyAdmin no conecta a la base de datos
- Verificar que Docker Desktop esté en ejecución.
- Reiniciar todos los servicios:
  ```bash
  docker-compose restart
  ```
- Si el problema persiste, realizar un reinicio completo:
  ```bash
  docker-compose down
  docker-compose up --build
  ```

### Error "Port already in use"
- Identificar el proceso que está utilizando el puerto:

  **Windows:**
  ```cmd
  netstat -ano | findstr :3306
  ```

  **macOS/Linux:**
  ```bash
  lsof -i :3306
  ```
- Detener el servicio que está ocupando el puerto o cambiar la configuración del puerto en `docker-compose.yml`.

### Los cambios en archivos SQL no se reflejan
- Importante: Los archivos SQL no se ejecutan automáticamente.
- Los scripts deben ejecutarse manualmente a través de phpMyAdmin o mediante el cliente MySQL.
- Para ejecutar un archivo SQL completo:
  ```bash
  docker exec -i cafeteria_mysql mysql -uroot -pcafeteria2025 cafeteria_bb < database/procedures/archivo.sql
  ```

### Error al ejecutar procedimientos almacenados en phpMyAdmin
- Verificar el uso correcto de delimitadores:
  ```sql
  DELIMITER //
  CREATE PROCEDURE ...
  END//
  DELIMITER ;
  ```
- En phpMyAdmin, cambiar el delimitador en el menú desplegable de la sección SQL antes de ejecutar el código.

### Contenedores consumen demasiada memoria
- Ajustar los recursos asignados a Docker Desktop en Configuración > Recursos > Memoria.
- Detener servicios no utilizados temporalmente:
  ```bash
  docker-compose stop cafeteria_frontend
  ```

---

## Estructura del Proyecto

```
docker-cafeteria-bb/
├── backend/                # Backend Node.js + Express
├── frontend/              # Frontend React
├── database/
│   ├── schema/           # Esquema inicial de MySQL
│   └── procedures/       # Archivos SQL y MongoDB para completar
├── docker-compose.yml    # Configuración de servicios Docker
└── README.md            # Este archivo
```

---

## Información Adicional

- Curso: TPA-3002 Bases de Datos
- Profesor: Natán Fernández de Castro
- Institución: Tecnológico de Costa Rica
