// API REST. El access token vive en memoria; el refresh token en cookie HttpOnly.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');
let accessToken = null, usuario = null, refreshing = null;
function publicar(data) {
    accessToken = data?.accessToken || null;
    usuario = data?.usuario || null;
    window.dispatchEvent(new Event('pixelbyte-sesion'));
}
export function sesionActual() { return usuario; }
async function request(path, {method='GET', body, token=null}={}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type']='application/json';
    if (token) headers.Authorization=`Bearer ${token}`;
    let response;
    try { response=await fetch(`${BASE}${path}`, {method, headers, credentials:'include', ...(body!==undefined?{body:JSON.stringify(body)}:{})}); }
    catch { throw new Error('No se pudo conectar con PixelByte API. Comprueba que el backend esté iniciado.'); }
    const raw = await response.text();
    let data; try { data=JSON.parse(raw); } catch { data=raw; }
    if (!response.ok) { const err=new Error(data?.message || (typeof data==='string'&&data) || ({401:'Debes iniciar sesión.',403:'No tienes permisos para esta operación.',404:'Registro no encontrado.',409:'Conflicto de datos.'}[response.status]) || `Error HTTP ${response.status}`);err.status=response.status;throw err; }
    return data || null;
}
export async function restaurarSesion() {
    if (!refreshing) refreshing=request('/auth/refresh',{method:'POST'}).then(data=>{publicar(data);return data.usuario;}).catch(()=>{publicar(null);return null;}).finally(()=>{refreshing=null;});
    return refreshing;
}
export async function autenticar(path, body) {const data=await request(`/auth/${path}`,{method:'POST',body});publicar(data);return data.usuario;}
export async function salir() {try { await request('/auth/logout',{method:'POST'}); } finally { publicar(null); }}
export async function api(path, opts={}) {
    const {auth=false,...rest}=opts;
    if (auth && !accessToken && !await restaurarSesion()) throw new Error('Debes iniciar sesión.');
    try { return await request(path,{...rest,token:auth?accessToken:null}); }
    catch(e) { if(auth&&e.status===401&&await restaurarSesion()) return request(path,{...rest,token:accessToken});throw e; }
}
