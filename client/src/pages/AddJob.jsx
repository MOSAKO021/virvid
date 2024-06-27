import React, { useState } from 'react';
import { toast } from 'react-toastify';
import customFetch from '../components/customFetch';
import Wrapper from '../assets/wrappers/DashboardFormPage';

const AddJob = () => {

  const [subjectName, setSubject] = useState('');
  const [topicName, setTopic] = useState('');
  const [standard, setStandard] = useState('');
  const [video, setVideo] = useState('');
  const [file, setFile] = useState(null);
  const [textualDataSubmitted, setTextualDataSubmitted] = useState(false);
  const [identifier, setIdentifier] = useState(null);

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const handleStandardChange = (e) => {
    setStandard(e.target.value);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmitTextualData = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('subjectName', subjectName);
      formData.append('topicName', topicName);
      formData.append('standard', standard);
      formData.append('video', video);
      const data = Object.fromEntries(formData);
      const response = await customFetch.post('/jobs', data);
      if (response.status === 201) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.data.job._id
          toast.success('Textual data submitted successfully. Please upload the PDF file.');
          setTextualDataSubmitted(true);
          setIdentifier(data); 
        } else {
          console.error('Response is not in JSON format');
          toast.error('Failed to submit textual data');
        }
      } else {
        console.error('Error submitting textual data:', response);
        toast.error('Failed to submit textual data');
      }
    } catch (error) {
      console.error('Error submitting textual data:', error);
      toast.error('Failed to submit textual data');
    }
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('file', file);
    formData.append('identifier', identifier);
    if (file.size > 5000000){
      toast.error("file size too large");
      return null;
    }
    try {
      await customFetch.post('/jobs/files', formData);
      window.location.href = '/dashboard/all-jobs';
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return error;
    }
  };

  return (
    <Wrapper>
      {!textualDataSubmitted ? (
        <form onSubmit={handleSubmitTextualData} encType='application/json'>
          <label className='form-label'>
            Subject: <br />
            <input className='form-input' type="text" value={subjectName} onChange={handleSubjectChange} required/>
          </label>
          <br />
          <label className='form-label'>
            Topic:
            <input className='form-input' type="text" value={topicName} onChange={handleTopicChange} required/>
          </label>
          <br />
          <label className='form-label'>
            Standard:
            <select className='form-input' value={standard} onChange={handleStandardChange} required>
              <option value="">Select Standard</option>
              <option value="1">Standard 1</option>
              <option value="2">Standard 2</option>
              <option value="3">Standard 3</option>
              <option value="4">Standard 4</option>
              <option value="5">Standard 5</option>
              <option value="6">Standard 6</option>
              <option value="7">Standard 7</option>
              <option value="8">Standard 8</option>
              <option value="9">Standard 9</option>
              <option value="10">Standard 10</option>
              {/* Add more options as needed */}
            </select>
            <br />
          </label>
          <button className='btn form-btn' type="submit">Submit Textual Data</button>
        </form>
      ) : (
        <form onSubmit={handleSubmitFile} encType='multipart/form-data'>
          <label className='form-label'>
            File (PDF only):
            <input className='form-input' type="file" accept=".pdf" onChange={handleFileChange} required/>
          </label>
          <br />
          <button className='btn form-btn' type="submit">Upload File</button>
        </form>
      )}
    </Wrapper>
  );
};

export default AddJob;
