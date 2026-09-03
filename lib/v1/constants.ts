/**
 * Kosar (v1) static content — a faithful port of kosar-localized/constants/index.ts.
 * Image paths are re-based under /v1/images (assets committed in public/v1).
 */

export const GlobalSearchFilters = [
  {
    name: 'تخصص',
    value: 'specilozation',
  },
  {
    name: 'دکتر',
    value: 'doctor',
  },
  {
    name: 'بیماری',
    value: 'illness',
  },
]

export const deal = [
  { id: '1', name: 'بیمه کوثر', imageUrl: '/v1/images/deal/Kosar.png' },
  { id: '2', name: 'بیمه رازی', imageUrl: '/v1/images/deal/Razi.png' },
  {
    id: '3',
    name: 'تامین اجتماعی',
    imageUrl: '/v1/images/deal/tamin-ejtemaei.svg',
  },
  { id: '4', name: 'بیمه ایران', imageUrl: '/v1/images/deal/Iran1.png' },
  { id: '5', name: 'بیمه ملت', imageUrl: '/v1/images/deal/Mellat.png' },
  { id: '6', name: 'بیمه سامان', imageUrl: '/v1/images/deal/Saman.png' },
  { id: '7', name: 'بیمه دانا', imageUrl: '/v1/images/deal/Dana.png' },
  { id: '8', name: 'بیمه آسیا', imageUrl: '/v1/images/deal/Asia.png' },
  { id: '9', name: 'بیمه سلامت', imageUrl: '/v1/images/deal/salamat.svg' },
  { id: '10', name: 'بیمه معلم', imageUrl: '/v1/images/deal/Moallem1.png' },
  { id: '11', name: 'بیمه نوین', imageUrl: '/v1/images/deal/Novin.png' },
  { id: '12', name: 'آتیه‌سازان', imageUrl: '/v1/images/deal/atieh.svg' },
  { id: '14', name: 'بیمه البرز', imageUrl: '/v1/images/deal/Alborz.png' },
  { id: '15', name: 'بیمه دی', imageUrl: '/v1/images/deal/Day.png' },
  { id: '16', name: 'بیمه میهن', imageUrl: '/v1/images/deal/Mihan.png' },
  { id: '17', name: 'بیمه سینا', imageUrl: '/v1/images/deal/Sina1.png' },
]

export const rooms = [
  {
    id: '1',
    title: 'اقدامات عمومی',
    src: '/v1/images/parts/omomi1.webp',
    items: [
      { id: '1', text: 'تزریق وریدی با رعایت طرح انطباق' },
      { id: '2', text: 'شست‌وشوی گوش' },
      { id: '3', text: 'وصل سرم' },
      { id: '4', text: 'انجام نوار قلب' },
      { id: '5', text: 'انجام بخیه' },
      { id: '6', text: 'انجام پانسمان ساده و تخصصی' },
      { id: '7', text: 'برداشتن خال، میخچه، کرایوتراپی' },
      { id: '8', text: 'حجامت' },
    ],
  },
  {
    id: '3',
    title: 'زیبایی عمومی',
    src: '/v1/images/parts/zibaei1.webp',
    items: [
      { id: '1', text: 'تزریق بوتاکس' },
      { id: '2', text: 'تزریق ژل' },
      { id: '3', text: 'لیزر موهای زائد' },
    ],
  },
]

export type Slider = { id: string; name: string; imageUrl: string }

export const slider = [
  {
    id: '1',
    name: 'غدد و متابولیسم',
    imageUrl: '/v1/images/head-6.webp',
  },
  {
    id: '2',
    name: 'کودکان و نوزادان',
    imageUrl: '/v1/images/kosar-sm.webp',
  },
  {
    id: '3',
    name: 'بیماری‌های عفونی',
    imageUrl: '/v1/images/14.webp',
  },
  {
    id: '4',
    name: 'زنان و زایمان',
    imageUrl: '/v1/images/head-1.webp',
  },
]

export const laboratories = [
  {
    id: '1',
    image: '/v1/images/labratoar/hemato.webp',
    title: 'هماتولوژی',
    description:
      'تشخیص کم‌خونی، سرطان خون و بیماری‌های مغز و استخوان با آزمایشهای مربوط به گلبول سفید و قرمز خون',
  },
  {
    id: '2',
    image: '/v1/images/labratoar/biochemy.webp',
    title: 'بیوشیمی',
    description:
      'تشخیص بیماری‌های شیمیایی خون مانند دیابت و چربی و بررسی عملکرد کلیه و کبد',
  },
  {
    id: '3',
    image: '/v1/images/labratoar/mikrob.webp',
    title: 'میکروبشناسی',
    description: 'کشت، بررسی و شناسایی باکتری، قارچ، مخمر و عفونتها',
  },
  {
    id: '4',
    image: '/v1/images/labratoar/serology.webp',
    title: 'سرولوژی',
    description:
      'سنجش سیستم ایمنی بدن و تشخیص بیماری‌های عفونی و آنتی‌بادی‌ها در خون',
  },
  {
    id: '5',
    image: '/v1/images/labratoar/potology.jpg',
    title: 'هورمون‌شناسی',
    description:
      'اندازه‌گیری سطح هورمون‌های تیروئیدی، جنسی، هیپوفیز و فوق کلیوی در بدن',
  },
]
