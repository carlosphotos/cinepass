
(() => {
  const FILMS = window.CINEPASS_FILMS || [];
  const GUEST_KEY = "cinepass_guest_v2";
  const FIREBASE = window.CINEPASS_FIREBASE_CONFIG || {};
  const $ = (id) => document.getElementById(id);

  let state = { watched: [], favorites: [], currentId: null };
  let currentFilm = null;
  let user = null;
  let firebaseReady = false;
  let auth, db, fbAuth, fbStore;
  let revealed = false;

  const refs = {
    loginBtn:$("loginBtn"), userBtn:$("userBtn"), libraryBtn:$("libraryBtn"),
    watchedBtn:$("watchedBtn"), anotherBtn:$("anotherBtn"), favoriteBtn:$("favoriteBtn"),
    canvas:$("scratchCanvas"), hint:$("scratchHint"), title:$("filmTitle"), director:$("filmDirector"),
    rank:$("filmRank"), year:$("filmYear"), no:$("ticketNo"), status:$("statusMsg"),
    progressLabel:$("progressLabel"), progressBar:$("progressBar"), progressPct:$("progressPct"),
    library:$("libraryDialog"), closeLibrary:$("closeLibraryBtn"), list:$("filmList"),
    search:$("searchInput"), filter:$("libraryFilter"), dialogProgress:$("dialogProgress"),
    dialogFavorites:$("dialogFavorites"), account:$("accountDialog"), closeAccount:$("closeAccountBtn"),
    accountName:$("accountName"), accountEmail:$("accountEmail"), logout:$("logoutBtn")
  };

  function cleanState(raw={}) {
    const valid = new Set(FILMS.map(f=>f.id));
    return {
      watched: [...new Set(raw.watched || [])].filter(x=>valid.has(x)),
      favorites: [...new Set(raw.favorites || [])].filter(x=>valid.has(x)),
      currentId: valid.has(raw.currentId) ? raw.currentId : null
    };
  }
  function readGuest(){ try{return cleanState(JSON.parse(localStorage.getItem(GUEST_KEY)||"{}"))}catch{return cleanState({})} }
  function writeGuest(){ localStorage.setItem(GUEST_KEY, JSON.stringify(state)); }

  async function saveState(){
    if(user && firebaseReady){
      await fbStore.setDoc(fbStore.doc(db,"users",user.uid), {
        watched:state.watched, favorites:state.favorites, currentId:state.currentId,
        updatedAt:fbStore.serverTimestamp()
      }, {merge:true});
    } else writeGuest();
    updateProgress();
  }

  function pickFilm(forceNew=false){
    const watched = new Set(state.watched);
    let pool = FILMS.filter(f=>!watched.has(f.id));
    if(!pool.length){ showStatus("¡Completaste las 264! Puedes seguir revisando tu pasaporte."); pool=FILMS; }
    if(forceNew && currentFilm && pool.length>1) pool=pool.filter(f=>f.id!==currentFilm.id);
    currentFilm = pool[Math.floor(Math.random()*pool.length)];
    state.currentId=currentFilm.id;
    renderFilm(); saveState();
  }

  function renderFilm(){
    if(!currentFilm) return;
    refs.title.textContent=currentFilm.title;
    refs.director.textContent="Dir. "+currentFilm.director;
    refs.rank.textContent="RANK #"+currentFilm.rank;
    refs.year.textContent=currentFilm.year;
    refs.no.textContent="No. "+String(Math.floor(Math.random()*999999)).padStart(6,"0");
    refs.favoriteBtn.textContent=state.favorites.includes(currentFilm.id)?"★":"☆";
    revealed=false;
    resetScratch();
  }

  function updateProgress(){
    const n=state.watched.length, pct=Math.round(n/FILMS.length*100);
    refs.progressLabel.textContent=`${n} / ${FILMS.length}`;
    refs.progressBar.style.width=pct+"%"; refs.progressPct.textContent=pct+"%";
    refs.dialogProgress.textContent=`${n} vistas`;
    refs.dialogFavorites.textContent=`${state.favorites.length} favoritas`;
  }

  function showStatus(msg){ refs.status.textContent=msg; clearTimeout(showStatus.t); showStatus.t=setTimeout(()=>refs.status.textContent="",3500); }

  function resetScratch(){
    const c=refs.canvas, box=c.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.max(1,Math.floor(box.width*dpr)); c.height=Math.max(1,Math.floor(box.height*dpr));
    const ctx=c.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
    const grad=ctx.createLinearGradient(0,0,box.width,box.height);
    grad.addColorStop(0,"#9d2e24"); grad.addColorStop(.5,"#7f211c"); grad.addColorStop(1,"#a63a2b");
    ctx.globalCompositeOperation="source-over";ctx.fillStyle=grad;ctx.fillRect(0,0,box.width,box.height);
    ctx.globalAlpha=.18;ctx.fillStyle="#f3e4c4";
    for(let i=0;i<140;i++){ctx.beginPath();ctx.arc(Math.random()*box.width,Math.random()*box.height,Math.random()*1.4+.3,0,Math.PI*2);ctx.fill()}
    ctx.globalAlpha=1; refs.hint.classList.remove("done");
  }

  function scratchAt(clientX,clientY){
    const c=refs.canvas, r=c.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2), ctx=c.getContext("2d");
    ctx.save(); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.globalCompositeOperation="destination-out";
    ctx.beginPath();ctx.arc(clientX-r.left,clientY-r.top,28,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  let drawing=false, strokes=0;
  refs.canvas.addEventListener("pointerdown",e=>{drawing=true;refs.canvas.setPointerCapture(e.pointerId);scratchAt(e.clientX,e.clientY);strokes++});
  refs.canvas.addEventListener("pointermove",e=>{if(drawing){scratchAt(e.clientX,e.clientY);strokes++;if(strokes>28) reveal()}});
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>refs.canvas.addEventListener(ev,()=>drawing=false));
  function reveal(){ if(revealed)return; revealed=true;refs.hint.classList.add("done"); refs.canvas.style.transition="opacity .35s";refs.canvas.style.opacity="0";setTimeout(()=>{refs.canvas.style.pointerEvents="none"},360); }

  refs.watchedBtn.addEventListener("click",async()=>{
    if(!currentFilm)return;
    if(!state.watched.includes(currentFilm.id)) state.watched.push(currentFilm.id);
    await saveState(); showStatus("Marcada como vista ✓"); pickFilm(true); renderLibrary();
  });
  refs.anotherBtn.addEventListener("click",()=>pickFilm(true));
  refs.favoriteBtn.addEventListener("click",async()=>{
    if(!currentFilm)return;
    const i=state.favorites.indexOf(currentFilm.id);
    if(i>=0)state.favorites.splice(i,1);else state.favorites.push(currentFilm.id);
    refs.favoriteBtn.textContent=i>=0?"☆":"★";await saveState();renderLibrary();
  });

  function renderLibrary(){
    if(!refs.list)return;
    const q=refs.search.value.trim().toLowerCase(), filter=refs.filter.value;
    const seen=new Set(state.watched), fav=new Set(state.favorites);
    const rows=FILMS.filter(f=>{
      if(q && !(f.title+" "+f.director).toLowerCase().includes(q))return false;
      if(filter==="watched"&&!seen.has(f.id))return false;
      if(filter==="unwatched"&&seen.has(f.id))return false;
      if(filter==="favorites"&&!fav.has(f.id))return false;
      return true;
    }).sort((a,b)=>a.rank-b.rank||a.title.localeCompare(b.title));
    refs.list.innerHTML=rows.map(f=>`
      <div class="film-row" data-id="${f.id}">
        <span class="film-rank">#${f.rank}</span>
        <div class="film-name"><strong>${escapeHtml(f.title)}</strong><span>${f.year} · ${escapeHtml(f.director)}</span></div>
        <button class="icon-btn fav-row" title="Favorita">${fav.has(f.id)?"★":"☆"}</button>
        <button class="watch-toggle ${seen.has(f.id)?"on":""}">${seen.has(f.id)?"Vista ✓":"Marcar vista"}</button>
      </div>`).join("");
    updateProgress();
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  refs.list.addEventListener("click",async e=>{
    const row=e.target.closest(".film-row"); if(!row)return; const id=row.dataset.id;
    if(e.target.closest(".watch-toggle")){
      const i=state.watched.indexOf(id); if(i>=0)state.watched.splice(i,1);else state.watched.push(id);
      await saveState();renderLibrary();
    } else if(e.target.closest(".fav-row")){
      const i=state.favorites.indexOf(id);if(i>=0)state.favorites.splice(i,1);else state.favorites.push(id);
      await saveState();renderLibrary();
    }
  });
  refs.libraryBtn.addEventListener("click",()=>{renderLibrary();refs.library.showModal()});
  refs.closeLibrary.addEventListener("click",()=>refs.library.close());
  refs.search.addEventListener("input",renderLibrary); refs.filter.addEventListener("change",renderLibrary);

  function firebaseConfigured(){ return FIREBASE.apiKey && !String(FIREBASE.apiKey).includes("PEGA_AQUI") && FIREBASE.projectId && !String(FIREBASE.projectId).includes("PEGA_AQUI"); }
  async function initFirebase(){
    if(!firebaseConfigured()) return;
    try{
      const [appMod,authMod,storeMod]=await Promise.all([
        import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js")
      ]);
      const app=appMod.initializeApp(FIREBASE); auth=authMod.getAuth(app); db=storeMod.getFirestore(app);
      fbAuth=authMod;fbStore=storeMod;firebaseReady=true;
      authMod.onAuthStateChanged(auth,handleAuthState);
    }catch(err){console.error(err);showStatus("No se pudo iniciar Firebase. El modo invitado sigue funcionando.");}
  }

  async function handleAuthState(u){
    user=u;
    if(!u){
      refs.loginBtn.classList.remove("hidden");refs.userBtn.classList.add("hidden");
      state=readGuest();loadCurrent();return;
    }
    refs.loginBtn.classList.add("hidden");refs.userBtn.classList.remove("hidden");
    refs.userBtn.style.backgroundImage=u.photoURL?`url("${u.photoURL}")`:"none";
    refs.userBtn.textContent=u.photoURL?"":(u.displayName||"U").slice(0,1);
    refs.accountName.textContent=u.displayName||"Cuenta";refs.accountEmail.textContent=u.email||"";
    const snap=await fbStore.getDoc(fbStore.doc(db,"users",u.uid));
    const cloud=snap.exists()?cleanState(snap.data()):cleanState({});
    const guest=readGuest();
    state=cleanState({
      watched:[...cloud.watched,...guest.watched],
      favorites:[...cloud.favorites,...guest.favorites],
      currentId:cloud.currentId||guest.currentId
    });
    await saveState();loadCurrent();showStatus("Progreso sincronizado con tu cuenta.");
  }

  refs.loginBtn.addEventListener("click",async()=>{
    if(!firebaseConfigured()){showStatus("Primero pega la configuración de Firebase en firebase-config.js.");return}
    if(!firebaseReady){showStatus("Firebase aún no está listo.");return}
    try{const provider=new fbAuth.GoogleAuthProvider();await fbAuth.signInWithPopup(auth,provider)}
    catch(e){console.error(e);showStatus("No se pudo iniciar sesión con Google.");}
  });
  refs.userBtn.addEventListener("click",()=>refs.account.showModal());
  refs.closeAccount.addEventListener("click",()=>refs.account.close());
  refs.logout.addEventListener("click",async()=>{await fbAuth.signOut(auth);refs.account.close();showStatus("Sesión cerrada. Ahora estás en modo invitado.")});

  function loadCurrent(){
    updateProgress();
    currentFilm=FILMS.find(f=>f.id===state.currentId&&!state.watched.includes(f.id))||null;
    if(currentFilm)renderFilm();else pickFilm();
  }

  window.addEventListener("resize",()=>{if(currentFilm&&!revealed){refs.canvas.style.opacity="1";refs.canvas.style.pointerEvents="auto";resetScratch()}});
  state=readGuest();loadCurrent();initFirebase();
})();
