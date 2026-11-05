import { Howl, Howler } from 'howler';

// All sound files live in public/sounds/
const make = (name, volume = 0.6, sprite) => {
    const sound = new Howl({
        src: [`/sounds/${name}.mp3`],
        volume,
        sprite,
        preload: true,
        onload: () => console.info(`[sfx] loaded ${name}.mp3`),
        onloaderror: (id, err) =>
            console.warn(`[sfx] could NOT load /sounds/${name}.mp3 (${err}). Check the file is in public/sounds/ and the name matches exactly.`),
    });
    return sound;
};


const sounds = {
    pop: make('pop'),
    whoosh: make('whoosh', 0.4),
    boing: make('boing'),
    spin: make('dvd-spin', 0.8), // the cube's spin follows this sound (see DVD in App.js)
    hover: make('hover', 1.0), // max volume (1.0); was 0.25
    click: make('clickbutton', 0.5),
    type: make('clickbutton', 0.2), // soft click for each letter of the title

    // ---- Menu section sounds (files in public/sounds/) ----
    clocheLift: make('cloche-lift', 0.6),   // lid lifting off the plate
    clocheClose: make('cloche-close', 0.5), // lid set back down
    steam: make('steam', 0.3),              // soft steam / sizzle as the dish appears
    bell: make('service-bell', 0.5),        // "order up!" ding when the dish is served
};

// ---- Optional sounds: add these files to public/sounds/ whenever you find them ----
// Until a file exists, the website quietly uses a stand-in sound instead (see `soft` below).
const optional = (key, file, volume) => {
    sounds[key] = new Howl({
        src: [`/sounds/${file}.mp3`],
        volume,
        preload: true,
        onloaderror: () => { delete sounds[key]; }, // not added yet: fine, use the stand-in
    });
};
optional('scribble', 'scribble', 0.5); // a quick pencil scribble (doodles drawing themselves)

// ---- The values sentence (short clips cut from the sounds you sent) ----
sounds.tape = make('tape', 0.5);       // a quick rip of tape: the big labels being taped on
sounds.sticker = make('sticker', 0.6); // a sticker slapped on: the little labels on top
sounds.popup = make('popup', 0.45);    // a cartoon pop: the stars spinning in
sounds.drip = make('drip', 0.5);       // a water drop: the raindrop
sounds.chair = make('chair', 0.45);
sounds.rip = make('rip', 0.6);         // paper tearing: a receipt ripped off the rail
sounds.paper = make('paper', 0.5);     // paper rustling: receipts sliding along the rail    // a chair scraping across the floor: the chairs at the ends of the Menu's table

let enabled = false;

// ---- Background audio: constant cloud ambience + shuffled music ----
// Plays from the moment the hero appears, for the whole visit.
// Volumes are set per file so they sit evenly and softly under everything else.
const AMBIENCE_VOLUME = 0.12; // background-clouds.mp3 is a loud file, so it stays low
const MUSIC = [
    { file: 'elevator-music', volume: 0.08 },
    { file: 'LOFIMUSIC', volume: 0.14 }, // a quieter recording, so a little higher
];

const ambience = new Howl({
    src: ['/sounds/background-clouds.mp3'],
    // loop a slice that skips the file's tiny silent padding, so the loop has no gap
    sprite: { loop: [50, 21950, true] },
    volume: 0,
    preload: true,
    onloaderror: () => console.warn('[sfx] could NOT load /sounds/background-clouds.mp3'),
});

let backgroundOn = false;
let musicOn = true; // the music key on the deck (the cloud ambience keeps playing either way)
let track = null;
let lastTrack = -1;

function playNextTrack() {
    // pick a random track, never the same one twice in a row
    let i = Math.floor(Math.random() * MUSIC.length);
    if (MUSIC.length > 1 && i === lastTrack) i = (i + 1) % MUSIC.length;
    lastTrack = i;
    const { file, volume } = MUSIC[i];

    // fade the old track out while the new one fades in
    if (track) {
        const old = track;
        old.off('end');
        old.fade(old.volume(), 0, 1500);
        old.once('fade', () => old.unload());
    }
    const next = new Howl({
        src: [`/sounds/${file}.mp3`],
        html5: true, // streams music instead of loading it all first
        volume: 0,
        onloaderror: () => console.warn(`[sfx] could NOT load /sounds/${file}.mp3`),
    });
    next.once('play', () => next.fade(0, volume, 2000));
    next.once('end', playNextTrack); // when a song ends, shuffle to another
    track = next;
    next.play();
}

