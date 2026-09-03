import CompareSlider from './DCompareSlider'
import BOrtodensi from '../../../public/images/b-a/beefore-ortodensi.webp'
import AOrtodensi from '../../../public/images/b-a/after-ortodensi.webp'
import BJermgiri from '../../../public/images/b-a/before-jermgiri.webp'
import AJermgiri from '../../../public/images/b-a/after-jermgiri.webp'
import BMasnoei from '../../../public/images/b-a/before-masnooei.webp'
import AMasnoei from '../../../public/images/b-a/after-masnooei.webp'
import BTarmim from '../../../public/images/b-a/before-tarmim.webp'
import ATarmim from '../../../public/images/b-a/after-tarmim.webp'

const DCompareSlides = () => {
  return (
    <section className="w-full overflow-x-hidden bg-white">
      <CompareSlider
        disableHandle
        before={BTarmim}
        after={ATarmim}
        disease="ترمیم"
        index={1}
      />
      <CompareSlider
        disableHandle
        before={BJermgiri}
        after={AJermgiri}
        disease="بوتاکس"
        index={0}
      />
      <CompareSlider
        disableHandle
        before={BMasnoei}
        after={AMasnoei}
        disease="فیس‌لیفت"
        index={1}
      />
      <CompareSlider
        disableHandle
        before={BOrtodensi}
        after={AOrtodensi}
        disease="جراحی بینی"
        index={0}
      />
    </section>
  )
}

export default DCompareSlides
