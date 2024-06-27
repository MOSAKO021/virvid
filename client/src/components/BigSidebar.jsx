import React from 'react'
import Wrapper from '../assets/wrappers/BigSidebar'
import NavLinks from './NavLinks'
import logo from '../assets/images/logo-no-bg.png'
import { useDashboardContext } from '../pages/DashboardLayout'

const BigSidebar = () => {
  const {showSidebar} = useDashboardContext()
  return (
    <Wrapper>
      <div className={showSidebar ? 'sidebar-container' : 'sidebar-container show-sidebar'}>
        <div className="content">
          <header>
            <img src={logo} alt='mosako' className='logoq' />
          </header>
          <NavLinks isBigSidebar/>
        </div>
      </div>
    </Wrapper>
  )
}

export default BigSidebar