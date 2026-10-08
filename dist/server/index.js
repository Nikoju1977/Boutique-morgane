const ADMIN_HTML = "<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Espace de gestion · Morgane medium</title><meta name=\"robots\" content=\"noindex,nofollow\"><link rel=\"stylesheet\" href=\"../assets/universe.css\"><link rel=\"icon\" href=\"../assets/favicon.svg\"></head><body><header class=\"site-header\"><a class=\"wordmark\" href=\"../\">Morgane <span>medium</span></a><nav><a href=\"../consultation/\">Voir les consultations</a><a href=\"../contact/\">Voir le contact</a><a href=\"/signout-with-chatgpt?return_to=%2F\">Se déconnecter</a></nav></header><main class=\"container admin-main\"><div class=\"section-title\"><div><div class=\"eyebrow\">Votre espace de gestion</div><h1 class=\"intro-title\">Votre site,<br><em>à votre façon.</em></h1><p>Modifiez vos informations, puis enregistrez-les pour les afficher sur le site.</p></div><div><p id=\"admin-account\"></p><a class=\"button secondary\" href=\"../\" target=\"_blank\" rel=\"noopener\">Voir le site</a></div></div><p id=\"admin-status\" class=\"note\" role=\"status\">Chargement de vos informations…</p><form id=\"admin-form\"><fieldset id=\"admin-fields\" disabled><section class=\"admin-section\"><div><div class=\"eyebrow\">01 · Présentation</div><h2>Parlez de vous.</h2><p>Ce texte apparaît sur la page Morgane.</p></div><div><label>Votre présentation<textarea name=\"bio\" rows=\"7\" maxlength=\"5000\" placeholder=\"Présentez-vous avec vos propres mots : votre approche, votre parcours, ce que vous proposez…\"></textarea></label></div></section><section class=\"admin-section\"><div><div class=\"eyebrow\">02 · Contact</div><h2>Comment vous joindre.</h2><p>Renseignez uniquement les coordonnées que vous souhaitez afficher aux visiteurs. Vous pouvez laisser un champ vide.</p></div><div class=\"admin-grid\"><label>E-mail de contact<input name=\"email\" type=\"email\" maxlength=\"254\" autocomplete=\"email\"></label><label>Téléphone public<input name=\"phone\" type=\"tel\" maxlength=\"40\" placeholder=\"+33…\"></label><label>WhatsApp<input name=\"whatsapp\" type=\"tel\" maxlength=\"24\" placeholder=\"Numéro avec indicatif international\"></label><label>Lien de contact ou réseau social<input name=\"contactUrl\" type=\"url\" maxlength=\"1000\" placeholder=\"https://…\"></label></div></section><section class=\"admin-section\"><div><div class=\"eyebrow\">03 · Rendez-vous</div><h2>Le cadre de vos consultations.</h2><p>Ces informations apparaîtront sur la page Consultation.</p></div><div><label>Formats proposés<input name=\"format\" maxlength=\"500\" placeholder=\"Par exemple : téléphone, visioconférence, en présentiel…\"></label><label>Disponibilités et modalités<textarea name=\"availability\" rows=\"4\" maxlength=\"1500\" placeholder=\"Vos horaires habituels, comment demander un créneau, le lieu si vous souhaitez le publier…\"></textarea></label><label>Lien de réservation <span>(facultatif)</span><input name=\"bookingUrl\" type=\"url\" maxlength=\"1000\" placeholder=\"https://…\"></label><p class=\"form-note\">Si vous disposez déjà d’un agenda en ligne, ajoutez son lien. Le site ouvrira cet agenda ; il ne créera pas lui-même de réservation.</p></div></section><section class=\"admin-section\"><div><div class=\"eyebrow\">04 · Prestations</div><h2>Vos offres et vos tarifs.</h2><p>Ajoutez chaque prestation. Une offre non publiée reste visible uniquement dans cet espace de gestion.</p></div><div><div id=\"admin-services\"></div><button class=\"button secondary\" id=\"add-service\" type=\"button\">Ajouter une prestation</button></div></section><section class=\"admin-section\" id=\"manager-access\" hidden><div><div class=\"eyebrow\">05 · Compte de Morgane</div><h2>Autoriser sa gestion.</h2><p>Le propriétaire peut indiquer le compte avec lequel Morgane modifiera le site. Le site privé doit également lui être partagé dans les réglages de partage.</p></div><div><label>E-mail du compte ChatGPT de Morgane<input name=\"managerEmail\" type=\"email\" maxlength=\"254\" placeholder=\"Compte de Morgane\"></label><p class=\"form-note\">Ce champ reste privé. L’e-mail de gestion peut être différent de l’e-mail de contact public. Son enregistrement n’envoie aucune invitation.</p></div></section><div class=\"admin-save\"><button class=\"button\" id=\"save-settings\" type=\"submit\">Enregistrer et publier mes informations</button><p id=\"admin-save-status\" role=\"status\"></p></div></fieldset></form><p class=\"form-note\">Les informations sont enregistrées pour l’ensemble du site et restent disponibles sur vos autres appareils après connexion.</p></main><script src=\"../assets/admin.js\"></script></body></html>\n";
const DEFAULTS = { bio: '', email: '', phone: '', whatsapp: '', contactUrl: '', bookingUrl: '', format: '', availability: '', services: [], managerEmail: '' };
const lower = value => String(value || '').trim().toLowerCase();
const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
async function loadSettings(env) {
  if (!env.DB) throw new Error('Database unavailable');
  const row = await env.DB.prepare('SELECT content, revision, updated_at FROM site_settings WHERE id = ?').bind(1).first();
  return row ? {settings: {...DEFAULTS,...JSON.parse(row.content)}, revision: row.revision, updatedAt: row.updated_at} : {settings: {...DEFAULTS},revision:0,updatedAt:null};
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
  return {email,isOwner,allowed:isOwner||Boolean(id&&email&&state.settings.managerEmail&&email===lower(state.settings.managerEmail))};
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
