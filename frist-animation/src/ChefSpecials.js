import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Cloudy from './Cloudy';
import { canBuddyFollow } from './CloudyBuddy';
import { CLOUDY_VIEWBOX, CHEF_HAT, SPATULA } from './cloudyMoods';
import { useLang, DISH_TEXT } from './i18n';
import { sfx } from './sfx';
import './ChefSpecials.css';

// PLACEHOLDER PROJECTS: replace with your real past projects (English and Arabic).
// dish: one of automation, mobile, landing, cms, agents (its name comes from the Menu)
// image: put a screenshot in public/projects/ and set e.g. image: '/projects/my-site.jpg'
const PROJECTS = [
    {
        order: '001', date: '03/2026', dish: 'landing', image: null,
        en: { client: 'Client name', title: 'Project name', line: 'One line about what we cooked up and the result.', sides: ['Design', 'Animation'] },
        ar: { client: 'اسم العميل', title: 'اسم المشروع', line: 'سطر واحد عمّا طبخناه والنتيجة.', sides: ['التصميم', 'الحركة'] }
    },
    {
        order: '002', date: '05/2026', dish: 'mobile', image: null,
        en: { client: 'Client name', title: 'Project name', line: 'One line about what we cooked up and the result.', sides: ['iOS', 'Android'] },
        ar: { client: 'اسم العميل', title: 'اسم المشروع', line: 'سطر واحد عمّا طبخناه والنتيجة.', sides: ['iOS', 'Android'] }
    },
    {
        order: '003', date: '07/2026', dish: 'agents', image: null,
        en: { client: 'Client name', title: 'Project name', line: 'One line about what we cooked up and the result.', sides: ['Ethical AI', 'Support'] },
        ar: { client: 'اسم العميل', title: 'اسم المشروع', line: 'سطر واحد عمّا طبخناه والنتيجة.', sides: ['ذكاء اصطناعي أخلاقي', 'الدعم'] }
    },
    {
        order: '004', date: '09/2026', dish: 'automation', image: null,
        en: { client: 'Client name', title: 'Project name', line: 'One line about what we cooked up and the result.', sides: ['Workflows', 'Dashboards'] },
        ar: { client: 'اسم العميل', title: 'اسم المشروع', line: 'سطر واحد عمّا طبخناه والنتيجة.', sides: ['سير العمل', 'لوحات المعلومات'] }
    },
];

const FAST_MOUSE = 4; // px per millisecond: only a really fast flick of the mouse pops his hat off

// The chef hat and spatula sit in a layer on top of Cloudy, in the same coordinates
// as his drawing, so the hat fits whichever mood he's in.
function ChefGear() {
    return (
        <svg className="chef-gear" viewBox={CLOUDY_VIEWBOX} fill="none" aria-hidden="true">
            {/* spatula, held up in his right hand */}
            <g transform="translate(270 140) rotate(200)">
                <g className="chef-spatula" dangerouslySetInnerHTML={{ __html: SPATULA }} />
            </g>
            {/* hat, positioned exactly as in your "chef Cloudy with hat" drawing */}
            <g transform="translate(119.543 -111.646)">
                <g className="chef-hat" dangerouslySetInnerHTML={{ __html: CHEF_HAT }} />
            </g>
        </svg>
    );
}

