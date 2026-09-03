'use client'
import { motion } from 'framer-motion'

import Sidebar from './sidebar/Sidebar'

const Navbar = ({}) => {
  return (
    <div className="absolute inset-0 navbar h-[100px] ">
      {/* Sidebar */}

      <Sidebar />

      <div className="wrapper w-full max-w-[1366px] m-auto flex items-center justify-between h-full sm:justify-end p-5 ">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden  icon  font-bold sm:hidden bg-red-500"
        >
          Lama Dev
        </motion.span>
        {/* <div className="social  flex-full gap-5 ">
          <Link href="#" className="relative p-4">
            <Image
              className=" icon"
              width={18}
              height={18}
              src="/facebook.png"
              alt=""
            />
          </Link>
          <Link href="#" className="relative p-4">
            <Image
              className=" icon"
              width={18}
              height={18}
              src="/instagram.png"
              alt=""
            />
          </Link>
          <Link href="#" className="relative p-4">
            <Image
              className=" icon"
              width={18}
              height={18}
              src="/youtube.png"
              alt=""
            />
          </Link>
          <Link href="#" className="relative p-4">
            <Image
              className=" icon"
              width={18}
              height={18}
              src="/dribbble.png"
              alt=""
            />
          </Link>
        </div> */}
      </div>
    </div>
  )
}

export default Navbar
