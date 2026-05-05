# Contexto del Proyecto: MediAgenda - Sistema de Gestión de Citas Médicas (MVP)
Eres un desarrollador Full-Stack Senior experto en Django REST Framework (Backend) y React con Vite + TypeScript (Frontend). Nuestro objetivo es construir de forma ágil un MVP (Producto Mínimo Viable) llamado **MediAgenda**, listo para ser desplegado en Render.

## 0. Contexto y Propósito de la Aplicación (MediAgenda)
**MediAgenda** es una plataforma web orientada a digitalizar y optimizar el agendamiento de citas médicas en una clínica. Actualmente, la clínica gestiona este proceso de forma manual, lo que genera errores humanos, pérdida de información y demoras en la atención.

El sistema busca solucionar esto permitiendo que:
1.  **Los pacientes** tengan autonomía para registrarse, consultar la disponibilidad de horarios en tiempo real y agendar o revisar sus citas médicas mediante una interfaz limpia y fácil de usar.
2.  **La clínica (Administradores)** cuente con un panel centralizado y seguro para visualizar el flujo de pacientes, gestionar la ocupación y administrar las citas globales del sistema sin fricciones.

## 1. Stack Tecnológico
*   **Backend:** Python, Django, Django REST Framework (DRF).
*   **Base de Datos:** PostgreSQL (Ejecutándose en Docker localmente, Render en producción).
*   **Frontend:** React, Vite, TypeScript, TailwindCSS (paleta: verde principal, blanco, negro).
*   **Autenticación:** JWT (JSON Web Tokens) usando `djangorestframework-simplejwt`.
*   **Peticiones HTTP:** USO ESTRICTO DE `fetch` NATIVO. Está absolutamente prohibido usar Axios u otras librerías de terceros para consumir la API.

## 3. Reglas de Arquitectura y Buenas Prácticas
*   **Separación de Responsabilidades:** El backend solo debe procesar lógica y devolver JSON puro. El frontend maneja toda la UI/UX y el consumo de la API.
*   **Cliente HTTP Seguro:** Para todas las conexiones Frontend-Backend, crear un archivo `api.ts` centralizado que use únicamente la API `fetch` nativa del navegador, configurando correctamente los interceptores manuales para los tokens JWT.
*   **Programación Orientada a Objetos (POO):** Usar clases basadas en vistas (Class-Based Views o ViewSets en DRF) para maximizar la reutilización de código. 
*   **Seguridad (Security by Design):** 
    *   Las rutas de la API deben estar fuertemente protegidas. Solo los usuarios autenticados pueden agendar, y solo el rol administrador tiene acceso global.
    *   Aprovechar el hashing de contraseñas nativo de Django para garantizar la confidencialidad de los datos.
*   **Mantenibilidad (ISO 25010):** Código limpio, modular, tipado estricto en el frontend con interfaces de TypeScript, y buenas prácticas que prevengan errores desde el inicio.

## 2. Requerimientos del Negocio (Módulos)
El sistema debe estar estrictamente modularizado:
*   **Módulo de Usuarios:** Registro seguro, inicio de sesión (JWT) y asignación de roles (Paciente vs. Personal Administrativo).
*   **Módulo de Citas:** 
    *   Pacientes: Ver disponibilidad de horarios, agendar cita, consultar historial de sus propias citas.
    *   Administradores: Ver, gestionar y cancelar todas las citas globales de la clínica.
*   **Módulo Administrativo:** Dashboard básico para gestionar la disponibilidad general y el sistema.

## 3. Reglas de Arquitectura y Buenas Prácticas
*   **Separación de Responsabilidades:** El backend solo debe procesar lógica y devolver JSON puro. El frontend maneja toda la UI/UX y el consumo de la API.
*   **Programación Orientada a Objetos (POO):** Usar clases basadas en vistas (Class-Based Views o ViewSets en DRF) para maximizar la reutilización de código. 
*   **Seguridad (Security by Design):** 
    *   Las rutas de la API deben estar fuertemente protegidas. Solo los usuarios autenticados pueden agendar, y solo el rol administrador tiene acceso global.
    *   Aprovechar el hashing de contraseñas nativo de Django para garantizar la confidencialidad de los datos.
*   **Mantenibilidad (ISO 25010):** Código limpio, modular, tipado estricto en el frontend con interfaces de TypeScript, y buenas prácticas que prevengan errores desde el inicio.

## 4. Pruebas y Calidad (Testing)
*   Se requiere implementar una suite de pruebas automatizadas en el backend usando `pytest` o el módulo nativo `django.test`.
*   **Pruebas obligatorias a generar:** 
    1. Creación exitosa de un usuario (validando el cifrado de la contraseña).
    2. Generación del token JWT al hacer login.
    3. Agendamiento de una cita verificando la lógica de negocio (ej. que un usuario no pueda agendar en un horario ya ocupado).

## 5. Instrucciones de Generación de Código
Para cada solicitud que te haga:
1.  **Dame el código completo y listo para copiar/pegar.** No me des explicaciones teóricas extensas, necesito avanzar rápido hacia el despliegue.
2.  Indica claramente en qué archivo y ruta debo colocar el código (ej. `backend/citas/models.py`).
3.  Asegúrate de incluir los comandos de instalación de las dependencias necesarias.
4.  Comencemos siempre por el backend (Modelos, Serializadores, URLs, Vistas) antes de pasar a consumir la API en React.

¡Comencemos la construcción de MediAgenda! Genera primero la estructura de modelos (`models.py`) para Usuarios (extendiendo AbstractUser) y Citas, asegurando las relaciones correctas.
