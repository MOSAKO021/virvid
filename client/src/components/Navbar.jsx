import Wrapper from "../assets/wrappers/Navbar";
import {FaAlignLeft}  from 'react-icons/fa';
import logo from '../assets/images/logo.png'
import React from 'react'
import { useDashboardContext } from "../pages/DashboardLayout";
import LogoutContainer from "./LogoutContainer";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const {toggleSidebar} = useDashboardContext()
  return (
    <Wrapper>
      <div className="nav-center">
        <button type='button' className="toggle-btn" onClick={toggleSidebar}>
          <FaAlignLeft />
        </button>
        <div>
        <img src={logo} alt='mosako' className='logo' />
          <h4 className="logo-text"><b>Dashboard</b></h4>
        </div>
        <div className="btn-container">
          <ThemeToggle />
          <LogoutContainer />
        </div>
      </div>
    </Wrapper>
  )
}

export default Navbar