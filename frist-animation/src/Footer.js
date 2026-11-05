import { gsap } from 'gsap';
import Cloudy from './Cloudy';
import Cloud from './Cloud';
import { useLang } from './i18n';
import './Footer.css';

// Footer.js: links glide to each section using onNavigate (smooth scrolling, from App.js).
// PLACEHOLDERS: the email and social links; swap in your real ones.
// [where it goes, which text from i18n.js]
const LINKS = [
    ['#menu', 'menu.title'],
    ['#meet-cloudy', 'meet.kicker'],
    ['#values', 'values.kicker'],
    ['#chef', 'chef.kicker'],
    ['#order', 'order.title'],
];

const SOCIALS = [
    ['https://instagram.com/', 'social.instagram'],
    ['https://linkedin.com/', 'social.linkedin'],
    ['https://behance.net/', 'social.behance'],
];

export default function Footer({ onNavigate }) {
    const { t } = useLang();
    const go = (target) => (e) => {
        e.preventDefault();
        onNavigate(target);
    };

    return (
        <footer className="footer" id="footer">
            {/* the hero's hand-drawn clouds, in white, drifting behind the footer */}
            <div className="footer-clouds" aria-hidden="true">
                <Cloud name="cloud3" tone="light" className="fcloud fcloud-a" size={0.32} />
                <Cloud name="cloud11" tone="light" className="fcloud fcloud-b" size={0.34} />
                <Cloud name="cloud2" tone="light" className="fcloud fcloud-c" size={0.3} />
                <Cloud name="cloud5" tone="light" className="fcloud fcloud-d" size={0.26} />
                <Cloud name="cloud1" tone="light" className="fcloud fcloud-e" size={0.3} />
                <Cloud name="cloud11" tone="light" className="fcloud fcloud-f" size={0.26} />
                <Cloud name="cloud2" tone="light" className="fcloud fcloud-g" size={0.2} />
                <Cloud name="cloud3" tone="light" className="fcloud fcloud-h" size={0.22} />
            </div>

            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <Cloudy mood="happy" className="footer-cloudy" />
                        <span className="footer-name">Solace</span>
                    </div>
                    <p className="footer-tagline">{t('footer.tagline')}</p>
                </div>

                <nav className="footer-col" aria-label="Footer">
                    <p className="footer-heading">{t('footer.kitchen')}</p>
                    <ul>
                        {LINKS.map(([href, label]) => (
                            <li key={href}><a href={href} onClick={go(href)}>{t(label)}</a></li>
                        ))}
                    </ul>
                </nav>

                <div className="footer-col">
                    <p className="footer-heading">{t('footer.hi')}</p>
                    <ul>
                        <li><a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a></li>
                        {SOCIALS.map(([href, label]) => (
                            <li key={label}><a href={href} target="_blank" rel="noreferrer">{t(label)}</a></li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
                <button className="back-to-top" onClick={() => onNavigate(0)}>
                    {t('footer.top')}
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19 V5 M5 12 L12 5 L19 12" /></svg>
                </button>
            </div>

            {/* Cloudy's ground line, as in the logo */}
            <div className="footer-ground" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
            </div>
        </footer>
    );
}

// Scroll animation, called from App.js: the clouds draw themselves (like in the hero)
// as the footer comes into view, then bob gently.
export function buildFooterScroll(root) {
    const q = gsap.utils.selector(root);
    const clouds = q('.fcloud');
    gsap.set(q('.fcloud .cloud-line'), { drawSVG: '0%' });
    gsap.set(q('.fcloud .cloud-shade'), { autoAlpha: 0 });

    const bobs = clouds.map((c, i) => gsap.to(c, {
        y: i % 2 ? 10 : -10, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true,
    }));

    gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 70%', toggleActions: 'play none none reverse' },
        onComplete: () => bobs.forEach((b) => b.play()),
        onReverseComplete: () => bobs.forEach((b) => b.pause(0)),
    })
        .to(q('.fcloud .cloud-line'), { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut', stagger: 0.15 })
        .to(q('.fcloud .cloud-shade'), { autoAlpha: 0.55, duration: 0.6, stagger: 0.08 }, '-=0.6');
}