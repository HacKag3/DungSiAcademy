import { testoSede } from "../../lib/helpers.mjs";

export default function noteLegali({ legale }) {
    const sede = testoSede(legale.sedeLegale);
    return {
        righe: [
            legale.denominazione,
            legale.codiceFiscale && `C.F. ${legale.codiceFiscale}`,
            legale.partitaIva && `P.IVA ${legale.partitaIva}`,
            sede && `Sede legale: ${sede}`,
            legale.rappresentanteLegale && `Legale rappresentante: ${legale.rappresentanteLegale}`,
            legale.registrazione
        ].filter(Boolean)
    };
}
