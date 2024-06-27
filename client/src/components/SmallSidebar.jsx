import React from 'react'
import Wrapper from '../assets/wrappers/SmallSidebar'
import { useDashboardContext } from '../pages/DashboardLayout'
import { FaTimes } from 'react-icons/fa';
import logo from '../assets/images/logo.png'
import links from '../utils/links';
import { NavLink } from 'react-router-dom';
import NavLinks from './NavLinks';

const SmallSidebar = () => {
    const {showSidebar, toggleSidebar} = useDashboardContext();
    
  return (
    <Wrapper>
      <div className={showSidebar?'sidebar-container show-sidebar': 'sidebar-container'}>
        <div className="content">
          <button type='button' className='close-btn' onClick={toggleSidebar}>
            <FaTimes />
          </button>
          <header>
          <img src={logo} alt='mosako' className='logo1' />
          </header>
          <NavLinks />
        </div>
      </div>
    </Wrapper>
  )
}

export default SmallSidebar