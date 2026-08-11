
(() => {
  const FILMS = window.REELSTUB_FILMS || window.CINEPASS_FILMS || [];
  const GUEST_KEY = "reelstub_guest_v1";
  const LEGACY_GUEST_KEY = "cinepass_guest_v2";
  const FIREBASE = window.REELSTUB_FIREBASE_CONFIG || window.CINEPASS_FIREBASE_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const LANG_KEY = "reelstub_lang_v1";
  const LEGACY_LANG_KEY = "cinepass_lang_v1";
  // Preserve progress and language from the CinePass prototype after the rename.
  if(!localStorage.getItem(GUEST_KEY) && localStorage.getItem(LEGACY_GUEST_KEY)) localStorage.setItem(GUEST_KEY, localStorage.getItem(LEGACY_GUEST_KEY));
  if(!localStorage.getItem(LANG_KEY) && localStorage.getItem(LEGACY_LANG_KEY)) localStorage.setItem(LANG_KEY, localStorage.getItem(LEGACY_LANG_KEY));
  const I18N = {
    es:{
      heroEyebrow:"TU LOTERÍA PERSONAL DE CINE", heroAdmit:"UNA ENTRADA", heroLede:"Raspa para descubrir la película de esta noche.",
      passport:"Mi pasaporte", login:"Entrar con Google", watched:"✓ Ya la vi", another:"↻ Dame otra", progressCopy:"películas vistas",
      admitOne:"UNA ENTRADA", ticketWord:"BOLETO", tonightsScreening:"FUNCIÓN DE ESTA NOCHE", oneFilmOneNight:"UNA PELÍCULA · UNA NOCHE",
      scratch:"RASPA PARA REVELAR", tonightFilm:"Película de esta noche", scratchToReveal:"Raspa para revelar", director:"Dir. ", rank:"PUESTO #",
      nameSummary:"¿Por qué ReelStub?", nameText:"Reel hace referencia al rollo de película del cine tradicional, y stub al talón que queda de un boleto después de entrar a una función. ReelStub une ambas ideas: descubrir grandes películas y conservar un pequeño recuerdo de cada una que vas viendo.",
      aboutSummary:"Acerca de la selección", aboutText:"La selección inicial de ReelStub corresponde a las 264 películas incluidas en el Top 250 de la encuesta de críticos de Sight & Sound 2022, conservando los empates del ranking.",
      libraryEyebrow:"Mi pasaporte", libraryTitle:"Las 264 películas", search:"Buscar película o director…", filters:{all:"Todas",unwatched:"Pendientes",watched:"Vistas",favorites:"Favoritas"},
      seenCount:n=>`${n} vistas`, favCount:n=>`${n} favoritas`, seen:"Vista ✓", markSeen:"Marcar vista", favorite:"Favorita",
      account:"Cuenta", accountCopy:"Tu progreso está sincronizado con esta cuenta.", logout:"Cerrar sesión",
      completed:"¡Completaste las 264! Puedes seguir revisando tu pasaporte.", markedSeen:"Marcada como vista ✓",
      firebaseFail:"No se pudo iniciar Firebase. El modo invitado sigue funcionando.", synced:"Progreso sincronizado con tu cuenta.", configFirebase:"Primero pega la configuración de Firebase en firebase-config.js.", firebaseNotReady:"Firebase aún no está listo.", loginFail:"No se pudo iniciar sesión con Google.", loggedOut:"Sesión cerrada. Ahora estás en modo invitado."
    },
    en:{
      heroEyebrow:"YOUR PERSONAL FILM LOTTERY", heroAdmit:"ADMIT ONE", heroLede:"Scratch to reveal tonight’s film.",
      passport:"My passport", login:"Sign in with Google", watched:"✓ Seen it", another:"↻ Another film", progressCopy:"films watched",
      admitOne:"ADMIT ONE", ticketWord:"TICKET", tonightsScreening:"TONIGHT'S SCREENING", oneFilmOneNight:"ONE FILM · ONE NIGHT",
      scratch:"SCRATCH TO REVEAL", tonightFilm:"Tonight’s film", scratchToReveal:"Scratch to reveal", director:"Dir. ", rank:"RANK #",
      nameSummary:"Why ReelStub?", nameText:"Reel refers to the traditional roll of film used in cinema, while stub is the part of a ticket kept after admission. ReelStub brings both ideas together: discovering great films and keeping a small memento of each one you watch.",
      aboutSummary:"About the selection", aboutText:"ReelStub begins with the 264 films included in the Sight & Sound 2022 critics’ Top 250, preserving the ranking ties.",
      libraryEyebrow:"My passport", libraryTitle:"The 264 films", search:"Search film or director…", filters:{all:"All",unwatched:"To watch",watched:"Watched",favorites:"Favorites"},
      seenCount:n=>`${n} watched`, favCount:n=>`${n} favorites`, seen:"Watched ✓", markSeen:"Mark watched", favorite:"Favorite",
      account:"Account", accountCopy:"Your progress is synced with this account.", logout:"Sign out",
      completed:"You completed all 264! You can keep browsing your passport.", markedSeen:"Marked as watched ✓",
      firebaseFail:"Firebase could not start. Guest mode still works.", synced:"Progress synced with your account.", configFirebase:"First add your Firebase configuration in firebase-config.js.", firebaseNotReady:"Firebase is not ready yet.", loginFail:"Could not sign in with Google.", loggedOut:"Signed out. You are now using guest mode."
    },
    fr:{
      heroEyebrow:"VOTRE LOTERIE PERSONNELLE DE CINÉMA", heroAdmit:"UNE PLACE", heroLede:"Grattez pour découvrir le film de ce soir.",
      passport:"Mon passeport", login:"Continuer avec Google", watched:"✓ Déjà vu", another:"↻ Un autre film", progressCopy:"films vus",
      admitOne:"UNE PLACE", ticketWord:"BILLET", tonightsScreening:"SÉANCE DE CE SOIR", oneFilmOneNight:"UN FILM · UNE SOIRÉE",
      scratch:"GRATTEZ POUR RÉVÉLER", tonightFilm:"Film de ce soir", scratchToReveal:"Grattez pour révéler", director:"Réal. ", rank:"RANG #",
      nameSummary:"Pourquoi ReelStub ?", nameText:"Reel évoque la bobine de film du cinéma traditionnel, tandis que stub désigne la partie d’un billet que l’on conserve après l’entrée. ReelStub réunit ces deux idées : découvrir de grands films et garder un petit souvenir de chacun de ceux que vous regardez.",
      aboutSummary:"À propos de la sélection", aboutText:"La sélection initiale de ReelStub reprend les 264 films du Top 250 des critiques de Sight & Sound 2022, en conservant les ex æquo du classement.",
      libraryEyebrow:"Mon passeport", libraryTitle:"Les 264 films", search:"Rechercher un film ou un réalisateur…", filters:{all:"Tous",unwatched:"À voir",watched:"Vus",favorites:"Favoris"},
      seenCount:n=>`${n} vus`, favCount:n=>`${n} favoris`, seen:"Vu ✓", markSeen:"Marquer comme vu", favorite:"Favori",
      account:"Compte", accountCopy:"Votre progression est synchronisée avec ce compte.", logout:"Se déconnecter",
      completed:"Vous avez terminé les 264 ! Vous pouvez continuer à parcourir votre passeport.", markedSeen:"Marqué comme vu ✓",
      firebaseFail:"Impossible de démarrer Firebase. Le mode invité reste disponible.", synced:"Progression synchronisée avec votre compte.", configFirebase:"Ajoutez d’abord la configuration Firebase dans firebase-config.js.", firebaseNotReady:"Firebase n’est pas encore prêt.", loginFail:"Impossible de se connecter avec Google.", loggedOut:"Déconnecté. Vous êtes maintenant en mode invité."
    }
  };
  function initialLang(){
    const saved=localStorage.getItem(LANG_KEY); if(I18N[saved]) return saved;
    const n=(navigator.language||"es").toLowerCase(); if(n.startsWith("fr"))return "fr"; if(n.startsWith("en"))return "en"; return "es";
  }
  let lang=initialLang();
  const t=(key)=>I18N[lang][key];

  let state = { watched: [], favorites: [], currentId: null };
  let currentFilm = null;
  let user = null;
  let firebaseReady = false;
  let auth, db, fbAuth, fbStore;
  let revealed = false;

  const refs = {
    loginBtn:$("loginBtn"), userBtn:$("userBtn"), libraryBtn:$("libraryBtn"),
    watchedBtn:$("watchedBtn"), anotherBtn:$("anotherBtn"), favoriteBtn:$("favoriteBtn"),
    canvas:$("scratchCanvas"), hint:$("scratchHint"), scratchHintText:$("scratchHintText"),
    title:$("filmTitle"), director:$("filmDirector"), rank:$("filmRank"), year:$("filmYear"),
    no:$("ticketNo"), status:$("statusMsg"),
    heroEyebrow:$("heroEyebrow"), heroAdmit:$("heroAdmit"), heroLede:$("heroLede"),
    progressCard:$("progressCard"), progressLabel:$("progressLabel"), progressCopy:$("progressCopy"),
    progressBar:$("progressBar"), progressPct:$("progressPct"),
    nameSummary:$("nameSummary"), nameText:$("nameText"),
    aboutSummary:$("aboutSummary"), aboutText:$("aboutText"),
    library:$("libraryDialog"), closeLibrary:$("closeLibraryBtn"), list:$("filmList"),
    libraryEyebrow:$("libraryEyebrow"), libraryTitle:$("libraryTitle"),
    search:$("searchInput"), filter:$("libraryFilter"), dialogProgress:$("dialogProgress"),
    dialogFavorites:$("dialogFavorites"), account:$("accountDialog"), closeAccount:$("closeAccountBtn"),
    accountEyebrow:$("accountEyebrow"), accountName:$("accountName"), accountEmail:$("accountEmail"),
    accountCopy:$("accountCopy"), logout:$("logoutBtn")
  };

  function applyLanguage(){
    document.documentElement.lang=lang;
    document.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
    refs.heroEyebrow.textContent=t("heroEyebrow"); refs.heroAdmit.textContent=t("heroAdmit"); refs.heroLede.textContent=t("heroLede");
    refs.libraryBtn.textContent=t("passport"); refs.loginBtn.textContent=t("login"); refs.watchedBtn.textContent=t("watched"); refs.anotherBtn.textContent=t("another"); refs.progressCopy.textContent=t("progressCopy");
    document.querySelectorAll('[data-i18n="admitOne"]').forEach(el=>el.textContent=t("admitOne"));
    document.querySelectorAll('[data-i18n="ticketWord"]').forEach(el=>el.textContent=t("ticketWord"));
    document.querySelectorAll('[data-i18n="tonightsScreening"]').forEach(el=>el.textContent=t("tonightsScreening"));
    document.querySelectorAll('[data-i18n="oneFilmOneNight"]').forEach(el=>el.textContent=t("oneFilmOneNight"));
    refs.scratchHintText.textContent=t("scratch"); refs.nameSummary.textContent=t("nameSummary"); refs.nameText.textContent=t("nameText"); refs.aboutSummary.textContent=t("aboutSummary"); refs.aboutText.textContent=t("aboutText");
    refs.libraryEyebrow.textContent=t("libraryEyebrow"); refs.libraryTitle.textContent=t("libraryTitle"); refs.search.placeholder=t("search");
    [...refs.filter.options].forEach(o=>o.textContent=t("filters")[o.value]); refs.accountEyebrow.textContent=t("account"); refs.accountCopy.textContent=t("accountCopy"); refs.logout.textContent=t("logout");
    refs.progressCard?.setAttribute("aria-label", lang==="es"?"Progreso":lang==="fr"?"Progression":"Progress");
    refs.favoriteBtn?.setAttribute("aria-label",t("favorite"));
    if(currentFilm){
      refs.title.textContent=currentFilm.title;
      refs.director.textContent=t("director")+currentFilm.director;
      refs.rank.textContent=t("rank")+currentFilm.rank;
    } else {
      refs.title.textContent=t("tonightFilm");
      refs.director.textContent=t("scratchToReveal");
    }
    updateProgress();
    if(refs.library?.open) renderLibrary();
  }
  document.querySelectorAll(".lang-btn").forEach(btn=>btn.addEventListener("click",()=>{lang=btn.dataset.lang;localStorage.setItem(LANG_KEY,lang);applyLanguage();}));

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
    if(!pool.length){ showStatus(t("completed")); pool=FILMS; }
    if(forceNew && currentFilm && pool.length>1) pool=pool.filter(f=>f.id!==currentFilm.id);
    currentFilm = pool[Math.floor(Math.random()*pool.length)];
    state.currentId=currentFilm.id;
    renderFilm(); saveState();
  }

  function renderFilm(){
    if(!currentFilm) return;
    refs.title.textContent=currentFilm.title;
    refs.director.textContent=t("director")+currentFilm.director;
    refs.rank.textContent=t("rank")+currentFilm.rank;
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
    refs.dialogProgress.textContent=t("seenCount")(n);
    refs.dialogFavorites.textContent=t("favCount")(state.favorites.length);
  }

  function showStatus(msg){ refs.status.textContent=msg; clearTimeout(showStatus.t); showStatus.t=setTimeout(()=>refs.status.textContent="",3500); }

  function resetScratch(){
    const c=refs.canvas, box=c.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.max(1,Math.floor(box.width*dpr)); c.height=Math.max(1,Math.floor(box.height*dpr));
    const ctx=c.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
    const grad=ctx.createLinearGradient(0,0,box.width,box.height);
    grad.addColorStop(0,"#c8c5bd"); grad.addColorStop(.5,"#aaa79f"); grad.addColorStop(1,"#d5d2ca");
    ctx.globalCompositeOperation="source-over";ctx.fillStyle=grad;ctx.fillRect(0,0,box.width,box.height);
    ctx.globalAlpha=.22;ctx.fillStyle="#f7f5ef";
    for(let i=0;i<170;i++){ctx.beginPath();ctx.arc(Math.random()*box.width,Math.random()*box.height,Math.random()*1.25+.25,0,Math.PI*2);ctx.fill()}
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
    await saveState(); showStatus(t("markedSeen")); pickFilm(true); renderLibrary();
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
        <button class="icon-btn fav-row" title="${escapeHtml(t("favorite"))}">${fav.has(f.id)?"★":"☆"}</button>
        <button class="watch-toggle ${seen.has(f.id)?"on":""}">${seen.has(f.id)?t("seen"):t("markSeen")}</button>
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
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js")
      ]);
      const app=appMod.initializeApp(FIREBASE); auth=authMod.getAuth(app); db=storeMod.getFirestore(app);
      fbAuth=authMod;fbStore=storeMod;firebaseReady=true;
      authMod.onAuthStateChanged(auth,handleAuthState);
    }catch(err){console.error(err);showStatus(t("firebaseFail"));}
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
    await saveState();loadCurrent();showStatus(t("synced"));
  }

  refs.loginBtn.addEventListener("click",async()=>{
    if(!firebaseConfigured()){showStatus(t("configFirebase"));return}
    if(!firebaseReady){showStatus(t("firebaseNotReady"));return}
    try{const provider=new fbAuth.GoogleAuthProvider();await fbAuth.signInWithPopup(auth,provider)}
    catch(e){console.error(e);showStatus(t("loginFail"));}
  });
  refs.userBtn.addEventListener("click",()=>refs.account.showModal());
  refs.closeAccount.addEventListener("click",()=>refs.account.close());
  refs.logout.addEventListener("click",async()=>{await fbAuth.signOut(auth);refs.account.close();showStatus(t("loggedOut"))});

  function loadCurrent(){
    updateProgress();
    currentFilm=FILMS.find(f=>f.id===state.currentId&&!state.watched.includes(f.id))||null;
    if(currentFilm)renderFilm();else pickFilm();
  }

  window.addEventListener("resize",()=>{if(currentFilm&&!revealed){refs.canvas.style.opacity="1";refs.canvas.style.pointerEvents="auto";resetScratch()}});
  state=readGuest();
  loadCurrent();
  applyLanguage();
  initFirebase();
})();
