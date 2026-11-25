import { sesionActual, salir, autenticar, restaurarSesion } from './api.js';
export const obtenerSesion=sesionActual;
export const cerrarSesion=salir;
export { autenticar, restaurarSesion };
