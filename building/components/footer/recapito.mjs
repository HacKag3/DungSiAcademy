import { telefono } from "../../lib/helpers.mjs";

export default function recapito({ contatti }) {
    return { telefono: telefono(contatti.generale?.telefono) };
}
