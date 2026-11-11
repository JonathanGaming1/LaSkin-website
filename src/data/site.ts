/** Confirmed business facts (source: owner specification). Nothing here is inferred. */
export const SITE = {
  name: 'La Skin',
  legalName: 'La Skin — Aesthetic Medical Clinic',
  phoneDisplay: '058-570-0051',
  phoneE164: '+972585700051',
  whatsappNumber: '972585700051',
  email: 'laskin.amc@gmail.com',
  address: { street: 'מבוא החורש 10', city: 'הר אדר', streetEn: 'Mevo HaHoresh 10', cityEn: 'Har Adar', country: 'IL' },
  hours: {
    weekdays: { opens: '08:30', closes: '18:00' }, // Sunday–Thursday
    friday: { opens: '08:30', closes: '14:00' },
  },
  facebook: 'https://www.facebook.com/Laskin.amc',
  instagram: 'https://www.instagram.com/la_skin_5',
  instagramHandle: '@la_skin_5',
  /** Public map/navigation links are built from the address only (no invented place IDs). */
  mapsQuery: 'מבוא החורש 10, הר אדר',
  productionOrigin: 'https://laskin.co.il',
  launchDate: '2026-09-26',
} as const;

export const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`;
export const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(SITE.mapsQuery)}&navigate=yes`;

/** Language-specific WhatsApp opening messages (from the owner specification). */
export const WA_MESSAGE = {
  he: 'שלום, הגעתי מאתר La Skin ואשמח לקבל פרטים על הסרת שיער בלייזר. השאלה המרכזית שלי היא: ',
  en: 'Hello, I came from the La Skin website and would like information about laser hair removal. My main question is: ',
  ar: 'مرحباً، وصلت عبر موقع La Skin وأرغب في الحصول على معلومات عن إزالة الشعر بالليزر. سؤالي الرئيسي هو: ',
} as const;

/** wa.me deep link with a URL-encoded message. Works without JavaScript on every device. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Message composed by the lead form ({name}/{phone} are replaced on the visitor's device only). */
export const FORM_MESSAGE = {
  he: 'שלום, הגעתי מאתר La Skin. שמי {name}, טלפון {phone}. אשמח שתחזרו אליי לתיאום פגישת ייעוץ ללא התחייבות.',
  en: 'Hello, I came from the La Skin website. My name is {name}, phone {phone}. Please get back to me to schedule a no-obligation consultation.',
  ar: 'مرحباً، وصلت عبر موقع La Skin. اسمي {name}، الهاتف {phone}. أرجو العودة إليّ لتحديد موعد استشارة بدون التزام.',
} as const;
