import Image from 'next/image'
import React from 'react'
import maxxit from "@/assets/images/footer/maxxit.png"

function FooterLabel() {
  return (
    <div className='flex justify-center'><Image
      src={maxxit}
      alt="image"
      width={900} 
      height={900} 
      className="pt-10 md:px-16 sm:px-10 px-6 lg:-mb-[1.5rem] md:-mb-5 sm:-mb-3 -mb-2"
    /></div>
  )
}

export default FooterLabel