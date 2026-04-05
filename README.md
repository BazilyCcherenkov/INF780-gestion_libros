# Gestión de Libros Leídos - API REST

API REST profesional para el seguimiento de libros leídos desarrollada con NestJS, TypeORM y PostgreSQL. Incluye documentación Swagger/OpenAPI completa y pruebas unitarias/de integración con Jest.

## Proyecto Académico - INF780: Validación y Verificación de Software

**Universidad Autónoma Tomás Frías**  
Carrera: Ingeniería Informática  
Potosí, Bolivia - 2026

## Características Principales

- **CRUD completo** de libros con validaciones robustas
- **Filtros avanzados**: autor, género, estado (read/unread), calificación mínima
- **Ordenamiento**: por título, autor, año, calificación, páginas, fecha
- **Paginación configurable** con límites personalizables
- **Estadísticas detalladas**: totales, promedios, top rated
- **Documentación Swagger** con ejemplos completos
- **Filtro global de excepciones** para respuestas consistentes
- **Pruebas unitarias** con cobertura >80% en servicio
- **Pruebas e2e** para integración completa

## Tecnologías

- **Backend**: NestJS 10 (Node.js 20)
- **ORM**: TypeORM 0.3
- **Base de datos**: PostgreSQL 16
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI (@nestjs/swagger)
- **Pruebas**: Jest con coverage

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)
- npm o yarn
- httpie (para pruebas en terminal)

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

```bash
# Clonar repositorio
git clone https://github.com/BazilyCcherenkov/INF780-gestion_libros.git
cd gestion_libros

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de PostgreSQL

# Iniciar PostgreSQL (Docker)
docker-compose up -d

# Ejecutar aplicación
npm run start:dev
```

La aplicación estará disponible en: `http://localhost:3000`

## Documentación Swagger

- **Swagger UI**: http://localhost:3000/api/docs
- **JSON OpenAPI**: http://localhost:3000/api/docs-json

## Endpoints de la API

| Método | Endpoint            | Descripción                            |
| ------ | ------------------- | -------------------------------------- |
| POST   | `/books`            | Crear un nuevo libro                   |
| GET    | `/books`            | Listar con filtros, orden y paginación |
| GET    | `/books/statistics` | Estadísticas de lectura                |
| GET    | `/books/:id`        | Obtener libro por ID                   |
| PATCH  | `/books/:id`        | Actualizar libro                       |
| DELETE | `/books/:id`        | Eliminar libro                         |

## Parámetros de Filtrado (GET /books)

| Parámetro   | Tipo   | Descripción                                               |
| ----------- | ------ | --------------------------------------------------------- |
| `author`    | string | Buscar por autor (parcial)                                |
| `genre`     | string | Buscar por género (parcial)                               |
| `status`    | enum   | `read` o `unread`                                         |
| `minRating` | number | Calificación mínima (1-5)                                 |
| `sortBy`    | enum   | `title`, `author`, `year`, `rating`, `pages`, `createdAt` |
| `sortOrder` | enum   | `asc` o `desc` (default: desc)                            |
| `page`      | number | Número de página (default: 1)                             |
| `limit`     | number | Elementos por página (default: 10, max: 100)              |

## Ejemplos con httpie

**Crear libro:**

```bash
http POST http://localhost:3000/books \
  title="Cien años de soledad" \
  author="Gabriel García Márquez" \
  year=1967 genre="Realismo mágico" \
  pages=417 read:=true rating:=5
```

**Buscar con filtros y orden:**

```bash
http "http://localhost:3000/books?status=read&minRating=4&sortBy=rating&sortOrder=desc"
```

**Listar paginado:**

```bash
http "http://localhost:3000/books?page=1&limit=20"
```

**Ver estadísticas:**

```bash
http http://localhost:3000/books/statistics
```

**Actualizar libro:**

```bash
http PATCH http://localhost:3000/books/1 rating:=4 notes="Excelente"
```

**Eliminar libro:**

```bash
http DELETE http://localhost:3000/books/1
```

## Ejecución de Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas con coverage
npm run test:cov

# Pruebas e2e (requiere BD)
npm run test:e2e

# Pruebas en modo watch
npm run test:watch
```

## Cobertura de Pruebas

| Componente    | Statements | Branches | Functions | Lines |
| ------------- | ---------- | -------- | --------- | ----- |
| books.service | 100%       | 91.17%   | 100%      | 100%  |
| book.entity   | 100%       | 100%     | 100%      | 100%  |
| books.module  | 100%       | 100%     | 100%      | 100%  |

**Total pruebas**: 33 tests passing

## Manejo de Errores

La API retorna errores estructurados:

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/books/999",
  "method": "GET",
  "message": "Libro con ID 999 no encontrado",
  "error": "Not Found"
}
```

**Códigos de error:**

- `400`: Validación fallida / datos inválidos
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Estructura del Proyecto

```
gestion_libros/
├── src/
│   ├── books/
│   │   ├── dto/
│   │   │   ├── create-book.dto.ts
│   │   │   ├── update-book.dto.ts
│   │   │   └── query-book.dto.ts
│   │   ├── entities/book.entity.ts
│   │   ├── books.controller.ts
│   │   ├── books.service.ts
│   │   ├── books.service.spec.ts
│   │   └── books.module.ts
│   ├── common/filters/
│   │   └── http-exception.filter.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── docker-compose.yml
├── package.json
└── README.md
```

## Validaciones Implementadas

### CreateBookDto / UpdateBookDto

- `title`: Requerido, 1-255 caracteres
- `author`: Requerido, 1-255 caracteres
- `year`: Entero 1000-2030
- `genre`: Máximo 100 caracteres
- `pages`: Entero mínimo 1
- `rating`: Entero 1-5
- `readDate`: Formato ISO (YYYY-MM-DD)

## Licencia

MIT License
