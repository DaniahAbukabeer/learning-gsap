import './App.css';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useEffect, useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Splash from './Splash';
import Mascot from './Mascot';
import Cloud from './Cloud';
import SolaceTitle from './SolaceTitle.js';
import { sfx } from './sfx';

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

// Reusable splash burst.
// immediateRender: false goes in the SECOND object of fromTo — it stops GSAP from
// showing the drops (stacked at the center) before the burst actually starts.
const burst = (drops) => gsap.timeline()
  .fromTo(drops,
    { y: 0, autoAlpha: 1, scaleX: 0.3, scaleY: 1.3 },
    {
      y: (i, el) => -el.dataset.dist, scaleX: 1, scaleY: 1,
      duration: 0.45, ease: 'expo.out', stagger: { each: 0.012, from: 'random' },
      immediateRender: false,
    })
  .to(drops, {
    y: '-=8', scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in',
    stagger: { each: 0.015, from: 'random' },
  }, '-=0.12');

// When things happen in dvd-spin.mp3 (seconds from the start of the sound).
// The cube's spin follows these, so the motion matches the sound.
const DVD = {
  clunk: 0.12,            // disc clunks into place
  spinUpStart: 1.0,       // motor starts speeding up
  fullSpeed: 2.9,         // motor reaches full speed
  spinDownStart: 6.1,     // motor starts slowing down
  stopped: 8.4,           // motor has stopped
  clicks: [4.46, 4.78, 6.02], // little seek clicks while at full speed
};
const TOP_SPEED = 900;    // cube's full speed in degrees per second (900 = 2.5 turns a second)

const TITLE = 'Solace';
const TITLE_GAP = 28;     // space between the mascot and the title (keep in sync with App.css)
const DOCK_HEIGHT = 72;   // how tall the logo is once it sits in the top-left corner
const DOCK_LEFT = 24;     // its distance from the left edge of the screen
const DOCK_TOP = 14;      // its distance from the top of the screen

// Upright water drop for the start screen (point at the top, round at the bottom)
const START_DROP = 'M0,-14 C4,-8 9,-2 9,3 A9,9 0 0 1 -9,3 C-9,-2 -4,-8 0,-14Z';

