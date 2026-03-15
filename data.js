// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const TEST_MODE = true; // Mettre false pour le vrai jeu
const MJ_CODE = "ZEUS";
const LS_KEY  = "myth_v5";
const EVENT_DATE     = '29 mars 2025';
const EVENT_LOCATION = 'Dosches';

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const TEAMS = {
  grec: {
    key:"grec", name:"Équipe Grecque", mascot:"🦉", tagline:"Les Enfants de l'Olympe",
    flavor:"Ô héros d'Athéna ! Comme Ulysse, vous voilà lancés dans une odyssée champenoise, boussole en main, sous le regard bienveillant de la chouette de la sagesse.",
    arrival:"Comme Ulysse retrouvant Ithaque après vingt ans d'errance, votre odyssée s'achève ici.",
    members:["Antoine","Bastien","Matthieu","Thomas"],
    color:"#5a8fd4", bg:"rgba(90,143,212,0.12)", border:"rgba(90,143,212,0.32)",
    route:["fresque","eglise","lavoir","salle"]
  },
  nordique: {
    key:"nordique", name:"Équipe Nordique", mascot:"🐦‍⬛", tagline:"Les Guerriers du Valhalla",
    flavor:"Guerriers du Valhalla ! Odin a tracé votre saga sur les feuilles d'Yggdrasil. Le corbeau noir vole devant vous — suivez-le dans les rues de Dosches.",
    arrival:"Comme Sigurd de retour de sa quête, vos exploits seront chantés au mead-hall ce soir.",
    members:["Alex","Livia","Raphaël","Victor"],
    color:"#c8c8c8", bg:"rgba(160,160,160,0.10)", border:"rgba(160,160,160,0.28)",
    route:["mairie","salle","fresque","lavoir"]
  },
  hindou: {
    key:"hindou", name:"Équipe Hindoue", mascot:"🐯", tagline:"Les Disciples du Dharma",
    flavor:"Disciples du Dharma ! Le tigre sacré ouvre la voie. Chaque checkpoint est une étape de votre yatra — votre pèlerinage champenois vers le moksha.",
    arrival:"Votre yatra s'achève. Le moksha vous attend — repos mérité après ce périple.",
    members:["Axel","Jade","LG","Patrick"],
    color:"#c080e8", bg:"rgba(160,80,200,0.12)", border:"rgba(160,80,200,0.32)",
    route:["lavoir","mairie","eglise","fresque"]
  }
};

const ENIGMES = {
  fresque:"[PLACEHOLDER — à compléter après repérage vendredi]",
  eglise: "[PLACEHOLDER — à compléter après repérage vendredi]",
  lavoir: "[PLACEHOLDER — à compléter après repérage vendredi]",
  salle:  "[PLACEHOLDER — à compléter après repérage vendredi]",
  mairie: "[PLACEHOLDER — à compléter après repérage vendredi]"
};

const CPS = {
  fresque:{name:"La Fresque du portail",          icon:"🎨", addr:"17 rue des Buchettes — nord-est du village", code:"NORD"},
  eglise: {name:"Église Saint-Jean-Baptiste",     icon:"⛪", addr:"Rue de l'Église — centre du village",        code:"JEAN"},
  lavoir: {name:"Le Lavoir",                      icon:"💧", addr:"Rue de la Fontaine des Champs",              code:"ONDE"},
  salle:  {name:"Salle Polyvalente de la Rose",   icon:"🌹", addr:"2 rue de la Côte aux Suisses",               code:"ROSE"},
  mairie: {name:"La Mairie",                      icon:"🏛️", addr:"4 rue du Grand-Cernay",                      code:"LOIS"},
  ferme:  {name:"La Ferme d'Octave",              icon:"🏡", addr:"1 rue de la Fontaine des Champs — ARRIVÉE",  code:null}
};

