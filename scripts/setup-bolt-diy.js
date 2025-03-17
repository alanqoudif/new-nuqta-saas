const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Rutas
const boltDiyPath = path.join(__dirname, '..', '..', 'bolt.diy');
const publicBoltDiyPath = path.join(__dirname, '..', 'public', 'bolt-diy');

// Función principal
async function setupBoltDiy() {
  console.log('Configurando bolt.diy para Nuqta AI...');

  // Verificar si el directorio bolt.diy existe
  if (!fs.existsSync(boltDiyPath)) {
    console.error('Error: No se encontró el directorio bolt.diy. Asegúrate de clonar el repositorio bolt.diy primero.');
    console.log('Ejecuta: git clone https://github.com/stackblitz-labs/bolt.diy.git');
    process.exit(1);
  }

  try {
    // Construir bolt.diy
    console.log('Construyendo bolt.diy...');
    execSync('cd ' + boltDiyPath + ' && npm install && npm run build', { stdio: 'inherit' });

    // Copiar archivos de build a public/bolt-diy
    console.log('Copiando archivos a public/bolt-diy...');
    
    // Asegurarse de que el directorio destino existe
    if (!fs.existsSync(publicBoltDiyPath)) {
      fs.mkdirSync(publicBoltDiyPath, { recursive: true });
    }

    // Copiar archivos de la carpeta dist
    const distPath = path.join(boltDiyPath, 'dist');
    copyFolderRecursiveSync(distPath, publicBoltDiyPath);

    // Personalizar el título y otros elementos
    customizeBoltDiy();

    console.log('¡bolt.diy configurado correctamente para Nuqta AI!');
  } catch (error) {
    console.error('Error al configurar bolt.diy:', error);
    process.exit(1);
  }
}

// Función para copiar carpetas recursivamente
function copyFolderRecursiveSync(source, target) {
  // Verificar si el directorio fuente existe
  if (!fs.existsSync(source)) {
    return;
  }

  // Crear directorio destino si no existe
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Leer todos los archivos/carpetas del directorio fuente
  const files = fs.readdirSync(source);

  // Copiar cada archivo/carpeta
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    // Si es un directorio, llamar recursivamente
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      // Si es un archivo, copiarlo
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Función para personalizar bolt.diy
function customizeBoltDiy() {
  console.log('Personalizando bolt.diy para Nuqta AI...');

  // Modificar el archivo index.html para cambiar el título y otros elementos
  const indexPath = path.join(publicBoltDiyPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Cambiar el título
    htmlContent = htmlContent.replace(/<title>.*?<\/title>/, '<title>Nuqta AI Site Builder</title>');
    
    // Agregar metadatos personalizados
    htmlContent = htmlContent.replace('</head>', `
  <meta name="description" content="Nuqta AI Site Builder - Crea sitios web impresionantes con IA">
  <meta name="theme-color" content="#111827">
</head>`);
    
    // Guardar los cambios
    fs.writeFileSync(indexPath, htmlContent);
    console.log('Archivo index.html personalizado correctamente.');
  } else {
    console.warn('No se encontró el archivo index.html para personalizar.');
  }
}

// Ejecutar la función principal
setupBoltDiy(); 