function App() {
  const [entered, setEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const container = useRef(null);
  const spin = useRef();
  const idle = useRef();

  // Hover + click sounds for every button/link on the page
  useEffect(() => sfx.setupUiSounds(), []);

  // Fake loading for testing: starts after entering, finishes after 3s
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, [entered]);

  // Initial states, start screen, spinner loop (runs once)
  const { contextSafe } = useGSAP(() => {
    gsap.set('.drop', { autoAlpha: 0, transformOrigin: '50% 50%' });
    gsap.set(['#shade', '#face', '#legs > *', '#ground > *'], { autoAlpha: 0 });
    gsap.set('#face', { transformOrigin: '50% 50%' });
    gsap.set('#cloud .line', { drawSVG: '0%' });
    gsap.set('.loading-spinner', { scale: 0 }); // the cube appears only after a button is picked

    // The logo (mascot + title) starts dead center of the screen. Scaling from its top-left
    // corner makes the "move to the corner" step easy to calculate.
    gsap.set('.lockup', { left: '50%', top: '50%', xPercent: -50, yPercent: -50, transformOrigin: '0 0' });
    gsap.set('.hero-content > *', { autoAlpha: 0 });

    // Title letters and clouds start undrawn: no outline yet, no fill/shading yet
    gsap.set(['.letter-outline', '.cloud-line'], { drawSVG: '0%', autoAlpha: 0 });
    gsap.set(['.letter-fill', '.cloud-shade'], { autoAlpha: 0 });

    // Clouds bob gently forever (they're invisible until they're drawn)
    gsap.utils.toArray('.cloud').forEach((cloud, i) => {
      gsap.to(cloud, {
        y: i % 2 ? 10 : -10, duration: 3 + i * 0.6,
        ease: 'sine.inOut', yoyo: true, repeat: -1,
      });
    });

    // Start screen: drop bobs gently, text and buttons fade up
    gsap.set('.start-drop', { transformOrigin: '50% 100%' });
    idle.current = gsap.to('.start-drop', {
      y: -10, scaleY: 1.05, scaleX: 0.97,
      duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
    gsap.from('.start-ui > *', {
      autoAlpha: 0, y: 12, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.2,
    });

    // The cube's spin, built to match dvd-spin.mp3 second by second.
    // Speeding up with power2.in and slowing down with power2.out joins smoothly onto the
    // constant full speed in the middle, as long as each turn amount is (speed x time / 2).
    const upTime = DVD.fullSpeed - DVD.spinUpStart;
    const fullTime = DVD.spinDownStart - DVD.fullSpeed;
    const downTime = DVD.stopped - DVD.spinDownStart;

    spin.current = gsap.timeline({ paused: true })
      // clunk: a little jolt as the disc drops in
      .to('.loading-spinner', {
        keyframes: { scaleX: [1.12, 0.95, 1], scaleY: [0.88, 1.04, 1] }, duration: 0.3,
      }, DVD.clunk)
      // spin up (corners round off a little, like a disc)
      .to('.loading-spinner', {
        rotation: `+=${TOP_SPEED * upTime / 2}`, borderRadius: 26,
        duration: upTime, ease: 'power2.in',
      }, DVD.spinUpStart)
      // full speed
      .to('.loading-spinner', {
        rotation: `+=${TOP_SPEED * fullTime}`,
        duration: fullTime, ease: 'none',
      }, DVD.fullSpeed)
      // spin down back to a square
      .to('.loading-spinner', {
        rotation: `+=${TOP_SPEED * downTime / 2}`, borderRadius: 0,
        duration: downTime, ease: 'power2.out',
      }, DVD.spinDownStart);

    // a tiny twitch on each seek click
    DVD.clicks.forEach((t) => {
      spin.current.to('.loading-spinner', { keyframes: { scale: [1.06, 1] }, duration: 0.12 }, t);
    });
  }, { scope: container });

  // A start-screen button was clicked
  const handleEnter = contextSafe((withSound) => {
    if (withSound) {
      // Happens directly inside the click, so the browser allows the audio
      sfx.enable();
      sfx.play('click'); // this first click happened before sound was on, so play it now
    }

    idle.current?.kill();

    gsap.timeline({
      onComplete: () => {
        // Start the spin and its sound at the exact same moment so they stay in sync
        spin.current.play(0);
        sfx.play('spin');
        setEntered(true);    // starts the (fake) loading timer
      },
    })
      // buttons and text drop away
      .to('.start-ui', { autoAlpha: 0, y: 16, duration: 0.25, ease: 'power2.in' }, 0)
      // drop squashes, then shrinks away...
      .to('.start-drop', { y: 0, scaleX: 1.3, scaleY: 0.65, duration: 0.14, ease: 'power2.out' }, 0)
      .to('.start-drop', { scale: 0, transformOrigin: '50% 50%', duration: 0.18, ease: 'back.in(2)' })
      // ...and the cube grows out of the same spot
      .to('.loading-spinner', { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.06');
  });

  // Where the logo should sit so that mascot + title together are centered on screen
  // (and shrunk to fit on narrow phones). Measured at the moment it's needed.
  const centeredLogo = () => {
    const lockup = container.current.querySelector('.lockup');
    const title = container.current.querySelector('.title');
    const w = lockup.offsetWidth;
    const h = lockup.offsetHeight;
    const total = w + TITLE_GAP + title.offsetWidth;
    const scale = Math.min(1, (window.innerWidth - 32) / total);
    return { x: w / 2 - (scale * total) / 2, y: h / 2 - (scale * h) / 2, scale };
  };

  // "Solace" gets written letter by letter: a pen traces each letter's outline,
  // then the color fills in with a tiny settle.
  const writeTitle = () => {
    const tl = gsap.timeline();
    container.current.querySelectorAll('.title-letter').forEach((letter, i) => {
      const at = i * 0.28; // when this letter starts
      tl.call(() => sfx.play('type'), null, at)
        .fromTo(letter.querySelector('.letter-outline'),
          { autoAlpha: 1, drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.45, ease: 'power1.inOut', immediateRender: false },
          at)
        .fromTo(letter.querySelector('.letter-fill'),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.2, ease: 'power1.out', immediateRender: false },
          at + 0.35)
        .to(letter, {
          keyframes: { scale: [1.07, 1] }, transformOrigin: '50% 100%',
          duration: 0.3, ease: 'power2.out',
        }, at + 0.35);
    });
    return tl;
  };

  // Each cloud's lines get drawn on, then its shading fades in
  const drawClouds = () => {
    const tl = gsap.timeline();
    container.current.querySelectorAll('.cloud').forEach((cloud, i) => {
      const at = i * 0.15;
      tl.fromTo(cloud,
        { x: cloud.dataset.side === 'left' ? -30 : 30 },
        { x: 0, duration: 1.4, ease: 'power2.out', immediateRender: false },
        at)
        .fromTo(cloud.querySelectorAll('.cloud-line'),
          { autoAlpha: 1, drawSVG: '0%' },
          { drawSVG: '100%', duration: 1.1, ease: 'power1.inOut', immediateRender: false },
          at)
        .fromTo(cloud.querySelectorAll('.cloud-shade'),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: 'power1.out', immediateRender: false },
          at + 0.8);
    });
    return tl;
  };

  // Spin while loading -> pop -> flash -> logo -> mascot -> title -> header -> hero
  useGSAP(() => {
    if (isLoading) return;

    spin.current?.pause();
    sfx.stop('spin', 150); // fade the spin sound out as the cube pops

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.timeline()
      // 1. cube pops
      .to('.loading-spinner', { scale: 1.12, duration: 0.12, ease: 'power2.out' })
      .to('.loading-spinner', { scale: 0, duration: 0.12, ease: 'power3.in' })
      .addLabel('pop', '-=0.04')
      .call(() => sfx.play('pop'), null, 'pop')
      .add(burst('.loader-splash .drop'), 'pop')

      // 2. one flash; the background switches to light while the flash hides it
      .addLabel('flash', 'pop+=0.3')
      .to('.flash', { autoAlpha: reduceMotion ? 0 : 0.85, duration: 0.05 }, 'flash')
      .set(container.current, { backgroundColor: '#f2f8ff' }, 'flash+=0.05')
      .to('.flash', { autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, 'flash+=0.05')

      // 3. the cloud logo draws itself, then holds for a beat
      .addLabel('cloud', 'flash+=0.1')
      .call(() => sfx.play('whoosh'), null, 'cloud')
      .to('#cloud .line', { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut' }, 'cloud')
      .from('#body', { scale: 0.8, transformOrigin: '50% 60%', duration: 0.7, ease: 'back.out(1.7)' }, 'cloud')

      // 4. face lands and shakes into place, cloud squashes, second splash
      .addLabel('face', '+=0.3')
      .call(() => sfx.play('boing'), null, 'face')
      .to('#shade', { autoAlpha: 1, duration: 0.2 }, 'face')
      .fromTo('#face',
        { autoAlpha: 0, y: -30, scale: 0.5 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(3)' }, 'face')
      .to('#face', {
        keyframes: { rotation: [-10, 8, -5, 3, 0], x: [-4, 4, -2, 1, 0] },
        duration: 0.45,
      }, 'face+=0.25')
      .to('#body', {
        keyframes: { scaleX: [1.08, 0.97, 1], scaleY: [0.92, 1.04, 1] },
        transformOrigin: '50% 100%', duration: 0.4,
      }, 'face+=0.2')
      .add(burst('.mascot-splash .drop'), 'face+=0.2')

      // 5. legs pop out, ground lines draw from the center
      .fromTo('#legs > *',
        { autoAlpha: 0, y: 20, scaleY: 0.4, transformOrigin: '50% 0%' },
        { autoAlpha: 1, y: 0, scaleY: 1, duration: 0.35, ease: 'back.out(2.5)', stagger: 0.07 },
        'face+=0.3')
      .fromTo('#ground > *',
        { autoAlpha: 1, drawSVG: '50% 50%' },
        { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out', stagger: 0.05, immediateRender: false },
        'face+=0.45')

      // 6. mascot slides left while "Solace" gets written out, letter by letter
      .addLabel('title', '+=0.35')
      .to('.lockup', {
        x: () => centeredLogo().x, y: () => centeredLogo().y, scale: () => centeredLogo().scale,
        duration: 0.7, ease: 'power3.inOut',
      }, 'title')
      .add(writeTitle(), 'title+=0.3')

      // 7. the whole logo floats up into the top-left corner and becomes the header logo
      .addLabel('dock', '+=0.6')
      .call(() => sfx.play('whoosh'), null, 'dock')
      .to('.lockup', {
        left: DOCK_LEFT, top: DOCK_TOP, xPercent: 0, yPercent: 0, x: 0, y: 0,
        scale: () => DOCK_HEIGHT / container.current.querySelector('.lockup').offsetHeight,
        duration: 0.9, ease: 'power3.inOut',
      }, 'dock')

      // 8. clouds get drawn in around the edges, then the hero content rises up
      .add(drawClouds(), 'dock+=0.35')
      .fromTo('.hero-content > *',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1, immediateRender: false },
        'dock+=0.55');
  }, { dependencies: [isLoading, entered], scope: container });

  return (
    <div className="App" ref={container}>
      <div className="flash"></div>

      {/* The logo: starts as the loading animation in the middle, ends as the header logo */}
      <div className="lockup">
        <div className="stage">
          <svg className="start-drop" viewBox="-12 -16 24 30" width="64" height="80" aria-hidden="true">
            <path d={START_DROP} fill="#bfe0ff" />
          </svg>
          <Splash className="loader-splash" />
          <Splash className="mascot-splash" color="#6db6ff" spread={2.2} size={320} />
          <Mascot />
          <div className="loading-spinner"></div>
        </div>
        <h1 className="title" aria-label={TITLE}>
          <SolaceTitle />
        </h1>
      </div>

      {!entered && (
        <div className="start-ui">
          <p className="start-title">Ready to make a splash?</p>
          <div className="start-buttons">
            <button className="btn btn-primary" onClick={() => handleEnter(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              Enter with sound
            </button>
            <button className="btn btn-secondary" onClick={() => handleEnter(false)}>
              Continue without sound
            </button>
          </div>
        </div>
      )}

      {/* Hero section: the first thing on the real page */}
      <main className="hero">
        <Cloud name="cloud2" className="cloud-a" side="left" size={0.28} />
        <Cloud name="cloud11" className="cloud-b" side="left" size={0.3} />
        <Cloud name="cloud3" className="cloud-c" side="left" size={0.32} />
        <Cloud name="cloud1" className="cloud-d" side="right" size={0.3} />
        <Cloud name="cloud5" className="cloud-e" side="right" size={0.32} />

        <div className="hero-content">
          {/* PLACEHOLDER COPY: replace with your real headline, text and button */}
          <h2 className="hero-title">A softer place to land</h2>
          <p className="hero-text">
            Placeholder text: one or two sentences about what Solace is and who it's for.
          </p>
          <a className="btn btn-hero" href="#start">Get started</a>
        </div>
      </main>
    </div>
  );
}

export default App;