# Portfolio Personal de Kawacoline

¡Bienvenido/a al portfolio personal de Kawacoline!

## Estructura del Proyecto

```
Kawaweb/
├── index.html         # Página principal del portfolio
├── style.css          # Estilos y apariencia visual
├── script.js          # Lógica e interactividad (modales, visualizador de audio, etc.)
├── readme.md          # Este archivo
└── assets/            # Recursos multimedia
    ├── PFP.jpg                # Imagen de perfil
    ├── click.mp3              # Sonido de clic
    ├── background_music.mp3   # Música de fondo
    └── PLAYLIST/              # Carpeta de música adicional
        ├── ANGUISH, EXILED, elfass - Gulyau.mp3
        ├── its rainy outside.mp3
        ├── Silentroom vs Frums - Aegleseeker.mp3
        └── World execute (me)   Mili.mp3
```

## Descripción General

Este portfolio es una web personal con temática oscura, animaciones, ventanas modales interactivas y un visualizador de audio usando p5.js. Incluye enlaces a redes sociales, sección de trabajos, galería de ilustraciones y contacto.

### Funcionalidades principales
- **Visualizador de audio** con p5.js y control de volumen/mute.
- **Ventanas modales** para About, Links, Work, FAQ y Contact, con soporte para minimizar, maximizar, arrastrar y cerrar.
- **Sección de trabajos** con herramientas, tecnologías, animaciones (videos de YouTube), galería de ilustraciones y proyectos de desarrollo.
- **Estilo personalizado** con variables CSS y fuentes de Google Fonts.
- **Sonidos** para clics e interacción.
- **Soporte para playlist**: puedes agregar más canciones en la carpeta `assets/PLAYLIST`.

## Descripción del Proyecto

Este proyecto es un portfolio interactivo que combina ilustración, animación, diseño web y desarrollo de aplicaciones. Está diseñado para mostrar las habilidades y proyectos de Kawacoline de una manera visualmente atractiva e interactiva.

### Características Principales

1. **Visualizador de Audio**: Utiliza la biblioteca `p5.js` para crear un visualizador de audio interactivo que responde a la música reproducida.
2. **Reproductor de Música**: Incluye un reproductor de música con controles de reproducción, pausa, volumen y navegación entre canciones.
3. **Modales Interactivos**: Ventanas modales que muestran información sobre herramientas, proyectos, ilustraciones y animaciones.
4. **Galería de Imágenes**: Una galería que presenta ilustraciones y diseños visuales.
5. **Integración de Videos**: Reproducción de videos directamente desde YouTube.
6. **Diseño Responsivo**: Adaptado para diferentes tamaños de pantalla y dispositivos.

### Tecnologías Utilizadas

- **HTML5**: Estructura del contenido.
- **CSS3**: Estilización y diseño visual.
- **JavaScript**: Lógica e interactividad.
- **p5.js**: Visualización de audio.
- **Cloudinary**: Almacenamiento y entrega de archivos multimedia.

### Cómo Funciona

- **Interacción Global**: El sitio detecta interacciones globales del usuario (clics o teclas) para activar el contexto de audio y garantizar una experiencia fluida.
- **Reproductor de Música**: Gestiona una lista de reproducción con canciones y sus respectivas carátulas.
- **Modales**: Permiten mostrar información detallada sobre diferentes secciones del portfolio, como herramientas utilizadas, proyectos destacados y más.
- **Galería y Videos**: Presenta ilustraciones y animaciones en un formato atractivo y accesible.

## Cómo usar

1. Clona o descarga este repositorio en tu PC.
2. Abre `index.html` en tu navegador para ver el portfolio.
3. Personaliza los textos, imágenes y enlaces en `index.html` y `script.js` según tus necesidades.
4. Cambia los estilos en `style.css` modificando las variables CSS para adaptar la paleta de colores o la fuente.
5. Reemplaza los archivos en `assets/` para usar tu propia imagen de perfil, música o sonidos.
6. Agrega o elimina canciones en `assets/PLAYLIST` para modificar la playlist de fondo.

## Personalización
- Edita los textos y enlaces en `index.html` y `script.js`.
- Cambia las imágenes y videos en la sección de trabajo desde `script.js`.
- Modifica los colores principales en `style.css` (variables CSS al inicio del archivo).
- Cambia la fuente principal en la variable `--font-primary`.
- Reemplaza `click.mp3` y `background_music.mp3` en la carpeta `assets` con tus propios archivos.
- Agrega tus propias canciones en la carpeta `assets/PLAYLIST`.

## Notas adicionales
- Los iconos abren ventanas modales interactivas.
- El visualizador de audio responde a la música de fondo.
- Asegúrate de que los archivos multimedia estén correctamente enlazados y en formatos compatibles.

---

© 2024-2025 Kawacoline. Proyecto actualizado el 15 de mayo de 2025.