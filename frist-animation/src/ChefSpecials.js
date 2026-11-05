import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Cloudy from './Cloudy';
import { canBuddyFollow } from './CloudyBuddy';
import { CLOUDY_VIEWBOX, CHEF_HAT, SPATULA } from './cloudyMoods';
import { useLang } from './i18n';
import { sfx } from './sfx';
import './ChefSpecials.css';

// THE PROJECTS: one receipt each (a client with three projects gets three receipts).
// en / ar:
//   client: who it was for (brand names stay as they are in Arabic too)
//   title:  the project's name, big on the receipt
//   type:   what we made for them
// dish:  which Menu dish it is (automation, mobile, landing, cms, agents)
// tech:  optional, shown as small labels, e.g. ['three.js']
// image: null for now (shows a placeholder); later e.g. '/projects/dream-coffee.jpg' in public/projects/
// link:  optional, the live project, e.g. 'https://example.com'
// For a project's own page you can also add detail: { brief, cooked, results } inside en/ar
// (see DETAIL_PLACEHOLDER below for the shape)
const PROJECTS = [
    {
        order: '001', dish: 'automation', tech: [], image: null,
        en: { client: 'Shadow', title: 'Shadow ERP', type: 'ERP system' },
        ar: { client: 'Shadow', title: 'Shadow ERP', type: 'نظام تخطيط موارد المؤسسة' }
    },
    {
        order: '002', dish: 'mobile', tech: [], image: null,
        en: { client: 'Shadow', title: 'Shadow App', type: 'Mobile app' },
        ar: { client: 'Shadow', title: 'Shadow App', type: 'تطبيق جوال' }
    },
    {
        order: '003', dish: 'landing', tech: ['three.js'], image: null,
        en: { client: 'Shadow', title: 'Shadow Website', type: 'Website' },
        ar: { client: 'Shadow', title: 'Shadow Website', type: 'موقع إلكتروني' }
    },
    {
        order: '004', dish: 'automation', tech: [], image: null,
        en: { client: 'Hez', title: 'Hez', type: 'Distribution management system' },
        ar: { client: 'Hez', title: 'Hez', type: 'نظام إدارة التوزيع' }
    },
    {
        order: '005', dish: 'automation', tech: [], image: null,
        en: { client: 'Homes', title: 'Homes CRM', type: 'Custom CRM for real estate' },
        ar: { client: 'Homes', title: 'Homes CRM', type: 'نظام CRM مخصص للعقارات' }
    },
    {
        order: '006', dish: 'landing', tech: ['three.js'], image: null,
        en: { client: 'Dream Iced Coffee', title: 'Dream Iced Coffee', type: 'Landing page' },
        ar: { client: 'Dream Iced Coffee', title: 'Dream Iced Coffee', type: 'صفحة هبوط' }
    },
];

// What a project's page says until you write its own (put the same shape in a project's
// en/ar as `detail: { brief, cooked, results, gallery }` to override any part of it)
const DETAIL_PLACEHOLDER = {
    en: {
        brief: 'What the client came in hungry for: the problem, who it was for, and what had to change. Two or three sentences is plenty.',
        cooked: 'How we cooked it: the idea, the design and the build. Mention anything special, like a tricky integration or a detail you are proud of.',
        results: [['+00%', 'a number that went up'], ['00', 'hours saved a week'], ['1', 'very happy client']],
        gallery: 2,
    },
    ar: {
        brief: 'ما جاء العميل جائعًا إليه: المشكلة، ولمن، وما الذي كان يجب أن يتغيّر. جملتان أو ثلاث تكفي.',
        cooked: 'كيف طبخناه: الفكرة والتصميم والتنفيذ. اذكر أي شيء مميز، مثل تكامل صعب أو تفصيل تفخر به.',
        results: [['+00%', 'رقم ارتفع'], ['00', 'ساعة توفير أسبوعيًا'], ['1', 'عميل سعيد جدًا']],
        gallery: 2,
    },
};

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

