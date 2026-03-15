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
    route:["moulin","eglise","mairie","lavoir"]
  },
  nordique: {
    key:"nordique", name:"Équipe Nordique", mascot:"🐦‍⬛", tagline:"Les Guerriers du Valhalla",
    flavor:"Guerriers du Valhalla ! Odin a tracé votre saga sur les feuilles d'Yggdrasil. Le corbeau noir vole devant vous — suivez-le dans les rues de Dosches.",
    arrival:"Comme Sigurd de retour de sa quête, vos exploits seront chantés au mead-hall ce soir.",
    members:["Alex","Livia","Raphaël","Victor"],
    color:"#c8c8c8", bg:"rgba(160,160,160,0.10)", border:"rgba(160,160,160,0.28)",
    route:["mairie","moulin","lavoir","eglise"]
  },
  hindou: {
    key:"hindou", name:"Équipe Hindoue", mascot:"🐯", tagline:"Les Disciples du Dharma",
    flavor:"Disciples du Dharma ! Le tigre sacré ouvre la voie. Chaque checkpoint est une étape de votre yatra — votre pèlerinage champenois vers le moksha.",
    arrival:"Votre yatra s'achève. Le moksha vous attend — repos mérité après ce périple.",
    members:["Axel","Jade","LG","Patrick"],
    color:"#c080e8", bg:"rgba(160,80,200,0.12)", border:"rgba(160,80,200,0.32)",
    route:["lavoir","mairie","eglise","moulin"]
  }
};

const ENIGMES = {
  moulin:"Face à l'entrée du moulin, tournez-vous vers la haie à l'est. Comptez 15 pas. Cherchez sous la pierre plate la plus éloignée du chemin. [PLACEHOLDER — à compléter vendredi]",
  eglise:"Entrez dans le cimetière par le portail. Longez le mur de droite sur 8 pas. Cherchez dans le creux du troisième pilier, à hauteur de genou. [PLACEHOLDER — à compléter vendredi]",
  mairie:"Face à la Mairie, prenez à droite. Derrière le panneau d'affichage, à 1,20m de hauteur. [PLACEHOLDER — à compléter vendredi]",
  lavoir:"Depuis le bassin, longez le mur nord sur 10 pas. Cherchez derrière le lierre dans le creux du deuxième pilier. [PLACEHOLDER — à compléter vendredi]"
};

const CPS = {
  moulin:{name:"Moulin de Dosches",        icon:"⚙️", addr:"Rue du Moulin — sommet du village",           code:"VENT"},
  eglise:{name:"Église Saint-Jean-Baptiste",icon:"⛪", addr:"Centre du village — Rue de l'Église",         code:"JEAN"},
  mairie:{name:"La Mairie",                 icon:"🏛️",addr:"4 rue du Grand-Cernay",                       code:"LOIS"},
  lavoir:{name:"Le Lavoir",                 icon:"💧", addr:"4 rue de la Fontaine des Champs",             code:"ONDE"},
  ferme: {name:"La Ferme d'Octave",         icon:"🏡", addr:"1 rue de la Fontaine des Champs — ARRIVÉE",   code:null}
};

