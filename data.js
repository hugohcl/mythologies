// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const MJ_CODE = "ZEUS";
const LS_KEY  = "myth_v5";
const APP_VERSION = '3.6.0';
const EVENT_DATE     = '29 mars 2025';
const EVENT_LOCATION = 'Dosches';

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const TEAMS = {
  grec: {
    key:"grec", name:"Équipe Grecque", mascot:"", tagline:"Les Enfants de l'Olympe",
    flavor:"Ô héros d'Athéna ! Comme Ulysse, vous voilà lancés dans une odyssée champenoise, boussole en main, sous le regard bienveillant de la chouette de la sagesse.",
    arrival:"Comme Ulysse retrouvant Ithaque après vingt ans d'errance, votre odyssée s'achève ici.",
    members:["Antoine","Bastien","Matthieu","Thomas"],
    color:"#5a8fd4", colorLight:"#2a5a9a", bg:"rgba(90,143,212,0.12)", border:"rgba(90,143,212,0.32)",
    route:["fresque","eglise","lavoir","mairie","salle"],
    emblem:'./emblem-grec.webp',
    bgTexture:'./bg-grec.webp'
  },
  nordique: {
    key:"nordique", name:"Équipe Nordique", mascot:"", tagline:"Les Guerriers du Valhalla",
    flavor:"Guerriers du Valhalla ! Odin a tracé votre saga sur les feuilles d'Yggdrasil. Le corbeau noir vole devant vous — suivez-le dans les rues de Dosches.",
    arrival:"Comme Sigurd de retour de sa quête, vos exploits seront chantés au mead-hall ce soir.",
    members:["Alex","Livia","Raphaël","Victor"],
    color:"#c8c8c8", colorLight:"#5a5a5a", bg:"rgba(160,160,160,0.10)", border:"rgba(160,160,160,0.28)",
    route:["mairie","salle","eglise","lavoir","fresque"],
    emblem:'./emblem-nordique.webp',
    bgTexture:'./bg-nordique.webp'
  },
  hindou: {
    key:"hindou", name:"Équipe Hindoue", mascot:"", tagline:"Les Disciples du Dharma",
    flavor:"Disciples du Dharma ! Le tigre sacré ouvre la voie. Chaque checkpoint est une étape de votre yatra — votre pèlerinage champenois vers le moksha.",
    arrival:"Votre yatra s'achève. Le moksha vous attend — repos mérité après ce périple.",
    members:["Axel","Jade","LG","Patrick"],
    color:"#c080e8", colorLight:"#7a3aa0", bg:"rgba(160,80,200,0.12)", border:"rgba(160,80,200,0.32)",
    route:["salle","eglise","fresque","lavoir","mairie"],
    emblem:'./emblem-hindou.webp',
    bgTexture:'./bg-hindou.webp'
  }
};

const ENIGMES = {
  fresque:"Cherchez sous le soleil de Dosches.",
  eglise: "À partir de l'arbre en fleur, marchez 24 pas vers l'est.",
  lavoir: "À partir de la chèvre, faites 21 pas nord-ouest.",
  salle:  "Placez-vous sous la fleur centrale sous le porche, et effectuez 12 pas vers le sud.",
  mairie: "Trouvez le sapeur-pompier, puis faites 12 pas en lui faisant dos.",
  ferme:  "[PLACEHOLDER]"
};

const CPS = {
  fresque:{name:"La Fresque du portail",  icon:"./cp-fresque.webp", addr:"", code:"NORD"},
  eglise: {name:"L'Église",              icon:"./cp-eglise.webp", addr:"", code:"JEAN"},
  lavoir: {name:"Le Lavoir",             icon:"./cp-lavoir.webp", addr:"", code:"ONDE"},
  salle:  {name:"La Salle Polyvalente",   icon:"./cp-salle.webp", addr:"", code:"ROSE"},
  mairie: {name:"La Mairie",             icon:"./cp-mairie.webp", addr:"", code:"LOIS"},
  ferme:  {name:"La Ferme d'Octave",     icon:"", addr:"Point de départ · 1 rue de la Fontaine des Champs", code:"FINI"}
};

