import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Cloudy from './Cloudy';
import Splash from './Splash';
import { DISHES } from './Menu';
import { sfx } from './sfx';
import { useLang, DISH_TEXT } from './i18n';
import './PlaceOrder.css';

// ---------------------------------------------------------------------------
// SENDING THE ORDER: this site has no server yet, so this only pretends to send.
// To receive orders by email, connect a form service, e.g. Formspree:
//   const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
//     body: JSON.stringify(order),
//   });
//   return res.ok;
// ---------------------------------------------------------------------------
async function sendOrder(order) {
    await new Promise((resolve) => setTimeout(resolve, 700)); // pretend it takes a moment
    return true;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PlaceOrder() {
    const root = useRef(null);
    const [mood, setMood] = useState('happy');
    const [cravings, setCravings] = useState([]);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'
    const [orderNo, setOrderNo] = useState('');
    const moodTimer = useRef();
    const { t, lang } = useLang();
    const dishName = (key) => DISH_TEXT[lang][key].name;

    const { contextSafe } = useGSAP(() => { }, { scope: root });

    const moodFor = (m, ms) => {
        clearTimeout(moodTimer.current);
        setMood(m);
        if (ms) moodTimer.current = setTimeout(() => setMood('happy'), ms);
    };

    // cravings are stored by dish key (e.g. 'mobile'), so they survive a language switch
    const toggleCraving = contextSafe((key, e) => {
        setCravings((list) => (list.includes(key) ? list.filter((c) => c !== key) : [...list, key]));
        gsap.fromTo(e.currentTarget, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    });

    // splash of drops around Cloudy (same burst as the intro)
    const splash = contextSafe(() => {
        const drops = root.current.querySelectorAll('.order-splash .drop');
        gsap.timeline()
            .fromTo(drops,
                { y: 0, autoAlpha: 1, scaleX: 0.3, scaleY: 1.3 },
                { y: (i, el) => -el.dataset.dist, scaleX: 1, scaleY: 1, duration: 0.5, ease: 'expo.out', stagger: { each: 0.012, from: 'random' } })
            .to(drops, { y: '-=10', scale: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.in', stagger: { each: 0.015, from: 'random' } }, '-=0.12');
        gsap.fromTo(root.current.querySelector('.order-cloudy'), { y: 0 }, { keyframes: { y: [-36, 0] }, duration: 0.6, ease: 'power2.out' });
    });

    const onSubmit = contextSafe(async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const order = { ...data, cravings: cravings.map((key) => DISH_TEXT.en[key].name), language: lang };

        // check the order
        const problems = {};
        if (!order.name.trim()) problems.name = 'order.errName';
        if (!EMAIL.test(order.email.trim())) problems.email = 'order.errEmail';
        if (!cravings.length && !order.message.trim()) problems.message = 'order.errMessage';
        setErrors(problems);

        if (Object.keys(problems).length) {
            moodFor('sad', 1800);
            sfx.soft('boing', 0.35);
            gsap.fromTo(root.current.querySelector('.order-pad'), { x: 0 }, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.45, ease: 'power1.out' });
            return;
        }

        setStatus('sending');
        moodFor('whistling');
        const ok = await sendOrder(order);
        if (!ok) {
            setStatus('idle');
            setErrors({ form: 'order.errForm' });
            moodFor('sad', 1800);
            return;
        }

        setOrderNo(String(Math.floor(100 + Math.random() * 900)));
        setStatus('sent');
        moodFor('jumping', 2600);
        sfx.play('bell');
        sfx.soft('pop', 0.5);
        splash();
    });

    const reset = () => {
        setStatus('idle');
        setCravings([]);
        setErrors({});
    };

    return (
        <section className="place-order" id="order" ref={root}>
            <div className="order-inner">
                <div className="order-intro">
                    <p className="order-kicker">{t('order.kicker')}</p>
                    <h2 className="order-title">{t('order.title')}</h2>
                    <p className="order-text">{t('order.text')}</p>
                    <div className="order-cloudy-wrap">
                        <Splash className="order-splash" color="#6BBEFF" spread={2.2} size={260} />
                        <Cloudy mood={mood} className="order-cloudy" label={t('meet.label')} />
                    </div>
                </div>

                {status !== 'sent' ? (
                    <form className="order-pad" onSubmit={onSubmit} noValidate>
                        <div className="pad-spiral" aria-hidden="true"></div>
                        <p className="pad-heading">{t('order.slip')}</p>

                        <div className="field">
                            <label htmlFor="order-name">{t('order.name')}</label>
                            <input id="order-name" name="name" type="text" autoComplete="name" placeholder={t('order.namePh')}
                                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
                            {errors.name && <p className="field-error" id="err-name">{t(errors.name)}</p>}
                        </div>

                        <div className="field">
                            <label htmlFor="order-email">{t('order.email')}</label>
                            <input id="order-email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
                                aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
                            {errors.email && <p className="field-error" id="err-email">{t(errors.email)}</p>}
                        </div>

                        <fieldset className="field">
                            <legend>{t('order.craving')}</legend>
                            <div className="cravings">
                                {DISHES.map((dish) => (
                                    <button
                                        key={dish.key}
                                        type="button"
                                        className="craving"
                                        aria-pressed={cravings.includes(dish.key)}
                                        onClick={(e) => toggleCraving(dish.key, e)}
                                    >
                                        {dishName(dish.key)}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <div className="field">
                            <label htmlFor="order-message">{t('order.message')}</label>
                            <textarea id="order-message" name="message" rows="4" placeholder={t('order.messagePh')}
                                aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : undefined} />
                            {errors.message && <p className="field-error" id="err-message">{t(errors.message)}</p>}
                        </div>

                        {errors.form && <p className="field-error">{t(errors.form)}</p>}

                        <button
                            type="submit"
                            className="btn btn-hero order-submit"
                            disabled={status === 'sending'}
                            onMouseEnter={() => status === 'idle' && moodFor('jumping')}
                            onMouseLeave={() => status === 'idle' && moodFor('happy')}
                        >
                            {status === 'sending' ? t('order.sending') : t('order.submit')}
                        </button>
                    </form>
                ) : (
                    <div className="order-done" role="status">
                        <article className="receipt order-receipt">
                            <header className="receipt-head">
                                <p className="receipt-brand">{t('receipt.brand')}</p>
                                <p className="receipt-small">{t('receipt.tagline')}</p>
                            </header>
                            <div className="receipt-rule" aria-hidden="true"></div>
                            <p className="order-received">{t('order.received')}</p>
                            <p className="receipt-line"><span>{t('receipt.order')}</span><span className="leader" /><span>#{orderNo}</span></p>
                            {(cravings.length ? cravings.map(dishName) : [t('order.special')]).map((c) => (
                                <p key={c} className="receipt-line"><span>1x {c}</span><span className="leader" /><span>{t('order.noted')}</span></p>
                            ))}
                            <div className="receipt-rule" aria-hidden="true"></div>
                            <p className="receipt-line receipt-total"><span>{t('order.status')}</span><span className="leader" /><span>{t('order.inKitchen')}</span></p>
                            <div className="receipt-rule" aria-hidden="true"></div>
                            <p className="receipt-thanks">{t('order.thanks')}</p>
                        </article>
                        <button type="button" className="btn btn-secondary-blue" onClick={reset}>{t('order.again')}</button>
                    </div>
                )}
            </div>
        </section>
    );
}

// Scroll animation, called from App.js
export function buildOrderScroll(root) {
    const q = gsap.utils.selector(root);
    gsap.from(q('.order-kicker, .order-title, .order-text, .order-cloudy-wrap'), {
        autoAlpha: 0, y: 40, stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 80%', end: 'top 30%', scrub: 1 },
    });
    gsap.from(q('.order-pad'), {
        autoAlpha: 0, y: 120, rotation: 5, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 20%', scrub: 1 },
    });
}
