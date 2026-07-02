// Server-only: next/font self-hosts these open-source fonts at build time and
// emits CSS variables. Import ONLY from the root layout. Client components
// reference the variables via lib/appearance FONT_OPTIONS instead.
//
// Every font here is licensed OFL-1.1 or Apache-2.0 and ships 400 + 700 weights.
// next/font requires each loader to be called with literal args and assigned to
// a module-scope const, so these are intentionally written out one by one.
// Declaring a font only injects its @font-face + CSS variable; the browser does
// not download it until some text actually uses that family.
import {
  Inter, Roboto, Open_Sans, Lato, Montserrat, Poppins, Raleway, Nunito,
  Work_Sans, Rubik, DM_Sans, Manrope, Mulish, Josefin_Sans, Quicksand,
  Kanit, Barlow, Karla,
  Lora, Merriweather, Playfair_Display, PT_Serif, Bitter, EB_Garamond, Source_Serif_4,
  JetBrains_Mono, Roboto_Mono, Fira_Code, Source_Code_Pro, IBM_Plex_Mono, Space_Mono,
} from 'next/font/google';

// Inter is the always-on UI font, so it is the only one we preload. Every other
// font is opt-in (chosen per card/group/global), so preload:false keeps them out
// of the initial download and lets Inter render immediately without a fallback flash.
const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true, variable: '--font-inter' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-roboto' });
const openSans = Open_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-open-sans' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-lato' });
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-montserrat' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-poppins' });
const raleway = Raleway({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-raleway' });
const nunito = Nunito({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-nunito' });
const workSans = Work_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-work-sans' });
const rubik = Rubik({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-rubik' });
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-dm-sans' });
const manrope = Manrope({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-manrope' });
const mulish = Mulish({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-mulish' });
const josefinSans = Josefin_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-josefin-sans' });
const quicksand = Quicksand({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-quicksand' });
const kanit = Kanit({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-kanit' });
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-barlow' });
const karla = Karla({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-karla' });

const lora = Lora({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-lora' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-merriweather' });
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-playfair' });
const ptSerif = PT_Serif({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-pt-serif' });
const bitter = Bitter({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-bitter' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-eb-garamond' });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-source-serif' });

const jetbrains = JetBrains_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-jetbrains' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-roboto-mono' });
const firaCode = Fira_Code({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-fira-code' });
const sourceCode = Source_Code_Pro({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-source-code' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-mono' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-space-mono' });

// Space-separated className list that defines every --font-* variable.
export const fontVariables = [
  inter, roboto, openSans, lato, montserrat, poppins, raleway, nunito,
  workSans, rubik, dmSans, manrope, mulish, josefinSans, quicksand, kanit, barlow, karla,
  lora, merriweather, playfair, ptSerif, bitter, ebGaramond, sourceSerif,
  jetbrains, robotoMono, firaCode, sourceCode, ibmPlexMono, spaceMono,
].map(f => f.variable).join(' ');
