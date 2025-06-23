import React, { useState, useEffect } from 'react';
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
  const [identifier, setIdentifier] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(false);
  const [summarized, setSummarized] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [textualData, setTextualData] = useState('');
  const [polling, setPolling] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const navigate = useNavigate();

  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleStandardChange = (e) => setStandard(e.target.value);
  const handleVideoChange = (e) => setVideo(e.target.value);

  useEffect(() => {
    let intervalId;
    const pollForResult = async () => {
      if (!polling || !identifier) return;

      try {
        const response = await customFetch.get(`/tasks/result/${taskId}`);
        console.log('summ dat: ', response.data.summary);
        if (response.status === 200 && response.data) {
          toast.success('Result is ready');
          setPolling(false);
          setIsLoadingSummary(false);
          setSummarized(response.data.summary);
          
          
          setTextualData(response.data.pdf_text);
        } else if (response.status === 202) {
          console.log('Waiting for result...');
        } else {
          toast.error('Failed to get result');
          setPolling(false);
          setIsLoadingSummary(false);
        }
      } catch (error) {
        console.error('Error polling for result:', error);
        toast.error('Failed to get result');
        setPolling(false);
        setIsLoadingSummary(false);
      }
    };

    if (polling) {
      intervalId = setInterval(pollForResult, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling, identifier, taskId]);

  useEffect(() => {
    if (summarized) {
      setEditableSummary(summarized);
    }
  }, [summarized]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const combinedHandeleFileChange = () => {
    const formData = new FormData();
    formData.append('subjectName', subjectName);
    formData.append('topicName', topicName);
    formData.append('standard', standard);
    formData.append('video', video);
    const data = Object.fromEntries(formData);
    sessionStorage.setItem('jobData', JSON.stringify(data));
  };

  const handleSubmitTextualData = async (e) => {
    e.preventDefault();
    combinedHandeleFileChange();
    toast.success('Textual data submitted successfully. Please upload the PDF file.');
    return;
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    if (!file || file.size > 5000000) {
      toast.error('File is required and must be less than 5MB');
      return;
    }

    await handleSubmitTextualData(e);

    const formData = new FormData();
    const formObject = JSON.parse(sessionStorage.getItem('jobData'));
    for (const key in formObject) {
      formData.append(key, formObject[key]);
    }
    formData.append('file', file);

    try {
      const resp = await customFetch.post('/jobs/', formData);
      setIdentifier(resp.data._id);
      setUploadedFile(true);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please submit textual data first');
      return;
    }
    try {
      setIsLoadingSummary(true);
      const response = await customFetch.get(`/tasks/summary/${identifier}`);
      if (response.status === 200) {
        setTaskId(response.data.taskId);
        setPolling(true);
        toast.success('PDF summarization started successfully');
      } else {
        toast.error('Failed to summarize PDF');
        setIsLoadingSummary(false);
      }
    } catch (error) {
      console.error('Error summarizing PDF:', error);
      toast.error('Failed to summarize PDF');
      setIsLoadingSummary(false);
    }
  };

  const handleSaveSummary = async () => {
    try {
      const response = await customFetch.post('/jobs/add-summary', {
        summary: editableSummary,
        identifier: identifier
      });
      if (response.status === 200) {
        toast.success('Summary saved successfully');
        navigate('/dashboard/all-jobs');
      } else {
        toast.error('Failed to save summary');
      }
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error('Failed to save summary');
    }
  };

  return (
    <Wrapper>
      {!uploadedFile ? (
        <form onSubmit={handleSubmitFile} encType='application/json'>
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
            />
            <span style={{ marginLeft: 10 }}>{file ? file.name : 'No file chosen'}</span>
          </div>
          <button className='btn form-btn' type="submit">
            Submit
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSummarize} encType='multipart/form-data'>
            <button className='btn form-btn' type="submit">
              Summarize PDF
            </button>
          </form>

          {isLoadingSummary && (
            <div className="spinner-container">
              <div className="dot-spinner">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p className="spinner-text">Summarizing your PDF... Please wait.</p>
            </div>
          )}

          {summarized && textualData && (
            <div className="flex flex-col gap-6 mt-10 h-full min-h-[400px]">
              <div className="flex-1 flex flex-col">
                <p className="text-3xl font-bold mb-2">✏️ Edit Summary:</p>
                <textarea
                  className="form-input w-full resize-none overflow-y-auto min-h-[400px]"
                  value={editableSummary}
                  onChange={(e) => setEditableSummary(e.target.value)}
                />
              </div>
              <button
                className="btn form-btn self-start mt-2"
                type="button"
                onClick={handleSaveSummary}
              >
                Save Summary
              </button>
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default AddJob;
