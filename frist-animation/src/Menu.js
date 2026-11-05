import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DISH_ART, PlateTop, ServiceBell, Star, Cup, Spoon, ForkAndKnife } from './MenuArt';
import { sfx } from './sfx';
import { useLang, DISH_TEXT } from './i18n';
import './Menu.css';

// The five dishes, in Menu order. Their names, descriptions and "ingredients"
// (in English and Arabic) live in i18n.js under DISH_TEXT.
export const DISHES = ['automation', 'mobile', 'landing', 'cms', 'agents'].map((key) => ({ key }));

export default function Menu() {
    const { t, lang } = useLang();
    const text = DISH_TEXT[lang];
    return (
        <section className="menu" id="menu">
            {/* the table, seen from above, with two glasses on it (it starts and ends in the clouds around this section) */}
            <div className="table-top" aria-hidden="true">
                <div className="table-runner"></div>
                <Cup className="table-cup cup-1" />
                <Cup className="table-cup cup-2" />
            </div>

            <div className="menu-head">
                <p className="menu-kicker">{t('menu.kicker')}</p>
                <h2 className="menu-title">{t('menu.title')}</h2>
            </div>

            {/* The table: a plate in the middle, dishes slide through it */}
            <div className="menu-table">
                {/* stars twinkling around the plate (they burst when a new dish lands) */}
                <div className="menu-stars" aria-hidden="true">
                    <span className="menu-star star-1"><Star kind="five" /></span>
                    <span className="menu-star star-2"><Star kind="four" /></span>
                    <span className="menu-star star-3"><Star kind="four" /></span>
                    <span className="menu-star star-4"><Star kind="five" /></span>
                </div>
                <Spoon className="cutlery spoon" />
                <ForkAndKnife className="cutlery fork-knife" />
                <PlateTop />
                <ul className="menu-track">
                    {DISHES.map((dish, i) => {
                        const Art = DISH_ART[dish.key];
                        return (
                            <li key={dish.key} className="menu-item" style={{ '--i': i }}>
                                <button className="menu-dish" data-index={i} aria-label={`${t('menu.show')} ${text[dish.key].name}`}>
                                    <Art />
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <ServiceBell />

                {/* soft blur on the left and right edges, where dishes slide out of view */}
                <div className="menu-edge menu-edge-start" aria-hidden="true"></div>
                <div className="menu-edge menu-edge-end" aria-hidden="true"></div>
            </div>

            {/* What's on the plate */}
            <div className="menu-info">
                <div className="menu-count">
                    <button className="menu-arrow" data-step="-1" aria-label={t('menu.prev')}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" /></svg>
                    </button>
                    <span><span className="menu-count-num">01</span> / 0{DISHES.length}</span>
                    <button className="menu-arrow" data-step="1" aria-label={t('menu.next')}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 L16 12 L9 19" /></svg>
                    </button>
                </div>
                <div className="dish-texts">
                    {DISHES.map((dish) => (
                        <div key={dish.key} className="dish-text">
                            <h3 className="dish-name">{text[dish.key].name}</h3>
                            <p className="dish-desc">{text[dish.key].desc}</p>
                            <ul className="ingredients" aria-label={t('menu.ingredients')}>
                                {text[dish.key].tags.map((tag) => <li key={tag}>{tag}</li>)}
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
const dishGap = () => Math.min(470, window.innerWidth * 0.62); // wide enough to clear the cutlery

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
        .fromTo(q('.menu-star .art-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, stagger: 0.1 }, 0.9)
        .from(q('.menu-star .art-fill'), { autoAlpha: 0, duration: 0.3, stagger: 0.1 }, 1.3)
        .from(q('.menu-count'), { autoAlpha: 0, y: 20, duration: 0.5 }, 1.2);

    // ----- the stars twinkle gently, forever (on the inner svg, so a burst can play on top) -----
    q('.menu-star .star').forEach((star, i) => {
        gsap.to(star, {
            rotation: i % 2 ? -18 : 18, scale: 1.15,
            duration: 1.4 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3,
        });
    });
    const burstStars = () => gsap.fromTo(q('.menu-star'),
        { scale: 0.3, rotation: -120 },
        { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.5)', stagger: 0.06, overwrite: true });

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

        // the new dish re-draws itself, fills with color and does a little hop (with a puff of steam)
        if (!quiet) sfx.soft('steam', 0.4, 300);
        const dish = items[i].querySelector('.menu-dish');
        gsap.fromTo(items[i].querySelectorAll('.art-line'), { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.6, stagger: 0.03, ease: 'power1.inOut', overwrite: true });
        gsap.to(items[i].querySelectorAll('.art-fill'), { autoAlpha: 1, duration: 0.35, delay: 0.45, stagger: 0.02, overwrite: true });
        // ...set down onto the plate: it comes from a little above (bigger, as if closer to you),
        // lands with a tiny bounce, and the plate gives a little nudge as it's set down
        gsap.fromTo(dish, { y: -36, scale: 1.18 }, { y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)', overwrite: 'auto' });
        gsap.fromTo(q('.plate'), { scale: 1 }, { keyframes: { scale: [0.975, 1.01, 1] }, duration: 0.4, delay: 0.3, transformOrigin: '50% 50%', overwrite: 'auto' });

        // ding! (only once the dish has actually settled on the plate)
        clearTimeout(bellTimer);
        if (!quiet) bellTimer = setTimeout(() => { if (active === i) { ringBell(); burstStars(); } }, BELL_DELAY);
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
            refreshPriority: 2, // measured first: everything below depends on how long this pins
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