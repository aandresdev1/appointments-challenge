# Appointments Technical Challenge

> **Plataforma de agendamiento de citas médicas de nivel empresarial para las operaciones de Appointments Technical Challenge en múltiples países (Perú y Chile)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://typescript.org/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange.svg)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-brightgreen.svg)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🎯 **Descripción del Proyecto**

Este es un **sistema escalable de gestión de citas médicas** diseñado para las operaciones de salud de Appointments Technical Challenge en Perú (PE) y Chile (CL). El sistema maneja la creación de citas, procesamiento específico por país, y flujos de trabajo de completación usando arquitectura serverless de AWS.

### **Problema de Negocio Resuelto**

- **Agendamiento de citas multi-país** con reglas de negocio específicas por país
- **Procesamiento asíncrono** para manejar altos volúmenes de citas
- **Estrategia de almacenamiento dual** para consultas rápidas y persistencia de datos enriquecidos
- **Arquitectura dirigida por eventos** para gestión del ciclo de vida de citas

### **Logros Técnicos Clave**

- ✅ **Clean Architecture** con principios SOLID
- ✅ **Microservicios dirigidos por eventos** usando AWS EventBridge
- ✅ **Estrategia multi-base de datos** (DynamoDB + RDS MySQL)
- ✅ **Monorepo type-safe** con librerías compartidas
- ✅ **Infrastructure as Code** con Serverless Framework
- ✅ **Diseño API-first** con documentación OpenAPI 3.0

---

## 🚀 **Inicio Rápido**

### **Prerequisitos**

```bash
node >= 18.0.0
npm >= 9.0.0
AWS CLI configurado
```

### **Setup en 3 Pasos**

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar todos los packages
npm run build

# 3. Desplegar a AWS (ambiente de desarrollo)
npm run deploy:dev
```

> **⚠️ Nota Importante sobre Compilación**: Si `npm run build` falla con errores de "@rimac/shared", ejecutar los builds individualmente:
>
> ```bash
> # Compilar shared primero (dependencia)
> npm run build -w @rimac/shared
>
> # Luego compilar la API
> npm run build -w @rimac/appointment-api
> ```

### **🌐 Probar la API**

#### **📖 Documentación Interactiva**

La documentación completa de la API está disponible en:

- **🌍 Documentación en vivo**: [http://appointment-technical-challenge-docs.s3-website-us-east-1.amazonaws.com/](http://appointment-technical-challenge-docs.s3-website-us-east-1.amazonaws.com/)
- **💻 Documentación local**: `npm run docs:serve` → [http://localhost:3000](http://localhost:3000)

#### **🧪 Pruebas de Endpoints**

```bash
# Probar endpoint de salud
curl https://YOUR_API_URL/dev/health

# Crear una cita (Linux/macOS)
curl -X POST https://YOUR_API_URL/dev/appointments \
  -H "Content-Type: application/json" \
  -d '{"insuredId": "12345", "scheduleId": 101, "countryISO": "PE"}'
