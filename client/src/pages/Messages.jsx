import React from 'react';
import Wrapper from '../assets/wrappers/ErrorPage';
import img from '../assets/images/comin_soon.svg';

const Messages = () => {
    return <Wrapper>
      <div>
        <img src={img} alt='coming soon'  />
        <h3>You are too early !</h3>
        <p>We are still developing this...</p>
      </div>
    </Wrapper>
}

export default Messages;