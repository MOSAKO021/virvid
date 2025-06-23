import styled from 'styled-components';

const Wrapper = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 2rem;
  background-color: transparent;

  .profile-container {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    box-sizing: border-box;
  }

  .card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.08);
  }

  .icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .profile-avatar {
    color: #3b82f6;
  }

  .profile-title {
    text-align: center;
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 1rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    font-size: 1rem;
    color: #4b5563;
  }

  .form-card {
    margin-top: 1rem;
  }

  .form-title {
    margin-bottom: 1rem;
    font-size: 1.25rem;
    color: #111827;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .profile-container {
      padding: 1rem;
    }
  }
`;

export default Wrapper;
