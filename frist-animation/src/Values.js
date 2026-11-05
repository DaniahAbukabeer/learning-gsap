import { gsap } from 'gsap';
import { useLang } from './i18n';
import { Star } from './MenuArt';
import { sfx } from './sfx';
import './Values.css';

// "Handmade, not generated": the heading, then one long sentence that slides sideways
// while the section is pinned. As each piece reaches the screen it settles into place:
// letters drop in, labels stick on with a little tilt, a giant word shrinks into the line,
// and hand-drawn doodles draw themselves. The sentence lives in i18n.js ('values.story').

// little hand-drawn shapes (in a 0 0 60 60 box), for the heading's floating shapes
const SHAPES = {
    sparkle: <path d="M30 4 L35 25 L56 30 L35 35 L30 56 L25 35 L4 30 L25 25 Z" />,
    drop: <path d="M30 6 C36 18 46 28 46 38 A16 16 0 0 1 14 38 C14 28 24 18 30 6 Z" />,
    cloud: <path d="M14 46 C4 46 3 34 12 31 C10 20 22 13 30 19 C34 9 50 10 51 23 C59 23 61 35 54 40 C58 46 54 50 46 50 L16 50 C15 50 14.5 48 14 46 Z" />,
    ring: <circle cx="30" cy="30" r="20" />,
    squiggle: <path d="M6 34 C14 20 22 46 30 32 C38 18 46 44 54 28" />,
    plus: <path d="M30 10 V50 M10 30 H50" />,
};

// shapes floating around the heading: where (percent), size in px, color, how "deep" they are
const FLOATERS = [
    { shape: 'sparkle', x: 6, y: 14, size: 54, color: '#FFFFFF', fill: true, depth: 1.2 },
    { shape: 'cloud', x: 84, y: 8, size: 90, color: '#BAE2FF', fill: true, depth: 0.6 },
    { shape: 'drop', x: 92, y: 60, size: 44, color: '#6BBEFF', fill: true, depth: 1.4 },
    { shape: 'ring', x: 12, y: 62, size: 60, color: '#BAE2FF', fill: false, depth: 0.8 },
    { shape: 'plus', x: 40, y: 2, size: 36, color: '#6BBEFF', fill: false, depth: 1.6 },
    { shape: 'squiggle', x: 72, y: 82, size: 80, color: '#FFFFFF', fill: false, depth: 1 },
];

