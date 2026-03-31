const CACHE_NAME='tfsa-fhsa-tracker-shell-v15_5';
const SHELL=[
  './',
  './tfsa-fhsa-tracker_personal_v15_5_checkpoint5_hosted_polish.html',
  './tfsa-fhsa-tracker_demo_v15_5_checkpoint5_hosted_polish.html',
  './tfsa-fhsa-tracker_personal_manifest.json',
  './tfsa-fhsa-tracker_demo_manifest.json',
  './tfsa-fhsa-tracker_icon_192.png',
  './tfsa-fhsa-tracker_icon_512.png'
];
async function warmShell(){
  const cache=await caches.open(CACHE_NAME);
  for(const url of SHELL){
    try{ await cache.add(url); }catch(e){}
  }
}
self.addEventListener('install',event=>{event.waitUntil((async()=>{await warmShell(); await self.skipWaiting();})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))); await self.clients.claim();})())});
self.addEventListener('message',event=>{ if(event.data&&event.data.type==='refresh-cache'){ event.waitUntil(warmShell()); } });
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const accept=req.headers.get('accept')||'';
  if(req.mode==='navigate' || accept.includes('text/html')){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req);
        const cache=await caches.open(CACHE_NAME);
        cache.put(req,fresh.clone());
        return fresh;
      }catch(e){
        const cached=await caches.match(req);
        if(cached)return cached;
        return caches.match(req.url.includes('demo')?'./tfsa-fhsa-tracker_demo_v15_5_checkpoint5_hosted_polish.html':'./tfsa-fhsa-tracker_personal_v15_5_checkpoint5_hosted_polish.html');
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached)return cached;
    try{
      const fresh=await fetch(req);
      const cache=await caches.open(CACHE_NAME);
      cache.put(req,fresh.clone());
      return fresh;
    }catch(e){
      return cached || Response.error();
    }
  })());
});