const HINTS = {
  ferme:{
    grec:[
      "Sisyphe gravissait sa colline éternellement. Vous n'aurez qu'à la gravir une fois — là où Borée et Euros se rencontrent, un artiste anonyme a peint le monde qu'il aimait.",
      "L'aiguille de fer pointe vers le quart nord-est. Suivez-la jusqu'à la montée, puis jusqu'au portail peint.",
      "Une fresque naïve représentant le village, peinte sur le portail d'une propriété en haut d'une côte, avec vue sur le moulin et les champs.",
      "La fresque peinte sur le portail, en montant vers le nord-est du village."
    ],
    nordique:[
      "Odin lisait les runes des destins ; la République lit ses lois. Elle les affiche sur un bâtiment gardé par une femme de pierre dont le prénom fleurit au printemps.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "Le seul bâtiment du village avec un drapeau tricolore et un panneau d'affichage officiel.",
      "La mairie."
    ],
    hindou:[
      "Le Gange descend du ciel pour purifier. Une source plus modeste accomplit le même office depuis des siècles, sous un toit de pierre.",
      "L'eau jaillit du sol et coule sous un abri de pierre depuis des générations. Ce lieu a disparu de nos usages mais subsiste dans le village.",
      "Un petit bassin couvert d'où sort encore de l'eau, dans la partie basse du village.",
      "Le lavoir."
    ]
  },
  fresque:{
    grec:[
      "L'Agora réunissait les citoyens libres sous le ciel d'Athènes. Ce lieu porte le nom d'une fleur liée à Aphrodite elle-même.",
      "Un bâtiment récent, ouvert à tous, dont le nom végétal pousse sur des tiges épineuses.",
      "La grande halle de charpente avec un jardin devant, sur la pente sud du village.",
      "La salle polyvalente."
    ],
    nordique:[
      "Entre Niflheim au nord et les terres de l'aurore à l'est, les Ases gravaient des runes sur les rochers. Ici, un mortel a dessiné son village sur une paroi.",
      "L'aiguille de fer pointe vers le quart nord-est. Suivez-la jusqu'à la montée, puis jusqu'au portail peint.",
      "Une fresque naïve représentant le village, peinte sur le portail d'une propriété en haut d'une côte, avec vue sur le moulin et les champs.",
      "La fresque peinte sur le portail, en montant vers le nord-est du village."
    ],
    hindou:[
      "Là où Vayu rencontre Indra — entre le vent du nord et le souffle de l'est — un pèlerin a tracé son mandala sur un portail au bout d'une montée.",
      "L'aiguille de fer pointe vers le quart nord-est. Suivez-la jusqu'à la montée, puis jusqu'au portail peint.",
      "Une fresque naïve représentant le village, peinte sur le portail d'une propriété en haut d'une côte, avec vue sur le moulin et les champs.",
      "La fresque peinte sur le portail, en montant vers le nord-est du village."
    ]
  },
  salle:{
    grec:[
      "Chaque polis avait son temenos — dédié à l'éclaireur qui précédait un plus grand et accomplissait dans les eaux d'un fleuve oriental le rite qui porte son prénom.",
      "Un trésor de bois sculpté classé par l'État se cache dans un écrin de pierre. Son saint versait l'eau sur les fronts.",
      "La vieille bâtisse de pierre avec un clocher, au cœur du village.",
      "L'église du village."
    ],
    nordique:[
      "Valhöll accueillait tous les guerriers sans distinction. Ce hall communal porte le nom d'une fleur que les scaldes offraient à leur muse.",
      "Un bâtiment récent, ouvert à tous, dont le nom végétal pousse sur des tiges épineuses.",
      "La grande halle de charpente avec un jardin devant, sur la pente sud du village.",
      "La salle polyvalente."
    ],
    hindou:[
      "Le Sabha védique rassemblait la communauté. Ce lieu porte le nom de la fleur de Lakshmi.",
      "Un bâtiment récent, ouvert à tous, dont le nom végétal pousse sur des tiges épineuses.",
      "La grande halle de charpente avec un jardin devant, sur la pente sud du village.",
      "La salle polyvalente."
    ]
  },
  eglise:{
    grec:[
      "Les Naïades habitaient chaque source. Elles ne sont plus là, mais l'eau coule encore — et la rue où elles vivaient dit dans son propre nom ce qu'elles ont toujours fait.",
      "L'eau jaillit du sol et coule sous un abri de pierre depuis des générations. Ce lieu a disparu de nos usages mais subsiste dans le village.",
      "Un petit bassin couvert d'où sort encore de l'eau, dans la partie basse du village.",
      "Le lavoir."
    ],
    nordique:[
      "Comme les Norses honoraient les Ases, ce lieu de pierre abrite un trésor sculpté — son saint annonçait dans l'eau la venue d'un autre.",
      "Un trésor de bois sculpté classé par l'État se cache dans un écrin de pierre. Son saint versait l'eau sur les fronts.",
      "La vieille bâtisse de pierre avec un clocher, au cœur du village.",
      "L'église du village."
    ],
    hindou:[
      "Chaque mandir est un axis mundi. Ce lieu de pierre abrite un trésor classé — son saint pratiquait la purification dans les eaux d'un fleuve d'Orient.",
      "Un trésor de bois sculpté classé par l'État se cache dans un écrin de pierre. Son saint versait l'eau sur les fronts.",
      "La vieille bâtisse de pierre avec un clocher, au cœur du village.",
      "L'église du village."
    ]
  },
  lavoir:{
    grec:[
      "L'Aréopage gravait les lois dans le marbre. Chaque commune française possède son propre Aréopage — et à son fronton veille une femme dont le prénom est une fleur.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "Le seul bâtiment du village avec un drapeau tricolore et un panneau d'affichage officiel.",
      "La mairie."
    ],
    nordique:[
      "Mimir gardait le puits de sagesse sous les racines d'Yggdrasil. L'eau qui jaillit ici ne donne pas la sagesse — mais elle a longtemps blanchi les draps des femmes du village.",
      "L'eau jaillit du sol et coule sous un abri de pierre depuis des générations. Ce lieu a disparu de nos usages mais subsiste dans le village.",
      "Un petit bassin couvert d'où sort encore de l'eau, dans la partie basse du village.",
      "Le lavoir."
    ],
    hindou:[
      "Brahma instaura les lois du cosmos ; la République instaure les lois des hommes. Son temple terrestre est gardé par une femme-fleur de pierre.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "Le seul bâtiment du village avec un drapeau tricolore et un panneau d'affichage officiel.",
      "La mairie."
    ]
  },
  mairie:{
    grec:[
      "Les Naïades habitaient chaque source. Elles ne sont plus là, mais l'eau coule encore — et la rue où elles vivaient dit dans son propre nom ce qu'elles ont toujours fait.",
      "L'eau jaillit du sol et coule sous un abri de pierre depuis des générations. Ce lieu a disparu de nos usages mais subsiste dans le village.",
      "Un petit bassin couvert d'où sort encore de l'eau, dans la partie basse du village.",
      "Le lavoir."
    ],
    nordique:[
      "Odin lisait les runes des destins ; la République lit ses lois. Elle les affiche sur un bâtiment gardé par une femme de pierre dont le prénom fleurit au printemps.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "Le seul bâtiment du village avec un drapeau tricolore et un panneau d'affichage officiel.",
      "La mairie."
    ],
    hindou:[
      "Brahma instaura les lois du cosmos ; la République instaure les lois des hommes. Son temple terrestre est gardé par une femme-fleur de pierre.",
      "La loi s'affiche sur ce bâtiment que chaque commune possède. Sa gardienne de pierre porte un prénom végétal — ni rose, ni lys.",
      "Le seul bâtiment du village avec un drapeau tricolore et un panneau d'affichage officiel.",
      "La mairie."
    ]
  }
};

const LVL = [
  {l:"Indice I",   p:0, d:"Coriace",       c:"#2a9d6a"},
  {l:"Indice II",  p:2, d:"Intermédiaire", c:"#d4a017"},
  {l:"Indice III", p:5, d:"Facile",        c:"#d07030"},
  {l:"Indice IV",  p:8, d:"Très facile",   c:"#b83030"}
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
  {t:"grec",    q:"Quel était le nom du cheval à 8 pattes d'Odin ?",          a:"Sleipnir"},
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
