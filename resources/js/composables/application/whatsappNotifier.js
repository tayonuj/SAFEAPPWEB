// composables/application/whatsappNotifierWeb.js
import generalAxiosRequest from './generalAxiosRequest';

/**
 * If you prefer to inject these from your app (recommended):
 *  - provide('$whatsappWebhook', 'https://.../webhook/<uuid>')
 *  - provide('$whatsappWebhookTest', 'https://.../webhook-test/<uuid>')
 * Then pass them into the send functions below OR replace the constants.
 */
const N8N_WH_WEBHOOK =
    'https://shia.logifortech.com/webhook/60aa6e79-fb99-42e4-b754-5a52ba218c52';
const N8N_WH_WEBHOOK_TEST =
    'https://shia.logifortech.com/webhook-test/60aa6e79-fb99-42e4-b754-5a52ba218c52';

// ---- helpers ----
export const normalizeE164 = (raw, defaultCC = '+94') => {
    if (!raw) return '';
    const s = String(raw).trim();
    if (s.startsWith('+')) return s.replace(/\s+/g, '');
    if (s.startsWith('0')) return `${defaultCC}${s.slice(1)}`.replace(/\s+/g, '');
    return s.replace(/\s+/g, '');
};

// Message builders (Sinhala)
export const buildAttendanceMsg = ({ studentName, className, time, date }) =>
    ` ${studentName} දරුවා අද දින පැවති ${className} පන්තියට ${date} ${time} ට ඇතුළුවූවා.`;

export const buildPaymentMsg = ({ studentName, className, amount }) =>
    ` ${studentName} දරුවා ${className} පන්තියට රු. ${amount} ගෙවීම සිදුකර ඇත.`;


// ---- NEW: "End of class (today)" message ----
export const buildClassEndMsg = ({ className, date, endTime, extra }) => {
    // date: "2025-10-23" (any readable date is fine)
    // endTime: "07:45 PM" (optional)
    // extra: optional short note (homework, reminders, etc.)
    const timePart = endTime ? ` ${endTime} ට` : '';
    const extraPart = extra ? ` ${extra}` : '';
    return ` අද (${date}) පැවති ${className} පන්තිය අවසන් විය.පන්තිය ${timePart} නිමාවුණා.${extraPart}`;
};

export async function sendClassEndNotice({
                                             to,
                                             className,
                                             date,        // e.g., new Date().toLocaleDateString('en-CA')
                                             endTime,     // e.g., new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true })
                                             extra,       // optional short note
                                             webhook = N8N_WH_WEBHOOK,
                                         }) {
    const key = `end:${to}:${className}:${date}:${endTime || ''}`;
    if (inCooldown(key)) return; // prevent rapid duplicates for the same class/day
    const text = buildClassEndMsg({ className, date, endTime, extra });
    await sendWhatsapp({ to, text, webhook });
}


const _cooldown = new Map();
const inCooldown = (key, ms = 20000) => {
    const now = Date.now();
    const at = _cooldown.get(key) || 0;
    if (now - at < ms) return true;
    _cooldown.set(key, now);
    return false;
};

// ---- sender (plain text) ----
export async function sendWhatsapp({ to, text, webhook = N8N_WH_WEBHOOK }) {
    const recipient = normalizeE164(to);
    if (!recipient || !text) return;
    try {
        await generalAxiosRequest(
            'curl-requests/post',
            { url: webhook, data: JSON.stringify({ to: recipient, text }) },
            false
        );
    } catch (e) {
        console.log('[sendWhatsapp:web] error', e?.message || e);
    }
}

// Convenience wrappers
export async function sendAttendanceNotice({
                                               to,
                                               studentName,
                                               className,
                                               time, // "07:45 PM"
                                               date, // "2025-10-23"
                                               webhook = N8N_WH_WEBHOOK,
                                           }) {
    const key = `att:${to}:${studentName}:${className}:${date}`;
    if (inCooldown(key)) return; // avoid accidental duplicates
    const text = buildAttendanceMsg({ studentName, className, time, date });
    await sendWhatsapp({ to, text, webhook });
}

export async function sendPaymentReceipt({
                                             to,
                                             studentName,
                                             className,
                                             amount,
                                             webhook = N8N_WH_WEBHOOK,
                                         }) {
    const key = `pay:${to}:${studentName}:${className}:${amount}`;
    if (inCooldown(key)) return; // avoid rapid duplicates
    const text = buildPaymentMsg({ studentName, className, amount });
    await sendWhatsapp({ to, text, webhook });
}
