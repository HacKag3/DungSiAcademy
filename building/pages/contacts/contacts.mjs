import { recapiti } from "../../lib/helpers.mjs";

export default function contacts({ contatti }) {
    return {
        contattiUtili: Object.entries(contatti).map(([id, contatto]) => ({
            ...contatto,
            id: contatto.id ?? id,
            icon: contatto.icon || "fas fa-info-circle",
            recapiti: recapiti(contatto)
        }))
    };
}
