import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import Wrapper from '../assets/wrappers/ErrorPage';
import img from '../assets/images/notFound.svg';

const Error = () => {
  const error = useRouteError();
  console.log(error);
  
  if(error.status === 404){
    return <Wrapper>
      <div>
        <img src={img} alt='not found' />
        <h3>Oh! Page Not Found</h3>
        <p>How did you land here?</p>
        <Link to='/dashboard'>Back Home</Link>
      </div>
    </Wrapper>
  }
  return (
    <Wrapper>
      <div>
        <h3>Something Went Wrong</h3>
      </div>
    </Wrapper>
  )
}

export default Error