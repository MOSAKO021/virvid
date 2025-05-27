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

  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleStandardChange = (e) => setStandard(e.target.value);
  const handleVideoChange = (e) => setVideo(e.target.value);

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

      if (response.status === 201 && response.data && response.data.job) {
        const jobId = response.data.job._id;
        toast.success('Textual data submitted successfully. Please upload the PDF file.');
        setTextualDataSubmitted(true);
        setIdentifier(jobId);
      } else {
        toast.error('Failed to submit textual data');
      }
    } catch (error) {
      console.error('Error submitting textual data:', error);
      toast.error('Failed to submit textual data');
    }
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();

    if (!file || file.size > 5000000) {
      toast.error('File is required and must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('identifier', identifier);

    try {
      await customFetch.post('/jobs/files', formData);
      toast.success('File uploaded successfully');
      window.location.href = '/dashboard/all-jobs';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  return (
    <Wrapper>
      {!textualDataSubmitted ? (
        <form onSubmit={handleSubmitTextualData} encType='application/json'>
          <label className='form-label'>
            Subject:<br />
            <input
              className='form-input'
              type="text"
              value={subjectName}
              onChange={handleSubjectChange}
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
              onChange={handleTopicChange}
              required
            />
          </label>
          <br />
          <label className='form-label'>
            Standard:<br />
            <select
              className='form-input'
              value={standard}
              onChange={handleStandardChange}
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
              onChange={handleVideoChange}
              required
            />
          </label>
          <br />
          <button className='btn form-btn' type="submit">
            Submit Textual Data
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitFile} encType='multipart/form-data'>
          <div className='form-label'>
            File (PDF only):<br />
            <label htmlFor="fileUpload" className="btn">
              Choose PDF
            </label>
            <input
              id="fileUpload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden w-0 h-0"
              required
              // style={{ display: 'none' }}
            />
            {/* <div className='bg-amber-500'>test</div> */}
            <span className="ml-10" style={{marginLeft: 10}}>{file ? file.name : 'No file chosen'}</span>
          </div>
          <br />
          <button className='btn form-btn' type="submit">
            Upload File
          </button>
        </form>
      )}
    </Wrapper>
  );
};

export default AddJob;