// ─────────────────────────────────────────────────────────────────
// HINTS : clé = CP QUI VIENT D'ÊTRE VALIDÉ → indices vers le SUIVANT
//
// Routes (5 CP chacune, église toujours avant lavoir) :
//   Grec     : Ferme -> Fresque -> Église -> Lavoir -> Mairie -> Salle -> Ferme
//   Nordique : Ferme -> Mairie -> Salle -> Église -> Lavoir -> Fresque -> Ferme
//   Hindou   : Ferme -> Salle -> Église -> Fresque -> Lavoir -> Mairie -> Ferme
// ─────────────────────────────────────────────────────────────────
const HINTS = {

  // ── FERME → 1er checkpoint de chaque équipe ──────────────────
  ferme: {
    grec: [  // Ferme → Fresque
      "Sisyphe gravissait sa colline éternellement. Vous n'aurez qu'à la gravir là où Borée et Euros se rencontrent pour voir son éclat.",
      "Mes couleurs se mélangent à celles de l'aube du pôle, et vous feront prendre de la hauteur.",
      "Dans le quart nord-est, un portail en montée est orné d'un mur peint.",
      "La fresque de Bécassine, rue des Buchettes — en prenant la rue qui monte."
    ],
    nordique: [  // Ferme → Mairie
      "Odin lisait les runes du destin, mais celui des hommes de Midgard s'écrit sans divinité.",
      "Je garde moins de secrets que de preuves, et bien des instants décisifs passent par moi.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "La mairie."
    ],
    hindou: [  // Ferme → Salle
      "Le sabha rassemblait la communauté. Ce hall les accueille.",
      "Je ne suis spécialisée en rien, ce qui me rend utile à tous. Je réunis sans distinguer, j'abrite sans imposer.",
      "Un bâtiment ouvert à tous, pour festoyer au centre du village.",
      "La salle polyvalente."
    ]
  },

  // ── FRESQUE → prochaine étape ────────────────────────────────
  //   Grec → Église | Nordique → Ferme (dernier) | Hindou → Lavoir
  fresque: {
    grec: [  // → Église
      "Chaque polis avait son temenos, mais la fin du « poly » olympien a engendré un héritier du monde qu'il a renversé.",
      "On ne m'habite pas, mais on vient me voir pour être habité, j'abrite sans loger et j'élève sans enfanter.",
      "Un trésor de bois sculpté se cache dans un écrin de pierre. Son saint versait l'eau sur les fronts.",
      "L'église du village."
    ],
    nordique: [  // Dernier CP → retour à la Ferme
      "Comme Sigurd de retour de sa quête, votre saga s'achève. Retournez au point de départ.",
      "La rue de la Fontaine des Champs vous guide jusqu'au bout.",
      "Retournez à la ferme par la rue de la Fontaine des Champs.",
      "La Ferme d'Octave — 1 rue de la Fontaine des Champs."
    ],
    hindou: [  // → Lavoir
      "Ganga purifie les âmes depuis l'éternité. Cherchez l'endroit où l'eau servait un rituel plus humble, mais non moins sacré.",
      "La répétition est ma seule musique, je crée des souvenirs tout en les effaçant.",
      "L'eau jaillit sous un abri de pierre, en empruntant un chemin en pelouse face à la Ferme d'Octave.",
      "Le lavoir."
    ]
  },

  // ── ÉGLISE → prochaine étape ─────────────────────────────────
  //   Grec → Lavoir | Nordique → Lavoir | Hindou → Fresque
  eglise: {
    grec: [  // → Lavoir
      "Les Naïades ne chantent aucune épopée héroïque, mais mille vies anonymes.",
      "La répétition est ma seule musique, je crée des souvenirs tout en les effaçant.",
      "L'eau jaillit sous un abri de pierre, en empruntant un chemin en pelouse face à la Ferme d'Octave.",
      "Le lavoir."
    ],
    nordique: [  // → Lavoir
      "Mimir l'honore de sa sagesse, mais sans saga, sans rune et sans épée, il a pourtant gardé mille voix.",
      "La répétition est ma seule musique, je crée des souvenirs tout en les effaçant.",
      "L'eau jaillit sous un abri de pierre, en empruntant un chemin en pelouse face à la Ferme d'Octave.",
      "Le lavoir."
    ],
    hindou: [  // → Fresque
      "Là où la route montagneuse de Kubera penche vers l'aube d'Indra, les nuances éclairent le monde.",
      "Mes couleurs se mélangent à celles de l'aube du pôle, et vous feront prendre de la hauteur.",
      "Dans le quart nord-est, un portail en montée est orné d'un mur peint.",
      "La fresque de Bécassine, rue des Buchettes — en prenant la rue qui monte."
    ]
  },

  // ── LAVOIR → prochaine étape ─────────────────────────────────
  //   Grec → Mairie | Nordique → Fresque | Hindou → Mairie
  lavoir: {
    grec: [  // → Mairie
      "Solon a donné ses lois à Athènes — dans chaque cité, un édifice garde les registres du destin civique.",
      "Je garde moins de secrets que de preuves, et bien des instants décisifs passent par moi.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "La mairie."
    ],
    nordique: [  // → Fresque
      "Entre le pays glacé du Niflheim et les terres de l'aurore, les Nains illuminaient les rochers.",
      "Mes couleurs se mélangent à celles de l'aube du pôle, et vous feront prendre de la hauteur.",
      "Dans le quart nord-est, un portail en montée est orné d'un mur peint.",
      "La fresque de Bécassine, rue des Buchettes — en prenant la rue qui monte."
    ],
    hindou: [  // → Mairie
      "Ce que Dharma exigeait d'ordonner, ce que le temps dispersait sans traces, les hommes l'ont consacré sans dieu.",
      "Je garde moins de secrets que de preuves, et bien des instants décisifs passent par moi.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "La mairie."
    ]
  },

  // ── SALLE → prochaine étape ──────────────────────────────────
  //   Grec → Ferme (dernier) | Nordique → Église | Hindou → Église
  salle: {
    grec: [  // Dernier CP → retour à la Ferme
      "Comme Ulysse apercevant Ithaque, votre odyssée champenoise s'achève. Retournez au point de départ.",
      "La rue de la Fontaine des Champs vous guide jusqu'au bout.",
      "Retournez à la ferme par la rue de la Fontaine des Champs.",
      "La Ferme d'Octave — 1 rue de la Fontaine des Champs."
    ],
    nordique: [  // → Église
      "Le temple d'Ásgarðr n'a qu'un héritier à Midgard — un lieu où un seul dieu règne et où les mortels s'agenouillent.",
      "On ne m'habite pas, mais on vient me voir pour être habité, j'abrite sans loger et j'élève sans enfanter.",
      "Un trésor de bois sculpté se cache dans un écrin de pierre. Son saint versait l'eau sur les fronts.",
      "L'église du village."
    ],
    hindou: [  // → Église
      "Aucun Brahmane n'y porte le feu d'Agni, car un seul homme a verticalisé son karma.",
      "On ne m'habite pas, mais on vient me voir pour être habité, j'abrite sans loger et j'élève sans enfanter.",
      "Un trésor de bois sculpté se cache dans un écrin de pierre. Son saint versait l'eau sur les fronts.",
      "L'église du village."
    ]
  },

  // ── MAIRIE → prochaine étape ─────────────────────────────────
  //   Grec → Salle | Nordique → Salle | Hindou → Ferme (dernier)
  mairie: {
    grec: [  // → Salle
      "Un lieu qui réunissait les citoyens libres d'Athènes. Ce hall les accueille.",
      "Je ne suis spécialisée en rien, ce qui me rend utile à tous. Je réunis sans distinguer, j'abrite sans imposer.",
      "Un bâtiment ouvert à tous, pour festoyer au centre du village.",
      "La salle polyvalente."
    ],
    nordique: [  // → Salle
      "Valhöll accueillait tous les guerriers sans distinction. Ce hall les réunit.",
      "Je ne suis spécialisée en rien, ce qui me rend utile à tous. Je réunis sans distinguer, j'abrite sans imposer.",
      "Un bâtiment ouvert à tous, pour festoyer au centre du village.",
      "La salle polyvalente."
    ],
    hindou: [  // Dernier CP → retour à la Ferme
      "Votre yatra touche à sa fin. Retournez au point de départ — là où votre odyssée champenoise a commencé.",
      "La rue de la Fontaine des Champs vous guide jusqu'au bout.",
      "Retournez à la ferme par la rue de la Fontaine des Champs.",
      "La Ferme d'Octave — 1 rue de la Fontaine des Champs."
    ]
  }
};

