import { sfx } from './sfx';
import { useLang } from './i18n';

// SoundControls.js: the buttons in the top corner.
//  - AR / EN: switch language (visible from the very start)
//  - shuffle + mute: appear once the intro is done
// soundOn / setSoundOn live in App.js, so the start screen's choice is remembered here.
export default function SoundControls({ soundOn, setSoundOn, onToggleLang }) {
    const { t } = useLang();

    const toggleSound = () => {
        if (soundOn) {
            sfx.setMuted(true);
            setSoundOn(false);
        } else {
            // also works if they chose "Continue without sound" at the start:
            // this click unlocks audio and starts the background music
            sfx.enable();
            sfx.setMuted(false);
            sfx.startBackground();
            sfx.play('click');
            setSoundOn(true);
        }
    };

    return (
        <div className="top-controls">
            <div className="sound-controls">
                {soundOn && (
                    <button className="sound-btn" onClick={() => sfx.shuffleMusic()} aria-label={t('sound.shuffle')} title={t('sound.shuffle')}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 7h3.5c2.5 0 3.8 1.2 5 3.5l1 2c1.2 2.3 2.5 3.5 5 3.5H21M3 17h3.5c1.6 0 2.7-.5 3.6-1.5M14 8.5c.9-1 2-1.5 3.5-1.5H21M18 4l3 3-3 3M18 14l3 3-3 3" />
                        </svg>
                    </button>
                )}
                <button
                    className="sound-btn"
                    onClick={toggleSound}
                    aria-pressed={!soundOn}
                    aria-label={soundOn ? t('sound.mute') : t('sound.on')}
                    title={soundOn ? t('sound.mute') : t('sound.on')}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path className="speaker" d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
                        {soundOn ? (
                            <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
                        ) : (
                            <path d="M16 9.5l5 5M21 9.5l-5 5" />
                        )}
                    </svg>
                </button>
            </div>
            <button className="sound-btn lang-btn" onClick={onToggleLang} aria-label={t('lang.label')} title={t('lang.label')}>
                <span className="lang-label">{t('lang.button')}</span>
            </button>
        </div>
    );
}