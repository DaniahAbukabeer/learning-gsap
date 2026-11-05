import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DISH_ART, PlateTop, ServiceBell } from './MenuArt';
import { sfx } from './sfx';
import './Menu.css';

// DRAFT COPY: the dish names come from your brand guide; descriptions and
// "ingredients" are first drafts, edit freely.
export const DISHES = [
    {
        key: 'automation',
        name: 'Automated Systems',
        desc: 'Workflows that run themselves, so your team can stop copy-pasting and get back to the good stuff.',
        tags: ['Workflows', 'Integrations', 'Dashboards'],
    },
    {
        key: 'mobile',
        name: 'Mobile Apps',
        desc: 'Apps that feel soft in the hand: simple, friendly and a joy to tap through.',
        tags: ['iOS', 'Android', 'Friendly UI'],
    },
    {
        key: 'landing',
        name: 'Landing Pages',
        desc: 'Breathtaking, hand-made first impressions that make visitors stay a little longer.',
        tags: ['Design', 'Animation', 'Fast'],
    },
    {
        key: 'cms',
        name: "CMS's",
        desc: 'Update your own content whenever you like, with no developer on call.',
        tags: ['Easy editing', 'Your structure', 'Secure'],
    },
    {
        key: 'agents',
        name: 'Cloudy AI Agents',
        desc: 'Ethical AI agentic systems tailored to your needs, built to help your team, not replace it.',
        tags: ['Ethical by design', 'Tailored', 'Friendly'],
    },
];

