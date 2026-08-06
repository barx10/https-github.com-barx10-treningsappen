import { lazy, type ComponentType } from 'react';

/**
 * Settes rett før vi laster siden på nytt etter en feilet chunk, og fjernes så
 * snart en import går bra igjen. Uten det ville en fil som faktisk er borte for
 * godt sende appen inn i en evig omlastingsløkke.
 */
const RELOAD_FLAG = 'treningsappen_chunk_reload';

const hasReloaded = (): boolean => {
  try {
    return sessionStorage.getItem(RELOAD_FLAG) === 'true';
  } catch {
    return false;
  }
};

const setReloaded = (value: boolean) => {
  try {
    if (value) {
      sessionStorage.setItem(RELOAD_FLAG, 'true');
    } else {
      sessionStorage.removeItem(RELOAD_FLAG);
    }
  } catch {
    // Privat modus kan nekte oss sessionStorage. Da lever vi uten løkkevernet.
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Som React.lazy, men tåler at filen ikke lenger finnes.
 *
 * Skjermene under lazy() hentes først når du trykker deg inn på dem. Ligger
 * appen åpen mens en ny versjon legges ut, har filene fått nye navn, og den
 * gamle siden ber om noe som er borte. Da kastet importen, og uten noe som tok
 * imot feilen forsvant hele appen – den måtte drepes og startes på nytt.
 *
 * Her prøver vi én gang til (dekker et blaff på nettet), og henter ellers inn
 * ny index.html slik at siden får tak i de nye filnavnene.
 */
export function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const module = await factory();
      setReloaded(false);
      return module;
    } catch (firstError) {
      try {
        await wait(500);
        const module = await factory();
        setReloaded(false);
        return module;
      } catch (error) {
        // Har vi allerede lastet på nytt for denne feilen, er det noe annet som
        // er galt. La feilgrensa vise den i stedet for å laste om igjen.
        if (hasReloaded()) throw error;

        setReloaded(true);
        window.location.reload();

        // Hold Suspense ventende mens omlastingen skjer, så brukeren ser
        // spinneren i stedet for et glimt av en feilmelding.
        return new Promise<never>(() => {});
      }
    }
  });
}
