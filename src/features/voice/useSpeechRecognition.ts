import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  SpeechRecognitionConstructor,
  SpeechRecognitionLike,
  RecState,
} from './types';

interface Options {
  lang?: string;
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
}

export function useSpeechRecognition(opts: Options) {
  const { lang = 'ja-JP', onFinal, onInterim } = opts;
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const [state, setState] = useState<RecState>('idle');
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);

  useEffect(() => { onFinalRef.current = onFinal; }, [onFinal]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);

  useEffect(() => {
    const SR =
      ((window as unknown) as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
      ((window as unknown) as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SR) {
      setState('unsupported');
      return;
    }

    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => setState('listening');
    rec.onend = () => setState(prev => (prev === 'listening' ? 'idle' : prev));
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setState('denied');
      } else if (e.error === 'no-speech') {
        // 無音時は idle に戻すだけ
        setState('idle');
      } else {
        setState('error');
      }
    };
    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const transcript = r[0]?.transcript ?? '';
        if (r.isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) onFinalRef.current(final);
      if (interim) onInterimRef.current?.(interim);
    };

    recRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* noop */ }
      recRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try { rec.start(); } catch { /* already started */ }
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try { rec.stop(); } catch { /* not running */ }
  }, []);

  const toggle = useCallback(() => {
    if (state === 'listening') stop();
    else start();
  }, [state, start, stop]);

  return { state, start, stop, toggle, supported: state !== 'unsupported' };
}
