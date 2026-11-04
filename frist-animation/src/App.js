import './App.css';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useEffect, useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Splash from './Splash';
import Mascot from './Mascot';
import { sfx } from './sfx';

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

// Reusable splash burst (same motion as before)
const burst = (drops) => gsap.timeline()
  .fromTo(drops,
    { y: 0, autoAlpha: 1, scaleX: 0.3, scaleY: 1.3 },
    {
      y: (i, el) => -el.dataset.dist, scaleX: 1, scaleY: 1,
      duration: 0.45, ease: 'expo.out', stagger: { each: 0.012, from: 'random' },
    })
  .to(drops, {
    y: '-=8', scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in',
    stagger: { each: 0.015, from: 'random' },
  }, '-=0.12');

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [entered, setEntered] = useState(false);
  const container = useRef(null);
  const tween = useRef();

  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, [entered]);



  // Initial states + spinner loop
  useGSAP(() => {
    gsap.set('.drop', { autoAlpha: 0, transformOrigin: '50% 50%' });
    gsap.set(['#shade', '#face', '#legs > *', '#ground > *'], { autoAlpha: 0 });
    gsap.set('#face', { transformOrigin: '50% 50%' });
    gsap.set('#cloud .line', { drawSVG: '0%' });

    tween.current = gsap.to('.loading-spinner', {
      rotate: 360, ease: 'circ.in', yoyo: true, repeat: -1,
      duration: 3, borderRadius: 120, paused: true,
    });
  }, { scope: container });

  // Pop -> flash -> logo -> mascot
  useGSAP(() => {
    if (isLoading) {
      if (entered) tween.current?.play();
      return;
    }
    tween.current?.pause();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.timeline({ onComplete: () => setIntroDone(true) })
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
      .from('#cloud', { scale: 0.8, transformOrigin: '50% 60%', duration: 0.7, ease: 'back.out(1.7)' }, 'cloud')

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
      .to('#cloud', {
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
        { drawSVG: '0% 100%', duration: 0.3, ease: 'power2.out', stagger: 0.05 },
        'face+=0.45');
  }, { dependencies: [isLoading, entered], scope: container });

  return (
    <div className="App">
      <header className="App-header" ref={container}>
        {!entered && (
          <button className="enter" onClick={() => { sfx.enable(); setEntered(true); }}>
            Tap to enter
          </button>
        )}
        <div className="flash"></div>
        <div className="stage">
          <Splash className="loader-splash" />
          <Splash className="mascot-splash" color="#6db6ff" spread={2.2} size={320} />
          <Mascot />
          <div className="loading-spinner"></div>
        </div>
        {introDone && <div className="done-loading">Loaded!</div>}
      </header>
    </div>
  );
}

export default App;