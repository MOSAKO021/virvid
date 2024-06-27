import React from 'react'
import { FaClock , FaCalendarCheck, FaBug } from 'react-icons/fa';
import Wrapper from '../assets/wrappers/StatsContainer';
import StatItem from './StatItem';

const StatsContainer = ({defaultStats}) => {
    const stats = [
        {title: 'pending',
        count:defaultStats?.unverified || 0,
        icon:<FaClock/>,
        color:'#f59e0b',
        bcg:'#fef3c7'},
        {title: 'verified',
        count:defaultStats?.verified || 0,
        icon:<FaCalendarCheck/>,
        color:'#09872f',
        bcg:'#7dff99'},
    ]
  return (
    <Wrapper>
        {stats.map((item) => {
            return <StatItem key={item.title} {...item}/>
        })}
    </Wrapper>
  )
}

export default StatsContainer