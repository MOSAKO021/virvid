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
  const [identifier, setIdentifier] = useState('null');
  const [uploadedFile, setUploadedFile] = useState(false);
  const [summarized, setSummarized] = useState('');
  const [textualData, setTextualData] = useState('')

  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleStandardChange = (e) => setStandard(e.target.value);
  const handleVideoChange = (e) => setVideo(e.target.value);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };
  const combinedHandeleFileChange = (e) => {
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
    console.log('handleSubmitTextualData called');
    combinedHandeleFileChange();
    toast.success('Textual data submitted successfully. Please upload the PDF file.');
    setTextualDataSubmitted(true);
    return ;
    try {
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
  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please submit textual data first');
      return;
    }
    try {
      const response = await customFetch.get(`/tasks/summary/${identifier}`);
      if (response.status === 200) {
        setSummarized(response.data.summary.data.choices[0].message.content);
        setTextualData(response.data.summary.pdf_text);
        toast.success('PDF summarized successfully');
      } else {
        toast.error('Failed to summarize PDF');
      }
    } catch (error) {
      console.error('Error summarizing PDF:', error);
      toast.error('Failed to summarize PDF');
    }
  }

  const handleSubmitFile = async (e) => {
    e.preventDefault();

    if (!file || file.size > 5000000) {
      toast.error('File is required and must be less than 5MB');
      return;
    }

    const formData = new FormData();
    var formObject = JSON.parse(sessionStorage.getItem('jobData'));
    console.log('formObject:', formObject);
    for (const key in formObject) {
      formData.append(key, formObject[key]);
    }

    formData.append('file', file);
    // formData.append('identifier', identifier);

    try {
      var resp = await customFetch.post('/jobs', formData);
      setIdentifier(resp.data.job._id);
      setUploadedFile(true);
      toast.success('File uploaded successfully');
      // window.location.href = '/dashboard/all-jobs';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  return (
    <Wrapper>
      {
      !textualDataSubmitted ? (
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
      ) : !uploadedFile ? (
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
      ):(
        <>
        <form onSubmit={handleSummarize} encType='multipart/form-data'>
          <button className='btn form-btn' type="submit">
            Summarize PDF
          </button>
        </form>
        {summarized && textualData && (
          <div className="flex flex-col md:flex-row gap-6 mt-8 h-full min-h-[400px]">
            {/* Raw PDF Text */}
            <div className="flex-1 flex flex-col">
              <label className="form-label mb-2">📄 Raw PDF Text:</label>
              <textarea
                className="form-input flex-1 w-full resize-none overflow-y-auto min-h-[400px]"
                value={textualData}
                readOnly
              />
            </div>

            {/* Summary */}
            <div className="flex-1 flex flex-col">
              <label className="form-label mb-2">🧠 Summary:</label>
              <textarea
                className="form-input flex-1 w-full resize-none overflow-y-auto min-h-[400px]"
                value={summarized}
                readOnly
              />
            </div>
          </div>
         )}
      </>
    )}
    </Wrapper>
  );
};

export default AddJob;
