import { api } from './api.js';
export const obtenerUsuarios=()=>api('/usuarios',{auth:true});
export const registrarUsuario=body=>api('/auth/registro',{method:'POST',body});
export const guardarUsuarioApi=(body,id)=>api('/usuarios'+(id?'/'+encodeURIComponent(id):''),{method:id?'PUT':'POST',body,auth:true});
export const eliminarUsuarioApi=id=>api('/usuarios/'+encodeURIComponent(id),{method:'DELETE',auth:true});
