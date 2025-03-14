// Cargar variables de entorno desde .env
require('dotenv').config();

console.log('Verificando variables de entorno:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'No definida');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Definida' : 'No definida');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Definida' : 'No definida');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definida' : 'No definida');
console.log('NODE_ENV:', process.env.NODE_ENV ? process.env.NODE_ENV : 'No definida');

// Verificar la ruta del archivo .env
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(process.cwd(), '.env');
console.log('Ruta del archivo .env:', envPath);
console.log('El archivo .env existe:', fs.existsSync(envPath) ? 'Sí' : 'No');

if (fs.existsSync(envPath)) {
  console.log('Contenido del archivo .env:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
} 