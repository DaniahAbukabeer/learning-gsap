import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Cloudy from './Cloudy';

// CloudyBuddy.js: Cloudy hops off the page and follows your cursor (desktop only).
//
// He's controlled with two window events (sent by the Meet Cloudy section):
//   'cloudy:takeoff'  detail: the DOMRect of the Cloudy he takes off from
//   'cloudy:land'     detail: { getRect } - a function returning where to land
// When he's landed he sends 'cloudy:landed'.
//
// While following you he changes mood: jumping when you hover something clickable,
// whistling if you stop moving for a while, sad if your mouse leaves the window.

const OFFSET_X = 26;   // where he floats relative to the cursor
const OFFSET_Y = 18;
const FOLLOW = 0.1;    // how quickly he catches up (0-1, bigger = snappier)
const IDLE_MS = 4000;  // stop moving this long and he starts whistling

export const canBuddyFollow = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function CloudyBuddy() {
    const ref = useRef(null);
    const [mood, setMood] = useState('happy');

    useGSAP(() => {
        const el = ref.current;
        const hop = el.querySelector('.buddy-hop');
        const size = () => el.offsetWidth;

        let mode = 'off';            // 'off' | 'flying' | 'landing'
        let landRect = null;          // function: where to land
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let idleTimer;
        const pos = { x: 0, y: 0, s: 1, r: 0 };

        gsap.set(el, { transformOrigin: '0 0' });
        const setX = gsap.quickSetter(el, 'x', 'px');
        const setY = gsap.quickSetter(el, 'y', 'px');
        const setS = gsap.quickSetter(el, 'scale');
        const setR = gsap.quickSetter(el, 'rotation', 'deg');

        // gentle floating bob
        gsap.to(el.querySelector('.buddy-bob'), { y: -7, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        // every frame: glide toward the target (the cursor, or the landing spot)
        const tick = () => {
            if (mode === 'off') return;
            const ease = mode === 'landing' ? 0.16 : FOLLOW;
            const k = 1 - Math.pow(1 - ease, gsap.ticker.deltaRatio(60));
            let tx; let ty; let ts;
            if (mode === 'flying') {
                tx = mx + OFFSET_X; ty = my + OFFSET_Y; ts = 1;
            } else {
                const r = landRect();
                tx = r.left; ty = r.top; ts = r.width / size();
            }
            pos.x += (tx - pos.x) * k;
            pos.y += (ty - pos.y) * k;
            pos.s += (ts - pos.s) * k;
            // lean into the direction he's moving
            const lean = gsap.utils.clamp(-16, 16, (tx - pos.x) * 0.06);
            pos.r += (lean - pos.r) * 0.2;
            setX(pos.x); setY(pos.y); setS(pos.s); setR(pos.r);

            if (mode === 'landing' && Math.abs(tx - pos.x) < 1.5 && Math.abs(ty - pos.y) < 1.5 && Math.abs(ts - pos.s) < 0.01) {
                mode = 'off';
                gsap.set(el, { autoAlpha: 0 });
                window.dispatchEvent(new Event('cloudy:landed'));
            }
        };
        gsap.ticker.add(tick);

        const onMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (mode !== 'flying') return;
            const overClickable = !!e.target.closest?.('a, button, [role="button"], input, .clickable');
            setMood(overClickable ? 'jumping' : 'happy');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => { if (mode === 'flying') setMood('whistling'); }, IDLE_MS);
        };
        const onOut = (e) => { if (!e.relatedTarget && mode === 'flying') setMood('sad'); };

        const onTakeoff = (e) => {
            if (!canBuddyFollow()) return;
            const r = e.detail;
            if (mode === 'off') Object.assign(pos, { x: r.left, y: r.top, s: r.width / size(), r: 0 });
            mode = 'flying';
            gsap.set(el, { autoAlpha: 1 });
            setMood('jumping');
            gsap.fromTo(hop, { y: 0 }, { keyframes: { y: [-70, 0] }, duration: 0.9, ease: 'power1.inOut' });
            gsap.delayedCall(1, () => { if (mode === 'flying') setMood('happy'); });
        };
        const onLand = (e) => {
            if (mode === 'off') return;
            landRect = e.detail.getRect;
            mode = 'landing';
            setMood('happy');
            clearTimeout(idleTimer);
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('mouseout', onOut);
        window.addEventListener('cloudy:takeoff', onTakeoff);
        window.addEventListener('cloudy:land', onLand);
        return () => {
            gsap.ticker.remove(tick);
            clearTimeout(idleTimer);
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('mouseout', onOut);
            window.removeEventListener('cloudy:takeoff', onTakeoff);
            window.removeEventListener('cloudy:land', onLand);
        };
    }, { scope: ref });

    return (
        <div className="cloudy-buddy" ref={ref} aria-hidden="true">
            <div className="buddy-hop">
                <div className="buddy-bob">
                    <Cloudy mood={mood} />
                </div>
            </div>
        </div>
    );
}