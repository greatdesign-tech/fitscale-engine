import { GymConfig } from '@/types';

export function encodeDemoConfig(cfg: GymConfig): string {
  try {
    const json = JSON.stringify(cfg);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(json, 'utf8').toString('base64url');
    }
    // Browser fallback
    const encoded = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(encoded)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error('Failed to encode demo config', e);
    return '';
  }
}

export function decodeDemoConfig(payload: string): GymConfig | null {
  try {
    if (!payload || typeof payload !== 'string') return null;
    let json = '';
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(payload, 'base64url').toString('utf8');
    } else {
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const binary = atob(base64);
      json = decodeURIComponent(
        Array.prototype.map
          .call(binary, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && parsed.name && parsed.slug) {
      return parsed as GymConfig;
    }
    return null;
  } catch (e) {
    console.error('Failed to decode demo config from URL', e);
    return null;
  }
}

/**
 * Builds a universal, self-contained shareable URL for a gym demo.
 * Ensures that ANY prospect, browser, or smartphone opening this URL
 * will always see this exact customized gym without reverting to presets.
 */
export function buildShareableDemoUrl(
  config: GymConfig,
  origin: string = ''
): string {
  const isPreset = ['apex-fitness', 'ironforge-crossfit', 'zenith-pilates', 'rumble-boxing'].includes(
    config.slug
  );

  // If it's an unmodified default preset and name hasn't changed, clean URL is sufficient
  // But if custom or modified, attach encoded payload ?c=...
  const encoded = encodeDemoConfig(config);
  const base = origin ? `${origin}/demo/${config.slug}` : `/demo/${config.slug}`;
  
  if (!encoded) {
    return base;
  }

  return `${base}?c=${encoded}`;
}