export default function ChefSpecials() {
    const root = useRef(null);
    const [mood, setMood] = useState('happy');
    const { t, lang } = useLang();

    // Chef Cloudy's reactions (no scrolling involved, so they live here)
    useGSAP((context, contextSafe) => {
        const q = gsap.utils.selector(root);
        const stage = q('.chef-stage')[0];
        const hat = q('.chef-hat')[0];
        const spatula = q('.chef-spatula')[0];
        let busy = false;      // true while his hat is in the air
        let current = 'happy'; // his mood right now
        let moodTimer;

        const show = (m) => { current = m; setMood(m); };
        const setMoodFor = (m, ms) => {
            clearTimeout(moodTimer);
            show(m);
            moodTimer = setTimeout(() => show('happy'), ms);
        };

        // spatula waves gently all the time
        gsap.set(spatula, { svgOrigin: '37 4' });
        const wave = gsap.to(spatula, { rotation: 12, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        // the hat pops off, spins and lands back on his head
        const flipHat = contextSafe(() => {
            if (busy) return;
            busy = true;
            gsap.timeline({ onComplete: () => { busy = false; } })
                .set(hat, { transformOrigin: '50% 100%' })
                .call(() => sfx.soft('pop', 0.35))
                .to(hat, { y: -80, rotation: 360, duration: 0.45, ease: 'power2.out' })
                .to(hat, { y: 0, duration: 0.6, ease: 'bounce.out' })
                .set(hat, { rotation: 0 });
        });

        const spinSpatula = contextSafe(() => {
            wave.pause();
            sfx.soft('whoosh', 0.3);
            gsap.to(spatula, {
                rotation: '+=360', duration: 0.6, ease: 'power2.inOut',
                onComplete: () => { gsap.set(spatula, { rotation: 0 }); wave.restart(); },
            });
        });

        // flick the mouse really fast while he's on screen -> hat pops off and he gets excited
        let last = null;
        const onMove = (e) => {
            const now = performance.now();
            if (last) {
                const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(now - last.t, 1);
                const r = stage.getBoundingClientRect();
                const onScreen = r.bottom > 0 && r.top < window.innerHeight;
                if (speed > FAST_MOUSE && onScreen && !busy) {
                    flipHat();
                    setMoodFor('jumping', 1200);
                }
            }
            last = { x: e.clientX, y: e.clientY, t: now };
        };

        // click him -> excited hat flip
        const onClick = () => { flipHat(); spinSpatula(); setMoodFor('jumping', 1200); };

        // hover a ticket -> excited + spatula spin
        const tickets = q('.receipt');
        const onEnter = () => { clearTimeout(moodTimer); show('jumping'); spinSpatula(); };
        const onLeave = () => { if (current === 'jumping' && !busy) show('happy'); };

        window.addEventListener('pointermove', onMove, { passive: true });
        stage.addEventListener('click', onClick);
        tickets.forEach((t) => { t.addEventListener('pointerenter', onEnter); t.addEventListener('pointerleave', onLeave); });
        return () => {
            clearTimeout(moodTimer);
            window.removeEventListener('pointermove', onMove);
            stage.removeEventListener('click', onClick);
            tickets.forEach((t) => { t.removeEventListener('pointerenter', onEnter); t.removeEventListener('pointerleave', onLeave); });
        };
    }, { scope: root });

    return (
        <section className="chef" id="chef" ref={root}>
            <div className="chef-inner">
                <div className="chef-intro">
                    <button className="chef-stage clickable" aria-label={t('chef.label')}>
                        <Cloudy mood={mood} className="chef-cloudy" />
                        <ChefGear />
                    </button>
                    <div className="chef-copy">
                        <p className="chef-kicker">{t('chef.kicker')}</p>
                        <h2 className="chef-title">{t('chef.title')}</h2>
                        <p className="chef-text">{t('chef.text')}</p>
                    </div>
                </div>

                {/* the kitchen's order rail, with a receipt clipped on for each project */}
                <div className="order-rail">
                    <svg className="rail-bar" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M6 10 H994" />
                    </svg>
                    <ul className="receipts">
                        {PROJECTS.map((p) => {
                            const text = p[lang];
                            return (
                                <li key={p.order} className="receipt-slot">
                                    <span className="receipt-clip" aria-hidden="true"></span>
                                    <article className="receipt">
                                        <header className="receipt-head">
                                            <p className="receipt-brand">{t('receipt.brand')}</p>
                                            <p className="receipt-small">{t('receipt.tagline')}</p>
                                        </header>
                                        <div className="receipt-rule" aria-hidden="true"></div>
                                        <dl className="receipt-meta">
                                            <div><dt>{t('receipt.order')}</dt><dd>#{p.order}</dd></div>
                                            <div><dt>{t('receipt.table')}</dt><dd>{text.client}</dd></div>
                                            <div><dt>{t('receipt.date')}</dt><dd>{p.date}</dd></div>
                                        </dl>
                                        <div className="receipt-rule" aria-hidden="true"></div>
                                        <p className="receipt-line"><span>1x {DISH_TEXT[lang][p.dish].single}</span><span className="leader" /><span>{t('receipt.fresh')}</span></p>
                                        <h3 className="receipt-title">{text.title}</h3>
                                        <div className="receipt-image">
                                            {p.image ? <img src={p.image} alt={text.title} /> : <span>{t('receipt.image')}</span>}
                                        </div>
                                        <p className="receipt-desc">{text.line}</p>
                                        {text.sides.map((side) => (
                                            <p key={side} className="receipt-line receipt-side"><span>+ {side}</span><span className="leader" /><span>{t('receipt.incl')}</span></p>
                                        ))}
                                        <div className="receipt-rule" aria-hidden="true"></div>
                                        <p className="receipt-line receipt-total"><span>{t('receipt.total')}</span><span className="leader" /><span>{t('receipt.happy')}</span></p>
                                        <div className="receipt-rule" aria-hidden="true"></div>
                                        <div className="receipt-barcode" aria-hidden="true"></div>
                                        <p className="receipt-thanks">{t('receipt.thanks')}</p>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}

// Scroll animation, called from App.js. Returns a cleanup function.
// On desktop the floating buddy Cloudy flies down and lands as the chef, then the hat
// drops onto his head. On phones the hat simply drops on when the section appears.
export function buildChefScroll(root) {
    const q = gsap.utils.selector(root);
    const chef = q('.chef-cloudy')[0];
    const gear = q('.chef-gear')[0];

    // the order rail draws itself, then the receipts drop onto it and swing to a stop
    gsap.set(q('.rail-bar path'), { drawSVG: '0%' });
    gsap.set(q('.receipt-slot'), { transformOrigin: '50% 0%' });
    const rail = gsap.timeline({ scrollTrigger: { trigger: q('.order-rail')[0], start: 'top 80%', toggleActions: 'play none none reverse' } });
    const forward = (fn) => () => { if (!rail.reversed()) fn(); }; // sounds only when it plays forwards
    rail
        .call(forward(() => sfx.soft('whoosh', 0.2)))
        .to(q('.rail-bar path'), { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut' })
        .from(q('.receipt-slot'), {
            autoAlpha: 0, y: -90, duration: 0.5, ease: 'power2.in', stagger: 0.12,
        }, 0.3);
    // a little clip "click" as each receipt hits the rail
    q('.receipt-slot').forEach((_, i) => rail.call(forward(() => sfx.soft('click', 0.6, 60)), null, 0.8 + i * 0.12));
    rail
        .from(q('.receipt-slot'), {
            rotation: (i) => (i % 2 ? -14 : 14), duration: 1.6, ease: 'elastic.out(1.2, 0.35)', stagger: 0.12,
        }, 0.75);
    gsap.from(q('.chef-kicker, .chef-title, .chef-text'), {
        autoAlpha: 0, y: 30, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 35%', scrub: 1 },
    });

    const dropGear = () => {
        gsap.set(gear, { autoAlpha: 1 });
        gsap.fromTo(q('.chef-hat'), { y: -170, rotation: -30 }, { y: 0, rotation: 0, duration: 0.9, ease: 'bounce.out' });
        gsap.delayedCall(0.35, () => sfx.soft('boing', 0.35)); // the hat bounces onto his head
        gsap.fromTo(q('.chef-spatula')[0].parentElement, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, delay: 0.5 });
    };
    gsap.set(gear, { autoAlpha: 0 });

    if (!canBuddyFollow()) {
        ScrollTrigger.create({ trigger: q('.chef-stage')[0], start: 'top 75%', once: true, onEnter: dropGear });
        return () => { };
    }

    // desktop: the buddy lands here and becomes the chef
    gsap.set(chef, { autoAlpha: 0 });
    const onLanded = (e) => {
        if (e.detail?.id !== 'chef') return;
        gsap.set(chef, { autoAlpha: 1 });
        dropGear();
    };
    window.addEventListener('cloudy:landed', onLanded);

    ScrollTrigger.create({
        trigger: q('.chef-stage')[0],
        start: 'top 70%',
        onEnter: () => {
            window.dispatchEvent(new CustomEvent('cloudy:land', { detail: { id: 'chef', getRect: () => chef.getBoundingClientRect() } }));
        },
        onLeaveBack: () => {
            // scrolling back up: the hat comes off and he flies off with you again
            gsap.set(gear, { autoAlpha: 0 });
            const rect = chef.getBoundingClientRect();
            gsap.set(chef, { autoAlpha: 0 });
            window.dispatchEvent(new CustomEvent('cloudy:takeoff', { detail: rect }));
        },
    });

    return () => window.removeEventListener('cloudy:landed', onLanded);
}
