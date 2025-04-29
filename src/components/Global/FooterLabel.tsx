import Image from 'next/image'
import React from 'react'
import maxxit from "@/assets/images/footer/maxxit.png"

function FooterLabel() {
  return (
    <div><Image src={maxxit} alt='image' className='pt-10 lg:px-40 md:px-28 sm:px-14 px-10 lg:-mb-10 md:-mb-5 sm:-mb-3 -mb-2 ' /></div>
  )
}

export default FooterLabel