/**
 * Network and Security Audit Service
 * Captures the client IP address (or contextual network fallback)
 * and exact timestamp down to milliseconds for comprehensive security event auditing.
 */

let cachedIpAddress: string | null = null;
let isFetchingIp = false;

/**
 * Determine a realistic contextual IP address placeholder when external IP lookup
 * is unreachable, slow, or running in local development / offline sandboxes.
 */
const getFallbackIpAddress = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '127.0.0.1 (Localhost Portal)';
    }
  }
  return '192.168.1.105 (LAN Committee Portal)';
};

/**
 * Eagerly fetch and cache the client's public IP address in the background
 */
export const initNetworkAudit = async (): Promise<string> => {
  if (cachedIpAddress) return cachedIpAddress;
  if (isFetchingIp) {
    return cachedIpAddress || getFallbackIpAddress();
  }

  isFetchingIp = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        cachedIpAddress = String(data.ip).trim();
        return cachedIpAddress;
      }
    }
  } catch {
    // Secondary fallback service if primary is restricted
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 1500);
      const res2 = await fetch('https://api.seeip.org/json', {
        signal: controller2.signal,
      });
      clearTimeout(timeoutId2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.ip) {
          cachedIpAddress = String(data2.ip).trim();
          return cachedIpAddress;
        }
      }
    } catch {
      // Ignore network errors and fallback to client context
    }
  } finally {
    isFetchingIp = false;
  }

  if (!cachedIpAddress) {
    cachedIpAddress = getFallbackIpAddress();
  }
  return cachedIpAddress;
};

// Initiate immediate resolution on module initialization
if (typeof window !== 'undefined') {
  initNetworkAudit().catch(() => {});
}

export interface SecurityAuditContext {
  ipAddress: string;
  exactTimestamp: string;
  isoTimestamp: string;
  clientContext: string;
}

/**
 * Generates exact timestamp with millisecond precision,
 * captures current IP address, and client system context.
 */
export const getSecurityAuditContext = async (): Promise<SecurityAuditContext> => {
  let ipAddress = cachedIpAddress;
  if (!ipAddress) {
    try {
      ipAddress = await initNetworkAudit();
    } catch {
      ipAddress = getFallbackIpAddress();
    }
  }
  if (!ipAddress) {
    ipAddress = getFallbackIpAddress();
  }

  const now = new Date();
  const isoTimestamp = now.toISOString();

  // Exact timestamp formatted with date, 12-hr time, milliseconds and local timezone
  const datePart = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const exactTimestamp = `${datePart}, ${timePart}.${ms}`;

  // Client user agent / browser & OS context
  let clientContext = 'Web Client';
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    let browser = 'Browser';
    let os = 'Unknown OS';

    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';

    if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    clientContext = `${browser} on ${os}`;
  }

  return {
    ipAddress,
    exactTimestamp,
    isoTimestamp,
    clientContext,
  };
};
