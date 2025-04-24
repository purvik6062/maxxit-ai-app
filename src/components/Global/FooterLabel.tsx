import Image from 'next/image'
import React from 'react'
import maxxit from "@/assets/images/footer/maxxit.png"

function FooterLabel() {
  return (
    <div><Image src={maxxit} alt='image' className='md:px-16 sm:px-10 px-6 lg:-mb-10 md:-mb-5 sm:-mb-3 -mb-2 ' /></div>
  )
}

export default FooterLabel