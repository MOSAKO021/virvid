import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Wrapper from '../assets/wrappers/LandingPage';
import main from '../assets/images/main-no-bg.png'
import { Logo } from '../components';


const Landing = () => {
  return (
    <Wrapper>
      <Link to={'/'}> {/* Use Link to wrap the Logo */}
      <nav>
          <Logo />
          </nav>
        </Link>
        
      <div className='container page'>
        <div className='info'>
          <h1>Smart <span>Education</span> App</h1>
          <p>
            <br></br>
            Enhancing Education ... Empowering Lives ... 
            <br></br>
          </p>
          <Link to="/register"className='btn register-link'>
            Register
          </Link>
          <Link to="/login"className='btn '>
            Login 
          </Link>
        </div>
        <img src={main} alt='mosako2' className='img main-img'/>
      </div>
    </Wrapper>
    
  )
}

export default Landing