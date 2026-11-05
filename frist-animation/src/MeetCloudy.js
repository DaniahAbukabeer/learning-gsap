import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Cloudy from './Cloudy';
import { canBuddyFollow } from './CloudyBuddy';
import './MeetCloudy.css';

// The moods shown in the "Cloudy has feelings too" row
const MOOD_ROW = [
    ['happy', 'Happy'],
    ['jumping', 'Excited'],
    ['whistling', 'Whistling'],
    ['sideEye', 'Side-eye'],
    ['confused', 'Confused'],
    ['weird', 'Unsure'],
    ['done', 'Done with it'],
    ['sad', 'Sad'],
    ['angry', 'Angry'],
];

export default function MeetCloudy() {
    return (
        <section className="meet-cloudy" id="meet-cloudy">
            <div className="meet-inner">
                <div className="meet-spot">
                    <Cloudy mood="happy" label="Cloudy, the Solace mascot" />
                </div>
                <div className="meet-text">
                    <p className="meet-kicker">Meet Cloudy</p>
                    <h2 className="meet-title">Our lucky charm, and your AI sidekick</h2>
                    <p className="meet-desc">
                        Cloudy makes sure every experience with our AI agentic systems feels friendly
                        and easy to use. Go on, move your mouse around. He's keeping an eye on you.
                    </p>
                    <p className="meet-hint">Keep scrolling and he'll tag along.</p>
                </div>
            </div>

            <div className="moods">
                <p className="moods-title">Cloudy has feelings too</p>
                <ul className="moods-row">
                    {MOOD_ROW.map(([mood, name]) => (
                        <li key={mood} className="mood">
                            <Cloudy mood={mood} />
                            <span>{name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// Scroll animation, called from App.js. On desktop, once you've scrolled past
// Cloudy he takes off and follows your cursor; scroll back up and he flies home.
// Returns a cleanup function.
export function buildMeetCloudyScroll(root) {
    const q = gsap.utils.selector(root);

    gsap.from(q('.meet-spot, .meet-text > *'), {
        autoAlpha: 0, y: 40, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 25%', scrub: 1 },
    });
    gsap.from(q('.mood'), {
        autoAlpha: 0, y: 30, scale: 0.8, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: q('.moods')[0], start: 'top 95%', end: 'top 60%', scrub: 1 },
    });

    if (!canBuddyFollow()) return () => { };

    const spot = q('.meet-spot .cloudy')[0];
    const onLanded = () => gsap.set(spot, { autoAlpha: 1 });
    window.addEventListener('cloudy:landed', onLanded);

    ScrollTrigger.create({
        trigger: q('.meet-spot')[0],
        start: 'center 30%', // once Cloudy has scrolled up past the middle of the screen
        onEnter: () => {
            const rect = spot.getBoundingClientRect();
            gsap.set(spot, { autoAlpha: 0 });
            window.dispatchEvent(new CustomEvent('cloudy:takeoff', { detail: rect }));
        },
        onLeaveBack: () => {
            window.dispatchEvent(new CustomEvent('cloudy:land', { detail: { getRect: () => spot.getBoundingClientRect() } }));
        },
    });

    return () => window.removeEventListener('cloudy:landed', onLanded);
}