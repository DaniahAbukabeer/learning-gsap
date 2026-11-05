import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BANKS } from './cloudBanks';
import { sfx } from './sfx';
import { Chair, PastaBowl } from './MenuArt';

// CloudDivider.js: layered cloud banks between two sections (inspired by logbook.so).
// The front layer is the NEXT section's color, so the clouds "become" that section.
// The two layers behind it are lighter and drift at different speeds as you scroll,
// and a hand-drawn blue line traces the front clouds' top edge.
//
// Place it between two sections.
//   behind: the color of the section above (shows between the clouds)
//   line:   color of the hand-drawn edge line (use white on blue clouds)
export default function CloudDivider({ back, mid, front, behind = 'transparent', line = '#005DFF', className = '', table }) {
    return (
        <div className={`cloud-divider ${table ? `has-table table-${table}` : ''} ${className}`} style={{ background: behind }} aria-hidden="true">
            {/* the clouds are split into two layers, so the table can sit between them */}
            {/* the viewBox starts at -90 to leave room above the tallest clouds, so their tops never get cut off */}
            <svg className="bank-layer" viewBox="0 -90 1440 410" preserveAspectRatio="xMidYMax slice">
                <path className="bank bank-back" d={BANKS.back.shape} fill={back} />
            </svg>

            {/* table="end": the Menu's table finishes here, with a chair pulled up to it,
          half hidden behind the clouds in front */}
            {table === 'end' && (
                <div className="divider-table">
                    <Chair className="divider-chair" />
                    <div className="table-piece"></div>
                </div>
            )}

            <svg className="bank-layer" viewBox="0 -90 1440 410" preserveAspectRatio="xMidYMax slice">
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

            {/* table="start": the head of the Menu's table rises out of the clouds,
          with a chair at the end and the bowl of pasta on top */}
            {table === 'start' && (
                <div className="divider-table">
                    <Chair className="divider-chair" />
                    <div className="table-piece"></div>
                    <PastaBowl className="divider-bowl" />
                </div>
            )}
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

        // the chair slides out from under the table as the clouds roll in
        const chair = q('.divider-chair')[0];
        if (chair) {
            gsap.from(chair, {
                y: divider.classList.contains('table-end') ? -50 : 50, ease: 'none',
                scrollTrigger: { trigger: divider, start: 'top bottom', end: 'bottom 40%', scrub: 1 },
            });
            // ...with a scrape across the floor, as it comes into view (either way you're scrolling)
            ScrollTrigger.create({
                trigger: chair,
                start: 'top 85%',
                end: 'bottom 15%',
                onEnter: () => sfx.soft('chair', 0.6, 800),
                onEnterBack: () => sfx.soft('chair', 0.6, 800),
            });
        }
    });
}