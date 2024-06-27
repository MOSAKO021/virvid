import styled from 'styled-components';

const Wrapper = styled.section`
background-color: white;
  nav {
    width: 2000px;
    max-width: 2000px;
    margin: -1 auto;
    /* height: var(--nav-height); */
    height: 150px;
    display: flex;
    align-items: left;
    background-color: #ffffff;
  }
  .page {
    min-height: calc(100vh - var(--nav-height));
    display: grid;
    align-items: center;
    margin-top: -3rem;
    background-color: white;
  }
  h1 {
    font-weight: 700;
    span {
      color: var(--primary-500);
    }
    margin-bottom: 1.5rem;
  }
  p {
    line-height: 2;
    color: var(--text-secondary-color);
    margin-bottom: 1.5rem;
    max-width: 35em;
  }
  .register-link {
    margin-right: 1rem;
  }
  .main-img {
    display: none;
    width: 149.199%;
    
    object-fit: cover;
  }
  .logo{
    margin-left: 0%;
    width: 20%;

  }
  .btn {
    padding: 0.75rem 1rem;
  }
  @media (min-width: 992px) {
    .page {
      grid-template-columns: 1fr 400px;
      column-gap: 3rem;
    }
    .main-img {
      display: flex;
    }
  }
`;
export default Wrapper;
