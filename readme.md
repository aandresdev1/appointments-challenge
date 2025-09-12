# 🚀 RIMAC Appointments - Guía de Desarrollo

## 📦 Estructura del Proyecto

```
prueba-rimac/
├── package.json                 # Root workspace (comandos principales)
├── docs/                       # Documentación OpenAPI
├── packages/
│   ├── appointment-api/        # Servicio principal de API
│   └── shared/                # Tipos y utilidades compartidas
└── tools/                     # Scripts y herramientas
```

## 🛠 Comandos Principales

### **Desde la raíz del proyecto (recomendado):**

```bash
# Instalación y configuración inicial
npm install                     # Instala todas las dependencias
npm run dev:setup              # Setup completo del proyecto

# Desarrollo
npm run build                   # Compila todos los packages
npm run build:watch            # Compila en modo watch
npm run test                    # Ejecuta todos los tests

# Deployment (AWS Lambda)
npm run deploy:dev              # Despliega a desarrollo
npm run deploy:prod             # Despliega a producción
npm run deploy:remove           # Remueve el stack de AWS

# Documentación
npm run docs:serve              # Sirve docs en http://localhost:3000
npm run docs:open               # Abre automáticamente en navegador

# Monitoreo
npm run dev:logs                # Muestra logs de Lambda en tiempo real
```

### **Comandos específicos por package:**

```bash
# Trabajar específicamente en appointment-api
cd packages/appointment-api
npm run build
npm run deploy:dev
npm run logs -- createAppointment  # Ver logs de función específica

# Trabajar específicamente en shared
cd packages/shared
npm run build
npm run test
```

## 🏗 Flujo de Desarrollo Recomendado

1. **Setup inicial:**

   ```bash
   npm run dev:setup
   npm run docs:serve    # En terminal separado
   ```

2. **Desarrollo activo:**

   ```bash
   npm run build:watch   # En terminal separado
   npm run test:watch    # En terminal separado
   ```

3. **Testing de endpoints:**
   - API endpoints: http://localhost:3000 (Swagger UI)
   - API en AWS: `npm run deploy:dev`

4. **Deployment:**
   ```bash
   npm run test          # Verificar tests
   npm run deploy:dev    # Desplegar a desarrollo
   ```

## 📋 Arquitectura

- **Monorepo:** Múltiples packages en un solo repositorio
- **Workspaces:** NPM workspaces para gestión de dependencias
- **TypeScript:** Tipado estático en todo el proyecto
- **AWS Lambda:** Serverless functions
- **DynamoDB + RDS:** Base de datos dual
- **Clean Architecture:** SOLID principles

## 🔧 Configuración de IDEs

### **VS Code (recomendado):**

- Extensiones: TypeScript, AWS Toolkit, Serverless
- Configuración: `.vscode/` ya incluida

### **WebStorm:**

- Configurar TypeScript service
- Habilitar soporte para AWS

## 🐛 Troubleshooting

**Problema:** `npm run deploy:dev` falla

```bash
# Solución: Verificar AWS credentials
aws configure list
npm run build  # Asegurar compilación exitosa
```

**Problema:** Documentación no carga

```bash
# Solución: Verificar puerto y archivos
npm run docs:serve
# Verificar en http://localhost:3000
```

**Problema:** Tests fallan

```bash
# Solución: Limpiar y reinstalar
npm run clean
npm install
npm run build
npm run test
```

## 📚 Recursos Adicionales

- [Documentación AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [OpenAPI 3.0](https://swagger.io/specification/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**💡 Tip:** Siempre ejecuta comandos desde la raíz del proyecto para aprovechar el workspace y evitar inconsistencias.
