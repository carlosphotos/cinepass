
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
      heroEyebrow:"TU LOTERÍA PERSONAL DE CINE", heroAdmit:"UNA ENTRADA", heroLede:"Raspa para descubrir la película de esta noche.", aboutNav:"Acerca de", aboutEyebrow:"ACERCA DE", filmDetailsEyebrow:"LA PELÍCULA", whyWatchTitle:"¿Por qué verla?", whyImportantLabel:"Por qué importa", whatToWatchLabel:"Qué observar",
      passport:"Mi pasaporte", login:"Entrar con Google", watched:"✓ Ya la vi", another:"↻ Dame otra", progressCopy:"películas vistas",
      admitOne:"UNA ENTRADA", ticketWord:"BOLETO", tonightsScreening:"FUNCIÓN DE ESTA NOCHE", oneFilmOneNight:"UNA PELÍCULA · UNA NOCHE",
      scratch:"RASPA PARA REVELAR", tonightFilm:"Película de esta noche", scratchToReveal:"Raspa para revelar", director:"Dir. ", rank:"PUESTO #",
      nameSummary:"¿Por qué ReelStub?", nameText:`<li><strong>Reel</strong><span>hace referencia al rollo de película del cine tradicional.</span></li><li><strong>Stub</strong><span>es el talón que queda de un boleto después de entrar a una función.</span></li><li><strong>ReelStub</strong><span>une ambas ideas: descubrir grandes películas y guardar un pequeño recuerdo de cada una.</span></li>`,
      aboutSummary:"Acerca de la selección", aboutText:"La selección inicial de ReelStub corresponde a las 264 películas incluidas en el Top 250 de la encuesta de críticos de Sight & Sound 2022, conservando los empates del ranking.", aboutDataSummary:"Datos y disponibilidad", aboutDataText:"La disponibilidad de streaming se consulta por país y puede cambiar con el tiempo. Los datos son proporcionados por Streaming Availability API by Movie of the Night.",
      libraryEyebrow:"Mi pasaporte", libraryTitle:"Las 264 películas", passportIntro:"Cada película vista se convierte en un talón coleccionable dentro de tu pasaporte.", passportStamp:"VISTA", passportPending:"PENDIENTE", dateUnknown:"SIN FECHA", statsAll:"TODAS", statsWatched:"VISTAS", statsFavorites:"FAVORITAS", statsDecades:"DÉCADAS", statsTop25:"TOP 25", achievements:"LOGROS", search:"Buscar película o director…", filters:{all:"Todas",unwatched:"Pendientes",watched:"Vistas",favorites:"Favoritas"},
      seenCount:n=>`${n} vistas`, favCount:n=>`${n} favoritas`, seen:"Vista ✓", markSeen:"Marcar vista", favorite:"Favorita",
      account:"Cuenta", accountCopy:"Tu progreso está sincronizado con esta cuenta.", logout:"Cerrar sesión",
      completed:"¡Completaste las 264! Puedes seguir revisando tu pasaporte.", markedSeen:"Marcada como vista ✓",
      whereToWatch:"DÓNDE VERLA", countryLabel:"País", streamingLoading:"Buscando disponibilidad…", streamingNone:"No encontramos opciones disponibles para este país.", trailerFallback:"", trailerButton:"Ver tráiler en YouTube", subscription:"Incluida con suscripción", free:"Gratis", rent:"Renta", buy:"Compra", from:"desde", qualityAvailable:"disponible", openService:"Abrir", streamingSource:"Disponibilidad proporcionada por Streaming Availability API by Movie of the Night.", firebaseFail:"No se pudo iniciar Firebase. El modo invitado sigue funcionando.", synced:"Progreso sincronizado con tu cuenta.", configFirebase:"Primero pega la configuración de Firebase en firebase-config.js.", firebaseNotReady:"Firebase aún no está listo.", loginFail:"No se pudo iniciar sesión con Google.", loggedOut:"Sesión cerrada. Ahora estás en modo invitado.", badges:[{id:"first",title:"Primera función",desc:"1 película"},{id:"ten",title:"Diez boletos",desc:"10 películas"},{id:"time",title:"Viajero del tiempo",desc:"8 décadas"},{id:"fifty",title:"Media centena",desc:"50 películas"},{id:"century",title:"Club de las 100",desc:"100 películas"},{id:"top25",title:"Top 25 completo",desc:"Todos los puestos 1–25"},{id:"all",title:"Pasaporte completo",desc:"264 películas"}]
    },
    en:{
      heroEyebrow:"YOUR PERSONAL FILM LOTTERY", heroAdmit:"ADMIT ONE", heroLede:"Scratch to reveal tonight’s film.", aboutNav:"About", aboutEyebrow:"ABOUT", filmDetailsEyebrow:"THE FILM", whyWatchTitle:"Why watch it?", whyImportantLabel:"Why it matters", whatToWatchLabel:"What to notice",
      passport:"My passport", login:"Sign in with Google", watched:"✓ Seen it", another:"↻ Another film", progressCopy:"films watched",
      admitOne:"ADMIT ONE", ticketWord:"TICKET", tonightsScreening:"TONIGHT'S SCREENING", oneFilmOneNight:"ONE FILM · ONE NIGHT",
      scratch:"SCRATCH TO REVEAL", tonightFilm:"Tonight’s film", scratchToReveal:"Scratch to reveal", director:"Dir. ", rank:"RANK #",
      nameSummary:"Why ReelStub?", nameText:`<li><strong>Reel</strong><span>refers to the roll of film traditionally used in cinema.</span></li><li><strong>Stub</strong><span>is the part of a ticket you keep after entering a screening.</span></li><li><strong>ReelStub</strong><span>brings both ideas together: discovering great films and keeping a small memento of each one.</span></li>`,
      aboutSummary:"About the selection", aboutText:"ReelStub begins with the 264 films included in the Sight & Sound 2022 critics’ Top 250, preserving the ranking ties.", aboutDataSummary:"Data and availability", aboutDataText:"Streaming availability is checked by country and can change over time. Data is provided by Streaming Availability API by Movie of the Night.",
      libraryEyebrow:"My passport", libraryTitle:"The 264 films", passportIntro:"Every film you watch becomes a collectible ticket stub inside your passport.", passportStamp:"WATCHED", passportPending:"TO WATCH", dateUnknown:"NO DATE", statsAll:"ALL", statsWatched:"WATCHED", statsFavorites:"FAVORITES", statsDecades:"DECADES", statsTop25:"TOP 25", achievements:"ACHIEVEMENTS", search:"Search film or director…", filters:{all:"All",unwatched:"To watch",watched:"Watched",favorites:"Favorites"},
      seenCount:n=>`${n} watched`, favCount:n=>`${n} favorites`, seen:"Watched ✓", markSeen:"Mark watched", favorite:"Favorite",
      account:"Account", accountCopy:"Your progress is synced with this account.", logout:"Sign out",
      completed:"You completed all 264! You can keep browsing your passport.", markedSeen:"Marked as watched ✓",
      whereToWatch:"WHERE TO WATCH", countryLabel:"Country", streamingLoading:"Checking availability…", streamingNone:"No viewing options were found for this country.", trailerFallback:"", trailerButton:"Watch trailer on YouTube", subscription:"Included with subscription", free:"Free", rent:"Rent", buy:"Buy", from:"from", qualityAvailable:"available", openService:"Open", streamingSource:"Streaming availability provided by Streaming Availability API by Movie of the Night.", firebaseFail:"Firebase could not start. Guest mode still works.", synced:"Progress synced with your account.", configFirebase:"First add your Firebase configuration in firebase-config.js.", firebaseNotReady:"Firebase is not ready yet.", loginFail:"Could not sign in with Google.", loggedOut:"Signed out. You are now using guest mode.", badges:[{id:"first",title:"First screening",desc:"1 film"},{id:"ten",title:"Ten tickets",desc:"10 films"},{id:"time",title:"Time traveller",desc:"8 decades"},{id:"fifty",title:"Half century",desc:"50 films"},{id:"century",title:"The 100 club",desc:"100 films"},{id:"top25",title:"Top 25 complete",desc:"All ranks 1–25"},{id:"all",title:"Passport complete",desc:"264 films"}]
    },
    fr:{
      heroEyebrow:"VOTRE LOTERIE PERSONNELLE DE CINÉMA", heroAdmit:"UNE PLACE", heroLede:"Grattez pour découvrir le film de ce soir.", aboutNav:"À propos", aboutEyebrow:"À PROPOS", filmDetailsEyebrow:"LE FILM", whyWatchTitle:"Pourquoi le voir ?", whyImportantLabel:"Pourquoi il compte", whatToWatchLabel:"À observer",
      passport:"Mon passeport", login:"Continuer avec Google", watched:"✓ Déjà vu", another:"↻ Un autre film", progressCopy:"films vus",
      admitOne:"UNE PLACE", ticketWord:"BILLET", tonightsScreening:"SÉANCE DE CE SOIR", oneFilmOneNight:"UN FILM · UNE SOIRÉE",
      scratch:"GRATTEZ POUR RÉVÉLER", tonightFilm:"Film de ce soir", scratchToReveal:"Grattez pour révéler", director:"Réal. ", rank:"RANG #",
      nameSummary:"Pourquoi ReelStub ?", nameText:`<li><strong>Reel</strong><span>fait référence à la bobine de film du cinéma traditionnel.</span></li><li><strong>Stub</strong><span>désigne la partie du billet que l’on conserve après être entré à une séance.</span></li><li><strong>ReelStub</strong><span>réunit ces deux idées : découvrir de grands films et garder un petit souvenir de chacun.</span></li>`,
      aboutSummary:"À propos de la sélection", aboutText:"La sélection initiale de ReelStub reprend les 264 films du Top 250 des critiques de Sight & Sound 2022, en conservant les ex æquo du classement.", aboutDataSummary:"Données et disponibilité", aboutDataText:"La disponibilité en streaming est consultée par pays et peut évoluer. Les données sont fournies par Streaming Availability API by Movie of the Night.",
      libraryEyebrow:"Mon passeport", libraryTitle:"Les 264 films", passportIntro:"Chaque film vu devient un talon de billet à collectionner dans votre passeport.", passportStamp:"VU", passportPending:"À VOIR", dateUnknown:"SANS DATE", statsAll:"TOUS", statsWatched:"VUS", statsFavorites:"FAVORIS", statsDecades:"DÉCENNIES", statsTop25:"TOP 25", achievements:"SUCCÈS", search:"Rechercher un film ou un réalisateur…", filters:{all:"Tous",unwatched:"À voir",watched:"Vus",favorites:"Favoris"},
      seenCount:n=>`${n} vus`, favCount:n=>`${n} favoris`, seen:"Vu ✓", markSeen:"Marquer comme vu", favorite:"Favori",
      account:"Compte", accountCopy:"Votre progression est synchronisée avec ce compte.", logout:"Se déconnecter",
      completed:"Vous avez terminé les 264 ! Vous pouvez continuer à parcourir votre passeport.", markedSeen:"Marqué comme vu ✓",
      whereToWatch:"OÙ LE VOIR", countryLabel:"Pays", streamingLoading:"Recherche des disponibilités…", streamingNone:"Aucune option de visionnage trouvée pour ce pays.", trailerFallback:"", trailerButton:"Voir la bande-annonce sur YouTube", subscription:"Inclus avec l’abonnement", free:"Gratuit", rent:"Location", buy:"Achat", from:"à partir de", qualityAvailable:"disponible", openService:"Ouvrir", streamingSource:"Disponibilité fournie par Streaming Availability API by Movie of the Night.", firebaseFail:"Impossible de démarrer Firebase. Le mode invité reste disponible.", synced:"Progression synchronisée avec votre compte.", configFirebase:"Ajoutez d’abord la configuration Firebase dans firebase-config.js.", firebaseNotReady:"Firebase n’est pas encore prêt.", loginFail:"Impossible de se connecter avec Google.", loggedOut:"Déconnecté. Vous êtes maintenant en mode invité.", badges:[{id:"first",title:"Première séance",desc:"1 film"},{id:"ten",title:"Dix billets",desc:"10 films"},{id:"time",title:"Voyageur du temps",desc:"8 décennies"},{id:"fifty",title:"Demi-centaine",desc:"50 films"},{id:"century",title:"Le club des 100",desc:"100 films"},{id:"top25",title:"Top 25 terminé",desc:"Tous les rangs 1–25"},{id:"all",title:"Passeport complet",desc:"264 films"}]
    }
  };
  function initialLang(){
    const saved=localStorage.getItem(LANG_KEY); if(I18N[saved]) return saved;
    const n=(navigator.language||"es").toLowerCase(); if(n.startsWith("fr"))return "fr"; if(n.startsWith("en"))return "en"; return "es";
  }
  let lang=initialLang();
  const t=(key)=>I18N[lang][key];

  // Pilot editorial notes: start small, validate the tone, then expand to all 264 films.
  const WHY_WATCH = {
    "film-001": {
      es:{important:"Una obra decisiva del cine moderno que convierte la rutina doméstica en tensión, tiempo y significado.",observe:"La duración de los planos, la repetición de los gestos y cómo los pequeños cambios alteran todo el ritmo."},
      en:{important:"A landmark of modern cinema that turns domestic routine into tension, time and meaning.",observe:"The duration of the shots, repeated gestures, and how tiny changes disturb the entire rhythm."},
      fr:{important:"Une œuvre majeure du cinéma moderne qui transforme la routine domestique en tension, temps et sens.",observe:"La durée des plans, la répétition des gestes et la façon dont de petits écarts bouleversent tout le rythme."}
    },
    "film-002": {
      es:{important:"Hitchcock lleva la obsesión romántica y la identidad a uno de los relatos visuales más influyentes del cine.",observe:"El color, los movimientos de cámara, los espejos y la manera en que San Francisco se vuelve parte del estado mental del protagonista."},
      en:{important:"Hitchcock turns romantic obsession and identity into one of cinema’s most influential visual narratives.",observe:"Color, camera movement, mirrors, and the way San Francisco becomes part of the protagonist’s state of mind."},
      fr:{important:"Hitchcock transforme l’obsession amoureuse et l’identité en l’un des récits visuels les plus influents du cinéma.",observe:"La couleur, les mouvements de caméra, les miroirs et la façon dont San Francisco devient le reflet de l’état mental du protagoniste."}
    },
    "film-003": {
      es:{important:"Su estructura narrativa y su inventiva visual ampliaron de forma duradera las posibilidades del cine de estudio.",observe:"La profundidad de campo, los ángulos bajos, el montaje y cómo distintos testimonios construyen —y contradicen— a Kane."},
      en:{important:"Its narrative structure and visual invention permanently expanded what studio filmmaking could do.",observe:"Deep focus, low angles, editing, and how conflicting testimonies build —and undermine— our idea of Kane."},
      fr:{important:"Sa structure narrative et son invention visuelle ont durablement élargi les possibilités du cinéma de studio.",observe:"La profondeur de champ, les contre-plongées, le montage et la façon dont les témoignages construisent — puis contredisent — l’image de Kane."}
    },
    "film-005": {
      es:{important:"Una historia de deseo contenido donde lo que no ocurre pesa tanto como lo que vemos.",observe:"Los encuadres parciales, los pasillos, la música repetida, el vestuario y el uso extraordinario del color."},
      en:{important:"A story of restrained desire in which what does not happen carries as much weight as what we see.",observe:"Partial framing, corridors, recurring music, costumes, and the extraordinary use of color."},
      fr:{important:"Une histoire de désir retenu où ce qui n’arrive pas compte autant que ce que l’on voit.",observe:"Les cadrages partiels, les couloirs, la musique répétée, les costumes et l’usage exceptionnel de la couleur."}
    },
    "film-006": {
      es:{important:"Redefinió la escala, la ambición visual y la seriedad filosófica de la ciencia ficción cinematográfica.",observe:"La composición, los efectos prácticos, los silencios, el diseño sonoro y el contraste entre música clásica y tecnología."},
      en:{important:"It redefined the scale, visual ambition and philosophical seriousness of science-fiction cinema.",observe:"Composition, practical effects, silence, sound design, and the contrast between classical music and technology."},
      fr:{important:"Il a redéfini l’échelle, l’ambition visuelle et la portée philosophique de la science-fiction au cinéma.",observe:"La composition, les effets pratiques, les silences, le design sonore et le contraste entre musique classique et technologie."}
    },
    "film-024": {
      es:{important:"Spike Lee convierte un solo día de verano en una mirada vibrante y todavía incómodamente vigente sobre comunidad, racismo y tensión social.",observe:"El color, los encuadres frontales, la música y cómo el calor se vuelve una presión física que aumenta durante toda la película."},
      en:{important:"Spike Lee turns one summer day into a vibrant, still urgently relevant look at community, racism and social tension.",observe:"Color, frontal framing, music, and the way the heat becomes a physical pressure that builds throughout the film."},
      fr:{important:"Spike Lee transforme une journée d’été en un regard vibrant, toujours actuel, sur la communauté, le racisme et la tension sociale.",observe:"La couleur, les cadrages frontaux, la musique et la façon dont la chaleur devient une pression physique qui monte tout au long du film."}
    },
    "film-077": {
      es:{important:"Miyazaki construye una aventura iniciática accesible y, al mismo tiempo, llena de ideas sobre identidad, trabajo, codicia y crecimiento.",observe:"La animación de los pequeños gestos, los momentos de calma y cómo el mundo fantástico evita dividirse simplemente entre buenos y malos."},
      en:{important:"Miyazaki builds an accessible coming-of-age adventure that is also rich with ideas about identity, work, greed and growing up.",observe:"The animation of tiny gestures, moments of stillness, and how the fantasy world refuses a simple good-versus-evil divide."},
      fr:{important:"Miyazaki construit une aventure initiatique accessible, riche en idées sur l’identité, le travail, l’avidité et le passage à l’âge adulte.",observe:"L’animation des petits gestes, les moments de calme et la manière dont le monde fantastique échappe à une simple opposition entre bien et mal."}
    },
    "film-091": {
      es:{important:"Combina comedia, thriller y drama social con una precisión extraordinaria para hablar de clase sin perder impulso narrativo.",observe:"La arquitectura de la casa, escaleras y niveles, y cómo el espacio visualiza constantemente quién está arriba y quién está abajo."},
      en:{important:"It combines comedy, thriller and social drama with remarkable precision to explore class without losing narrative momentum.",observe:"The architecture of the house, stairs and levels, and how space constantly visualizes who is above and who is below."},
      fr:{important:"Il mêle comédie, thriller et drame social avec une précision remarquable pour parler de classe sans perdre son élan narratif.",observe:"L’architecture de la maison, les escaliers et les niveaux, et la façon dont l’espace montre sans cesse qui est en haut et qui est en bas."}
    }
  };

  const SUPPORTED_COUNTRIES=["MX","US","GB","FR","ES","CA"];
  const DEFAULT_COUNTRY="MX";
  const COUNTRY_LANG={MX:"es",ES:"es",US:"en",GB:"en",CA:"en",FR:"fr"};
  const COUNTRY_FLAGS={MX:"🇲🇽",US:"🇺🇸",GB:"🇬🇧",FR:"🇫🇷",ES:"🇪🇸",CA:"🇨🇦"};
  const STREAM_TEST_MODE=new URLSearchParams(location.search).get("streamtest")==="1";
  let streamingData=null;
  let passportPosterLoadStarted=false;
  let passportView="all";
  let passportDecade=null;
  let state = { watched: [], favorites: [], watchedDates: {}, currentId: null, country: DEFAULT_COUNTRY };
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
    heroEyebrow:$("heroEyebrow"), heroAdmit:$("heroAdmit"), heroLede:$("heroLede"), aboutNav:$("aboutNav"),
    progressCard:$("progressCard"), progressLabel:$("progressLabel"), progressCopy:$("progressCopy"),
    progressBar:$("progressBar"), progressPct:$("progressPct"),
    nameSummary:$("nameSummary"), nameText:$("nameText"),
    aboutSummary:$("aboutSummary"), aboutText:$("aboutText"), aboutDataSummary:$("aboutDataSummary"), aboutDataText:$("aboutDataText"), aboutEyebrow:$("aboutEyebrow"),
    about:$("aboutDialog"), closeAbout:$("closeAboutBtn"),
    library:$("libraryDialog"), closeLibrary:$("closeLibraryBtn"), list:$("filmList"),
    libraryEyebrow:$("libraryEyebrow"), libraryTitle:$("libraryTitle"), passportIntro:$("passportIntro"),
    search:$("searchInput"), filter:$("libraryFilter"), dialogProgress:$("dialogProgress"),
    dialogFavorites:$("dialogFavorites"), statAll:$("statAll"), statWatched:$("statWatched"), statFavorites:$("statFavorites"), statDecades:$("statDecades"), statTop25:$("statTop25"), statAllLabel:$("statAllLabel"), statWatchedLabel:$("statWatchedLabel"), statFavoritesLabel:$("statFavoritesLabel"), statDecadesLabel:$("statDecadesLabel"), statTop25Label:$("statTop25Label"), decadeNav:$("passportDecadeNav"), achievementsTitle:$("achievementsTitle"), achievementList:$("achievementList"), account:$("accountDialog"), closeAccount:$("closeAccountBtn"),
    accountEyebrow:$("accountEyebrow"), accountName:$("accountName"), accountEmail:$("accountEmail"),
    accountCopy:$("accountCopy"), logout:$("logoutBtn"),
    streamingPanel:$("streamingPanel"), streamingPoster:$("streamingPoster"), streamingEyebrow:$("streamingEyebrow"), streamingOriginalTitle:$("streamingOriginalTitle"), streamingLocalTitle:$("streamingLocalTitle"), countryLabel:$("countryLabel"), countrySelect:$("countrySelect"), streamingServices:$("streamingServices"), streamingEmpty:$("streamingEmpty"), streamingAttribution:$("streamingAttribution"),
    filmDetailsEyebrow:$("filmDetailsEyebrow"), trailerPrimary:$("trailerPrimary"), whyWatchSection:$("whyWatchSection"), whyWatchTitle:$("whyWatchTitle"), whyImportantLabel:$("whyImportantLabel"), whyImportantText:$("whyImportantText"), whatToWatchLabel:$("whatToWatchLabel"), whatToWatchText:$("whatToWatchText")
  };

  function applyLanguage(){
    document.documentElement.lang=lang;
    document.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
    refs.heroEyebrow.textContent=t("heroEyebrow"); refs.heroAdmit.textContent=t("heroAdmit"); refs.heroLede.textContent=t("heroLede"); if(refs.aboutNav) refs.aboutNav.textContent=t("aboutNav");
    refs.libraryBtn.textContent=t("passport"); refs.loginBtn.textContent=t("login"); refs.watchedBtn.textContent=t("watched"); refs.anotherBtn.textContent=t("another"); refs.progressCopy.textContent=t("progressCopy");
    document.querySelectorAll('[data-i18n="admitOne"]').forEach(el=>el.textContent=t("admitOne"));
    document.querySelectorAll('[data-i18n="ticketWord"]').forEach(el=>el.textContent=t("ticketWord"));
    document.querySelectorAll('[data-i18n="tonightsScreening"]').forEach(el=>el.textContent=t("tonightsScreening"));
    document.querySelectorAll('[data-i18n="oneFilmOneNight"]').forEach(el=>el.textContent=t("oneFilmOneNight"));
    refs.scratchHintText.textContent=t("scratch"); refs.nameSummary.textContent=t("nameSummary"); refs.nameText.innerHTML=t("nameText"); refs.aboutSummary.textContent=t("aboutSummary"); refs.aboutText.textContent=t("aboutText");
    if(refs.aboutDataSummary) refs.aboutDataSummary.textContent=t("aboutDataSummary"); if(refs.aboutDataText) refs.aboutDataText.textContent=t("aboutDataText"); if(refs.aboutEyebrow) refs.aboutEyebrow.textContent=t("aboutEyebrow");
    refs.libraryEyebrow.textContent=t("libraryEyebrow"); refs.libraryTitle.textContent=t("libraryTitle"); refs.passportIntro.textContent=t("passportIntro"); refs.search.placeholder=t("search");
    refs.statAllLabel.textContent=t("statsAll"); refs.statWatchedLabel.textContent=t("statsWatched"); refs.statFavoritesLabel.textContent=t("statsFavorites"); refs.statDecadesLabel.textContent=t("statsDecades"); refs.statTop25Label.textContent=t("statsTop25"); refs.achievementsTitle.textContent=t("achievements");
    [...refs.filter.options].forEach(o=>o.textContent=t("filters")[o.value]); refs.accountEyebrow.textContent=t("account"); refs.accountCopy.textContent=t("accountCopy"); refs.logout.textContent=t("logout");
    refs.progressCard?.setAttribute("aria-label", lang==="es"?"Progreso":lang==="fr"?"Progression":"Progress");
    refs.favoriteBtn?.setAttribute("aria-label",t("favorite"));
    if(refs.streamingEyebrow) refs.streamingEyebrow.textContent=t("whereToWatch");
    if(refs.filmDetailsEyebrow) refs.filmDetailsEyebrow.textContent=t("filmDetailsEyebrow");
    if(refs.trailerPrimary) refs.trailerPrimary.textContent=`▶ ${t("trailerButton")}`;
    if(refs.whyWatchTitle) refs.whyWatchTitle.textContent=t("whyWatchTitle");
    if(refs.whyImportantLabel) refs.whyImportantLabel.textContent=t("whyImportantLabel");
    if(refs.whatToWatchLabel) refs.whatToWatchLabel.textContent=t("whatToWatchLabel");
    if(refs.countryLabel) refs.countryLabel.textContent=t("countryLabel");
    if(refs.countrySelect){[...refs.countrySelect.options].forEach(o=>{o.textContent=`${COUNTRY_FLAGS[o.value]||""} ${countryName(o.value)}`.trim()});refs.countrySelect.setAttribute("aria-label",t("countryLabel"));}
    if(currentFilm){
      refs.title.textContent=currentFilm.title;
      refs.director.textContent=t("director")+currentFilm.director;
      refs.rank.textContent=t("rank")+currentFilm.rank;
    } else {
      refs.title.textContent=t("tonightFilm");
      refs.director.textContent=t("scratchToReveal");
    }
    updateProgress();
    if(revealed) renderStreamingDetails();
    if(refs.library?.open) renderLibrary();
  }
  document.querySelectorAll(".lang-btn").forEach(btn=>btn.addEventListener("click",()=>{lang=btn.dataset.lang;localStorage.setItem(LANG_KEY,lang);applyLanguage();}));

  function cleanState(raw={}) {
    const valid = new Set(FILMS.map(f=>f.id));
    const watched=[...new Set(raw.watched || [])].filter(x=>valid.has(x));
    const watchedSet=new Set(watched);
    const watchedDates={};
    if(raw.watchedDates && typeof raw.watchedDates==="object") Object.entries(raw.watchedDates).forEach(([id,date])=>{
      if(watchedSet.has(id) && /^\d{4}-\d{2}-\d{2}$/.test(String(date))) watchedDates[id]=String(date);
    });
    return {
      watched,
      favorites: [...new Set(raw.favorites || [])].filter(x=>valid.has(x)),
      watchedDates,
      currentId: valid.has(raw.currentId) ? raw.currentId : null,
      country: SUPPORTED_COUNTRIES.includes(String(raw.country||"").toUpperCase()) ? String(raw.country).toUpperCase() : DEFAULT_COUNTRY
    };
  }
  function readGuest(){ try{return cleanState(JSON.parse(localStorage.getItem(GUEST_KEY)||"{}"))}catch{return cleanState({})} }
  function writeGuest(){ localStorage.setItem(GUEST_KEY, JSON.stringify(state)); }

  async function saveState(){
    if(user && firebaseReady){
      await fbStore.setDoc(fbStore.doc(db,"users",user.uid), {
        watched:state.watched, favorites:state.favorites, watchedDates:state.watchedDates, currentId:state.currentId, country:state.country,
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
    hideStreamingDetails();
    resetScratch();
  }

  function todayLocal(){
    const d=new Date(), y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }
  function formatWatchDate(value){
    if(!value)return t("dateUnknown");
    const [y,m,d]=value.split("-").map(Number);
    const date=new Date(y,m-1,d);
    const locale=lang==="fr"?"fr-FR":lang==="en"?"en-US":"es-MX";
    return new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short",year:"numeric"}).format(date).replace(/\./g,"").toUpperCase();
  }
  function markWatched(id,withDate=true){
    if(!state.watched.includes(id))state.watched.push(id);
    if(withDate && !state.watchedDates[id])state.watchedDates[id]=todayLocal();
  }
  function unmarkWatched(id){
    const i=state.watched.indexOf(id); if(i>=0)state.watched.splice(i,1);
    delete state.watchedDates[id];
  }
  function updatePassportStats(){
    if(!refs.statWatched)return;
    const watchedFilms=FILMS.filter(f=>state.watched.includes(f.id));
    const decades=new Set(watchedFilms.map(f=>Math.floor(f.year/10)*10));
    const top25=FILMS.filter(f=>f.rank<=25);
    const top25Seen=top25.filter(f=>state.watched.includes(f.id)).length;
    refs.statAll.textContent=FILMS.length; refs.statWatched.textContent=state.watched.length; refs.statFavorites.textContent=state.favorites.length;
    refs.statDecades.textContent=decades.size; refs.statTop25.textContent=`${top25Seen} / ${top25.length}`;
    const unlocked={first:state.watched.length>=1,ten:state.watched.length>=10,time:decades.size>=8,fifty:state.watched.length>=50,century:state.watched.length>=100,top25:top25Seen===top25.length,all:state.watched.length===FILMS.length};
    refs.achievementList.innerHTML=t("badges").map((b,i)=>`<div class="achievement-badge ${unlocked[b.id]?"unlocked":"locked"}"><span class="achievement-seal">${unlocked[b.id]?"✓":String(i+1).padStart(2,"0")}</span><span class="achievement-copy"><strong>${escapeHtml(b.title)}</strong><small>${escapeHtml(b.desc)}</small></span></div>`).join("");
  }

  function updateProgress(){
    const n=state.watched.length, pct=Math.round(n/FILMS.length*100);
    refs.progressLabel.textContent=`${n} / ${FILMS.length}`;
    refs.progressBar.style.width=pct+"%"; refs.progressPct.textContent=pct+"%";
    refs.dialogProgress.textContent=t("seenCount")(n);
    refs.dialogFavorites.textContent=t("favCount")(state.favorites.length);
    updatePassportStats();
  }

  function showStatus(msg){ refs.status.textContent=msg; clearTimeout(showStatus.t); showStatus.t=setTimeout(()=>refs.status.textContent="",3500); }

  function resetScratch(){
    const c=refs.canvas, box=c.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);

    // A new film must always behave like a brand-new scratch ticket.
    // reveal() fades the canvas out and disables pointer events, so restore
    // those properties before drawing the fresh silver coating.
    c.style.transition="none";
    c.style.opacity="1";
    c.style.pointerEvents="auto";
    drawing=false;
    strokes=0;

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
  function reveal(){ if(revealed)return; revealed=true;refs.hint.classList.add("done"); refs.canvas.style.transition="opacity .35s";refs.canvas.style.opacity="0";setTimeout(()=>{refs.canvas.style.pointerEvents="none"},360); renderStreamingDetails(); }


  function hideStreamingDetails(){
    if(!refs.streamingPanel)return;
    refs.streamingPanel.classList.add("hidden");
    refs.streamingServices.innerHTML="";
    refs.streamingEmpty.classList.add("hidden");
    refs.streamingPoster.removeAttribute("src");
    if(refs.whyWatchSection) refs.whyWatchSection.classList.add("hidden");
  }
  async function loadStreamingData(){
    if(streamingData)return streamingData;
    const response=await fetch("data/streaming-catalog.json",{cache:"no-cache"});
    if(!response.ok)throw new Error(`streaming-catalog.json ${response.status}`);
    streamingData=await response.json();
    return streamingData;
  }
  function countryName(code){
    const locale=lang==="fr"?"fr-FR":lang==="en"?"en-US":"es-MX";
    try{return new Intl.DisplayNames([locale],{type:"region"}).of(code)||code}catch{return code}
  }
  function money(value,currency){
    const num=Number(value); if(!Number.isFinite(num))return "";
    const cur=String(currency||"MXN").toUpperCase();
    const locale=lang==="fr"?"fr-FR":lang==="en"?"en-US":"es-MX";
    try{
      const valueText=new Intl.NumberFormat(locale,{style:"currency",currency:cur,currencyDisplay:"narrowSymbol",maximumFractionDigits:Number.isInteger(num)?0:2}).format(num);
      return ["MXN","USD","GBP","CAD"].includes(cur)?`${valueText} ${cur}`:valueText;
    }catch{return `${num} ${cur}`.trim()}
  }
  function qualityRank(q){return ({sd:1,hd:2,uhd:3,4:3,"4k":3})[String(q||"").toLowerCase()]||0}
  function groupStreamingOptions(options=[]){
    const groups=new Map();
    for(const opt of options){
      if(!opt||opt.type==="addon")continue;
      const key=opt.serviceId||opt.service||"service";
      if(!groups.has(key))groups.set(key,{name:opt.service||key,logo:opt.serviceLogo||null,link:opt.link||null,offers:{free:[],subscription:[],rent:[],buy:[]}});
      const g=groups.get(key); if(!g.logo&&opt.serviceLogo)g.logo=opt.serviceLogo;if(!g.link&&opt.link)g.link=opt.link;
      if(g.offers[opt.type])g.offers[opt.type].push(opt);
    }
    return [...groups.values()];
  }
  function offerHtml(type,items){
    if(!items?.length)return "";
    if(type==="free")return `<span class="streaming-offer"><strong>${escapeHtml(t("free"))}</strong></span>`;
    if(type==="subscription")return `<span class="streaming-offer"><strong>${escapeHtml(t("subscription"))}</strong></span>`;
    const prices=items.map(x=>Number(x.price)).filter(Number.isFinite).sort((a,b)=>a-b);
    const cheapest=prices[0]; const currency=items.find(x=>Number.isFinite(Number(x.price)))?.currency||"MXN";
    const qualities=[...new Set(items.map(x=>String(x.quality||"").toUpperCase()).filter(Boolean))].sort((a,b)=>qualityRank(a)-qualityRank(b));
    const best=qualities.at(-1); const prefix=type==="rent"?t("rent"):t("buy"); const hasMultiple=[...new Set(prices)].length>1;
    const price=Number.isFinite(cheapest)?`${hasMultiple?t("from")+" ":""}${money(cheapest,currency)}`:"";
    const quality=best?`<span class="streaming-quality">${escapeHtml(best)} ${escapeHtml(t("qualityAvailable"))}</span>`:"";
    return `<span class="streaming-offer"><strong>${escapeHtml(prefix)}</strong>${price?` · ${escapeHtml(price)}`:""}${quality?` · ${quality}`:""}</span>`;
  }
  function trailerSearchUrl(){
    const title=currentFilm?.title||"";
    const year=currentFilm?.year||"";
    const query=`${title} ${year} trailer`.trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }
  function renderWhyWatch(){
    if(!refs.whyWatchSection || !currentFilm)return;
    const note=WHY_WATCH[currentFilm.id]?.[lang] || WHY_WATCH[currentFilm.id]?.en;
    if(!note){refs.whyWatchSection.classList.add("hidden");return;}
    refs.whyWatchTitle.textContent=t("whyWatchTitle");
    refs.whyImportantLabel.textContent=t("whyImportantLabel");
    refs.whatToWatchLabel.textContent=t("whatToWatchLabel");
    refs.whyImportantText.textContent=note.important;
    refs.whatToWatchText.textContent=note.observe;
    refs.whyWatchSection.classList.remove("hidden");
  }
  function renderEditorialDetails(){
    if(!currentFilm)return;
    if(refs.filmDetailsEyebrow) refs.filmDetailsEyebrow.textContent=t("filmDetailsEyebrow");
    if(refs.trailerPrimary){refs.trailerPrimary.href=trailerSearchUrl();refs.trailerPrimary.textContent=`▶ ${t("trailerButton")}`;}
    renderWhyWatch();
  }
  function renderStreamingFallback(){
    refs.streamingEmpty.textContent=t("streamingNone");
    refs.streamingEmpty.classList.remove("hidden");
  }

  function renderStreamingFilm(filmPayload){
    const code=state.country||DEFAULT_COUNTRY;
    refs.countrySelect.value=code;
    refs.streamingOriginalTitle.textContent=currentFilm?.title||filmPayload?.title||"";
    const localized=filmPayload?.localizedTitle||"";
    const canShowLocalized=lang==="es" && localized && localized!==refs.streamingOriginalTitle.textContent;
    refs.streamingLocalTitle.textContent=localized; refs.streamingLocalTitle.classList.toggle("hidden",!canShowLocalized);
    if(filmPayload?.poster){refs.streamingPoster.src=filmPayload.poster;refs.streamingPoster.alt=refs.streamingOriginalTitle.textContent;}else{refs.streamingPoster.removeAttribute("src");refs.streamingPoster.alt="";}
    const groups=groupStreamingOptions(filmPayload?.countries?.[code]?.streamingOptions||[]);
    refs.streamingServices.innerHTML=groups.map(g=>{
      const brand=g.logo?`<img class="streaming-service-logo" src="${escapeHtml(g.logo)}" alt="${escapeHtml(g.name)}">`:`<span class="streaming-service-name">${escapeHtml(g.name)}</span>`;
      const offers=offerHtml("free",g.offers.free)+offerHtml("subscription",g.offers.subscription)+offerHtml("rent",g.offers.rent)+offerHtml("buy",g.offers.buy);
      const open=g.link?`<a class="streaming-open" href="${escapeHtml(g.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openService"))}</a>`:"";
      return `<article class="streaming-service"><div class="streaming-service-brand">${brand}</div><div class="streaming-offers">${offers}</div>${open}</article>`;
    }).join("");
    if(groups.length){
      refs.streamingEmpty.classList.add("hidden");
      refs.streamingEmpty.innerHTML="";
    }else{
      renderStreamingFallback();
    }
    refs.streamingAttribution.textContent=t("streamingSource");
  }
  async function renderStreamingDetails(){
    if(!refs.streamingPanel||!revealed||!currentFilm){hideStreamingDetails();return;}
    refs.streamingPanel.classList.remove("hidden");
    renderEditorialDetails();
    refs.streamingOriginalTitle.textContent=currentFilm.title;
    refs.streamingLocalTitle.classList.add("hidden");
    refs.streamingServices.innerHTML=`<div class="streaming-loading">${escapeHtml(t("streamingLoading"))}</div>`;
    refs.streamingEmpty.classList.add("hidden"); refs.streamingAttribution.textContent="";
    try{
      const payload=await loadStreamingData();
      if(!currentFilm||!revealed)return;
      const filmPayload=payload.films?.[currentFilm.id];
      if(!filmPayload){refs.streamingServices.innerHTML="";refs.streamingPoster.removeAttribute("src");renderStreamingFallback();refs.streamingAttribution.textContent=t("streamingSource");return;}
      renderStreamingFilm(filmPayload);
    }catch(err){console.warn(err);refs.streamingServices.innerHTML="";refs.streamingPoster.removeAttribute("src");renderStreamingFallback()}
  }
  if(refs.countrySelect){
    refs.countrySelect.value=state.country||DEFAULT_COUNTRY;
    refs.countrySelect.addEventListener("change",async()=>{state.country=SUPPORTED_COUNTRIES.includes(refs.countrySelect.value)?refs.countrySelect.value:DEFAULT_COUNTRY;await saveState();if(revealed)renderStreamingDetails();});
  }

  refs.watchedBtn.addEventListener("click",async()=>{
    if(!currentFilm)return;
    markWatched(currentFilm.id,true);
    await saveState(); showStatus(t("markedSeen")); pickFilm(true); renderLibrary();
  });
  refs.anotherBtn.addEventListener("click",()=>pickFilm(true));
  refs.favoriteBtn.addEventListener("click",async()=>{
    if(!currentFilm)return;
    const i=state.favorites.indexOf(currentFilm.id);
    if(i>=0)state.favorites.splice(i,1);else state.favorites.push(currentFilm.id);
    refs.favoriteBtn.textContent=i>=0?"☆":"★";await saveState();renderLibrary();
  });

  function passportPosterFor(film){
    return streamingData?.films?.[film.id]?.poster || "";
  }

  function renderDecadeNav(){
    if(!refs.decadeNav)return;
    const decades=[...new Set(FILMS.filter(f=>state.watched.includes(f.id)).map(f=>Math.floor(f.year/10)*10))].sort((a,b)=>a-b);
    refs.decadeNav.classList.toggle("hidden",passportView!=="decades");
    if(passportView!=="decades")return;
    refs.decadeNav.innerHTML=`<button type="button" class="decade-chip ${passportDecade===null?"active":""}" data-decade="all">${escapeHtml(t("statsAll"))}</button>`+decades.map(d=>`<button type="button" class="decade-chip ${passportDecade===d?"active":""}" data-decade="${d}">${d}</button>`).join("");
  }
  function syncPassportNav(){
    document.querySelectorAll("[data-passport-view]").forEach(btn=>btn.classList.toggle("active",btn.dataset.passportView===passportView));
    renderDecadeNav();
  }
  function setPassportView(view,{scroll=true}={}){
    passportView=view;
    passportDecade=null;
    if(["all","watched","favorites","unwatched"].includes(view)) refs.filter.value=view;
    else refs.filter.value="all";
    syncPassportNav();
    renderLibrary();
    if(scroll) document.querySelector(".passport-tools")?.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function renderLibrary(){
    if(!refs.list)return;
    const q=refs.search.value.trim().toLowerCase();
    const seen=new Set(state.watched), fav=new Set(state.favorites);
    let rows=FILMS.filter(f=>{
      if(q && !(f.title+" "+f.director).toLowerCase().includes(q))return false;
      if(passportView==="watched"&&!seen.has(f.id))return false;
      if(passportView==="unwatched"&&seen.has(f.id))return false;
      if(passportView==="favorites"&&!fav.has(f.id))return false;
      if(passportView==="top25"&&f.rank>25)return false;
      if(passportView==="decades"){
        if(!seen.has(f.id))return false;
        if(passportDecade!==null && Math.floor(f.year/10)*10!==passportDecade)return false;
      }
      return true;
    });
    rows.sort(passportView==="decades"?(a,b)=>a.year-b.year||a.rank-b.rank||a.title.localeCompare(b.title):(a,b)=>a.rank-b.rank||a.title.localeCompare(b.title));
    syncPassportNav();

    refs.list.innerHTML=rows.map(f=>{
      const isSeen=seen.has(f.id), isFav=fav.has(f.id);
      const poster=isSeen?passportPosterFor(f):"";
      const serial=String(f.rank).padStart(3,"0")+"-"+String(FILMS.indexOf(f)+1).padStart(3,"0");
      return `
      <article class="passport-stub-card ${isSeen?"collected":"pending"}" data-id="${f.id}">
        <div class="passport-stub-body">
          <div class="passport-card-top"><span class="passport-mini-brand">REELSTUB</span><span class="passport-rank">#${f.rank}</span></div>
          <div class="passport-card-main ${poster?"":"no-poster"}">
            ${poster?`<span class="passport-mini-poster-wrap"><img class="passport-mini-poster" src="${escapeHtml(poster)}" alt="" loading="lazy"></span>`:""}
            <div class="passport-film-copy">
              <h3>${escapeHtml(f.title)}</h3>
              <p>${f.year} · ${escapeHtml(f.director)}</p>
            </div>
            ${isSeen?`<span class="passport-stamp" aria-hidden="true"><b>${escapeHtml(t("passportStamp"))}</b><strong>${escapeHtml(formatWatchDate(state.watchedDates[f.id]))}</strong><small>REELSTUB</small></span>`:""}
          </div>
          <div class="passport-card-foot"><span>${isSeen?t("passportStamp"):t("passportPending")}</span><span>No. ${serial}</span></div>
        </div>
        <div class="passport-stub-side">
          <span class="passport-side-label">RS</span>
          <button class="icon-btn fav-row ${isFav?"on":""}" type="button" aria-label="${escapeHtml(t("favorite"))}" title="${escapeHtml(t("favorite"))}">${isFav?"★":"☆"}</button>
          <button class="watch-toggle ${isSeen?"on":""}" type="button" aria-label="${escapeHtml(isSeen?t("seen"):t("markSeen"))}">${isSeen?"✓":"+"}</button>
        </div>
      </article>`;
    }).join("");
    updateProgress();
    if(!streamingData && state.watched.length && !passportPosterLoadStarted){
      passportPosterLoadStarted=true;
      loadStreamingData().then(()=>{
        if(refs.library?.open) renderLibrary();
      }).catch(err=>console.warn("Passport posters unavailable",err));
    }
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  refs.list.addEventListener("click",async e=>{
    const row=e.target.closest(".passport-stub-card"); if(!row)return; const id=row.dataset.id;
    if(e.target.closest(".watch-toggle")){
      const i=state.watched.indexOf(id); if(i>=0)unmarkWatched(id);else markWatched(id,true);
      await saveState();renderLibrary();
    } else if(e.target.closest(".fav-row")){
      const i=state.favorites.indexOf(id);if(i>=0)state.favorites.splice(i,1);else state.favorites.push(id);
      await saveState();renderLibrary();
    }
  });
  if(refs.aboutNav && refs.about){
    refs.aboutNav.addEventListener("click",()=>refs.about.showModal());
    refs.closeAbout?.addEventListener("click",()=>refs.about.close());
    refs.about.addEventListener("click",e=>{if(e.target===refs.about)refs.about.close();});
  }
  document.querySelector(".passport-stats")?.addEventListener("click",e=>{
    const btn=e.target.closest("[data-passport-view]");
    if(!btn)return;
    setPassportView(btn.dataset.passportView);
  });
  refs.decadeNav?.addEventListener("click",e=>{
    const btn=e.target.closest("[data-decade]");
    if(!btn)return;
    passportDecade=btn.dataset.decade==="all"?null:Number(btn.dataset.decade);
    renderLibrary();
    refs.list.scrollTop=0;
  });
  refs.libraryBtn.addEventListener("click",()=>{renderLibrary();refs.library.showModal()});
  refs.closeLibrary.addEventListener("click",()=>refs.library.close());
  refs.search.addEventListener("input",renderLibrary);
  refs.filter.addEventListener("change",()=>{
    passportView=refs.filter.value;
    passportDecade=null;
    renderLibrary();
  });

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
      watchedDates:{...guest.watchedDates,...cloud.watchedDates},
      currentId:cloud.currentId||guest.currentId,
      country:cloud.country||guest.country||DEFAULT_COUNTRY
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
    if(STREAM_TEST_MODE){
      currentFilm=FILMS.find(f=>f.title==="Do the Right Thing"&&Number(f.year)===1989)||null;
      if(currentFilm){state.currentId=currentFilm.id;renderFilm();return;}
    }
    currentFilm=FILMS.find(f=>f.id===state.currentId&&!state.watched.includes(f.id))||null;
    if(currentFilm)renderFilm();else pickFilm();
  }

  window.addEventListener("resize",()=>{if(currentFilm&&!revealed){refs.canvas.style.opacity="1";refs.canvas.style.pointerEvents="auto";resetScratch()}});
  state=readGuest();
  loadCurrent();
  applyLanguage();
  initFirebase();
})();
