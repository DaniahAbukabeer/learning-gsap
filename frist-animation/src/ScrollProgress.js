import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Cloudy from './Cloudy';
import { sfx } from './sfx';
import { useLang } from './i18n';

// ScrollProgress.js: "Cloudy's journey", the scroll progress indicator.
// A hand-drawn wavy line down the side of the screen draws itself as you scroll,
// with a tiny Cloudy riding its tip. Each section is a stop on the line: when Cloudy
// reaches one it fills in with a pop and he does a little hop. Click a stop to go there.

// the stops: [section id, the text from i18n.js used as its name]
const STOPS = [
    ['#menu', 'menu.title'],
    ['#meet-cloudy', 'meet.kicker'],
    ['#values', 'values.kicker'],
    ['#chef', 'chef.kicker'],
    ['#order', 'order.title'],
];

// the wavy line, drawn in a 40 x 400 box (it's stretched to the track's height)
const PATH = 'M20 4 C34 40 6 76 20 112 C34 148 6 184 20 220 C34 256 6 292 20 328 C30 354 14 376 20 396';
const VB = { w: 40, h: 400 };

export default function ScrollProgress({ onNavigate }) {
    const { t } = useLang();
    return (
        <nav className="scroll-progress" aria-label={t('progress.label')}>
            <svg className="progress-svg" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" aria-hidden="true">
                <path className="progress-track" d={PATH} />
                <path className="progress-line" d={PATH} />
            </svg>

            {STOPS.map(([id, label]) => (
                <button
                    key={id}
                    className="progress-stop"
                    data-target={id}
                    onClick={() => onNavigate(id)}
                    aria-label={t(label)}
                >
                    <span className="progress-dot" aria-hidden="true"></span>
                    <span className="progress-label">{t(label)}</span>
                </button>
            ))}

            <div className="progress-rider" aria-hidden="true">
                <div className="progress-hop">
                    <Cloudy mood="happy" className="progress-cloudy" />
                </div>
            </div>
        </nav>
    );
}

// Called from App.js (after the smooth scrolling and pinned sections exist). Returns a cleanup.
export function buildScrollProgress(root) {
    const svg = root.querySelector('.progress-svg');
    const line = root.querySelector('.progress-line');
    const path = line;
    const rider = root.querySelector('.progress-rider');
    const hop = root.querySelector('.progress-hop');
    const length = path.getTotalLength();

    // where a point on the line is, in pixels inside the track
    const pointAt = (fraction) => {
        const p = path.getPointAtLength(length * gsap.utils.clamp(0, 1, fraction));
        return { x: (p.x / VB.w) * svg.clientWidth, y: (p.y / VB.h) * svg.clientHeight };
    };

    // each stop: where its section starts, as a fraction of the whole page
    const stops = [...root.querySelectorAll('.progress-stop')].map((el) => ({
        el,
        dot: el.querySelector('.progress-dot'),
        trigger: ScrollTrigger.create({ trigger: el.dataset.target, start: 'top 55%' }),
        at: 0,
        passed: false,
    }));

    const placeStops = () => {
        const max = ScrollTrigger.maxScroll(window) || 1;
        stops.forEach((s) => {
            s.at = gsap.utils.clamp(0, 1, s.trigger.start / max);
            const { x, y } = pointAt(s.at);
            gsap.set(s.el, { x, y });
        });
    };

    // a hop when Cloudy reaches a stop
    const reach = (s) => {
        gsap.fromTo(s.dot, { scale: 1.9 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
        gsap.fromTo(hop, { y: 0 }, { keyframes: { y: [-14, 0] }, duration: 0.45, ease: 'power2.out', overwrite: true });
        sfx.soft('pop', 0.35, 80);
    };

    // smooth the progress a little, so Cloudy glides rather than jumps
    const state = { p: 0 };
    const render = () => {
        const p = state.p;
        gsap.set(line, { drawSVG: `0% ${p * 100}%` });
        const { x, y } = pointAt(p);
        gsap.set(rider, { x, y });
        stops.forEach((s) => {
            const passed = p >= s.at - 0.002;
            if (passed && !s.passed) reach(s);
            if (passed !== s.passed) s.el.classList.toggle('is-passed', passed);
            s.passed = passed;
        });
    };
    const follow = gsap.quickTo(state, 'p', { duration: 0.5, ease: 'power3', onUpdate: render });

    const progress = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => follow(self.progress),
    });

    // over the blue sections the line turns white (like the logo)
    const blue = ['#values', '#footer'].map((trigger) => ScrollTrigger.create({
        trigger, start: 'top 50%', end: 'bottom 50%', toggleClass: { targets: root, className: 'on-blue' },
    }));

    const onRefresh = () => { placeStops(); render(); };
    ScrollTrigger.addEventListener('refresh', onRefresh);
    onRefresh();

    return () => {
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        progress.kill();
        blue.forEach((st) => st.kill());
        stops.forEach((s) => s.trigger.kill());
    };
}