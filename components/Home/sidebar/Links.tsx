'use client'
import { motion } from 'framer-motion'

const variants = {
  open: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}
const itemVariants = {
  open: {
    //comes from bottom
    y: 0,
    opacity: 1,
  },
  closed: {
    // 50px
    y: 50,
    opacity: 0,
  },
}

const Links = () => {
  const items = ['خانه', 'خدمات', 'درباره من', 'صفحه شخصی', 'تماس با ما']

  return (
    <motion.div
      //   className={stylex(s.links)}
      className="font-semibold"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
      variants={variants}
    >
      {items.map((item) => (
        <motion.a
          //   className={stylex(s.a)}

          href={`#${item}`}
          key={item}
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {item}
        </motion.a>
      ))}
    </motion.div>
  )
}

export default Links
