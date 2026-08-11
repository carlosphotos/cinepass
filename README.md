# CinePass MVP

Prototipo de una app web para descubrir al azar películas de la encuesta de críticos de Sight & Sound 2022 mediante un boleto raspable.

## Incluye

- 264 títulos (el Top 250 oficial contiene más de 250 entradas por los empates).
- Boleto raspable compatible con mouse y touch.
- Modo invitado con progreso guardado en `localStorage`.
- Marcar películas como vistas y favoritas.
- Pasaporte con buscador y filtros.
- Selección aleatoria que evita las películas marcadas como vistas.
- Preparado para iniciar sesión con Google usando Firebase Authentication.
- Sincronización del progreso por usuario con Cloud Firestore.
- Reglas de Firestore incluidas para que cada usuario solo acceda a su documento.

## Probarlo ya

El modo invitado funciona sin Firebase. Para evitar restricciones del navegador con archivos locales, levanta un servidor sencillo desde esta carpeta:

```bash
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Activar Google + sincronización

1. Crea un proyecto en Firebase Console.
2. Agrega una aplicación Web.
3. En Authentication, habilita el proveedor Google.
4. Crea una base de datos Cloud Firestore.
5. Copia la configuración Web de Firebase en `firebase-config.js`.
6. En Firestore > Rules, pega el contenido de `firestore.rules` y publícalo.
7. En Authentication > Settings > Authorized domains, agrega el dominio de GitHub Pages cuando publiques el sitio.

Cuando alguien inicia sesión, el progreso que tenga en el navegador se fusiona con el de su cuenta.

## Publicar en GitHub Pages

Sube todos los archivos a la raíz de un repositorio. En GitHub: **Settings > Pages > Deploy from a branch > main / root**.

## Archivos

- `index.html`: interfaz.
- `styles.css`: diseño.
- `films.js`: catálogo.
- `app.js`: raspado, selección aleatoria, progreso, Firebase.
- `firebase-config.js`: configuración que debes rellenar.
- `firestore.rules`: aislamiento de datos por usuario.

## Siguiente iteración sugerida

Añadir pósteres/licencias de imágenes, estadísticas por década/país, logros, listas sociales, compartir boleto y una capa de datos de disponibilidad de streaming.
