'use client'

import { motion } from 'framer-motion'
import { Dispatch, SetStateAction } from 'react'

const ToggleButton = ({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  return (
    <button
      //   className={stylex(s.button)}
      // className="z-50 fixed w-14 h-14 rounded-full top-6 left-9 bg-transparent border-none cursor-pointer "
      style={{
        zIndex: '999',
        position: 'fixed',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        top: '27px',
        left: '39px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      onClick={() => setOpen((prev) => !prev)}
    >
      <svg width="23" height="23" viewBox="0 0 23 23">
        <motion.path
          strokeWidth="3"
          stroke="black"
          strokeLinecap="round"
          variants={{
            closed: { d: 'M 2 2.5 L 20 2.5' },
            open: { d: 'M 3 16.5 L 17 2.5' },
          }}
        />
        <motion.path
          strokeWidth="3"
          stroke="black"
          strokeLinecap="round"
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
        />
        <motion.path
          strokeWidth="3"
          stroke="black"
          strokeLinecap="round"
          variants={{
            closed: { d: 'M 2 16.346 L 20 16.346' },
            open: { d: 'M 3 2.5 L 17 16.346' },
          }}
        />
      </svg>
    </button>
  )
}

export default ToggleButton