// One receipt: the full receipt look, with only what matters on it
function Receipt({ p, t, lang }) {
    const text = p[lang];
    return (
        <>
            <header className="receipt-head">
                <p className="receipt-brand">{t('receipt.brand')}</p>
                <p className="receipt-small">{t('receipt.tagline')}</p>
            </header>
            <div className="receipt-rule" aria-hidden="true"></div>
            <dl className="receipt-meta">
                <div><dt>{t('receipt.order')}</dt><dd>#{p.order}</dd></div>
                <div><dt>{t('receipt.table')}</dt><dd>{text.client}</dd></div>
            </dl>
            <div className="receipt-rule" aria-hidden="true"></div>
            <h3 className="receipt-title">{text.title}</h3>
            <p className="receipt-line"><span>1x {text.type}</span><span className="leader" /><span>{t('receipt.fresh')}</span></p>
            {p.tech.length > 0 && (
                <p className="receipt-tech">{p.tech.map((x) => <span key={x}>{x}</span>)}</p>
            )}
            <div className="receipt-image">
                {p.image ? <img src={p.image} alt="" /> : <span>{t('receipt.image')}</span>}
            </div>
            <div className="receipt-rule" aria-hidden="true"></div>
            <p className="receipt-line receipt-total"><span>{t('receipt.total')}</span><span className="leader" /><span>{t('receipt.happy')}</span></p>
            <div className="receipt-rule" aria-hidden="true"></div>
            <div className="receipt-barcode" aria-hidden="true"></div>
            <p className="receipt-thanks">{t('receipt.thanks')}</p>
        </>
    );
}

