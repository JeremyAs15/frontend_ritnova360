# Frontend Ritnova360 - Academia de Baile en Línea
Este repositorio contiene la interfaz de usuario (Front-End) desarrollada para Ritnova360, una plataforma web que gestiona los servicios de una academia de baile en línea. Permite la autenticación con CAPTCHA, el acceso a dashboards dinámicos según el rol del usuario, la gestión de usuarios (directores, administradores, profesores, estudiantes), el catálogo de coreografías, el carrito de compras y el flujo de compra simulado.
El proyecto sigue la metodología ágil Scrum + XP, organizado en sprints con historias de usuario gestionadas en Jira.

## Tecnologías Utilizadas
- **Lenguaje:** JavaScript (JSX)
- **Framework Principal:** React 18 + Vite
- **Estilos:** Tailwind CSS v3
- **Gestión de estado:** Context API nativa de React
- **Comunicación HTTP:** fetch nativo del navegador
- **Autenticación:** JWT (JSON Web Tokens) + Google reCAPTCHA
- **Gráficos / Dashboards:** ApexCharts
- **Despliegue:** Vercel

---

## ⚙️ Guía de Instalación y Configuración Local
Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local después de clonar el repositorio.

### 1. Clonar el repositorio
```bash
git clone https://github.com/JeremyAs15/frontend_ritnova360.git
cd frontend_ritnova360
```

### 2. Instalar dependencias
```bash
npm install
```
Esto instalará todas las librerías definidas en `package.json`, incluyendo React, Vite, Tailwind CSS, ApexCharts, entre otros.

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto a partir de la plantilla:
```bash
cp .env.example .env
```

Luego edita el archivo `.env` con los valores correspondientes:
```env
# URL de la API REST del Back-End
# Clave del sitio para Google reCAPTCHA v2
```
---

## Ejecución del Proyecto

Asegúrate de que `VITE_USE_MOCKS=false` en tu `.env`. Luego ejecuta:

```bash
npm run dev
```
La aplicación estará disponible en: [http://localhost:5173](http://localhost:5173)
