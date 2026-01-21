// composables/application/smsNotifierWeb.js
import generalAxiosRequest from './generalAxiosRequest';

/**
 * Production/Test endpoints
 * (Your Postman screenshot shows: https://sms.logifortech.com/v1/sms)
 */
export const SMS_API_URL = 'https://sms.logifortech.com/v1/sms';
export const SMS_API_TEST_URL = 'https://sms.logifortech.com/v1/sms'; // change if you have a separate test URL

// ---- helpers ----

/**
 * Normalize to MSISDN format required by most Sri Lankan SMS gateways:
 * - Input examples: "+94 740 111 169", "0740111169", "94740111169"
 * - Output: "94740111169" (digits only, no plus)
 */
export const normalizeMsisdn = (raw, defaultCC = '94') => {
    if (!raw) return '';
    let s = String(raw).trim();

    // remove spaces and non-digits except leading +
    s = s.replace(/[^\d+]/g, '');

    // +94XXXXXXXXX  ->  94XXXXXXXXX
    if (s.startsWith('+')) s = s.slice(1);

    // 0XXXXXXXXX -> 94XXXXXXXXX
    if (s.startsWith('0')) s = `${defaultCC}${s.slice(1)}`;

    // already starts with 94.. -> keep
    // anything else -> strip non-digits (safety)
    return s.replace(/\D/g, '');
};

// Simple duplicate-suppression window
const _cooldown = new Map();
const inCooldown = (key, ms = 20000) => {
    const now = Date.now();
    const at = _cooldown.get(key) || 0;
    if (now - at < ms) return true;
    _cooldown.set(key, now);
    return false;
};

// ---- Message builders (Sinhala) ----
// Keep them concise for SMS

export const buildAttendanceMsg = ({ studentName, className, time, date }) =>
    `${studentName} ada ${date} ${time} ta ${className} panthiyata peminiya.`

export const buildPaymentMsg = ({ studentName, className, amount }) =>
    `${studentName} (${className}) geweema Rs.${amount} labaagaththa.`

export const buildClassEndMsg = ({ className, date, endTime, extra }) => {
    const timePart = endTime ? ` ${endTime} ට` : '';
    const extraPart = extra ? ` ${extra}` : '';
    return `ada (${date}) pewathi ${className} panthiya awasan. panthiya ${timePart} nima una.${extraPart}`;
};

// ---- Sender (plain text SMS) ----

/**
 * Send a plain SMS via your gateway.
 * Body: { to: "9474...", message: "..." }
 * Returns the raw axios result from your backend wrapper.
 */
export async function sendSms({
                                  to,
                                  message,
                                  endpoint = SMS_API_URL,
                              }) {
    const msisdn = normalizeMsisdn(to);
    if (!msisdn || !message) return { ok: false, error: 'Missing to/message' };

    try {
        // Your convention: generalAxiosRequest('curl-requests/post', payload, false)
        // Payload -> { url, data }  (headers handled by server util)
        const payload = {
            url: endpoint,
            data: JSON.stringify({ to: msisdn, message:message }),
        };

        const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false,'',null,'true');
        // Typical shape (from screenshot):
        // { ok: true, data: { cmd: 13, success: true, data: "OK" } }
        const value = json_data?.value ?? json_data ?? null;

        return { ok: true, result: value };
    } catch (e) {
        console.log('[sendSms] error', e?.message || e);
        return { ok: false, error: e?.message || String(e) };
    }
}

// ---- Convenience wrappers (mirror WhatsApp helpers) ----

export async function sendAttendanceSMS({
                                            to,
                                            studentName,
                                            className,
                                            time, // "07:45 PM"
                                            date, // "2025-10-23"
                                            endpoint = SMS_API_URL,
                                        }) {
    const key = `sms:att:${to}:${studentName}:${className}:${date}`;
    if (inCooldown(key)) return { ok: true, suppressed: true };
    const message = buildAttendanceMsg({ studentName, className, time, date });
    return await sendSms({ to, message, endpoint });
}

export async function sendPaymentSMS({
                                         to,
                                         studentName,
                                         className,
                                         amount,
                                         endpoint = SMS_API_URL,
                                     }) {
    const key = `sms:pay:${to}:${studentName}:${className}:${amount}`;
    if (inCooldown(key)) return { ok: true, suppressed: true };
    const message = buildPaymentMsg({ studentName, className, amount });
    return await sendSms({ to, message, endpoint });
}

export async function sendClassEndSMS({
                                          to,
                                          className,
                                          date,     // "2025-10-23"
                                          endTime,  // "07:45 PM" (optional)
                                          extra,    // optional short note
                                          endpoint = SMS_API_URL,
                                      }) {
    const key = `sms:end:${to}:${className}:${date}:${endTime || ''}`;
    if (inCooldown(key)) return { ok: true, suppressed: true };
    const message = buildClassEndMsg({ className, date, endTime, extra });
    return await sendSms({ to, message, endpoint });
}

// Optional: default export for ergonomic imports
export default {
    SMS_API_URL,
    SMS_API_TEST_URL,
    normalizeMsisdn,
    buildAttendanceMsg,
    buildPaymentMsg,
    buildClassEndMsg,
    sendSms,
    sendAttendanceSMS,
    sendPaymentSMS,
    sendClassEndSMS,
};