const lastSoft = {}; // when each soft sound last played

export const sfx = {
    // Must be called directly inside a click/tap handler
    enable() {
        enabled = true;
        Howler.ctx?.resume();
    },

    isEnabled: () => enabled,

    // Start the cloud ambience + music (only once, and only if sound is on)
    startBackground() {
        if (!enabled || backgroundOn) return;
        backgroundOn = true;
        ambience.play('loop');
        ambience.fade(0, AMBIENCE_VOLUME, 3000);
        if (musicOn) playNextTrack();
    },

    // Skip to another random song (and turn the music back on if it was stopped)
    shuffleMusic() {
        musicOn = true;
        if (backgroundOn) playNextTrack();
    },

    // Stop / start only the music (sound effects and the cloud ambience stay on)
    setMusic(on) {
        musicOn = on;
        if (!backgroundOn) return;
        if (on) {
            if (!track) playNextTrack();
        } else if (track) {
            const old = track;
            track = null;
            old.off('end');
            old.fade(old.volume(), 0, 600);
            old.once('fade', () => old.unload());
        }
    },

    isMusicOn: () => musicOn,

    // The "ka-chunk" of a cassette player key: a low press, then a little latch click
    key() {
        sfx.soft('click', 1, 0, 0.6);
        setTimeout(() => sfx.soft('type', 1.6, 0, 1.5), 70);
    },

    // Mute / unmute the whole website
    setMuted(muted) {
        Howler.mute(muted);
    },

    // Play a sound from start to finish
    play(name, part) {
        if (!enabled || !sounds[name]) return; // skips sounds you haven't added yet
        sounds[name].play(part);
    },

    // A quieter, "background" version of a sound for things moving on the page.
    // The same sound won't repeat within `gap` ms, so fast scrolling never piles them up.
    // `name` can also be a list, e.g. ['sticker', 'click']: the first one that's loaded plays.
    // `rate` changes the pitch for this play (1 = normal, 1.3 = higher), for a bit of variety.
    soft(names, volume = 0.3, gap = 150, rate = 1) {
        const name = [].concat(names).find((n) => sounds[n]?.state() === 'loaded');
        if (!enabled || !name) return;
        const now = performance.now();
        if (now - (lastSoft[name] || 0) < gap) return;
        lastSoft[name] = now;
        const s = sounds[name];
        const id = s.play();
        s.volume(s.volume() * volume, id); // only this play is quieter
        if (rate !== 1) s.rate(rate, id);
    },

    // Fade a sound out and stop it (used to end the spin sound at the pop)
    stop(name, fadeMs = 150) {
        const s = sounds[name];
        if (!s.playing()) return;
        const volume = s.volume();
        s.fade(volume, 0, fadeMs);
        s.once('fade', () => {
            s.stop();
            s.volume(volume); // reset, so it plays at full volume next time
        });
    },

    // Hover + click sounds for the whole page. Returns a cleanup function.
    setupUiSounds() {
        const CLICKABLE = 'button, a, [role="button"], input[type="submit"], .clickable';
        let hovered = null;

        const onOver = (e) => {
            if (e.pointerType !== 'mouse') return;          // no hover sounds on touch screens
            const el = e.target.closest(CLICKABLE);
            if (el && el !== hovered) sfx.play('hover');    // only once when entering an element
            hovered = el;
        };

        // any click, anywhere (the deck's keys make their own cassette sound instead)
        const onDown = (e) => { if (!e.target.closest('.deck-key')) sfx.play('click'); };

        document.addEventListener('pointerover', onOver);
        document.addEventListener('pointerdown', onDown);
        return () => {
            document.removeEventListener('pointerover', onOver);
            document.removeEventListener('pointerdown', onDown);
        };
    },
};