const LVL = [
  {l:"Indice I",   p:0,  d:"Coriace",       c:"#2a9d6a"},
  {l:"Indice II",  p:3,  d:"Intermédiaire", c:"#d4a017"},
  {l:"Indice III", p:6,  d:"Facile",        c:"#d07030"},
  {l:"Indice IV",  p:10, d:"Très facile",   c:"#b83030"}
];

const ACC = {
  fresque:["fresque","la fresque","portail","buchettes"],
  eglise: ["eglise","église","saint-jean","saint jean","l'église","l'eglise"],
  lavoir: ["lavoir","le lavoir"],
  salle:  ["salle","polyvalente","rose","salle polyvalente"],
  mairie: ["mairie","la mairie"],
  ferme:  ["ferme","la ferme","octave","ferme d'octave"]
};

const CITS = {
  grec:[{t:"« Γνῶθι σεαυτόν »",s:"Connais-toi toi-même — Delphes"},{t:"« Πάντα ῥεῖ »",s:"Tout est en flux — Héraclite"},{t:"« Νίκη σύν σοφίᾳ »",s:"La victoire par la sagesse"},{t:"« Ἀρχὴ ἥμισυ παντός »",s:"Le début est la moitié du tout — Aristote"}],
  nordique:[{t:"« Vegr til Valhöll er þungr »",s:"La route vers le Valhalla est longue"},{t:"« Deyr fé, deyja frændr »",s:"Le bétail meurt, les amis meurent — Hávamál"},{t:"« Miðgarðr er víðr »",s:"Le Midgard est vaste — Edda"},{t:"« Hinn er sannr vinr »",s:"Celui qui dit la vérité est le vrai ami — Hávamál"}],
  hindou:[{t:"« चरैवेति चरैवेति »",s:"Avance, toujours avance — Aitareya Brahmana"},{t:"« सत्यमेव जयते »",s:"La vérité seule triomphe — Mundaka Upanishad"},{t:"« योगः कर्मसु कौशलम् »",s:"Le yoga est l'excellence dans l'action — Bhagavad-Gîtâ"},{t:"« अहं ब्रह्मास्मि »",s:"Je suis Brahman — Brihadaranyaka Upanishad"}]
};