const HINTS = {
  ferme:{
    grec:["Dans la tradition des Anciens, chaque cité avait son temenos. À Dosches, cherchez ce qui domine tous les toits depuis une colline — une construction de bois dont quatre bras captent le souffle des plaines de Champagne. Inaugurée en 2007, elle reproduit ce que le XVIIIe siècle érigea avant que la révolution industrielle ne le condamne au silence.","Cherchez à Dosches ce qui domine le village depuis sa colline — une construction en bois dont les quatre bras captent le souffle des plaines. On le voit depuis la Grande Rue si on sait lever la tête.","Montez vers le sommet du village. Cherchez une structure en bois qui tourne avec le vent.","Moulin de Dosches — Rue du Moulin, au sommet du village."],
    nordique:["Odin a tracé votre première étape. Dans le Midgard de Dosches, le pouvoir de l'État s'exerce depuis un bâtiment gardé par le buste d'une femme allégorique dont le prénom est celui d'une fleur symbole de liberté. Il siège au numéro 4 d'une rue portant le nom d'un cours d'eau qui borde les terres agricoles à l'ouest du bourg.","Comme Asgard avait ses halls de gouvernance, chaque commune française a son bâtiment officiel orné de Marianne. Trouvez-le à Dosches — sur une rue portant le nom d'un grand ruisseau.","Le bâtiment officiel qui gouverne la commune. Cherchez le drapeau tricolore.","La Mairie — 4 rue du Grand-Cernay."],
    hindou:["Dans la cosmologie hindoue, l'eau est purificatrice — Ganga descend des cieux pour laver les péchés des mortels. À Dosches, une source naturelle alimente un bassin de pierre couvert, refuge des lavandières. La rue sur laquelle il se trouve dit dans son propre nom ce qui y coule.","L'eau est sacrée dans la tradition hindoue. À Dosches, cherchez le bassin de pierre couvert alimenté par une source naturelle. La rue indique dans son nom ce qui y jaillit.","Un bassin de pierre couvert, alimenté par une source. La rue de ce lieu évoque l'eau et les champs.","Le Lavoir — 4 rue de la Fontaine des Champs."]
  },
  moulin:{
    grec:["Dans la tradition des Anciens, un édifice de pierre conserve une œuvre en bois polychrome classée Monument Historique. Son saint tutélaire était l'éclaireur : il accomplissait dans les eaux d'un fleuve oriental le rite qui porte désormais son prénom.","Cherchez à Dosches le lieu de culte chrétien dont le saint patron a donné son nom au rite de l'eau. Il abrite un trésor classé Monument Historique.","L'église du village, dédiée à un saint dont le nom est aussi un prénom très courant.","Église Saint-Jean-Baptiste — centre du village."],
    nordique:["Mimir gardait sous les racines d'Yggdrasil un puits dont les eaux conféraient la sagesse absolue. À Dosches, une source naturelle alimente un bassin de pierre couvert. Cette source porte le prénom du saint tutélaire de l'église, et la rue dit dans son propre nom ce qui y coule.","Trouvez le bassin de pierre couvert du village. La rue où il se situe porte le nom de ce qui y jaillit.","Le lavoir du village, alimenté par une source. La rue évoque l'eau et les champs.","Le Lavoir — 4 rue de la Fontaine des Champs."],
    hindou:["Le pèlerin qui achève son yatra retrouve son ashram. Votre demeure porte le prénom d'un homme dont le nom latin évoque le rang de huitième — Octavius. Elle vous attend au numéro 1 de la rue portant le nom de ce qui jaillit librement des terres champenoises.","Le moksha est proche. Votre maison de base est une ferme dont le nom contient un prénom masculin latin. Elle est au numéro 1 d'une rue dont le nom évoque une source des champs.","Votre maison de base — une ferme dont le nom est un prénom d'homme.","La Ferme d'Octave — 1 rue de la Fontaine des Champs. C'est l'arrivée !"]
  },
  eglise:{
    grec:["L'Aréopage d'Athènes était le conseil des sages. La République française perpétue cette tradition dans un bâtiment gardé par le buste d'une femme allégorique dont le prénom est celui d'une fleur symbole de liberté. À Dosches, il siège au numéro 4 d'une rue portant le nom d'un cours d'eau à l'ouest.","Les hommes gouvernent depuis un bâtiment orné de Marianne. Trouvez-le à Dosches — sur une rue portant le nom d'un grand ruisseau.","Le bâtiment officiel qui gère la commune. Cherchez le drapeau tricolore.","La Mairie — 4 rue du Grand-Cernay."],
    nordique:["Comme Sigurd trouva son repos après mille épreuves, votre saga s'achève. Votre mead-hall porte le prénom d'un homme dont le nom latin évoque le huitième rang — il vous attend au numéro 1 de la rue portant le nom de ce qui jaillit naturellement des Champs.","Tout guerrier revient au mead-hall. Votre maison de base est une ferme dont le nom contient un prénom masculin. Elle est au numéro 1 d'une rue évoquant une source.","Votre maison de base — une ferme dont le nom est un prénom d'homme.","La Ferme d'Octave — 1 rue de la Fontaine des Champs. C'est l'arrivée !"],
    hindou:["Vayu, dieu védique du vent, insuffle sa puissance dans une construction de bois qui domine le village. Réhabilité en 2007, cet édifice à quatre bras se dresse au point le plus élevé du territoire communal, visible depuis la Grande Rue pour qui sait lever les yeux.","Le vent est sacré dans la cosmologie hindoue. Cherchez au sommet du village la structure en bois dont les quatre ailes captent le souffle de Vayu.","Montez vers le point le plus haut du village. Cherchez quelque chose qui tourne avec le vent.","Le Moulin de Dosches — Rue du Moulin, au sommet du village."]
  },
  mairie:{
    grec:["Les Naïades peuplaient chaque source. À Dosches, une source qui porte le prénom du saint tutélaire de l'église alimente un bassin de pierre couvert. La rue dit dans son nom ce qui y coule.","Poséidon régnait sur toutes les eaux. Cherchez à Dosches le bassin de pierre couvert, alimenté par une source. La rue indique dans son nom ce qui y jaillit.","Un bassin de pierre couvert, alimenté par une source. La rue évoque l'eau et les champs.","Le Lavoir — 4 rue de la Fontaine des Champs."],
    nordique:["Tel Yggdrasil dont les branches touchent les neuf cieux, une construction de bois s'élève au-dessus du village. Ses quatre bras captent le souffle d'Odin. Elle fut reconstituée en 2007 selon les plans d'un moulin à pivot du XVIIIe siècle.","Cherchez en haut du village la structure à quatre ailes qui tourne avec le souffle du nord.","Montez vers le point le plus haut du village. Cherchez quelque chose qui tourne avec le vent.","Le Moulin de Dosches — Rue du Moulin, au sommet du village."],
    hindou:["Dans la tradition hindoue, chaque mandir est un axis mundi. À Dosches, un édifice dont le transept remonte au XVIe siècle abrite une Vierge à l'Enfant en bois polychrome classée Monument Historique. Son saint patron fut le premier à reconnaître le divin dans l'humain — dans les eaux d'un fleuve oriental.","L'église du village abrite un trésor classé. Son saint patron pratiquait un rite de purification dans l'eau.","Le lieu de culte du village. Son saint patron est connu pour un rite pratiqué dans l'eau.","Église Saint-Jean-Baptiste — centre du village."]
  },
  lavoir:{
    grec:["Ulysse, après vingt ans d'errance, reconnut enfin les rivages de son île. Comme lui, votre odyssée touche à sa fin. Votre Ithaque est une ferme portant le prénom d'un homme dont le nom latin évoque le rang de huitième — elle vous attend au numéro 1 de la rue portant le nom de ce qui jaillit naturellement des champs.","Votre base est une ferme champenoise dont le nom contient un prénom masculin latin. Au numéro 1 d'une rue évoquant une source des champs.","Votre maison de base — une ferme dont le nom est un prénom d'homme.","La Ferme d'Octave — 1 rue de la Fontaine des Champs. C'est l'arrivée !"],
    nordique:["Les hommes du Midgard érigèrent leurs sanctuaires pour dialoguer avec le divin. À Dosches, un édifice dont le transept remonte au XVIe siècle abrite une Vierge à l'Enfant classée Monument Historique. Son saint fut envoyé en éclaireur — il annonçait un autre dans les eaux du Jourdain.","L'église du village abrite un trésor classé. Son saint patron pratiquait un rite dans l'eau.","Le lieu de culte du village. Son saint patron est connu pour un rite pratiqué dans l'eau.","Église Saint-Jean-Baptiste — centre du village."],
    hindou:["Brahma instaura l'ordre cosmique. Dans chaque commune française, un bâtiment perpétue cet ordre — il porte le buste d'une femme allégorique dont le prénom est celui d'une fleur symbole de liberté. À Dosches, il siège au numéro 4 d'une rue portant le nom d'un cours d'eau qui serpente à l'ouest.","Indra règne sur les cieux ; sur terre, la République gouverne depuis la Mairie. Trouvez celle de Dosches — sur une rue portant le nom d'un ruisseau.","Le bâtiment officiel qui gère la commune. Cherchez le drapeau tricolore.","La Mairie — 4 rue du Grand-Cernay."]
  }
};

const LVL = [
  {l:"Indice I",  p:0,  d:"Coriace",       c:"#2a9d6a"},
  {l:"Indice II", p:2,  d:"Intermédiaire", c:"#d4a017"},
  {l:"Indice III",p:5,  d:"Facile",        c:"#d07030"},
  {l:"Indice IV", p:10, d:"Très facile",   c:"#b83030"}
];

const ACC = {
  moulin:["moulin","le moulin","moulin de dosches"],
  eglise:["église","eglise","saint-jean","saint jean","l'église","l'eglise"],
  mairie:["mairie","la mairie"],
  lavoir:["lavoir","le lavoir"],
  ferme: ["ferme","la ferme","ferme d'octave","octave"]
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
