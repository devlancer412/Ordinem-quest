import { useEffect, useRef, useState } from 'react';
import { Slide, SlideshowRef } from 'react-slideshow-image';

import 'react-slideshow-image/dist/styles.css';

type Props = {
  items: RollItem[]
  finishedRolling: () => void;
};

const RollingSlide: React.FC<Props> = ({ items, finishedRolling }) => {
  const ref = useRef<SlideshowRef>(null);
  const slideProperties = {
    duration: 0,
    transitionDuration: 5000,
    indicators: false,
    scale: 0.4,
    arrows: false,
    slidesToShow: 5,
    autoplay: false,    
    pauseOnHover: false,
    canSwipe: false,
    easing: 'ease',
    defaultIndex: 0,
  };

  useEffect(() => {
    const sliderRef = ref.current?.goTo(45);
    setTimeout(() => {
      finishedRolling();
    }, 6000);
  }, []);

  return (
    <div className='w-full flex flex-col'>
      <div className='relative'>
        <Slide ref={ref} {...slideProperties}>
          {items.map((each, index) => (
            <div key={index} className='w-10 md:w-20 flex flex-col justify-center items-center mx-auto text-[8px] md:text-[16px]'>
              <img
                className='w-full rounded-md mx-4 mb-2'
                key={index}
                src={each.type == 'Sol' ? '/roll-sol.png' : each.type == 'Gold' ? '/roll-gold.png' : '/roll-nothing.png'}
                alt={'Image' + index}
              />
              <div>{each.type == 'Nothing' ? 'Nothing' : `${each.amount} ${each.type}`}</div>
            </div>
          ))}
        </Slide>
      </div>
    </div>
  );
};

export default RollingSlide;
