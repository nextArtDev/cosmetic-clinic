import React from 'react'

interface GoldsmithLabeledSectionProps {
  title: string
}

const GoldsmithLabeledSection: React.FC<GoldsmithLabeledSectionProps> = ({
  title,
}) => {
  return (
    <div className="xl:h-[120px] sm:h-[90px] h-[70px] min-w-[50px] gradient-base-r rounded-lg shadow-lg !glass relative overflow-hidden">
      <span className="flex flex-col w-full h-full justify-evenly py-0.5 md:py-3 items-center text-xs md:text-sm lg:text-base font-bold text-black">
        بخش
        <h2 className="text-xs md:text-sm lg:text-base text-black">{title}</h2>
      </span>
    </div>
  )
}

export default GoldsmithLabeledSection
