# Gestión de Libros Leídos - API REST

API REST para el seguimiento de libros leídos desarrollada con NestJS, TypeORM y PostgreSQL. Incluye documentación Swagger y pruebas unitarias/de integración con Jest.

## Proyecto Académico - INF780: Validación y Verificación de Software

**Universidad Autónoma Tomás Frías**  
Carrera: Ingeniería Informática  
Potosí, Bolivia - 2026

## Descripción

Esta API permite gestionar un catálogo de libros leídos con las siguientes funcionalidades:

- CRUD completo de libros
- Filtrado por autor, género, estado de lectura y calificación
- Paginación de resultados
- Estadísticas de lectura
- Documentación automática con Swagger/OpenAPI

## Tecnologías

- **Backend**: NestJS (Node.js)
- **ORM**: TypeORM
- **Base de datos**: PostgreSQL
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Pruebas**: Jest

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Docker (opcional, para PostgreSQL)
- npm o yarn
- httpie (opcional, para pruebas en terminal)

### Instalar httpie

```bash
# Linux
sudo apt install httpie

# macOS
brew install httpie

# Windows (con pip)
pip install httpie
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd gestion_libros
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo `.env.example` a `.env`:

```bash
cp .env.example .env
```

O configura manualmente las variables:

```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=gestion_user
DATABASE_PASSWORD=tu_contraseña_segura
DATABASE_NAME=gestion_libros
PORT=3000
```

### 4. Iniciar PostgreSQL

#### Opción A: Con Docker

```bash
docker-compose up -d
```

#### Opción B: Local

Asegúrate de tener PostgreSQL instalado y ejecutándose, y crea la base de datos:

```sql
CREATE DATABASE gestion_libros;
```

## Ejecutar la Aplicación

### Modo desarrollo

```bash
npm run start:dev
```

### Modo producción

```bash
npm run build
npm run start:prod
```

La aplicación estará disponible en: `http://localhost:3000`

## Documentación Swagger

Una vez que la aplicación esté en ejecución, accede a:

- **Swagger UI**: <http://localhost:3000/api/docs>
- **JSON OpenAPI**: <http://localhost:3000/api/docs-json>

## Endpoints de la API

| Método | Endpoint            | Descripción                                         |
| ------ | ------------------- | --------------------------------------------------- |
| POST   | `/books`            | Crear un nuevo libro                                |
| GET    | `/books`            | Obtener todos los libros (con filtros y paginación) |
| GET    | `/books/statistics` | Obtener estadísticas de lectura                     |
| GET    | `/books/:id`        | Obtener un libro por ID                             |
| PATCH  | `/books/:id`        | Actualizar un libro                                 |
| DELETE | `/books/:id`        | Eliminar un libro                                   |

### Ejemplos de uso con curl

**Crear un libro:**

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cien años de soledad",
    "author": "Gabriel García Márquez",
    "year": 1967,
    "genre": "Realismo mágico",
    "pages": 417,
    "read": true,
    "rating": 5
  }'
```

**Obtener todos los libros:**

```bash
curl http://localhost:3000/books
```

**Filtrar por autor:**

```bash
curl "http://localhost:3000/books?author=García"
```

**Filtrar por calificación mínima:**

```bash
curl "http://localhost:3000/books?minRating=4&read=true"
```

**Obtener estadísticas:**

```bash
curl http://localhost:3000/books/statistics
```

### Ejemplos de uso con httpie

> httpie es una alternativa a curl con salida más legible para terminal.

**Crear un libro:**

```bash
http POST http://localhost:3000/books \
  title="Cien años de soledad" \
  author="Gabriel García Márquez" \
  year=1967 \
  genre="Realismo mágico" \
  pages=417 \
  read:=true \
  rating:=5
```

**Obtener todos los libros:**

```bash
http http://localhost:3000/books
```

**Filtrar por autor:**

```bash
http http://localhost:3000/books author=="García"
```

**Filtrar por calificación mínima y leídos:**

```bash
http http://localhost:3000/books minRating==4 read==true
```

**Obtener un libro por ID:**

```bash
http http://localhost:3000/books/1
```

**Obtener estadísticas:**

```bash
http http://localhost:3000/books/statistics
```

**Actualizar un libro:**

```bash
http PATCH http://localhost:3000/books/1 \
  rating:=4 \
  notes="Excelente lectura"
```

**Eliminar un libro:**

```bash
http DELETE http://localhost:3000/books/1
```

### Verificación rápida de la API

Ejecuta estos comandos en orden para verificar que todo funciona:

```bash
# 1. Crear libro
http POST http://localhost:3000/books \
  title="El Principito" \
  author="Antoine de Saint-Exupéry" \
  year=1943 \
  genre="Fábula" \
  pages=96 \
  rating:=5

# 2. Listar libros
http http://localhost:3000/books

# 3. Ver estadísticas
http http://localhost:3000/books/statistics

# 4. Verificar en Swagger
# Abrir en navegador: http://localhost:3000/api/docs
```

## Ejecutar las Pruebas

### Pruebas unitarias (servicios)

```bash
npm run test
```

### Pruebas con watching

```bash
npm run test:watch
```

### Cobertura de pruebas

```bash
npm run test:cov
```

### Pruebas e2e (integración)

```bash
npm run test:e2e
```

## Cobertura de Pruebas

El proyecto incluye:

- **Pruebas unitarias**: Cobertura del servicio BooksService
- **Pruebas de integración**: Cobertura del controlador BooksController

Métricas esperadas:

- Cobertura de líneas: > 80%
- Cobertura de funciones: > 80%
- Cobertura de ramas: > 70%

## Estructura del Proyecto

```
gestion_libros/
├── src/
│   ├── books/
│   │   ├── dto/
│   │   │   ├── create-book.dto.ts
│   │   │   ├── update-book.dto.ts
│   │   │   └── query-book.dto.ts
│   │   ├── entities/
│   │   │   └── book.entity.ts
│   │   ├── books.controller.ts
│   │   ├── books.module.ts
│   │   ├── books.service.ts
│   │   └── books.service.spec.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Validación de Datos

Los DTOs implementan las siguientes validaciones:

### CreateBookDto

- `title`: Requerido, string, 1-255 caracteres
- `author`: Requerido, string, 1-255 caracteres
- `year`: Opcional, entero entre 1000-2030
- `genre`: Opcional, string máximo 100 caracteres
- `pages`: Opcional, entero mínimo 1
- `read`: Opcional, boolean (default: false)
- `rating`: Opcional, entero entre 1-5
- `notes`: Opcional, string
- `readDate`: Opcional, formato fecha ISO

### QueryBookDto

- `author`: Filtrar por autor (búsqueda parcial)
- `genre`: Filtrar por género (búsqueda parcial)
- `read`: Filtrar por estado de lectura
- `minRating`: Filtrar por calificación mínima
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)

## Licencia

MIT License
