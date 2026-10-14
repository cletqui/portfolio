import { CLIENT_FLAGS } from "../../shared/flags";
import type { Translate } from "../../shared/i18n";
import type { GameApi } from "../types";

export interface Line {
  text: string;
  cls?: string;
}
export type Status = "playing" | "won" | "quit";
type RoomId = "reception" | "aisle" | "server" | "storage" | "control";
type Item = "badge" | "flashlight" | "fuse";
type Dir = "n" | "s" | "e" | "w";

export const PASSWORD = "tcp-ack-42";

const VERBS: Record<string, string> = {
  look: "look", l: "look", regarder: "look", voir: "look", observer: "look",
  examine: "examine", x: "examine", examiner: "examine", inspecter: "examine",
  take: "take", get: "take", grab: "take", prendre: "take", ramasser: "take",
  drop: "drop", poser: "drop", lacher: "drop",
  go: "go", walk: "go", run: "go", aller: "go", va: "go",
  open: "open", ouvrir: "open",
  use: "use", insert: "use", slot: "use", swipe: "use", utiliser: "use", passer: "use", inserer: "use",
  read: "read", lire: "read",
  move: "move", push: "move", pousser: "move", deplacer: "move",
  inventory: "inv", i: "inv", inv: "inv", inventaire: "inv",
  help: "help", aide: "help", "?": "help",
  hint: "hint", indice: "hint",
  quit: "quit", q: "quit", quitter: "quit",
  login: "login", kick: "kick", frapper: "kick", xyzzy: "xyzzy",
};
const DIRS: Record<string, Dir> = {
  n: "n", north: "n", nord: "n", s: "s", south: "s", sud: "s", e: "e", east: "e", est: "e", w: "w", west: "w", o: "w", ouest: "w",
};
const THINGS: Record<string, string> = {
  drawer: "drawer", tiroir: "drawer", desk: "desk", bureau: "desk", plant: "plant", plante: "plant", monitor: "monitor", ecran: "monitor",
  badge: "badge", flashlight: "flashlight", torch: "flashlight", lampe: "flashlight", torche: "flashlight", fuse: "fuse", fusible: "fuse",
  fusebox: "fusebox", box: "fusebox", tableau: "fusebox", boxes: "boxes", cartons: "boxes", boite: "boxes", boites: "boxes",
  note: "note", postit: "note", "post-it": "note", rack: "rack", baie: "rack", terminal: "terminal", ordinateur: "terminal",
  reader: "reader", lecteur: "reader",
};
const ARTICLES = /\b(the|a|an|le|la|les|l'|un|une|des|du|de|d'|to|vers|au|aux|sur|on|with|avec|in|dans)\b/g;

