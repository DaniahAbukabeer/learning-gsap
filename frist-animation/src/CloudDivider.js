import { gsap } from 'gsap';
import { BANKS } from './cloudBanks';
import { sfx } from './sfx';

// CloudDivider.js: layered cloud banks between two sections (inspired by logbook.so).
// The front layer is the NEXT section's color, so the clouds "become" that section.
// The two layers behind it are lighter and drift at different speeds as you scroll,
// and a hand-drawn blue line traces the front clouds' top edge.
//
// Place it between two sections.
//   behind: the color of the section above (shows between the clouds)
//   line:   color of the hand-drawn edge line (use white on blue clouds)
export default function CloudDivider({ back, mid, front, behind = 'transparent', line = '#005DFF', className = '' }) {
    return (
        <div className={`cloud-divider ${className}`} style={{ background: behind }} aria-hidden="true">
            {/* the viewBox starts at -90 to leave room above the tallest clouds, so their tops never get cut off */}
            <svg viewBox="0 -90 1440 410" preserveAspectRatio="xMidYMax slice">
                <path className="bank bank-back" d={BANKS.back.shape} fill={back} />
                <path className="bank bank-mid" d={BANKS.mid.shape} fill={mid} />
                <path className="bank bank-front" d={BANKS.front.shape} fill={front} />
                <path
                    className="bank-line"
                    d={BANKS.front.edge}
                    fill="none"
                    stroke={line}
                    strokeWidth="5"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

// Scroll animation for every divider on the page: as a divider comes up the screen,
// its back layers rise from lower down (parallax) and the blue edge draws itself.
export function buildDividerScroll(scope) {
    scope.querySelectorAll('.cloud-divider').forEach((divider) => {
        const q = gsap.utils.selector(divider);
        gsap.set(q('.bank-line'), { drawSVG: '0%' });
        gsap.timeline({
            scrollTrigger: {
                trigger: divider, start: 'top bottom', end: 'bottom 55%', scrub: 1,
                onEnter: () => sfx.soft('whoosh', 0.3, 600), // a soft gust as the clouds roll in (scrolling down only)
            },
        })
            .from(q('.bank-back'), { y: 120, ease: 'none' }, 0)
            .from(q('.bank-mid'), { y: 70, ease: 'none' }, 0)
            .from(q('.bank-front'), { y: 30, ease: 'none' }, 0)
            .to(q('.bank-line'), { drawSVG: '100%', ease: 'none' }, 0);
    });
}