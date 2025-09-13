# 📖 Documentación Estática - Appointments Technical Challenge

Esta carpeta contiene la documentación estática de la API generada automáticamente para hosting en S3 o cualquier servidor web estático.

## 🚀 Generar Documentación

```bash
# Generar archivos estáticos optimizados
npm run docs:build

# Generar y desplegar a S3 (configurar bucket primero)
npm run docs:deploy
```

## 📁 Estructura

```
dist/docs/
├── index.html          # Swagger UI principal
├── swagger.html        # Interfaz alternativa de documentación
└── api/
    └── openapi.yaml    # Especificación OpenAPI 3.0
```

## ☁️ Deployment a S3

1. **Crear bucket S3**:

   ```bash
   aws s3 mb s3://rimac-appointments-docs
   ```

2. **Configurar bucket para web hosting**:

   ```bash
   aws s3 website s3://rimac-appointments-docs --index-document index.html
   ```

3. **Actualizar bucket name en package.json**:

   ```json
   "docs:deploy": "npm run docs:build && aws s3 sync ./dist/docs s3://rimac-appointments-docs --delete"
   ```

4. **Desplegar**:
   ```bash
   npm run docs:deploy
   ```

## 🌐 URLs de Acceso

- **Desarrollo local**: http://localhost:3000
- **S3 Static Website**: http://rimac-appointments-docs.s3-website-us-east-1.amazonaws.com

## 🔧 Personalización

Para actualizar la documentación:

1. Editar `docs/api/openapi.yaml`
2. Modificar `docs/index.html` o `docs/swagger.html` si es necesario
3. Ejecutar `npm run docs:build`
4. Desplegar con `npm run docs:deploy`

## 📊 Características

- ✅ **Completamente estática** - No requiere servidor
- ✅ **Optimizada para S3** - Configuración de bucket incluida
- ✅ **Swagger UI interactivo** - Testing directo desde la documentación
- ✅ **OpenAPI 3.0** - Especificación completa de la API
- ✅ **Auto-actualizable** - Script de build automatizado

---

_Generado automáticamente por el script `tools/scripts/build-static-docs.js`_
