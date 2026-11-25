// Prueba integración real: ejecutar con backend iniciado y DEMO_PASSWORD igual al de las cuentas.
const base=process.env.API_URL||'http://localhost:8080/api/v1';
const password=process.env.DEMO_PASSWORD;
if(!password) {console.error('Configura DEMO_PASSWORD (misma clave que al iniciar backend).');process.exit(1);}
let n=0;
async function req(method,path,{token,body,cookie,expected=200}={}){
 const headers={};if(token)headers.Authorization='Bearer '+token;if(body!==undefined)headers['Content-Type']='application/json';if(cookie)headers.Cookie=cookie;
 const res=await fetch(base+path,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});const raw=await res.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}
 if(res.status!==expected)throw new Error(`${method} ${path}: esperado ${expected}, recibido ${res.status}: ${raw.slice(0,200)}`);
 console.log(`OK ${++n}: ${method} ${path} -> ${res.status}`);return {data,cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
const login=email=>req('POST','/auth/login',{body:{email,password}});
const id='TEST-'+Date.now(), product={id,nombre:'Producto prueba integración',descripcion:'Temporal',precio:10000,stock:5,stockCritico:2,categoria:'Otros',imagenUrl:''};
let admin, vendedor, cliente, order, created=false;
try{
 await req('GET','/productos');
 await req('POST','/productos',{body:product,expected:401});
 await req('POST','/auth/login',{body:{email:'admin@duoc.cl',password:password+'-incorrecta'},expected:401});
 admin=await login('admin@duoc.cl');vendedor=await login('vendedor@profesor.duoc.cl');cliente=await login('cliente@gmail.com');
 const a=admin.data.accessToken,v=vendedor.data.accessToken,c=cliente.data.accessToken;
 await req('GET','/auth/me',{token:a});
 await req('GET','/usuarios',{token:v,expected:403});
 await req('GET','/ordenes',{token:c,expected:403});
 await req('POST','/productos',{token:v,body:product,expected:403});
 await req('POST','/productos',{token:a,body:product,expected:201});created=true;
 await req('GET','/productos/'+id);
 await req('PUT','/productos/'+id,{token:a,body:{...product,precio:12000}});
 const entrega={nombre:'Prueba',email:'cliente@gmail.com',region:'Región Metropolitana de Santiago',comuna:'Santiago',direccion:'Dirección de prueba',envio:'estandar'};
 await req('POST','/ordenes',{token:c,body:{cliente:entrega,items:[{id,quantity:99}]},expected:409});
 order=(await req('POST','/ordenes',{token:c,body:{cliente:entrega,items:[{id,quantity:2}]},expected:201})).data;
 if(order.total!==24000)throw new Error('El total no fue recalculado por el backend');
 const p=(await req('GET','/productos/'+id)).data;if(p.stock!==3)throw new Error('Stock esperado 3');
 await req('GET','/ordenes/'+order.id,{token:v});
 await req('PUT','/ordenes/'+order.id,{token:v,body:{estado:'Enviado'},expected:403});
 await req('PUT','/ordenes/'+order.id,{token:a,body:{estado:'Enviado'}});
 const rotated=await req('POST','/auth/refresh',{cookie:admin.cookie});
 await req('POST','/auth/refresh',{cookie:admin.cookie,expected:401});admin=rotated;
 await req('GET','/auth/me',{token:admin.data.accessToken});
 console.log('Integración verificada. Google requiere prueba en navegador.');
}catch(e){console.error('FALLÓ:',e.message);process.exitCode=1;}
finally{
 if(admin){const token=admin.data.accessToken;try{if(order)await req('DELETE','/ordenes/'+order.id,{token,expected:204});if(created)await req('DELETE','/productos/'+id,{token,expected:204});}catch(e){console.error('Limpieza manual necesaria:',e.message);process.exitCode=1;}}
 for(const s of [admin,vendedor,cliente])if(s?.cookie){try{await req('POST','/auth/logout',{cookie:s.cookie,expected:204});}catch(e){console.error(e.message);process.exitCode=1;}}
}
