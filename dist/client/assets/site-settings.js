(async()=>{let settings;try{const response=await fetch('/api/settings',{credentials:'same-origin',cache:'no-store'});if(!response.ok)return;settings=await response.json();}catch{return;}
const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n);
for(const element of document.querySelectorAll('[data-site-bio]'))if(settings.bio)element.textContent=settings.bio;
for(const block of document.querySelectorAll('[data-site-contact]')){
 const links=[];const add=(text,href)=>{const a=document.createElement('a');a.className='button secondary';a.textContent=text;a.href=href;links.push(a);};
 if(settings.email)add(settings.email,'mailto:'+settings.email);if(settings.phone)add(settings.phone,'tel:'+settings.phone.replace(/[^+\d]/g,''));if(settings.whatsapp)add('Contacter Morgane sur WhatsApp','https://wa.me/'+settings.whatsapp.replace(/\D/g,''));if(settings.contactUrl)add('Ouvrir le contact de Morgane',settings.contactUrl);
 if(links.length){block.replaceChildren(...links);block.hidden=false;for(const note of document.querySelectorAll('[data-contact-missing]'))note.hidden=true;}
}
const target=document.querySelector('[data-site-services]');if(target&&settings.services.length){target.hidden=false;for(const service of settings.services){const article=document.createElement('article');article.className='world';const h=document.createElement('h3');h.textContent=service.name;const price=document.createElement('p');price.className='service-price';price.textContent=(service.price===null?'Tarif à confirmer':money(service.price))+(service.duration?' · '+service.duration:'');const description=document.createElement('p');description.textContent=service.description;const link=document.createElement('a');link.className='text-link';link.href='#demande';link.textContent='Préparer une demande';article.append(h,price,description,link);target.append(article);}
 for(const select of document.querySelectorAll('[name=sujet]'))for(const service of settings.services){const option=document.createElement('option');option.textContent=service.name;select.append(option);}
 for(const note of document.querySelectorAll('[data-rates-missing]'))note.textContent='Les prestations, tarifs et durées publiés par Morgane sont présentés ci-dessus. Confirmez le créneau et les modalités avec elle avant le rendez-vous.';
}
for(const element of document.querySelectorAll('[data-site-format]'))if(settings.format){element.textContent=settings.format;element.hidden=false;}
for(const element of document.querySelectorAll('[data-site-availability]'))if(settings.availability){element.textContent=settings.availability;element.hidden=false;}
for(const element of document.querySelectorAll('[data-site-booking]'))if(settings.bookingUrl){element.href=settings.bookingUrl;element.hidden=false;}
for(const form of document.querySelectorAll('[data-message-form]')){
 const result=form.querySelector('.message-result');const links=document.createElement('div');links.className='actions';result.append(links);
 form.addEventListener('submit',()=>{links.replaceChildren();const text=form.querySelector('.message-output').value;if(!text)return;
 if(settings.email){const a=document.createElement('a');a.className='button';a.textContent='Ouvrir mon e-mail pour Morgane';a.href='mailto:'+settings.email+'?subject='+encodeURIComponent('Demande · Morgane medium')+'&body='+encodeURIComponent(text);links.append(a);}
 if(settings.whatsapp){const a=document.createElement('a');a.className='button secondary';a.textContent='Transmettre avec WhatsApp';a.href='https://wa.me/'+settings.whatsapp.replace(/\D/g,'')+'?text='+encodeURIComponent(text);a.target='_blank';a.rel='noopener';links.append(a);}
 });
}
})();
