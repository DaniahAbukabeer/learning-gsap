// MenuArt.js: hand-drawn line art for the Menu section, in the same style as Cloudy
// (Brandeis Blue lines, Pastel Blue and white fills, round line ends).
//
// Every shape is drawn twice: once as a fill (.art-fill) and once as an outline (.art-line).
// That way GSAP can draw the outline first with DrawSVG and fade the fill in afterwards.

const BLUE = '#005DFF';
const PASTEL = '#BAE2FF';
const WHITE = '#FFFFFF';
const LINE = 6;

// One shape = an outline + (optionally) a fill underneath it
function Drawn({ as: Tag = 'path', fill, line = LINE, ...shape }) {
    return (
        <>
            {fill && <Tag className="art-fill" fill={fill} stroke="none" {...shape} />}
            <Tag
                className="art-line"
                fill="none"
                stroke={BLUE}
                strokeWidth={line}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...shape}
            />
        </>
    );
}

// ---------- The serving plate (seen from above) and the service bell ----------

export function PlateTop() {
    return (
        <svg className="menu-plate" viewBox="0 0 440 440" aria-hidden="true">
            {/* flat offset shadow, like the cards' shadow */}
            <circle className="plate-shadow" cx="232" cy="234" r="196" fill="#6BBEFF" opacity="0.45" />
            <g className="plate">
                <Drawn as="circle" cx="220" cy="220" r="196" fill={WHITE} />
                <circle className="art-line plate-ring" cx="220" cy="220" r="150" fill="none" stroke={PASTEL} strokeWidth="5" />
            </g>
        </svg>
    );
}

export function ServiceBell() {
    return (
        <svg className="service-bell" viewBox="0 0 120 110" aria-hidden="true">
            {/* little "ding" lines, drawn when the bell rings */}
            <g className="bell-ring">
                <path d="M26 40 C20 30 20 20 26 10" fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" />
                <path d="M94 40 C100 30 100 20 94 10" fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" />
                <path d="M12 46 C4 32 4 18 12 4" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
                <path d="M108 46 C116 32 116 18 108 4" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
            </g>
            <g className="bell-body">
                <g className="bell-plunger">
                    <Drawn d="M60 40 V52" line={5} />
                    <Drawn as="ellipse" cx="60" cy="36" rx="13" ry="6" fill={PASTEL} line={5} />
                </g>
                <Drawn d="M20 88 C20 48 100 48 100 88 Z" fill={WHITE} />
                <path d="M78 62 C88 68 93 76 94 86 L86 86 C85 78 82 70 78 62 Z" fill={PASTEL} />
                <Drawn as="rect" x="8" y="88" width="104" height="12" rx="6" fill={PASTEL} />
            </g>
        </svg>
    );
}

// ---------- The five dishes ----------

function AutomatedSystems() {
    return (
        <>
            <Drawn d="M221.1 230.7 L229.7 243.6 L224.4 253.3 L209.0 253.2 L202.3 258.7 L199.2 273.8 L188.7 277.0 L177.8 266.0 L169.3 265.1 L156.4 273.7 L146.7 268.4 L146.8 253.0 L141.3 246.3 L126.2 243.2 L123.0 232.7 L134.0 221.8 L134.9 213.3 L126.3 200.4 L131.6 190.7 L147.0 190.8 L153.7 185.3 L156.8 170.2 L167.3 167.0 L178.2 178.0 L186.7 178.9 L199.6 170.3 L209.3 175.6 L209.2 191.0 L214.7 197.7 L229.8 200.8 L233.0 211.3 L222.0 222.2 Z" fill={WHITE} />
            <Drawn as="circle" cx="178" cy="222" r="15" fill={PASTEL} />
            <Drawn d="M273.1 183.5 L275.2 194.1 L268.6 199.3 L258.8 195.0 L252.6 196.0 L244.4 203.1 L236.7 200.1 L235.4 189.4 L231.5 184.5 L221.3 181.0 L220.0 172.8 L228.7 166.3 L230.9 160.5 L228.8 149.9 L235.4 144.7 L245.2 149.0 L251.4 148.0 L259.6 140.9 L267.3 143.9 L268.6 154.6 L272.5 159.5 L282.7 163.0 L284.0 171.2 L275.3 177.7 Z" fill={PASTEL} />
            <Drawn as="circle" cx="252" cy="172" r="8" fill={WHITE} line={5} />
            {/* little "it runs by itself" arrow */}
            <Drawn d="M262 236 C280 248 282 270 266 284" line={5} />
            <Drawn d="M256 280 L266 285 L268 274" line={5} />
        </>
    );
}

