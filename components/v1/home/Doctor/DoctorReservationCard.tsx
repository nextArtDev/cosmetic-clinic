/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils'
import type { V1Doctor } from '@/lib/v1/data'
import BoxReveal from '../BoxReveal'
import { StarRating } from '../StarRating'
import SvgShadow from '../SvgShadow'
import style from './DoctorReservationCard.module.css'

type Props = {
  doctor: V1Doctor
  dir?: string
  isVertical?: boolean
}

function DoctorReservationCard({
  doctor,
  dir = 'rtl',
  isVertical = false,
}: Props) {
  return (
    <div
      dir={dir}
      style={{
        background:
          'linear-gradient(to bottom, #add8e6 0%, #fff8dc 60%, #30e8bf60 100%)',
      }}
      className={cn(
        ' relative  rounded-xl overflow-hidden  ',
        isVertical ? 'max-w-sm w-[94vw] h-[50vh]' : 'w-[400px] h-48',
      )}
    >
      <SvgShadow />
      <div
        className={cn(
          ' w-full h-full flex   px-1.5  ',
          isVertical ? 'flex-col   ' : 'justify-around items-center',
        )}
      >
        <div
          className={cn(
            ' flex flex-col items-center ',
            isVertical ? 'h-fit pb-2' : 'pt-2 justify-between h-full',
          )}
        >
          <div className="pt-6 flex flex-col gap-2 items-center text-center ">
            {doctor.rating > 0 && (
              <article className="pb-2 -mt-2">
                <BoxReveal boxColor="transparent" duration={0.7}>
                  <StarRating
                    disabled
                    numStars={doctor.rating}
                    value={doctor.rating}
                    iconProps={{ className: 'size-5' }}
                  />
                </BoxReveal>
              </article>
            )}
            <p
              className={` text-xl text-secondary font-semibold ${style.title}`}
            >
              دکتر {doctor.name}
            </p>

            <BoxReveal boxColor="transparent">
              <p className={'text-sm px-1 text-muted'}>{doctor.brief}</p>
            </BoxReveal>
          </div>
          <ul
            className={cn(
              'font-semibold',
              isVertical
                ? 'flex flex-wrap gap-x-2 py-4 order-4 items-center '
                : 'absolute inset-0 bottom-1.5 z-[1] flex items-end pb-1  gap-1 ',
              dir === 'ltr' ? 'left-4' : 'right-4',
            )}
          >
            {doctor.schedule.slice(0, 4).map((booking, index) => (
              <li key={index} className={'text-base text-muted '}>
                <BoxReveal boxColor="transparent">
                  <span
                    style={{ borderRadius: '7px' }}
                    className=" !custom-box-shadow text-xs border border-green-700/40 text-green-700 px-1 "
                  >
                    {booking.startTime}
                  </span>
                </BoxReveal>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`${style.eight} ${
            isVertical ? 'flex-col-reverse' : ''
          } w-36 h-36  rounded-full overflow-hidden self-center `}
        >
          <img
            alt={doctor.name}
            className="eight object-cover"
            src={doctor.imageUrl || '/v1/images/blank-profile-picture.png'}
          />
        </div>
      </div>
    </div>
  )
}

export default DoctorReservationCard
