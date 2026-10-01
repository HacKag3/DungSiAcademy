// Email per le richieste privacy: legale.emailPrivacy se presente, altrimenti il contatto "privacy".
export default function emailPrivacy({ legale, contatti }) {
    return { email: legale.emailPrivacy || contatti.privacy?.email || "" };
}
