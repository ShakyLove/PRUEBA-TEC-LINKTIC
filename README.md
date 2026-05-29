# PRUEBA TEC LINTICK

Guia rapida para instalar, configurar y ejecutar el proyecto correctamente.

## 1. Requisitos previos

Antes de iniciar, verificar que el equipo tenga instalado:

- Java 17
- Maven 3.9.x
- MySQL
- Node.js `v22.12.0`
- npm `11.13.0`

Comandos utiles para validar versiones:

```bash
java -version
mvn -version
node -v
npm -v
```

## 2. Clonar el proyecto


```bash
git clone <URL_DEL_REPOSITORIO>
cd "PRUEBA TEC LINTICK"
```

## 3. Preparar la base de datos

El proyecto requiere MySQL activo.

### Script a ejecutar

Ejecutar el archivo:

```txt
BASE DE DATOS.sql
```

Ese script crea la estructura y carga los datos iniciales necesarios.

### Recomendacion importante

Verificar que la base creada corresponda a este nombre:

```txt
product_inventory_db
```

## 4. Configurar credenciales de base de datos

Abrir el archivo:

[application.properties](C:\Users\isaac\Documents\MIS%20DOCUMENTOS\PRUEBA%20TEC%20LINTICK\backend\src\main\resources\application.properties)

Revisar especialmente estas lineas:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/product_inventory_db?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=1234567
```

Si en el equipo el usuario o password de MySQL es diferente, debe cambiar esos valores antes de ejecutar el backend.

## 5. Ejecutar el backend

Ubicarse en la carpeta `backend`:

```bash
cd backend
```

Ejecutar:

```bash
mvn spring-boot:run
```

Si todo sale bien, la API quedara disponible en:

```txt
http://localhost:8080/api
```

## 6. Ejecutar el frontend

Abrir una segunda terminal y ubicarse en la carpeta `frontend`:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Luego ejecutar el proyecto:

```bash
npm run dev
```

Si todo sale bien, el frontend quedara disponible normalmente en:

```txt
http://localhost:5173
```

## 7. Credenciales de acceso

Usuario principal de prueba:

```txt
admin
admin123
```

Usuario alterno:

```txt
user
user123
```

## 8. Orden recomendado para probar

Para evitar errores de conexion, seguir este orden:

1. Iniciar MySQL.
2. Ejecutar `BASE DE DATOS.sql`.
3. Ajustar `application.properties` si cambia el usuario o password de MySQL.
4. Levantar backend con `mvn spring-boot:run`.
5. Levantar frontend con `npm install` y luego `npm run dev`.
6. Abrir `http://localhost:5173`.
7. Iniciar sesion con `admin / admin123`.

## 9. Comandos utiles

### Backend

```bash
mvn test
mvn spring-boot:run
```

### Frontend

```bash
npm install
npm run dev
npm run build
npm run test:unit
npx playwright test
```

## 10. Recomendaciones finales

- No ejecutar el frontend si el backend no esta arriba, porque varias vistas dependen directamente de la API.
- Si aparece error de acceso a base de datos, revisar primero usuario, password y nombre de la BD en `application.properties`.
- Si el puerto `8080` o `5173` ya esta ocupado en el equipo, debe liberarse antes de iniciar la aplicacion.
- Para pruebas funcionales completas, usar preferiblemente el usuario `admin`.
