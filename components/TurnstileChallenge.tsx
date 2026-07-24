import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../LanguageContext';

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      action: string;
      appearance: 'interaction-only';
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
      sitekey: string;
      theme: 'light';
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileChallengeProps {
  onSuccess: (token: string) => void;
}

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let turnstileScriptPromise: Promise<TurnstileApi> | null = null;

const loadTurnstile = (): Promise<TurnstileApi> => {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        reject(new Error('Turnstile API did not initialize.'));
      }
    });
    script.addEventListener('error', () => {
      turnstileScriptPromise = null;
      reject(new Error('Turnstile script failed to load.'));
    });
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

export const TurnstileChallenge: React.FC<TurnstileChallengeProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    let widgetId: string | undefined;

    void loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        widgetId = turnstile.render(containerRef.current, {
          action: 'anonymous_login',
          appearance: 'interaction-only',
          callback: onSuccess,
          'error-callback': () => setFailed(true),
          'expired-callback': () => setFailed(true),
          sitekey: siteKey,
          theme: 'light',
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onSuccess, siteKey]);

  return (
    <div className="fixed inset-0 z-[2000] bg-retro-dark flex items-center justify-center p-6">
      <div className="bg-retro-paper border-4 border-retro-amber shadow-retro p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-serif font-black text-black mb-3 uppercase">
          {t('flow.captcha_title')}
        </h2>
        <p className="text-xs font-mono text-gray-700 mb-5">
          {t('flow.captcha_explanation')}
        </p>
        <div ref={containerRef} className="flex justify-center min-h-16" />
        {failed && (
          <p className="text-xs font-mono text-red-700 mt-4">
            {t('flow.error.captcha_failed')}
          </p>
        )}
      </div>
    </div>
  );
};
