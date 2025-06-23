import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import customFetch from '../components/customFetch';
import Wrapper from '../assets/wrappers/DashboardFormPage';

const AddJob = () => {
  const [subjectName, setSubject] = useState('');
  const [topicName, setTopic] = useState('');
  const [standard, setStandard] = useState('');
  const [video, setVideo] = useState('');
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || file.size > 5 * 1024 * 1024) {
      toast.error('File is required and must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('subjectName', subjectName);
    formData.append('topicName', topicName);
    formData.append('standard', standard);
    formData.append('video', video);
    formData.append('file', file);

    try {
      const response = await customFetch.post('/jobs', formData);
      toast.success('Content uploaded successfully');
      navigate('/dashboard/all-jobs');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  return (
    <Wrapper>
      <form onSubmit={handleSubmit}>
        <label className='form-label'>
          Subject:<br />
          <input
            className='form-input'
            type="text"
            value={subjectName}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </label>
        <br />
        <label className='form-label'>
          Topic:<br />
          <input
            className='form-input'
            type="text"
            value={topicName}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </label>
        <br />
        <label className='form-label'>
          Standard:<br />
          <select
            className='form-input'
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            required
          >
            <option value="">Select Standard</option>
            {[...Array(10).keys()].map(i => (
              <option key={i + 1} value={i + 1}>Standard {i + 1}</option>
            ))}
          </select>
        </label>
        <br />
        <label className='form-label'>
          Video URL:<br />
          <input
            className='form-input'
            type="text"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            required
          />
        </label>
        <br />
        <div className='form-label'>
          File (PDF only):<br />
          <label htmlFor="fileUpload" className="btn">Choose PDF</label>
          <input
            id="fileUpload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden w-0 h-0"
            required
          />
          <span style={{ marginLeft: 10 }}>{file ? file.name : 'No file chosen'}</span>
        </div>
        <button className='btn form-btn' type="submit">Submit</button>
      </form>
    </Wrapper>
  );
};

export default AddJob;
