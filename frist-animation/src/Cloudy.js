import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { MOODS, CLOUDY_VIEWBOX, EYE_CENTER } from './cloudyMoods';
import './Cloudy.css';

// Cloudy.js: drop Cloudy anywhere, in any mood. His pupils follow the cursor and he blinks.
//
//   <Cloudy mood="confused" />   (e.g. a 404 page)
//   <Cloudy mood="happy" />      (e.g. after sending the contact form)
//
// Moods: happy, jumping, confused, sad, sideEye, weird, done, angry, whistling
// (whistling has no moving pupils; his eyes are drawn as one piece with their outline)

const LOOK_X = 4.5; // how far the pupils can move sideways (in the drawing's units)
const LOOK_Y = 3.5; // ...and up/down
const [VB_X, VB_Y, VB_W, VB_H] = CLOUDY_VIEWBOX.split(' ').map(Number);

export default function Cloudy({ mood = 'happy', className = '', followEyes = true, blink = true, label }) {
    const ref = useRef(null);

    useGSAP(() => {
        const svg = ref.current;
        const pupils = svg.querySelectorAll('.pupil');
        if (!pupils.length) return undefined;
        gsap.set(pupils, { transformOrigin: '50% 50%' });

        // ----- eyes follow the cursor -----
        let onMove;
        if (followEyes) {
            const xTo = gsap.quickTo(pupils, 'x', { duration: 0.35, ease: 'power3' });
            const yTo = gsap.quickTo(pupils, 'y', { duration: 0.35, ease: 'power3' });
            onMove = (e) => {
                const r = svg.getBoundingClientRect();
                if (!r.width) return;
                // where Cloudy's eyes are on screen
                const eyeX = r.left + ((EYE_CENTER.x - VB_X) / VB_W) * r.width;
                const eyeY = r.top + ((EYE_CENTER.y - VB_Y) / VB_H) * r.height;
                const dx = e.clientX - eyeX;
                const dy = e.clientY - eyeY;
                const dist = Math.hypot(dx, dy) || 1;
                const reach = Math.min(dist / 180, 1); // a nearby cursor = a smaller glance
                xTo((dx / dist) * LOOK_X * reach);
                yTo((dy / dist) * LOOK_Y * reach);
            };
            window.addEventListener('pointermove', onMove, { passive: true });
        }

        // ----- a blink every few seconds -----
        if (blink) {
            gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(2.5, 5), delay: gsap.utils.random(0.5, 3) })
                .to(pupils, { scaleY: 0.1, duration: 0.07, ease: 'power1.in' })
                .to(pupils, { scaleY: 1, duration: 0.12, ease: 'power1.out' });
        }

        return () => { if (onMove) window.removeEventListener('pointermove', onMove); };
    }, { dependencies: [mood, followEyes, blink], scope: ref, revertOnUpdate: true });

    return (
        <svg
            ref={ref}
            className={`cloudy ${className}`}
            viewBox={CLOUDY_VIEWBOX}
            fill="none"
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            // the mood's drawing (from cloudyMoods.js)
            dangerouslySetInnerHTML={{ __html: MOODS[mood] || MOODS.happy }}
        />
    );
}