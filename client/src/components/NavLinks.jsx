import React from 'react'
import { useDashboardContext } from '../pages/DashboardLayout'
import links from '../utils/links'
import { NavLink } from 'react-router-dom'

const NavLinks = ({isBigSidebar}) => {
    const{toggleSidebar, user} = useDashboardContext()
  return (
    <div className="nav-links">
            {links.map((link)=>{
              const {text, path, icon} = link
              const {role} = user
              if (path === 'admin' && role  != 'legend') return;
              if (path === 'messages' && role  != 'legend') return;
              if (path === 'add-job' && role != 'admin') return;
              if (path === 'stats' && role != 'admin') return;
              if (path === 'issues' && role != 'admin' && role != 'user') return;
              return (<NavLink to={path} 
                key={text} 
                className={'nav-link'} 
                onClick={isBigSidebar ? null : toggleSidebar}
                end>
                <span className='icon'>{icon}</span>
                {text}
              </NavLink>);
            })}
          </div>
  )
}

export default NavLinks