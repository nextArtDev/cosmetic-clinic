import * as React from 'react'

const LogoSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="125px" height="120px" viewBox="0 0 125 120" {...props}>
    <image
      href="/v1/images/logo.png"
      width="125px"
      height="120px"
      preserveAspectRatio="xMidYMid meet"
    />
  </svg>
)
export default LogoSvg