const QUIZ = [
  {t:"grec",    q:"Qui est le roi des dieux de l'Olympe ?",                    a:"Zeus"},
  {t:"grec",    q:"Quel fleuve des Enfers faisait oublier les mémoires ?",    a:"Le Léthé"},
  {t:"grec",    q:"Combien de travaux Héraclès devait-il accomplir ?",         a:"12"},
  {t:"grec",    q:"Qui a tué Achille d'une flèche dans le talon ?",            a:"Pâris"},
  {t:"nordique",q:"Quel serpent ronge les racines d'Yggdrasil ?",              a:"Níðhöggr"},
  {t:"nordique",q:"Combien de mondes contient Yggdrasil ?",                    a:"9"},
  {t:"nordique",q:"Quel est le nom du marteau de Thor ?",                      a:"Mjölnir"},
  {t:"nordique",q:"Quelle est la monture d'Odin ?",                            a:"Sleipnir"},
  {t:"hindou",  q:"Combien de bras possède la déesse Durga ?",                 a:"10"},
  {t:"hindou",  q:"Quel est le premier avatar de Vishnu (forme de poisson) ?", a:"Matsya"},
  {t:"hindou",  q:"Quel dieu hindou a une tête d'éléphant ?",                  a:"Ganesh"},
  {t:"hindou",  q:"Quel est le nom de la monture de Shiva ?",                  a:"Nandi (taureau)"}
];