export default function Menu() {
    return (
        <section className="menu" id="menu">
            <div className="menu-head">
                <p className="menu-kicker">Today's specials</p>
                <h2 className="menu-title">The Menu</h2>
            </div>

            {/* The table: a plate in the middle, dishes slide through it */}
            <div className="menu-table">
                <PlateTop />
                <ul className="menu-track">
                    {DISHES.map((dish, i) => {
                        const Art = DISH_ART[dish.key];
                        return (
                            <li key={dish.key} className="menu-item" style={{ '--i': i }}>
                                <button className="menu-dish" data-index={i} aria-label={`Show ${dish.name}`}>
                                    <svg viewBox="100 120 210 185" aria-hidden="true"><Art /></svg>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <ServiceBell />
            </div>

            {/* What's on the plate */}
            <div className="menu-info">
                <div className="menu-count">
                    <button className="menu-arrow" data-step="-1" aria-label="Previous dish">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" /></svg>
                    </button>
                    <span><span className="menu-count-num">01</span> / 0{DISHES.length}</span>
                    <button className="menu-arrow" data-step="1" aria-label="Next dish">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 L16 12 L9 19" /></svg>
                    </button>
                </div>
                <div className="dish-texts">
                    {DISHES.map((dish) => (
                        <div key={dish.key} className="dish-text">
                            <h3 className="dish-name">{dish.name}</h3>
                            <p className="dish-desc">{dish.desc}</p>
                            <ul className="ingredients" aria-label="Ingredients">
                                {dish.tags.map((tag) => <li key={tag}>{tag}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// The scroll animation, called from App.js after smooth scrolling is set up.
//
// The section pins (stays put) and scrolling slides the row of dishes sideways
// through the plate. When you stop scrolling, it glides so one dish sits on the plate.
// The dish on the plate grows and fills with color, the bell rings, and its
// description swaps in. Clicking a dish or an arrow scrolls to that dish.
//
// Returns a cleanup function (removes the click listeners).
// ---------------------------------------------------------------------------

const SCROLL_PER_DISH = 0.8; // screen-heights of scrolling to move one dish along
const BELL_DELAY = 180;      // ms a dish must stay on the plate before the bell rings

// distance between dishes on the track (keep in sync with --gap in Menu.css)
const dishGap = () => Math.min(380, window.innerWidth * 0.62);

export function buildMenuScroll(root, getSmoother) {
    const q = gsap.utils.selector(root);
    const track = q('.menu-track')[0];
    const items = q('.menu-item');
    const texts = q('.dish-text');
    const countNum = q('.menu-count-num')[0];
    const n = items.length;

    // ----- starting states -----
    const setGap = () => track.style.setProperty('--gap', `${dishGap()}px`);
    setGap();
    window.addEventListener('resize', setGap);
    gsap.set(q('.menu-item .art-fill'), { autoAlpha: 0 }); // dishes start as line drawings
    gsap.set(texts, { autoAlpha: 0 });
    gsap.set(q('.bell-ring path'), { drawSVG: '0%' });
    gsap.set(q('.bell-body'), { transformOrigin: '50% 100%' });

    // ----- the plate and bell draw in as the section arrives -----
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 85%', end: 'top 10%', scrub: 1 } })
        .from(q('.menu-kicker, .menu-title'), { autoAlpha: 0, y: 40, stagger: 0.15 }, 0)
        .fromTo(q('.plate .art-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, stagger: 0.2 }, 0.2)
        .from(q('.plate .art-fill, .plate-shadow'), { autoAlpha: 0, duration: 0.4 }, 1)
        .from(q('.menu-dish'), { autoAlpha: 0, x: 120, stagger: 0.12, duration: 0.8 }, 0.6)
        .from(q('.service-bell'), { autoAlpha: 0, y: 30, rotation: 12, duration: 0.6 }, 1.2)
        .from(q('.menu-count'), { autoAlpha: 0, y: 20, duration: 0.5 }, 1.2);

    // ----- choosing the dish on the plate -----
    let active = -1;
    let bellTimer;

    const ringBell = () => {
        sfx.play('bell');
        gsap.timeline()
            .to(q('.bell-plunger'), { y: 5, duration: 0.06, yoyo: true, repeat: 1 })
            .to(q('.bell-body'), { keyframes: { rotation: [-7, 5, -3, 0] }, duration: 0.5, ease: 'power1.out' }, 0)
            .fromTo(q('.bell-ring path'),
                { drawSVG: '0%', autoAlpha: 1 },
                { drawSVG: '100%', duration: 0.25, stagger: 0.04, immediateRender: false }, 0.03)
            .to(q('.bell-ring path'), { autoAlpha: 0, duration: 0.3 }, 0.4);
    };

    const select = (i, { quiet = false } = {}) => {
        if (i === active) return;
        const prev = active;
        active = i;
        countNum.textContent = String(i + 1).padStart(2, '0');

        // description swap
        if (prev >= 0) gsap.to(texts[prev], { autoAlpha: 0, y: -14, duration: 0.25, overwrite: true });
        gsap.fromTo(texts[i], { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.45, delay: 0.08, ease: 'power3.out', overwrite: true });

        // the old dish goes back to a line drawing
        if (prev >= 0) gsap.to(items[prev].querySelectorAll('.art-fill'), { autoAlpha: 0, duration: 0.3, overwrite: true });

        // the new dish re-draws itself, fills with color and does a little hop
        const dish = items[i].querySelector('.menu-dish');
        gsap.fromTo(items[i].querySelectorAll('.art-line'), { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.6, stagger: 0.03, ease: 'power1.inOut', overwrite: true });
        gsap.to(items[i].querySelectorAll('.art-fill'), { autoAlpha: 1, duration: 0.35, delay: 0.45, stagger: 0.02, overwrite: true });
        gsap.fromTo(dish, { y: 0 }, { keyframes: { y: [-22, 0] }, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });

        // ding! (only once the dish has actually settled on the plate)
        clearTimeout(bellTimer);
        if (!quiet) bellTimer = setTimeout(() => { if (active === i) ringBell(); }, BELL_DELAY);
    };

    // dishes shrink and fade the further they are from the plate
    const scaleSet = items.map((el) => gsap.quickSetter(el, 'scale'));
    const fadeSet = items.map((el) => gsap.quickSetter(el, 'opacity'));
    const updateSizes = () => {
        const x = gsap.getProperty(track, 'x');
        const gap = dishGap();
        items.forEach((el, i) => {
            const d = Math.min(Math.abs(i * gap + x) / gap, 1.5);
            scaleSet[i](gsap.utils.interpolate(1.15, 0.6, Math.min(d, 1)));
            fadeSet[i](gsap.utils.interpolate(1, 0.35, Math.min(d, 1)));
        });
    };

    // ----- the pinned carousel -----
    const carousel = gsap.timeline({
        onUpdate: updateSizes,
        scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${window.innerHeight * SCROLL_PER_DISH * (n - 1)}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => select(Math.round(self.progress * (n - 1))),
        },
    });
    carousel.to(track, { x: () => -(n - 1) * dishGap(), ease: 'none' });

    updateSizes();
    select(0, { quiet: true });

    // ----- clicking a dish or an arrow scrolls to that dish -----
    const goTo = (i) => {
        const st = carousel.scrollTrigger;
        const target = Math.max(0, Math.min(n - 1, i));
        const y = st.start + (st.end - st.start) * (target / (n - 1));
        const smoother = getSmoother?.();
        if (smoother) smoother.scrollTo(y, true);
        else window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const onClick = (e) => {
        const dish = e.target.closest('.menu-dish');
        const arrow = e.target.closest('.menu-arrow');
        if (dish) goTo(Number(dish.dataset.index));
        if (arrow) goTo(active + Number(arrow.dataset.step));
    };
    root.addEventListener('click', onClick);

    // ----- gentle snap: when scrolling stops inside the carousel, glide to the nearest dish -----
    // (Done by hand: ScrollTrigger's built-in snap fights with ScrollSmoother and can
    // throw the page back to the top.)
    const snapToNearest = () => {
        const st = carousel.scrollTrigger;
        if (!st) return;
        // where you actually scrolled to (the smooth scroller's position lags behind it)
        const y = window.scrollY;
        if (y <= st.start || y >= st.end) return; // not inside the carousel
        const pos = ((y - st.start) / (st.end - st.start)) * (n - 1);
        if (Math.abs(pos - Math.round(pos)) < 0.02) return; // already on a dish
        goTo(Math.round(pos));
    };
    ScrollTrigger.addEventListener('scrollEnd', snapToNearest);

    return () => {
        ScrollTrigger.removeEventListener('scrollEnd', snapToNearest);
        root.removeEventListener('click', onClick);
        window.removeEventListener('resize', setGap);
        clearTimeout(bellTimer);
    };
}