```

> **💡 Para Windows PowerShell**, usar este formato:
>
> ```powershell
> # Crear una cita en PowerShell
> $body = @{ insuredId = "12345"; scheduleId = 101; countryISO = "PE" } | ConvertTo-Json
> Invoke-RestMethod -Uri "https://YOUR_API_URL/dev/appointments" -Method POST -Body $body -ContentType "application/json"
>
> # Consultar todas las citas
> Invoke-RestMethod -Uri "https://YOUR_API_URL/dev/appointments" -Method GET
> ```

---

## 🔧 **Troubleshooting Común**

### **Error de Compilación con @rimac/shared**

Si encuentras errores como `Cannot find module '@rimac/shared'`:

```bash
# Solución: Compilar packages en orden correcto
npm run build -w @rimac/shared       # Primero shared
npm run build -w @rimac/appointment-api  # Después la API
```

### **Error de JSON en curl (Windows)**

Si curl falla con "Invalid JSON format", usar PowerShell:

```powershell
# En lugar de curl, usar Invoke-RestMethod
$body = @{ insuredId = "12345"; scheduleId = 101; countryISO = "PE" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://TU_API_URL/dev/appointments" -Method POST -Body $body -ContentType "application/json"
```

### **AWS CLI no configurado**

Si ves errores de AWS durante deployment:

```bash
# Configurar AWS CLI
aws configure
# Ingresar: Access Key, Secret Key, Region (us-east-1), Format (json)

# Verificar configuración
aws sts get-caller-identity
```

### **Puerto 3000 ocupado**

Si `npm run docs:serve` falla:

```bash
# Usar puerto alternativo
cd docs && npx serve . -p 8080
```

---

## 🏗 **Arquitectura del Sistema**

### **Flujo de Alto Nivel**

```
📱 Petición del Cliente
    ↓
🌐 API Gateway → Lambda (create-appointment)
    ↓
💾 DynamoDB (almacenamiento rápido)
    ↓
📨 SNS Topic → SQS Queues (PE/CL)
    ↓
⚡ Lambda Processors (específicos por país)
    ↓
🗄️ RDS MySQL (datos enriquecidos)
    ↓
🎯 EventBridge → Completion Handler
    ↓
✅ Actualización de Estado (completed)
```

### **Stack Tecnológico**

| Capa               | Tecnología              | Propósito                          |
| ------------------ | ----------------------- | ---------------------------------- |
| **API**            | API Gateway + Lambda    | Endpoints RESTful                  |
| **Cómputo**        | AWS Lambda (Node.js 18) | Funciones serverless               |
| **Almacenamiento** | DynamoDB + RDS MySQL    | Estrategia dual de base de datos   |
| **Mensajería**     | SNS + SQS + EventBridge | Procesamiento dirigido por eventos |
| **IaC**            | Serverless Framework    | Gestión de infraestructura         |
| **Lenguaje**       | TypeScript              | Seguridad de tipos                 |
| **Arquitectura**   | Clean Architecture      | Principios SOLID                   |

### **Componentes Principales**

```
packages/
├── appointment-api/          # 🎯 Servicio principal de API
│   ├── src/handlers/        # Handlers de funciones Lambda
│   ├── src/application/     # Casos de uso e interfaces
│   ├── src/domain/         # Entidades y repositorios
│   └── src/infrastructure/ # Implementaciones de servicios externos
└── shared/                  # 📦 Utilidades compartidas
    ├── src/types/          # Interfaces TypeScript
    ├── src/utils/          # Utilidades comunes
    └── src/middlewares/    # Middlewares de API
```

---

## 📋 **Endpoints de la API**

| Método | Endpoint                    | Descripción              | Estado |
| ------ | --------------------------- | ------------------------ | ------ |
| `GET`  | `/health`                   | Health check             | ✅     |
| `POST` | `/appointments`             | Crear cita               | ✅     |
| `GET`  | `/appointments`             | Listar todas las citas   | ✅     |
| `GET`  | `/appointments/{insuredId}` | Obtener citas de usuario | ✅     |

### **Ejemplos de Uso de la API**

**Crear Cita:**

```json
POST /appointments
{
  "insuredId": "12345678",
  "scheduleId": 101,
  "countryISO": "PE"
}

Response: {
  "appointmentId": "uuid-v4",
  "status": "pending",
  "message": "Appointment created successfully"
}
```

**Listar Citas:**

```json
GET /appointments?country=PE&status=completed

Response: {
  "appointments": [...],
  "count": 25,
  "lastEvaluatedKey": "..."
}
```

---

## 🛠 **Guía de Desarrollo**

### **Comandos Disponibles**

```bash
# 📦 Instalación y Setup
npm install                 # Instalar todas las dependencias
npm run dev:setup          # Setup completo del proyecto

# 🔨 Build y Desarrollo
npm run build               # Compilar todos los packages
npm run build:watch         # Modo watch para desarrollo
npm run test                # Ejecutar todos los tests

# � Build Individual (si hay problemas de dependencias)
npm run build -w @rimac/shared              # Compilar solo shared
npm run build -w @rimac/appointment-api     # Compilar solo API

# �🚀 Deployment
npm run deploy:dev          # Desplegar a desarrollo
npm run deploy:prod         # Desplegar a producción
npm run deploy:remove       # Remover recursos de AWS

# 📖 Documentación
npm run docs:serve          # Servir docs en localhost:3000
npm run docs:open           # Abrir docs en navegador

# 🔍 Monitoreo
npm run dev:logs            # Ver logs de Lambda en tiempo real
```

> **💡 Tip**: Si `npm run build` falla, compilar packages individualmente en orden: `shared` primero, luego `appointment-api`.

### **Flujo de Trabajo de Desarrollo Recomendado**

```bash
# 1. Setup del workspace
npm run dev:setup
npm run docs:serve          # Terminal 1

# 2. Si hay problemas de compilación
npm run build -w @rimac/shared       # Compilar shared primero
npm run build -w @rimac/appointment-api  # Luego la API

# 3. Desarrollo activo
npm run build:watch         # Terminal 2
npm run test:watch          # Terminal 3

# 4. Desplegar y probar
npm run deploy:dev
npm run dev:logs            # Monitorear deployment

# 5. Probar API (Windows PowerShell)
$healthCheck = Invoke-RestMethod -Uri "https://TU_API_URL/dev/health"
$healthCheck | ConvertTo-Json
```

> **⚠️ Importante**: Reemplazar `TU_API_URL` con la URL real que aparece después del deployment.

### **Estructura del Proyecto**

```
appointments/
├── 📁 docs/                    # Documentación de la API
│   ├── index.html             # Swagger UI
│   └── api/openapi.yaml       # Especificación OpenAPI 3.0
├── 📁 packages/
│   ├── 📁 appointment-api/    # Servicio principal de API
│   │   ├── serverless.yml     # Infraestructura AWS
│   │   └── src/               # Código fuente
│   └── 📁 shared/             # Librería compartida
│       └── src/               # Tipos y utils comunes
├── 📁 tools/                   # Herramientas de desarrollo
└── package.json               # Configuración del workspace
```

---

## 🏛 **Patrones de Arquitectura**

### **Implementación de Clean Architecture**

- **Capa de Dominio**: Entidades, repositorios (interfaces)
- **Capa de Aplicación**: Casos de uso, lógica de negocio
- **Capa de Infraestructura**: Servicios AWS, APIs externas
- **Capa de Handlers**: Puntos de entrada Lambda

### **Diseño Dirigido por Eventos**

```
Cita Creada → SNS → Colas por País → Procesadores → EventBridge → Completación
```

### **Estrategia de Base de Datos**

- **DynamoDB**: Escrituras rápidas, consultas en tiempo real
- **RDS MySQL**: Datos enriquecidos, relaciones complejas, esquemas específicos por país

### **Procesamiento Específico por País**

- **Perú (PE)**: Usa `RDSPEAppointmentRepository`
- **Chile (CL)**: Usa `RDSCLAppointmentRepository`
- **Compartido**: Interfaces y lógica de negocio común

---

## 🔧 **Configuración y Ambiente**

### **Recursos AWS**

- **Funciones Lambda**: 8 funciones serverless
- **DynamoDB**: `appointments-table-{stage}`
- **RDS MySQL**: Instancia compartida, bases de datos separadas por país
- **SNS/SQS**: Enrutamiento de mensajes para procesamiento específico por país
- **EventBridge**: Eventos de completación de citas

### **Variables de Entorno**

```bash
STAGE=dev|prod
APPOINTMENTS_TABLE_NAME=appointments-table-dev
SNS_TOPIC_ARN=arn:aws:sns:...
RDS_PE_HOST=appointments.region.rds.amazonaws.com
RDS_CL_HOST=appointments.region.rds.amazonaws.com
```

> **🔐 Credenciales RDS**: Las credenciales de acceso a la base de datos RDS (usuario, contraseña, puerto) están configuradas en el archivo `packages/appointment-api/serverless.yml` en la sección `environment` de cada función Lambda. Estas credenciales se definen como variables de entorno específicas para cada país (PE y CL).

---

## 🧪 **Estrategia de Testing**

```bash
# Unit tests
npm run test

# Tests de integración
npm run test:integration

# Testing de API vía Swagger UI
npm run docs:serve
```

### **Verificación Manual del Sistema**

```powershell
# 1. Health Check
Invoke-RestMethod -Uri "https://TU_API_URL/dev/health"

# 2. Crear cita de prueba
$body = @{ insuredId = "12345"; scheduleId = 101; countryISO = "PE" } | ConvertTo-Json
$newAppointment = Invoke-RestMethod -Uri "https://TU_API_URL/dev/appointments" -Method POST -Body $body -ContentType "application/json"

# 3. Verificar procesamiento (esperar ~5 segundos)
Start-Sleep -Seconds 5
Invoke-RestMethod -Uri "https://TU_API_URL/dev/appointments/12345"

# 4. Listar todas las citas
Invoke-RestMethod -Uri "https://TU_API_URL/dev/appointments"
```

> **✅ Resultado Esperado**: Las citas deben cambiar de estado `pending` a `completed` en ~3-5 segundos.

---

## 🔍 **Monitoreo y Observabilidad**

### **Logging**

- **Logging estructurado** con IDs de correlación
- **Integración con CloudWatch** para logs centralizados
- **Grupos de logs por función** para debugging aislado

### **Health Checks**

```bash
GET /health
Response: {
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

---

## 🚀 **Consideraciones de Producción**

### **Escalabilidad**

- **Funciones Lambda con auto-scaling**
- **Capacidad on-demand de DynamoDB**
- **Colas de mensajes muertos (DLQ) en SQS** para manejo de errores

### **Seguridad**

- **Acceso IAM con privilegios mínimos**
- **Configuración VPC** para acceso a RDS
- **Rate limiting de API** vía API Gateway

### **Optimización de Costos**

- **TTL de DynamoDB** para limpieza automática
- **Concurrencia provisionada de Lambda** para funciones críticas
- **Optimización de instancia RDS** por carga de país

---

## 📚 **Recursos Adicionales**

- 📖 [**Documentación Interactiva de la API**](http://localhost:3000) - Swagger UI
- 🏗 [**Guía de Clean Architecture**](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- ⚡ [**Documentación Serverless Framework**](https://www.serverless.com/framework/docs/)
- 🏷 [**Mejores Prácticas TypeScript**](https://typescript.org/docs/)
- ☁️ [**Mejores Prácticas AWS Lambda**](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

---

## 👨‍💻 **Acerca de Esta Implementación**

Este proyecto demuestra **arquitectura serverless lista para producción** con:

- ✅ **Patrones empresariales**: Clean Architecture, CQRS, Event Sourcing
- ✅ **Mejores prácticas AWS**: Serverless, multi-región, optimizado en costos
- ✅ **Dominio de TypeScript**: Tipos avanzados, gestión de monorepo
- ✅ **Integración DevOps**: IaC, listo para CI/CD, monitoreo
- ✅ **Expertise en dominio de negocio**: Salud, operaciones multi-país

**Construido para el desafío técnico de Appointments Technical Challenge** por **[Tu Nombre]** - demostrando expertise en desarrollo moderno de aplicaciones cloud-native.

---

_💡 **Consejo Pro**: Usa `npm run docs:serve` para la mejor experiencia de desarrollo con testing interactivo de API._
