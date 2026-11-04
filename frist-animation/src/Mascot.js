// Mascot.js
export default function Mascot() {
    return (
        <svg className="mascot" viewBox="0 0 480 450">
            <g id="ground">{/* 3 line paths */}</g>
            <g id="legs">{/* 2 shoe paths */}</g>
            <g id="shade">{/* light fill path */}</g>
            <g id="cloud">
                <path className="line" d="..." fill="none" stroke="#0a66ff" strokeWidth="4" strokeLinecap="round" />
            </g>
            <g id="face">{/* eyes + mouth paths */}</g>
        </svg>
    );
}