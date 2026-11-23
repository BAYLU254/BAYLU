import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import {SUPABASE_URL,SUPABASE_ANON_KEY,WHATSAPP,STORE} from "./config.js";
const sb=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=s=>document.querySelector(s),money=v=>"$"+Number(v).toLocaleString("es-AR");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TAGS={viral:"Viral",nuevo:"Nuevo",mas_vendido:"Más vendido",oferta:"Oferta"};
let P=[],C=[],q="",cat="",cart=[];
try{cart=JSON.parse(localStorage.getItem("baylu_cart")||"[]")}catch(e){}
const pct=p=>p.old_price>p.price?Math.round(100-p.price/p.old_price*100):0;
const T0=document.title,D0=document.querySelector('meta[name=description]').content;

async function load(){
  const [a,b]=await Promise.all([sb.from("products").select("*").eq("published",true).order("created_at",{ascending:false}),sb.from("categories").select("*").order("name")]);
  if(a.error||b.error){$("#app").innerHTML='<p class="msg">No se pudo cargar el catálogo. Revisá config.js y el README.</p>';return}
  P=a.data;C=b.data;route();renderCart();
}
function card(p){const d=pct(p),out=p.stock<=0,l=`#/p/${p.slug}`;
return `<article class="card"><a class="ph" href="${l}">${p.images?.[0]?`<img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy">`:esc(p.name[0])}<div class="tags">${(p.tags||[]).filter(t=>TAGS[t]).map(t=>`<b>${TAGS[t]}</b>`).join("")}${d?`<b>-${d}%</b>`:""}</div></a><h3><a href="${l}">${esc(p.name)}</a></h3><span class="price">${money(p.price)}${d?`<s>${money(p.old_price)}</s>`:""}</span><button class="add" data-id="${p.id}" ${out?"disabled":""}>${out?"Sin stock":p.variants?.length?"Elegir opción":"Agregar"}</button></article>`}
const sec=(t,l)=>l.length?`<h2>${t}</h2><div class="grid">${l.slice(0,8).map(card).join("")}</div>`:"";
function home(){
  document.title=T0;document.querySelector('meta[name=description]').content=D0;
  const chips=`<div class="chips"><button aria-pressed="${!cat}" data-c="">Todo</button>${C.map(c=>`<button aria-pressed="${cat===c.id}" data-c="${c.id}">${esc(c.name)}</button>`).join("")}</div>`;
  let L=P.filter(p=>(!cat||p.category_id===cat)&&(!q||(p.name+" "+p.description).toLowerCase().includes(q)));
  if(q||cat)return chips+`<h2>${L.length?"Resultados":"Sin resultados"}</h2><div class="grid">${L.map(card).join("")}</div>`;
  const has=t=>P.filter(p=>p.tags?.includes(t));
  return `<section class="hero"><h1>BAYLU</h1><p class="tag">PRODUCTS · TRENDS · DISCOVERIES</p><h2>Descubrí lo que está en tendencia</h2><p>Productos virales y novedosos, elegidos uno por uno.</p><a class="btn solid" href="#catalogo">Ver catálogo</a></section>${chips}`
  +sec("Virales",has("viral"))+sec("Más vendidos",has("mas_vendido"))+sec("Novedades",has("nuevo"))+sec("Ofertas",P.filter(p=>p.tags?.includes("oferta")||pct(p)>0))+sec("Recomendados",has("destacado"))
  +`<span id="catalogo"></span>`+sec("Todo el catálogo",P.length?P.slice(0,60):[])+(P.length?"":'<p class="msg">Todavía no hay productos publicados.</p>')
  +`<div class="benefits">${STORE.benefits.map(b=>`<div><h3>${esc(b[0])}</h3><p>${esc(b[1])}</p></div>`).join("")}</div>`;
}
function detail(slug){
  const p=P.find(x=>x.slug===slug);if(!p)return '<p class="msg">Producto no disponible. <a href="#/" style="color:var(--hi)">Volver a la tienda</a></p>';
  const d=pct(p),url=location.href,imgs=p.images||[],rel=P.filter(x=>x.id!==p.id&&x.category_id&&x.category_id===p.category_id).concat(P.filter(x=>x.id!==p.id&&x.category_id!==p.category_id)).slice(0,4);
  document.title=`${p.name} · BAYLU`;document.querySelector('meta[name=description]').content=(p.description||"").slice(0,155);
  const ld=document.createElement("script");ld.type="application/ld+json";ld.id="ld";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:p.name,description:p.description,image:imgs,offers:{"@type":"Offer",priceCurrency:"ARS",price:p.price,availability:p.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock"}});
  document.getElementById("ld")?.remove();document.head.appendChild(ld);
  return `<div class="detail"><div><div class="ph" style="font-size:90px">${imgs[0]?`<img id="main" src="${esc(imgs[0])}" alt="${esc(p.name)}">`:esc(p.name[0])}</div>${imgs.length>1?`<div class="thumbs">${imgs.map(i=>`<img src="${esc(i)}" alt="">`).join("")}</div>`:""}</div>
  <div><h1>${esc(p.name)}</h1><span class="price" style="font-size:26px">${money(p.price)}${d?`<s>${money(p.old_price)}</s> · -${d}%`:""}</span>
  <p style="color:var(--mute);white-space:pre-line">${esc(p.description)}</p>
  ${p.variants?.length?`<label for="v">Opción</label><select id="v">${p.variants.map(v=>`<option>${esc(v)}</option>`).join("")}</select>`:""}
  <p class="stock">${p.stock<=0?"Sin stock":p.stock<=5?"Quedan pocas unidades":"Disponible"}</p>
  <label for="qty" style="color:var(--mute);font-size:13px">Cantidad</label><input id="qty" type="number" min="1" max="${Math.max(p.stock,1)}" value="1" style="width:100%;padding:11px;background:var(--surface);color:var(--hi);border:1px solid var(--line);margin:6px 0 16px;font:400 15px var(--body)"><button class="btn solid" id="addd" style="width:100%" ${p.stock<=0?"disabled":""}>Agregar al carrito</button>
  <div class="share"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(p.name+" "+url)}">Compartir</a><button class="btn" id="copy">Copiar link</button></div></div></div>${sec("También te puede gustar",rel)}`;
}
function route(){
  const h=location.hash,m=h.match(/^#\/p\/(.+)$/);
  $("#app").innerHTML=m?detail(decodeURIComponent(m[1])):home();
  if(m){const p=P.find(x=>x.slug===decodeURIComponent(m[1]));
    $("#addd")?.addEventListener("click",()=>add(p,$("#v")?.value||"",Math.max(1,parseInt($("#qty").value)||1)));
    $("#copy")?.addEventListener("click",e=>{navigator.clipboard?.writeText(location.href);e.target.textContent="Link copiado"});
    document.querySelectorAll(".thumbs img").forEach(i=>i.onclick=()=>{$("#main").src=i.src});window.scrollTo(0,0)}
  else if(h&&h!=="#/"&&h!=="#catalogo"){}
}
function save(){localStorage.setItem("baylu_cart",JSON.stringify(cart))}
function add(p,v,n=1){const i=cart.find(x=>x.id===p.id&&x.v===v);if(i){i.q=Math.min(p.stock,i.q+n)}else cart.push({id:p.id,v,q:Math.min(n,p.stock)});save();renderCart();openCart()}
function renderCart(){
  cart=cart.filter(i=>P.find(p=>p.id===i.id));
  let sub=0,tot=0,n=0,msg="Hola BAYLU, quiero hacer este pedido:\n";
  $("#lines").innerHTML=cart.length?"":'<p style="color:var(--mute)">Tu carrito está vacío.</p>';
  cart.forEach((i,k)=>{const p=P.find(x=>x.id===i.id);sub+=i.q*(p.old_price>p.price?p.old_price:p.price);tot+=i.q*p.price;n+=i.q;
    msg+=`• ${i.q} x ${p.name}${i.v?" ("+i.v+")":""} - ${money(i.q*p.price)}\n`;
    const d=document.createElement("div");d.className="line";
    d.innerHTML=`<span>${esc(p.name)}${i.v?`<br><small style="color:var(--mute)">${esc(i.v)}</small>`:""}<br><small>${money(p.price)}</small></span><span class="qty"><button aria-label="Quitar uno">−</button>${i.q}<button aria-label="Agregar uno">+</button></span>`;
    const b=d.querySelectorAll("button");b[0].onclick=()=>{i.q--;if(!i.q)cart.splice(k,1);save();renderCart()};b[1].onclick=()=>{if(i.q<p.stock)i.q++;save();renderCart()};
    $("#lines").appendChild(d)});
  $("#count").textContent=n;
  $("#sums").innerHTML=`<div class="sum"><span>Subtotal</span><span>${money(sub)}</span></div><div class="sum"><span>Descuentos</span><span>-${money(sub-tot)}</span></div><div class="sum t"><span>Total</span><span>${money(tot)}</span></div>`;
  const w=$("#wa");w.style.opacity=n?1:.4;w.style.pointerEvents=n?"auto":"none";
  w.href=n?checkout(msg+`Total: ${money(tot)}`):"#";
}
// El pedido se envía por WhatsApp al número de config.js.
function checkout(message){return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`}
const openCart=()=>{$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false")};
const closeCart=()=>{$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true")};
$("#open").onclick=openCart;$("#close").onclick=closeCart;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});
document.addEventListener("click",e=>{
  const a=e.target.closest(".add");if(a){const p=P.find(x=>x.id===a.dataset.id);if(p.variants?.length)location.hash=`#/p/${p.slug}`;else add(p,"")}
  const c=e.target.closest(".chips button");if(c){cat=c.dataset.c;route()}});
$("#q").addEventListener("input",e=>{q=e.target.value.trim().toLowerCase();if(location.hash.startsWith("#/p/"))location.hash="#/";else route()});
window.addEventListener("hashchange",route);
$("#promo").textContent=STORE.promo;
$("#foot").innerHTML=`<span>BAYLU · Products · Trends · Discoveries</span><span><a href="https://wa.me/${WHATSAPP}">WhatsApp</a> · <a href="${STORE.instagram}">Instagram</a> · ${esc(STORE.email)}</span><span>Políticas de envío, cambios y privacidad: completar antes de publicar.</span>`;
load();