function MobileApps() {
    return (
        <>
            <Drawn as="rect" x="158" y="134" width="84" height="156" rx="18" fill={WHITE} />
            <Drawn as="rect" x="170" y="160" width="60" height="100" rx="8" fill={PASTEL} line={4} />
            <Drawn d="M188 148 H212" line={5} />
            <Drawn as="rect" x="180" y="172" width="16" height="16" rx="5" fill={WHITE} line={4} />
            <Drawn as="rect" x="204" y="172" width="16" height="16" rx="5" fill={WHITE} line={4} />
            <Drawn as="rect" x="180" y="196" width="16" height="16" rx="5" fill={WHITE} line={4} />
            <Drawn as="rect" x="204" y="196" width="16" height="16" rx="5" fill={BLUE} line={4} />
            <Drawn as="circle" cx="200" cy="275" r="5" line={4} />
            {/* sparkle: "it feels nice" */}
            <Drawn d="M268 168 L272 179 L283 183 L272 187 L268 198 L264 187 L253 183 L264 179 Z" fill={PASTEL} line={4} />
        </>
    );
}

function LandingPages() {
    return (
        <>
            <Drawn as="rect" x="114" y="148" width="172" height="136" rx="14" fill={WHITE} />
            <Drawn d="M114 172 H286" line={5} />
            <Drawn as="circle" cx="130" cy="160" r="3" line={4} />
            <Drawn as="circle" cx="144" cy="160" r="3" line={4} />
            <Drawn as="circle" cx="158" cy="160" r="3" line={4} />
            <Drawn d="M136 198 H214" />
            <Drawn d="M136 214 H190" line={5} />
            <Drawn as="rect" x="136" y="232" width="56" height="22" rx="11" fill={BLUE} line={4} />
            {/* a little cloud in the page's picture */}
            <Drawn d="M232 252 C220 252 218 238 228 235 C227 223 241 217 249 225 C254 213 274 215 274 231 C284 232 285 252 272 252 Z" fill={PASTEL} line={4} />
        </>
    );
}

function ContentSystems() {
    return (
        <>
            <Drawn as="rect" x="166" y="140" width="118" height="94" rx="12" fill={PASTEL} />
            <Drawn as="rect" x="148" y="164" width="118" height="94" rx="12" fill={WHITE} />
            <Drawn as="rect" x="130" y="188" width="118" height="94" rx="12" fill={WHITE} />
            <Drawn d="M148 214 H222" line={5} />
            <Drawn d="M148 232 H208" line={5} />
            <Drawn d="M148 250 H190" line={5} />
            {/* pencil: you edit it yourself */}
            <Drawn d="M246 268 L286 204 L300 213 L260 277 L244 282 Z" fill={PASTEL} line={5} />
            <Drawn d="M280 214 L293 222" line={4} />
        </>
    );
}

function CloudyAgents() {
    return (
        <>
            <Drawn d="M148 280 C120 280 114 246 140 238 C134 206 166 190 190 204 C198 176 244 172 256 200 C280 192 304 216 292 242 C316 246 312 280 284 280 Z" fill={WHITE} />
            <Drawn d="M156 272 C190 276 250 276 284 270" line={4} />
            <Drawn as="ellipse" cx="198" cy="236" rx="6" ry="9" fill={BLUE} line={3} />
            <Drawn as="ellipse" cx="228" cy="236" rx="6" ry="9" fill={BLUE} line={3} />
            <Drawn d="M200 256 C208 266 220 266 228 256" line={5} />
            <Drawn d="M286 150 L291 163 L304 168 L291 173 L286 186 L281 173 L268 168 L281 163 Z" fill={PASTEL} line={4} />
            <Drawn d="M130 160 L133 168 L141 171 L133 174 L130 182 L127 174 L119 171 L127 168 Z" fill={PASTEL} line={4} />
        </>
    );
}

export const DISH_ART = {
    automation: AutomatedSystems,
    mobile: MobileApps,
    landing: LandingPages,
    cms: ContentSystems,
    agents: CloudyAgents,
};