// the doodles inside the sentence
function Doodle({ shape }) {
    if (shape === 'star5' || shape === 'star4') return <Star kind={shape === 'star5' ? 'five' : 'four'} />;
    if (shape === 'squiggle') {
        return (
            <svg viewBox="0 0 120 60" aria-hidden="true">
                <path className="doodle-line" d="M6 40 C20 6 34 6 40 30 C46 54 62 54 70 30 C78 6 96 4 114 22" fill="none" stroke="#BAE2FF" strokeWidth="7" strokeLinecap="round" />
            </svg>
        );
    }
    if (shape === 'cloud') {
        return (
            <svg viewBox="0 0 120 80" aria-hidden="true">
                <path className="doodle-fill" d="M26 70 C8 70 6 50 20 45 C17 27 37 16 50 26 C56 9 84 10 86 32 C100 32 104 52 92 58 C98 68 90 72 80 72 Z" fill="#FFFFFF" />
                <path className="doodle-line" d="M26 70 C8 70 6 50 20 45 C17 27 37 16 50 26 C56 9 84 10 86 32 C100 32 104 52 92 58 C98 68 90 72 80 72 Z" fill="none" stroke="#BAE2FF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    // drop
    return (
        <svg viewBox="0 0 60 70" aria-hidden="true">
            <path d="M30 4 C38 20 52 32 52 46 A22 22 0 0 1 8 46 C8 32 22 20 30 4 Z" fill="#6BBEFF" />
            <path d="M22 46 A9 9 0 0 0 30 56" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

// English words are split into letters (they drop in one by one).
// Arabic letters join together, so Arabic words move as whole words.
function Letters({ text, split }) {
    if (!split) return text;
    return [...text].map((ch, i) => <span key={i} className="ch">{ch}</span>);
}

function Piece({ item, split }) {
    if (typeof item === 'string') {
        return item.split(' ').map((word, i) => (
            <span key={i} className="piece word"><Letters text={word} split={split} /></span>
        ));
    }
    if (item.low) {
        return item.low.split(' ').map((word, i) => (
            <span key={i} className="piece word low"><Letters text={word} split={split} /></span>
        ));
    }
    if (item.big) return <span className="piece big">{item.big}</span>;
    if (item.shape) return <span className={`piece doodle doodle-${item.shape}`}><Doodle shape={item.shape} /></span>;
    return (
        <span className="piece tag-wrap">
            <span className={`tag tag-${item.tone}`} data-tilt={item.tilt}>{item.tag}</span>
            {item.sub && (
                <span className={`tag tag-sub tag-${item.sub.tone}`} data-tilt={item.sub.tilt}>{item.sub.tag}</span>
            )}
        </span>
    );
}

// the whole sentence as plain text, for screen readers
const plainText = (story) => story.map((item) => (typeof item === 'string' ? item
    : item.low || item.big || (item.tag ? [item.tag, item.sub?.tag].filter(Boolean).join(' ') : ''))).filter(Boolean).join(' ');

export default function Values() {
    const { t, lang } = useLang();
    const story = t('values.story');
    return (
        <section className="values" id="values">
            <div className="values-intro">
                <div className="floaters" aria-hidden="true">
                    {FLOATERS.map((f, i) => (
                        <div
                            key={i}
                            className="floater"
                            data-depth={f.depth}
                            style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.size, height: f.size }}
                        >
                            <div className="floater-mouse">
                                <svg
                                    viewBox="0 0 60 60"
                                    fill={f.fill ? f.color : 'none'}
                                    stroke={f.fill ? 'none' : f.color}
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {SHAPES[f.shape]}
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="values-head">
                    <p className="values-kicker">{t('values.kicker')}</p>
                    <h2 className="values-title">{t('values.title')}</h2>
                    <p className="values-text">{t('values.text')}</p>
                </div>
            </div>

            {/* the sliding sentence */}
            <div className="story">
                <p className="visually-hidden">{plainText(story)}</p>
                <div className="story-track" aria-hidden="true">
                    {story.map((item, i) => <Piece key={i} item={item} split={lang !== 'ar'} />)}
                </div>
            </div>
        </section>
    );
}

// Scroll animation, called from App.js (and again when the language changes). Returns a cleanup.
export function buildValuesScroll(root) {
    const q = gsap.utils.selector(root);
    const cleanups = [];

    // 1. heading
    gsap.from(q('.values-head > *'), {
        autoAlpha: 0, y: 40, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 25%', scrub: 1 },
    });

    // 2. heading shapes drift up at different speeds and spin as you scroll...
    q('.floater').forEach((el, i) => {
        const depth = Number(el.dataset.depth);
        gsap.fromTo(el,
            { y: 80 * depth, rotation: 0 },
            {
                y: -80 * depth, rotation: (i % 2 ? -1 : 1) * 160 * depth, ease: 'none',
                scrollTrigger: { trigger: root, start: 'top bottom', end: 'top -40%', scrub: 1 },
            });
    });
    // ...and shift a little with the mouse (deeper shapes move more)
    const movers = q('.floater-mouse').map((el) => ({
        depth: Number(el.parentElement.dataset.depth),
        x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }),
    }));
    const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => { m.x(nx * 50 * m.depth); m.y(ny * 40 * m.depth); });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    cleanups.push(() => window.removeEventListener('pointermove', onMove));

    // 3. the sentence
    rebuildValuesStory(root);
    cleanups.push(() => { storyCleanup?.(); storyCleanup = null; });

    return () => cleanups.forEach((fn) => fn());
}

// The sentence: pin it and slide the line sideways. Kept separate so it can be rebuilt
// when the language changes (the words, and so all the measurements, change).
let storyCleanup = null;
export function rebuildValuesStory(root) {
    storyCleanup?.();
    storyCleanup = buildStory(root);
}

function buildStory(root) {
    const q = gsap.utils.selector(root);
    const story = q('.story')[0];
    const track = q('.story-track')[0];
    const rtl = getComputedStyle(root).direction === 'rtl';
    const travel = () => track.scrollWidth - window.innerWidth;
    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
            trigger: story,
            start: 'top top',
            end: () => `+=${travel()}`,
            pin: true,
            scrub: 0.8,
            refreshPriority: 1,        // measured early, so things after it (like the white logo) know how long it's pinned
            invalidateOnRefresh: true, // re-measure on resize
        },
    });
    tl.fromTo(track, { x: 0 }, { x: () => (rtl ? 1 : -1) * travel(), duration: 1 }, 0);

    // When does a piece reach the screen? Its distance from the start of the line,
    // turned into a point on the timeline (0 = start of the pin, 1 = end).
    const at = (el, screenFraction) => {
        const start = rtl ? track.scrollWidth - (el.offsetLeft + el.offsetWidth) : el.offsetLeft;
        return gsap.utils.clamp(0, 1, (start - window.innerWidth * screenFraction) / travel());
    };
    const window_ = (el) => {
        const from = at(el, 0.95);                      // just coming in from the side
        return { from, duration: Math.max(at(el, 0.55) - from, 0.02) }; // settled by just past the middle
    };
    // play a little sound when a piece settles (only when scrolling forwards)
    const soundAt = (time, name, volume) => tl.call(() => {
        if (tl.scrollTrigger?.direction === 1) sfx.soft(name, volume, 120);
    }, null, time);

    q('.piece').forEach((el) => {
        const { from, duration } = window_(el);
        const v = { duration, immediateRender: true };

        if (el.classList.contains('word')) {
            const letters = el.querySelectorAll('.ch');
            if (letters.length) {
                // letters drop in from below, a bit scattered, and brighten
                tl.fromTo(letters,
                    { yPercent: () => gsap.utils.random(40, 110), rotation: () => gsap.utils.random(-25, 25), opacity: 0.25 },
                    { yPercent: 0, rotation: 0, opacity: 1, ease: 'back.out(2)', stagger: { amount: duration * 0.5 }, ...v, duration: duration * 0.6 },
                    from);
            } else {
                tl.fromTo(el, { yPercent: 70, opacity: 0.25 }, { yPercent: 0, opacity: 1, ease: 'back.out(2)', ...v }, from);
            }
        } else if (el.classList.contains('big')) {
            // a giant pale word that shrinks down into the line
            tl.fromTo(el, { scale: 3.2, opacity: 0.3 }, { scale: 1, opacity: 1, ease: 'power2.out', ...v }, from);
            soundAt(from + duration * 0.8, 'boing', 0.25);
        } else if (el.classList.contains('tag-wrap')) {
            // labels stick on with a springy tilt, the little one lands on top afterwards
            el.querySelectorAll('.tag').forEach((tag, k) => {
                const tilt = Number(tag.dataset.tilt);
                const t0 = from + k * duration * 0.45;
                tl.fromTo(tag,
                    { scale: 0, rotation: tilt - 30 },
                    { scale: 1, rotation: tilt, ease: 'back.out(2.2)', duration: duration * 0.6, immediateRender: true },
                    t0);
                soundAt(t0 + duration * 0.3, 'pop', 0.3);
            });
        } else if (el.classList.contains('doodle')) {
            const lines = el.querySelectorAll('.doodle-line, .art-line');
            const fills = el.querySelectorAll('.doodle-fill, .art-fill');
            if (el.classList.contains('doodle-drop')) {
                tl.fromTo(el, { yPercent: -160, opacity: 0, scaleY: 1.3 }, { yPercent: 0, opacity: 1, scaleY: 1, ease: 'bounce.out', ...v }, from);
            } else {
                tl.fromTo(el, { rotation: -140, scale: 0.2 }, { rotation: 0, scale: 1, ease: 'back.out(1.8)', ...v }, from);
                if (lines.length) tl.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', ...v }, from);
                if (fills.length) tl.fromTo(fills, { opacity: 0 }, { opacity: 1, duration: duration * 0.4, immediateRender: true }, from + duration * 0.6);
            }
        }
    });

    // the stars keep twinkling once they're in
    const twinkles = q('.doodle .star').map((star, i) => gsap.to(star, {
        rotation: i % 2 ? -16 : 16, scale: 1.12, duration: 1.4 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1,
    }));

    // undo everything (including the pin and the inline styles) so it can be built again
    return () => {
        twinkles.forEach((tw) => tw.revert());
        tl.scrollTrigger?.kill(true);
        tl.revert();
    };
}