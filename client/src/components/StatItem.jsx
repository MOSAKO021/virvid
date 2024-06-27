import React from 'react'
import Wrapper from '../assets/wrappers/StatItem'

const StatItem = ({count, title, icon, color, bcg}) => {
  // console.log(count);
  return (
    <Wrapper color={color} bcg={bcg}>
        <header>
            <span className='count'>{count}</span>
            <span className='icon'>{icon}</span>
        </header>
        <h5 className='title'>{title}</h5>
    </Wrapper>
  )
}

export default StatItem