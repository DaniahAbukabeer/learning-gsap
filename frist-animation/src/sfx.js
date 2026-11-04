// sfx.js
import { Howl, Howler } from 'howler';

const make = (name, volume = 0.6) =>
  new Howl({ src: [`/sounds/${name}.mp3`], volume, preload: true });

const sounds = {
  pop: make('pop'),
  whoosh: make('whoosh', 0.4),
  boing: make('boing'),
};

let enabled = false;

export const sfx = {
  enable() {            // call this from a click/tap
    enabled = true;
    Howler.ctx?.resume();
  },
  play(name) {
    // If audio isn't unlocked yet, skip the sound rather than let it play late and out of sync
    if (!enabled || Howler.ctx?.state !== 'running') return;
    sounds[name].play();
  },
};