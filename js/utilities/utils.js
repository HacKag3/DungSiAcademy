const ESCAPE_MAP = { 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    '"': '&quot;', 
    "'": '&#039;' };
export const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (m) => ESCAPE_MAP[m]);

export const telHref = (phone) => String(phone).replace(/[^0-9+]/g, "");
