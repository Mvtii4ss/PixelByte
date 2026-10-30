import { Link, useParams } from 'react-router-dom';
const articulos = [
    {
        id: '1', titulo: 'Cómo Elegir los Componentes Correctos para tu Primer PC Gamer', etiqueta: 'Guía de Hardware', fecha: '01 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=900&q=80',
        resumen: 'Consejos para elegir piezas compatibles, equilibrar tu presupuesto y armar tu primer PC.',
        secciones: [
            ['1. Define el objetivo de tu setup', 'Antes de elegir componentes, define la resolución y los juegos que usarás. En 1080p competitivo la CPU y la frecuencia de actualización son muy importantes; para 4K suele pesar más el rendimiento gráfico.'],
            ['2. La tarjeta de video (GPU) y procesador (CPU)', 'Distribuye el presupuesto de acuerdo con el objetivo del equipo. Compara compatibilidad, consumo y rendimiento entre una GPU y un procesador de gama similar para evitar desequilibrios.'],
            ['3. Fuente de poder: la columna vertebral', 'Selecciona una fuente de calidad con certificación y capacidad suficiente para los componentes elegidos. Comprueba conectores y deja un margen razonable para futuras mejoras.']
        ]
    },
    {
        id: '2', titulo: 'Mantenimiento Preventivo: Extiende la Vida Útil de tu GPU', etiqueta: 'Mantenimiento', fecha: '28 de Agosto, 2026',
        imagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
        resumen: 'Consejos prácticos para mantener tu tarjeta gráfica limpia y controlar sus temperaturas.',
        secciones: [
            ['Limpieza de polvo y flujo de aire', 'El polvo acumulado puede dificultar la refrigeración. Revisa periódicamente filtros, ventiladores y flujo de aire; limpia con cuidado y con el equipo apagado.'],
            ['Cambio de pasta térmica y thermal pads', 'Cuando un equipo presenta temperaturas anormales puede ser necesaria una revisión térmica. Realizar mantenimiento interno requiere conocimientos y puede afectar la garantía.'],
            ['Monitoreo de temperaturas (hotspot)', 'Usa herramientas de monitoreo para observar temperatura del núcleo y punto caliente durante el uso. Si aparecen valores excesivos, ruido anormal o apagados, revisa la ventilación.']
        ]
    }
];
function Noticias() {
    return <main className="news-container"><section className="news-hero"><h1>Noticias & <span>Novedades Tech</span></h1><p>Guías, consejos y novedades sobre hardware y periféricos para tu PC Gaming.</p></section>
        <section className="news-grid">{articulos.map(a=><article className="news-card" key={a.id}><Link to={`/noticias/${a.id}`}><img src={a.imagen} alt={a.titulo}/><div className="card-content"><span className="news-tag">{a.etiqueta}</span><h3>{a.titulo}</h3><p>{a.resumen}</p><div className="news-meta">📅 {a.fecha}</div><span className="btn btn-outline mt-3">Leer artículo</span></div></Link></article>)}</section>
    </main>;
}
function DetalleNoticia() {
    const { id } = useParams();
    const articulo = articulos.find(a=>a.id === id);
    if (!articulo) return <main className="container my-5"><h2>Noticia no encontrada</h2><Link to="/noticias">Volver a noticias</Link></main>;
    return <main className="blog-detail-container"><Link to="/noticias">← Volver a Noticias</Link><article className="blog-content mt-4"><div className="blog-article-header"><span className="news-tag">{articulo.etiqueta}</span><h1>{articulo.titulo}</h1><p>{articulo.fecha}</p></div>
        <div className="blog-main-image"><img src={articulo.imagen} alt={articulo.titulo}/></div><p>{articulo.resumen}</p>
        {articulo.secciones.map(([titulo,contenido])=><section key={titulo}><h2>{titulo}</h2><p>{contenido}</p></section>)}
        <div className="blog-cta-box"><h3>¿Buscas componentes para tu PC?</h3><p>Explora nuestro catálogo de hardware y periféricos.</p><Link to="/productos" className="btn btn-primary">Ver productos</Link></div>
    </article></main>;
}
export { Noticias, DetalleNoticia };
