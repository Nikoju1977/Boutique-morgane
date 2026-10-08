const ADMIN_HTML = '';
const DEFAULTS = { bio: '', email: '', phone: '', whatsapp: '', contactUrl: '', bookingUrl: '', format: '', availability: '', services: [], managerEmail: '' };
const lower = value => String(value || '').trim().toLowerCase();
const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
async function loadSettings(env) {
  if (!env.DB) throw new Error('Database unavailable');
  const row = await env.DB.prepare('SELECT content, revision, updated_at FROM site_settings WHERE id = ?').bind(1).first();
  return row ? {settings: {...DEFAULTS,...JSON.parse(row.content)}, revision: row.revision, updatedAt: row.updated_at} : {settings: {...DEFAULTS, managerEmail: lower(env.SITE_MANAGER_EMAIL)},revision:0,updatedAt:null};
}
function validateSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Informations invalides.');
  const settings={...DEFAULTS};
  const lengths={bio:5000,email:254,phone:40,whatsapp:24,contactUrl:1000,bookingUrl:1000,format:500,availability:1500,managerEmail:254};
  for (const [key,max] of Object.entries(lengths)) {
    if (typeof value[key] !== 'string' || value[key].length>max) throw new Error('Champ invalide : '+key);
    settings[key]=value[key].trim();
  }
  for (const key of ['email','managerEmail']) {
    settings[key]=lower(settings[key]);
    if (settings[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings[key])) throw new Error('Adresse e-mail invalide.');
  }
  for (const key of ['contactUrl','bookingUrl']) if (settings[key]) {
    const url=new URL(settings[key]);
    if(url.protocol!=='https:' || url.username || url.password) throw new Error('Utilisez un lien https valide.');
    settings[key]=url.href;
  }
  if(settings.phone&&!/^\+?[\d\s().-]{5,40}$/.test(settings.phone)) throw new Error('Téléphone invalide.');
  if(settings.whatsapp&&!/^\+?[\d\s().-]{8,24}$/.test(settings.whatsapp)) throw new Error('Numéro WhatsApp invalide.');
  if(!Array.isArray(value.services)||value.services.length>30) throw new Error('Liste des prestations invalide.');
  settings.services=value.services.map(service=>{
    if(!service||typeof service!=='object'||typeof service.name!=='string'||!service.name.trim()||service.name.length>100||typeof service.description!=='string'||service.description.length>1200||typeof service.duration!=='string'||service.duration.length>80||typeof service.published!=='boolean') throw new Error('Prestation invalide.');
    if(service.price!==null&&(!Number.isFinite(service.price)||service.price<0||service.price>10000))throw new Error('Tarif invalide.');
    return {name:service.name.trim(),description:service.description.trim(),duration:service.duration.trim(),price:service.price,published:service.published};
  });
  return settings;
}
async function allowed(request,env,state) {
  const id=request.headers.get('oai-authenticated-user-id');
  const email=lower(request.headers.get('oai-authenticated-user-email'));
  const owner=lower(env.SITE_OWNER_EMAIL);
  const isOwner=Boolean(id&&email&&owner&&email===owner);
  const designatedManager=lower(env.SITE_MANAGER_EMAIL);
  return {email,isOwner,allowed:isOwner||Boolean(id&&email&&((state.settings.managerEmail&&email===lower(state.settings.managerEmail))||(designatedManager&&email===designatedManager)))};
}
function safePublic(state) {
  const {managerEmail,...settings}=state.settings;
  return {...settings,services:settings.services.filter(s=>s.published),updatedAt:state.updatedAt};
}
export default {
  async fetch(request,env) {
    const url=new URL(request.url),path=url.pathname;
    try {
      if(path==='/api/settings') {
        if(request.method!=='GET')return json({error:'Méthode non autorisée.'},405);
        return json(safePublic(await loadSettings(env)));
      }
      if(path==='/api/admin/settings') {
        const state=await loadSettings(env),actor=await allowed(request,env,state);
        if(!actor.allowed)return json({error:'Connectez-vous avec un compte autorisé pour gérer ce site.'},403);
        if(request.method==='GET')return json({...state,actor:{email:actor.email,isOwner:actor.isOwner}});
        if(request.method!=='PUT')return json({error:'Méthode non autorisée.'},405);
        if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Origine non autorisée.'},403);
        if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'Format JSON requis.'},415);
        const bodyText=await request.text();if(bodyText.length>50000)return json({error:'Informations trop longues.'},413);
        let body,settings;try{body=JSON.parse(bodyText);settings=validateSettings(body.settings);}catch(error){return json({error:error.message||'Informations invalides.'},400);}
        if(!Number.isInteger(body.revision)||body.revision!==state.revision)return json({error:'Ces informations ont été modifiées ailleurs. Rechargez la page avant d’enregistrer.'},409);
        if(!actor.isOwner&&settings.managerEmail!==state.settings.managerEmail)return json({error:'Seul le propriétaire peut changer le compte de gestion.'},403);
        const updatedAt=new Date().toISOString(),revision=state.revision+1;
        const content=JSON.stringify(settings);
        const result=state.revision===0&&state.updatedAt===null
          ? await env.DB.prepare('INSERT INTO site_settings (id, content, revision, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(1,content,revision,updatedAt).run()
          : await env.DB.prepare('UPDATE site_settings SET content = ?, revision = ?, updated_at = ? WHERE id = ? AND revision = ?').bind(content,revision,updatedAt,1,state.revision).run();
        if(result.meta?.changes!==1)return json({error:'Une autre modification vient d’être enregistrée. Rechargez la page.'},409);
        return json({settings,revision,updatedAt,actor:{email:actor.email,isOwner:actor.isOwner}});
      }
      if(path==='/admin'||path.startsWith('/admin/')) {
        const state=await loadSettings(env),actor=await allowed(request,env,state);
        if(!actor.allowed){const hasUser=request.headers.has('oai-authenticated-user-id');return new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Accès à la gestion · Morgane medium</title><body style="background:#0c1718;color:#f0eee6;font:18px/1.6 Georgia;padding:10vw"><h1>Espace de Morgane</h1><p>'+ (hasUser?'Ce compte ne possède pas l’accès à la gestion. Le propriétaire doit autoriser votre adresse e-mail et vous partager le site.':'Connectez-vous au compte autorisé pour gérer les informations de Morgane.')+'</p><a style="color:#d9bd86" target="_top" href="/signin-with-chatgpt?return_to=%2Fadmin%2F">Se connecter avec ChatGPT</a><p><a style="color:#d9bd86" href="/">Retour au site</a></p></body></html>',{status:hasUser?403:401,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}});}
        if(path!=='/admin/')return Response.redirect(new URL('/admin/',url),302);
        return new Response(ADMIN_HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
      }
      return env.ASSETS.fetch(request);
    } catch(error) {
      console.error('Morgane settings request failed',error.message);
      return json({error:'Les informations sont temporairement indisponibles. Vos modifications ne sont pas perdues : réessayez sans fermer la page.'},503);
    }
  }
};