export const normalise = (text: string): string =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(ARTICLES, " ").replace(/['’]/g, " ").replace(/\s+/g, " ").trim();

export class Adventure {
  private inventory: Item[] = [];
  private flags = { drawer: false, door: false, power: false, boxes: false, note: false };
  private room: RoomId = "reception";
  private askingPassword = false;
  moves = 0;
  status: Status = "playing";
  private out: Line[] = [];

  constructor(private readonly t: Translate) {}

  private say(text: string, cls?: string): void {
    this.out.push({ text, cls });
  }
  private has(item: Item): boolean {
    return this.inventory.includes(item);
  }
  private itemName(item: Item): string {
    const { t } = this;
    return { badge: t("a staff badge", "un badge de service"), flashlight: t("a flashlight", "une lampe torche"), fuse: t("a 20A fuse", "un fusible de 20A") }[item];
  }
  private itemsHere(): Item[] {
    if (this.room === "reception" && this.flags.drawer) return (["badge", "flashlight"] as Item[]).filter((i) => !this.has(i));
    if (this.room === "storage" && this.flags.boxes && !this.has("fuse")) return ["fuse"];
    return [];
  }
  private dark(): boolean {
    return this.room === "storage" && !this.has("flashlight");
  }

  intro(): Line[] {
    const { t } = this;
    this.out = [];
    this.say(t("COLOSSAL DATA CENTER", "DATACENTER COLOSSAL"), "font-semibold");
    this.say(t("You wake up on the floor of a data center at 3 a.m. The doors are locked and the power is out. Find a way out. Type `help` for verbs.", "Tu te réveilles par terre dans un datacenter à 3 h du matin. Les portes sont verrouillées et le courant est coupé. Trouve la sortie. Tape `help` pour les verbes."), "text-muted-foreground");
    this.describe();
    return this.flush();
  }

  private flush(): Line[] {
    const lines = this.out;
    this.out = [];
    return lines;
  }

  private roomText(): { title: string; desc: string } {
    const { t, flags } = this;
    switch (this.room) {
      case "reception":
        return {
          title: t("RECEPTION", "RÉCEPTION"),
          desc: t("The lights are off except for a red emergency strip. A reception desk with a drawer, a dead monitor, a plant that has seen things. A door leads north; a badge reader blinks beside it.", "Les lumières sont éteintes, sauf une bande rouge de secours. Un bureau d'accueil avec un tiroir, un écran mort, une plante qui en a vu d'autres. Une porte mène au nord ; un lecteur de badge clignote à côté.") + (flags.drawer ? "" : t(" The drawer is closed.", " Le tiroir est fermé.")),
        };
      case "aisle":
        return {
          title: t("COLD AISLE", "ALLÉE FROIDE"),
          desc: t("A long corridor of humming racks, cold air rising from the floor tiles. Doors: south (reception), east (server room), west (storage), north (control room, a heavy door with a dead magnetic lock). A fuse box on the wall has an empty slot.", "Un long couloir de baies bourdonnantes, de l'air froid monte des dalles. Portes : sud (réception), est (salle serveurs), ouest (stockage), nord (salle de contrôle, une lourde porte au verrou magnétique éteint). Un tableau électrique au mur a un emplacement vide.") + (flags.power ? t(" The fuse box hums happily.", " Le tableau électrique ronronne.") : ""),
        };
      case "server":
        return {
          title: t("SERVER ROOM", "SALLE SERVEURS"),
          desc: t("Racks, racks, racks, and a thousand blinking LEDs. A yellow sticky note is stuck to rack 7. A door leads west.", "Des baies, des baies, des baies, et mille LED qui clignotent. Un post-it jaune est collé sur la baie 7. Une porte mène à l'ouest."),
        };
      case "storage":
        return {
          title: t("STORAGE", "STOCKAGE"),
          desc: this.dark()
            ? t("It is pitch dark in here. You can hear boxes shifting. You need some light. The door is east.", "Il fait nuit noire ici. Tu entends des cartons bouger. Il te faut de la lumière. La porte est à l'est.")
            : t("Shelves of spare cables and a stack of cardboard boxes. The door is east.", "Des étagères de câbles de rechange et une pile de cartons. La porte est à l'est.") + (flags.boxes && !this.has("fuse") ? t(" A spare fuse sits where the boxes were.", " Un fusible de rechange est là où étaient les cartons.") : ""),
        };
      case "control":
        return {
          title: t("CONTROL ROOM", "SALLE DE CONTRÔLE"),
          desc: t("Screens everywhere, all dark but one terminal glowing green: EMERGENCY EXIT: LOGIN REQUIRED. The door south leads back to the aisle.", "Des écrans partout, tous éteints sauf un terminal vert : SORTIE DE SECOURS : CONNEXION REQUISE. La porte sud ramène à l'allée."),
        };
    }
  }

  private describe(): void {
    const { title, desc } = this.roomText();
    this.say("");
    this.say(title, "font-semibold");
    this.say(desc);
    const items = this.itemsHere();
    if (items.length && !this.dark()) this.say(this.t("You see: ", "Tu vois : ") + items.map((i) => this.itemName(i)).join(", ") + ".");
  }

  private hint(): string {
    const { t, flags } = this;
    if (!flags.drawer) return t("Desks have drawers. Drawers can be opened.", "Les bureaux ont des tiroirs. Les tiroirs s'ouvrent.");
    if (!this.has("badge")) return t("Take the badge from the drawer.", "Prends le badge dans le tiroir.");
    if (!flags.door) return t("A reader and a badge: use one on the other.", "Un lecteur et un badge : utilise l'un sur l'autre.");
    if (!flags.power)
      return this.has("fuse")
        ? t("The empty slot in the aisle wants that fuse.", "L'emplacement vide dans l'allée attend ce fusible.")
        : t("You need a fuse. Storage is dark, you will need light, and the boxes might hide something.", "Il te faut un fusible. Le stockage est sombre, il te faut de la lumière, et les cartons cachent peut-être quelque chose.");
    if (!flags.note) return t("Someone left a password lying around in the server room.", "Quelqu'un a laissé un mot de passe traîner dans la salle serveurs.");
    return t("The terminal in the control room wants that password.", "Le terminal de la salle de contrôle veut ce mot de passe.");
  }

  private go(dir: Dir): void {
    const { t, flags } = this;
    const exits: Record<RoomId, Partial<Record<Dir, RoomId>>> = {
      reception: { n: "aisle" },
      aisle: { s: "reception", e: "server", w: "storage", n: "control" },
      server: { w: "aisle" },
      storage: { e: "aisle" },
      control: { s: "aisle" },
    };
    const dest = exits[this.room][dir];
    if (!dest) return this.say(t("You can't go that way.", "Tu ne peux pas aller par là."));
    if (this.room === "reception" && dir === "n" && !flags.door) return this.say(t("The badge reader blinks red. The door stays shut.", "Le lecteur de badge clignote en rouge. La porte reste fermée."));
    if (this.room === "aisle" && dir === "n" && !flags.power) return this.say(t("The control room door is dead: the magnetic lock has no power. The fuse box beside it has an empty slot.", "La porte de la salle de contrôle est morte : le verrou magnétique n'a plus de courant. Le tableau électrique à côté a un emplacement vide."));
    this.room = dest;
    this.describe();
  }

  private examineText(thing: string): string {
    const { t, flags } = this;
    const texts: Record<string, string> = {
      desk: t("A reception desk. It has a drawer.", "Un bureau d'accueil. Il a un tiroir."),
      drawer: flags.drawer ? t("The drawer is open.", "Le tiroir est ouvert.") : t("A closed drawer. It looks openable.", "Un tiroir fermé. Il a l'air de s'ouvrir."),
      plant: t("It's plastic. It has seen things.", "Elle est en plastique. Elle en a vu d'autres."),
      monitor: t("Dead. It reflects a very tired intern.", "Mort. Il reflète un stagiaire très fatigué."),
      reader: t("A badge reader. A tiny LED blinks red.", "Un lecteur de badge. Une petite LED clignote en rouge."),
      badge: t("A staff badge. 'INTERN' it says, optimistically.", "Un badge de service. « STAGIAIRE », dit-il, avec optimisme."),
      flashlight: t("A small flashlight. It works.", "Une petite lampe torche. Elle marche."),
      fuse: t("A 20A fuse, the kind that holds a building together.", "Un fusible de 20A, du genre qui tient un bâtiment debout."),
      fusebox: t("A fuse box with one empty slot, marked 20A.", "Un tableau électrique avec un emplacement vide, marqué 20A."),
      boxes: t("A teetering stack of cardboard boxes. They look movable.", "Une pile branlante de cartons. Ils ont l'air déplaçables."),
      rack: t("Rack 7. A sticky note is stuck to it.", "La baie 7. Un post-it y est collé."),
      note: t(`Handwritten: 'control terminal password: ${PASSWORD}' (underlined twice).`, `Écrit à la main : « mot de passe du terminal de contrôle : ${PASSWORD} » (souligné deux fois).`),
      terminal: t("A green terminal: EMERGENCY EXIT, LOGIN REQUIRED.", "Un terminal vert : SORTIE DE SECOURS, CONNEXION REQUISE."),
    };
    if (thing === "note" && this.room === "server") flags.note = true;
    return texts[thing] ?? t("Nothing special.", "Rien de spécial.");
  }

  private win(): void {
    const { t } = this;
    this.status = "won";
    this.say("");
    this.say(t("The terminal blinks. EMERGENCY EXIT UNLOCKED. Somewhere, a heavy gate rolls open.", "Le terminal clignote. SORTIE DE SECOURS DÉVERROUILLÉE. Quelque part, un lourd portail s'ouvre."), "text-green-500");
    this.say(t("You step outside as the sun comes up over the car park. The night shift never knew you were there.", "Tu sors alors que le soleil se lève sur le parking. L'équipe de nuit ne t'a jamais vu."));
    this.say(t(`You escaped in ${this.moves} moves.`, `Tu t'es échappé en ${this.moves} coups.`));
  }

  handle(line: string): Line[] {
    this.out = [];
    this.dispatch(line);
    return this.flush();
  }

  private dispatch(line: string): void {
    const { t, flags } = this;
    if (this.askingPassword) {
      this.askingPassword = false;
      this.moves++;
      if (line.trim() === PASSWORD) return this.win();
      return this.say(t("ACCESS DENIED. The terminal looks smug.", "ACCÈS REFUSÉ. Le terminal a l'air suffisant."));
    }
    const words = normalise(line).split(" ").filter(Boolean);
    const first = words[0];
    if (!first) return;
    let verb = VERBS[first];
    let thing: string | null = null;
    let dir: Dir | null = null;
    for (const w of words.slice(1)) {
      if (THINGS[w] && !thing) thing = THINGS[w]!;
      if (DIRS[w] && !dir) dir = DIRS[w]!;
    }
    if (!verb && DIRS[first]) {
      verb = "go";
      dir = DIRS[first]!;
    }
    if (!verb) return this.say(t("I don't understand that. Try `help`.", "Je ne comprends pas. Essaie `help`."));

    if (verb === "help") return this.say(t("Verbs: look, examine <thing>, take <item>, drop <item>, go <north|south|east|west> (or n/s/e/w), open <thing>, use <item>, read <thing>, move <thing>, inventory, hint, quit.", "Verbes : regarder, examiner <chose>, prendre <objet>, poser <objet>, aller <nord|sud|est|ouest> (ou n/s/e/o), ouvrir <chose>, utiliser <objet>, lire <chose>, déplacer <chose>, inventaire, indice, quitter."));
    if (verb === "hint") return this.say(this.hint());
    if (verb === "quit") {
      this.status = "quit";
      return this.say(t("You give up and nap under the reception desk. Type `adventure` to try again.", "Tu abandonnes et fais la sieste sous le bureau. Tape `adventure` pour réessayer."));
    }
    if (verb === "inv") return this.say(this.inventory.length ? t("You carry: ", "Tu portes : ") + this.inventory.map((i) => this.itemName(i)).join(", ") + "." : t("You are empty-handed.", "Tu n'as rien sur toi."));
    if (verb === "xyzzy") return this.say(t("Nothing happens. (Wrong game.)", "Il ne se passe rien. (Mauvais jeu.)"));

    this.moves++;
    if (this.dark() && verb !== "go" && verb !== "look") return this.say(t("It is too dark to do that.", "Il fait trop sombre pour ça."));
    if (verb === "go") return dir ? this.go(dir) : this.say(t("Go where?", "Aller où ?"));
    if (verb === "look") {
      if (!thing) return this.describe();
      verb = "examine";
    }
    if (verb === "examine") return thing ? this.say(this.examineText(thing)) : this.say(t("Examine what?", "Examiner quoi ?"));
    if (verb === "read") {
      if (thing === "note" && this.room === "server") {
        flags.note = true;
        return this.say(t(`The note says: 'control terminal password: ${PASSWORD}'`, `Le post-it dit : « mot de passe du terminal de contrôle : ${PASSWORD} »`));
      }
      return this.say(t("Nothing to read there.", "Rien à lire ici."));
    }
    if (verb === "open") {
      if (thing === "drawer" && this.room === "reception") {
        if (flags.drawer) return this.say(t("It's already open.", "Il est déjà ouvert."));
        flags.drawer = true;
        return this.say(t("Inside the drawer: a staff badge and a flashlight.", "Dans le tiroir : un badge de service et une lampe torche."));
      }
      return this.say(t("You can't open that.", "Tu ne peux pas ouvrir ça."));
    }
    if (verb === "move") {
      if (thing === "boxes" && this.room === "storage") {
        if (flags.boxes) return this.say(t("You already moved them.", "Tu les as déjà déplacés."));
        flags.boxes = true;
        return this.say(t("Behind the boxes you find a spare fuse.", "Derrière les cartons, tu trouves un fusible de rechange."));
      }
      return this.say(t("It doesn't budge.", "Ça ne bouge pas."));
    }
    if (verb === "take") {
      const item = thing as Item | null;
      if (!item || !["badge", "flashlight", "fuse"].includes(item)) return this.say(t("You can't take that.", "Tu ne peux pas prendre ça."));
      if (this.has(item)) return this.say(t("You already have it.", "Tu l'as déjà."));
      if (!this.itemsHere().includes(item)) return this.say(t("You don't see that here.", "Tu ne vois pas ça ici."));
      this.inventory.push(item);
      return this.say(t("Taken.", "Pris."));
    }
    if (verb === "drop") return !thing || !this.has(thing as Item) ? this.say(t("You don't have that.", "Tu n'as pas ça.")) : this.say(t("You'd rather keep it. It might matter.", "Tu préfères le garder. Ça peut servir."));
    if (verb === "kick") return this.say(t("Ow. The rack does not care.", "Aïe. La baie s'en fiche."));
    if (verb === "login" || (verb === "use" && thing === "terminal")) {
      if (this.room !== "control") return this.say(t("There is no terminal here.", "Il n'y a pas de terminal ici."));
      this.askingPassword = true;
      return this.say(t("PASSWORD:", "MOT DE PASSE :"));
    }
    if (verb === "use") return this.use(thing);
    this.say(t("I don't understand that.", "Je ne comprends pas."));
  }

  private use(thing: string | null): void {
    const { t, flags } = this;
    if (thing === "badge" || thing === "reader") {
      if (!this.has("badge")) return this.say(t("You don't have a badge.", "Tu n'as pas de badge."));
      if (this.room !== "reception") return this.say(t("There is no reader here.", "Il n'y a pas de lecteur ici."));
      if (flags.door) return this.say(t("The door is already unlocked.", "La porte est déjà déverrouillée."));
      flags.door = true;
      return this.say(t("BEEP. The reader turns green and the door unlocks.", "BIP. Le lecteur passe au vert et la porte se déverrouille."));
    }
    if (thing === "fuse" || thing === "fusebox") {
      if (!this.has("fuse")) return this.say(t("You don't have a fuse.", "Tu n'as pas de fusible."));
      if (this.room !== "aisle") return this.say(t("There is no fuse box here.", "Il n'y a pas de tableau électrique ici."));
      if (flags.power) return this.say(t("The fuse is already in.", "Le fusible est déjà en place."));
      flags.power = true;
      return this.say(t("You slot the fuse in. The lights flicker on, and somewhere a lock clunks.", "Tu enfiles le fusible. Les lumières se rallument, et quelque part un verrou claque."));
    }
    if (thing === "flashlight") return this.say(t("You have light whenever you carry it.", "Tu as de la lumière tant que tu la portes."));
    this.say(t("That doesn't do anything here.", "Ça ne fait rien ici."));
  }
}

export const runAdventure = (api: GameApi): number => {
  const game = new Adventure(api.t);
  const show = (lines: Line[]) => lines.forEach((l) => api.print(l.text, l.cls));
  show(game.intro());
  api.setMode({
    prompt: ">",
    onLine: (line) => {
      show(game.handle(line));
      if (game.status === "won") {
        api.endMode();
        api.award(CLIENT_FLAGS.adventure);
      } else if (game.status === "quit") api.endMode();
    },
    onCtrlC: () => {
      api.endMode();
      api.print("^C");
    },
  });
  return 0;
};
