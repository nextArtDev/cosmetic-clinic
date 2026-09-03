export type Movie = {
  poster: string
  name: string
}

export const movies = [
  {
    poster: '/images/b-a/before-implant.webp',
    name: 'Airplane',
  },
  {
    poster: '/images/b-a/after-implant.webp',
    name: 'Family man',
  },
  {
    poster: '/images/b-a/beefore-ortodensi.webp',
    name: 'Laboratory',
  },
  {
    poster: '/images/b-a/after-ortodensi.webp',
    name: 'Napoleon',
  },
  {
    poster: '/images/b-a/before-jermgiri.webp',
    name: 'Person in Darkness',
  },
  {
    poster: '/images/b-a/after-jermgiri.webp',
    name: 'Scary Building',
  },
  {
    poster: '/images/b-a/before-masnooei.webp',
    name: 'Stars',
  },
  {
    poster: '/images/b-a/after-masnooei.webp',
    name: 'Stars',
  },
  {
    poster: '/images/b-a/before-tarmim.webp',
    name: 'Stars',
  },
  {
    poster: '/images/b-a/after-tarmim.webp',
    name: 'Stars',
  },
]

export const randomMoviesSet1 = movies
  .sort(() => Math.random() - 0.5)
  .concat(movies.sort(() => Math.random() - 0.5))
  .concat(movies.sort(() => Math.random() - 0.5))

export const randomMoviesSet2 = movies
  .sort(() => Math.random() - 0.5)
  .concat(movies.sort(() => Math.random() - 0.5))
  .concat(movies.sort(() => Math.random() - 0.5))
  .sort(() => Math.random() - 0.5)

export type RandomMovie = {
  id: string
  beforeImgSrc: string
  afterImgSrc: string
}
export const randomMoviesSet3 = [
  {
    id: '1',
    beforeImgSrc: '/images/b-a/before-implant.webp',
    afterImgSrc: '/images/b-a/after-implant.webp',
  },
  {
    id: '2',
    beforeImgSrc: '/images/b-a/beefore-ortodensi.webp',
    afterImgSrc: '/images/b-a/after-ortodensi.webp',
  },
  {
    id: '3',
    beforeImgSrc: '/images/b-a/before-jermgiri.webp',
    afterImgSrc: '/images/b-a/after-jermgiri.webp',
  },
  {
    id: '4',
    beforeImgSrc: '/images/b-a/before-masnooei.webp',
    afterImgSrc: '/images/b-a/after-masnooei.webp',
  },
  {
    id: '5',
    beforeImgSrc: '/images/b-a/before-tarmim.webp',
    afterImgSrc: '/images/b-a/after-tarmim.webp',
  },
]
export const randomMoviesSet4 = [
  {
    id: '1',
    beforeImgSrc: '/images/b-a/before-implant.web',
    afterImgSrc: '/images/b-a/after-implant.webp',
  },
  {
    id: '2',
    beforeImgSrc: '/images/b-a/beefore-ortodensi.webp',
    afterImgSrc: '/images/b-a/after-ortodensi.webp',
  },
  {
    id: '3',
    beforeImgSrc: '/images/b-a/before-jermgiri.webp',
    afterImgSrc: '/images/b-a/after-jermgiri.webp',
  },
  {
    id: '4',
    beforeImgSrc: '/images/b-a/before-masnooei.webp',
    afterImgSrc: '/images/b-a/after-masnooei.webp',
  },
  {
    id: '5',
    beforeImgSrc: '/images/b-a/before-tarmim.webp',
    afterImgSrc: '/images/b-a/after-tarmim.webp',
  },
]
