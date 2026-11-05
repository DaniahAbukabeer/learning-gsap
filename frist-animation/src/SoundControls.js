import { useState } from 'react';
import { sfx } from './sfx';
import { useLang } from './i18n';

// SoundControls.js: the buttons in the top corner, made like an old cassette player's keys.
//   [tape window] [mute all] [stop/play music] [shuffle] [AR/EN]
// - AR / EN is there from the very start; the rest slide out once the intro is done
// - mute and music keys stay pushed down while they're "on", like real latching keys
// - the little cassette's reels turn while music is playing
// soundOn / setSoundOn live in App.js, so the start screen's choice is remembered here.

const Icon = ({ children }) => <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;

export default function SoundControls({ soundOn, setSoundOn, onToggleLang }) {
    const { t } = useLang();
    const [musicOn, setMusicOn] = useState(sfx.isMusicOn());

    // every key: the cassette "ka-chunk", then what it does
    const press = (fn) => () => { sfx.key(); fn(); };

    const toggleSound = () => {
        if (soundOn) {
            sfx.setMuted(true);
            setSoundOn(false);
        } else {
            // also works if they chose "Continue without sound" at the start:
            // this click unlocks audio and starts the background sounds
            sfx.enable();
            sfx.setMuted(false);
            sfx.startBackground();
            setSoundOn(true);
            sfx.key();
        }
    };

    const toggleMusic = () => {
        sfx.setMusic(!musicOn);
        setMusicOn(!musicOn);
    };

    const shuffle = () => {
        sfx.shuffleMusic(); // also turns the music back on
        setMusicOn(true);
    };

    const playing = soundOn && musicOn;

    return (
        <div className="top-controls">
            <div className="deck" role="group" aria-label={t('sound.deck')}>
                <div className="sound-controls">
                    {/* the little cassette: its reels turn while the music plays */}
                    <svg className={`deck-tape ${playing ? 'is-playing' : ''}`} viewBox="0 0 56 32" aria-hidden="true">
                        <rect x="1.5" y="1.5" width="53" height="29" rx="5" className="tape-body" />
                        <path d="M15 22 H41" className="tape-line" />
                        <g className="tape-reel"><circle cx="15" cy="14" r="8" /><path d="M15 8 V11 M9.8 17 L12.4 15.5 M20.2 17 L17.6 15.5" /></g>
                        <g className="tape-reel"><circle cx="41" cy="14" r="8" /><path d="M41 8 V11 M35.8 17 L38.4 15.5 M46.2 17 L43.6 15.5" /></g>
                    </svg>

                    {/* mute everything */}
                    <button
                        className="deck-key"
                        onClick={soundOn ? press(toggleSound) : toggleSound}
                        aria-pressed={!soundOn}
                        aria-label={soundOn ? t('sound.mute') : t('sound.on')}
                        title={soundOn ? t('sound.mute') : t('sound.on')}
                    >
                        <Icon>
                            <path className="fill" d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
                            {soundOn ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
                        </Icon>
                    </button>

                    {/* stop / play the music only */}
                    <button
                        className="deck-key"
                        onClick={press(toggleMusic)}
                        aria-pressed={!musicOn}
                        aria-label={musicOn ? t('sound.musicOff') : t('sound.musicOn')}
                        title={musicOn ? t('sound.musicOff') : t('sound.musicOn')}
                    >
                        <Icon>
                            {musicOn
                                ? <rect className="fill" x="7" y="7" width="10" height="10" rx="1.5" />
                                : <path className="fill" d="M8 6 L18 12 L8 18 Z" />}
                        </Icon>
                    </button>

                    {/* another song */}
                    <button className="deck-key" onClick={press(shuffle)} aria-label={t('sound.shuffle')} title={t('sound.shuffle')}>
                        <Icon>
                            <path d="M3 7h3.5c2.5 0 3.8 1.2 5 3.5l1 2c1.2 2.3 2.5 3.5 5 3.5H21M3 17h3.5c1.6 0 2.7-.5 3.6-1.5M14 8.5c.9-1 2-1.5 3.5-1.5H21M18 4l3 3-3 3M18 14l3 3-3 3" />
                        </Icon>
                    </button>
                </div>

                {/* language */}
                <button className="deck-key lang-key" onClick={press(onToggleLang)} aria-label={t('lang.label')} title={t('lang.label')}>
                    <span className="lang-label">{t('lang.button')}</span>
                </button>
            </div>
        </div>
    );
}