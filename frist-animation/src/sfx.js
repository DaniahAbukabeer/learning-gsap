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
};

let enabled = false;

export const sfx = {
    // Must be called directly inside a click/tap handler
    enable() {
        enabled = true;
        Howler.ctx?.resume();
    },

    isEnabled: () => enabled,

    // Play a sound from start to finish
    play(name, part) {
        if (!enabled) return;
        sounds[name].play(part);
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

        const onDown = () => sfx.play('click');           // any click, anywhere

        document.addEventListener('pointerover', onOver);
        document.addEventListener('pointerdown', onDown);
        return () => {
            document.removeEventListener('pointerover', onOver);
            document.removeEventListener('pointerdown', onDown);
        };
    },
};