// The project's own page: a big receipt that opens over the site
function ProjectPage({ p, t, lang, onClose }) {
    const ref = useRef(null);
    const text = p[lang];
    const detail = { ...DETAIL_PLACEHOLDER[lang], ...(text.detail || {}) };
    const closing = useRef(false);

    const close = () => {
        if (closing.current) return;
        closing.current = true;
        const q = gsap.utils.selector(ref);
        gsap.timeline({ onComplete: onClose })
            .to(q('.project-paper'), { y: 80, rotation: 3, autoAlpha: 0, duration: 0.35, ease: 'power2.in' })
            .to(ref.current, { autoAlpha: 0, duration: 0.25 }, '-=0.1');
    };

    useEffect(() => {
        const q = gsap.utils.selector(ref);
        gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
        gsap.fromTo(q('.project-paper'),
            { y: 60, scale: 0.92, rotation: -2, autoAlpha: 0 },
            { y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.4)' });
        // (fromTo, not from: in development React runs this twice, and a second `from` would
        // read the half-faded values of the first as its end point)
        gsap.fromTo(q('.project-paper > *'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.4, delay: 0.2 });
        q('.project-close')[0]?.focus({ preventScroll: true });
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className="project-page"
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={`${text.title}: ${text.type}`}
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
            <article className="project-paper receipt-paper">
                <div className="project-top">
                    <button className="project-close btn-link" onClick={close}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12 H5 M11 5 L4 12 L11 19" /></svg>
                        {t('detail.back')}
                    </button>
                    <p className="project-order">#{p.order}</p>
                </div>

                <header className="project-head">
                    <p className="receipt-brand">{t('receipt.brand')}</p>
                    <h2 className="project-title">{text.title}</h2>
                    <p className="project-client">{t('receipt.table')}: {text.client}</p>
                    <p className="project-line">{text.type}</p>
                    {p.tech.length > 0 && (
                        <p className="receipt-tech">{p.tech.map((x) => <span key={x}>{x}</span>)}</p>
                    )}
                </header>

                <div className="project-hero">
                    {p.image ? <img src={p.image} alt="" /> : <span>{t('receipt.image')}</span>}
                </div>

                <div className="receipt-rule" aria-hidden="true"></div>

                <div className="project-columns">
                    <section>
                        <h3 className="project-heading">{t('detail.brief')}</h3>
                        <p>{detail.brief}</p>
                    </section>
                    <section>
                        <h3 className="project-heading">{t('detail.cooked')}</h3>
                        <p>{detail.cooked}</p>
                    </section>
                </div>

                <div className="receipt-rule" aria-hidden="true"></div>

                <section>
                    <h3 className="project-heading">{t('detail.results')}</h3>
                    <ul className="project-results">
                        {detail.results.map(([num, label]) => (
                            <li key={label}><strong>{num}</strong><span>{label}</span></li>
                        ))}
                    </ul>
                </section>

                <div className="project-gallery">
                    {Array.from({ length: detail.gallery }).map((_, i) => (
                        <div key={i} className="project-shot"><span>{t('receipt.image')}</span></div>
                    ))}
                </div>

                <div className="receipt-rule" aria-hidden="true"></div>
                <p className="receipt-line receipt-total"><span>{t('receipt.total')}</span><span className="leader" /><span>{t('receipt.happy')}</span></p>
                <div className="receipt-rule" aria-hidden="true"></div>
                <div className="receipt-barcode" aria-hidden="true"></div>
                <p className="receipt-thanks">{t('receipt.thanks')}</p>

                <div className="project-actions">
                    {p.link && <a className="btn btn-hero" href={p.link} target="_blank" rel="noreferrer">{t('detail.visit')}</a>}
                    <button className="btn btn-secondary-blue" onClick={close}>{t('detail.back')}</button>
                </div>
            </article>
        </div>
    );
}

export default function ChefSpecials({ getSmoother }) {
    const root = useRef(null);
    const [mood, setMood] = useState('happy');
    const [ripped, setRipped] = useState(null); // which receipt is off the rail
    const [open, setOpen] = useState(null);     // which project page is open
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

    // Click a receipt: it's ripped off the rail (leaving a torn stub under the clip),
    // flies to the middle of the screen and opens into the project's page.
    const { contextSafe } = useGSAP({ scope: root });
    const rip = contextSafe((i, paper) => {
        if (ripped !== null) return;
        const rect = paper.getBoundingClientRect();
        sfx.play('rip');

        // a copy of the paper flies free, outside the scrolling page.
        // (on short screens the receipts are shrunk with CSS zoom, so the copy gets the same zoom,
        // and its position is given in zoomed pixels)
        const zoom = parseFloat(getComputedStyle(paper.closest('.receipts')).zoom) || 1;
        const flying = paper.cloneNode(true);
        flying.classList.add('receipt-flying');
        Object.assign(flying.style, {
            zoom, left: `${rect.left / zoom}px`, top: `${rect.top / zoom}px`, width: `${rect.width / zoom}px`,
        });
        document.body.appendChild(flying);
        setRipped(i);
        getSmoother?.()?.paused(true); // no scrolling the page behind the project page

        const dir = i % 2 ? -1 : 1;
        gsap.timeline({ onComplete: () => flying.remove() })
            // the yank: it tilts and jerks down as it tears free
            .to(flying, { rotation: 7 * dir, y: 30, duration: 0.14, ease: 'power3.out' })
            // then flies to the middle
            .to(flying, {
                x: (window.innerWidth / 2 - (rect.left + rect.width / 2)) / zoom,
                y: (window.innerHeight / 2 - (rect.top + rect.height / 2)) / zoom,
                rotation: -3 * dir, scale: 1.12, duration: 0.55, ease: 'power3.inOut',
            })
            .call(() => setOpen(i))
            .to(flying, { autoAlpha: 0, scale: 1.25, duration: 0.3 });
    });

    // the page closes: the receipt gets clipped back onto the rail
    const onClosed = contextSafe(() => {
        const i = open;
        setOpen(null);
        setRipped(null);
        getSmoother?.()?.paused(false);
        const swing = root.current.querySelectorAll('.receipt-swing')[i];
        gsap.fromTo(swing, { y: -70, autoAlpha: 0, rotation: 10 },
            { y: 0, autoAlpha: 1, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.4)' });
        gsap.delayedCall(0.15, () => sfx.soft('sticker', 0.6));
    });

    const onKey = (i) => (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rip(i, e.currentTarget); }
    };

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
                        <p className="rail-hint">{t('chef.hint')}</p>
                    </div>
                </div>
            </div>

            {/* the kitchen's order rail: it stays on screen while scrolling slides it sideways */}
            <div className="rail-stage">
                <div className="rail-track">
                    <svg className="rail-bar" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 10 H1000" />
                    </svg>
                    <ul className="receipts">
                        {PROJECTS.map((p, i) => (
                            <li key={p.order} className={`receipt-slot ${ripped === i ? 'is-ripped' : ''}`}>
                                <span className="receipt-clip" aria-hidden="true"></span>
                                {/* what's left on the rail once it's been ripped off */}
                                <span className="receipt-stub" aria-hidden="true"></span>
                                <div className="receipt-swing">
                                    <article
                                        className="receipt receipt-paper clickable"
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`${t('detail.open')}: ${p[lang].title}, ${p[lang].type}`}
                                        onClick={(e) => rip(i, e.currentTarget)}
                                        onKeyDown={onKey(i)}
                                    >
                                        <Receipt p={p} t={t} lang={lang} />
                                    </article>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {open !== null && createPortal(
                <ProjectPage p={PROJECTS[open]} t={t} lang={lang} onClose={onClosed} />,
                document.body,
            )}
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
    const stage = q('.rail-stage')[0];
    const track = q('.rail-track')[0];
    const slots = q('.receipt-slot');
    const swings = q('.receipt-swing');

    // 1. the rail draws itself, then the receipts drop onto it and swing to a stop
    gsap.set(q('.rail-bar path'), { drawSVG: '0%' });
    gsap.set(swings, { transformOrigin: '50% -14px' }); // they swing from the clip
    const rail = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 80%', toggleActions: 'play none none reverse' } });
    const forward = (fn) => () => { if (!rail.reversed()) fn(); }; // sounds only when it plays forwards
    rail
        .call(forward(() => sfx.soft('whoosh', 0.2)))
        .to(q('.rail-bar path'), { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' })
        .from(slots, { autoAlpha: 0, y: -90, duration: 0.5, ease: 'power2.in', stagger: 0.08 }, 0.3);
    slots.forEach((_, i) => rail.call(forward(() => sfx.soft('click', 0.6, 60)), null, 0.8 + i * 0.08));
    rail.from(swings, { rotation: (i) => (i % 2 ? -14 : 14), duration: 1.6, ease: 'elastic.out(1.2, 0.35)', stagger: 0.08 }, 0.75);

    gsap.from(q('.chef-kicker, .chef-title, .chef-text'), {
        autoAlpha: 0, y: 30, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 35%', scrub: 1 },
    });

    // 2. the rail pins and slides sideways as you scroll (to the left in English, to the right in Arabic)
    const travel = () => track.scrollWidth - window.innerWidth;
    const rtl = () => document.documentElement.dir === 'rtl';
    let current = 0;
    const swingTo = swings.map((el) => gsap.quickTo(el, 'rotation', { duration: 0.8, ease: 'elastic.out(1, 0.4)' }));
    const clampSwing = gsap.utils.clamp(-10, 10);
    gsap.to(track, {
        x: () => (rtl() ? 1 : -1) * travel(),
        ease: 'none',
        scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${travel()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // the receipts sway on their clips as the rail moves (faster = more sway)
                const sway = clampSwing(self.getVelocity() / 260) * (rtl() ? -1 : 1);
                swingTo.forEach((to) => to(sway));
                // a paper rustle each time a new receipt reaches the middle
                const i = Math.round(self.progress * (slots.length - 1));
                if (i !== current) { current = i; sfx.soft('paper', 0.6, 140, 0.9 + Math.random() * 0.2); }
            },
        },
    });

    // 3. chef Cloudy's hat and spatula
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