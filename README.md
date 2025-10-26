# Babylon 3D Visualization

Proyecto educativo de visualización 3D interactiva con **Babylon.js**

Autor: **Ariel Justin Amaguaña Toapanta**

## Descripción

Aplicación web que demuestra conceptos fundamentales de renderizado 3D en navegadores modernos, incluyendo:
- Primitivos 3D con texturas realistas
- Carga y visualización de modelos 3D en formato glTF
- Iluminación y sombras
- Interactividad con cámara libre

## Características

- **5 Primitivos 3D**: Cubo, esfera, cilindro, toroide y plano
- **Texturas PBR**: Madera, mármol, metal, ladrillo y pasto
- **Modelo 3D**: Yeti importado desde archivo glTF
- **Cámara interactiva**: Rotación y zoom con ratón
- **Responsive**: Se adapta al redimensionar la ventana

## Cómo ejecutar

### Con npm (recomendado)
```bash
npm install -g http-server
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:8000`

### Sin npm
Usa un servidor web estático de tu preferencia:
```bash
python -m http.server 8000
# o
npx http-server public -p 8000
```

Luego accede a `http://localhost:8000/public`

## Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos
- **JavaScript** - Lógica
- **Babylon.js** - Motor 3D
- **WebGL** - Aceleración gráfica

## Estructura del proyecto

```
public/
├── index.html              # Entrada HTML principal
├── assets/
│   ├── js/
│   │   └── app.js         # Lógica de Babylon.js
│   ├── models/            # Modelos 3D (glTF)
│   └── textures/          # Texturas PNG
```

## Licencia

MIT
