import CountAnimation from './count-animation'

function Works() {
  return (
    <article className="text-[rebeccapurple] text-base font-semibold  absolute z-[2]   px-2 place-content-center place-items-center py-1 rounded-md bottom-0 w-full h-1/4 grid grid-cols-3 grid-rows-1 gap-0.5">
      {/* <div className="bg-white/10 rounded-md backdrop-blur-sm w-full h-full flex items-center justify-center flex-col">
        <p>دندان مصنوعی</p>
      </div>
      <div className="bg-white/10 rounded-md backdrop-blur-sm w-full h-full flex items-center justify-center flex-col">
        روکش دندان
      </div>
      <div className="bg-white/10 rounded-md backdrop-blur-sm w-full h-full flex items-center justify-center flex-col">
        ارتودنسی
      </div> */}
      <div className="bg-white/10 rounded-md backdrop-blur-sm w-full h-full flex items-center justify-center flex-col">
        <CountAnimation number={24} className="" duration={2} />
        سال سابقه
      </div>
      <div className="bg-white/10 rounded-md backdrop-blur-sm w-full h-full flex items-center justify-center flex-col">
        <CountAnimation number={2500} className="" duration={3} />
        عمل جراحی
      </div>
      <div className="bg-white/10 rounded-md backdrop-blur-sm w-full h-full flex items-center justify-center flex-col">
        <CountAnimation number={4500} className="" duration={4} />
        بیمار راضی
      </div>
    </article>
  )
}

export default Works
