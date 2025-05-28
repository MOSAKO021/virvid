import React, { useState,useEffect } from 'react';
import { toast } from 'react-toastify';
import customFetch from '../components/customFetch';
import Wrapper from '../assets/wrappers/DashboardFormPage';

const AddJob = () => {
  const [subjectName, setSubject] = useState('');
  const [topicName, setTopic] = useState('');
  const [standard, setStandard] = useState('');
  const [video, setVideo] = useState('');
  const [file, setFile] = useState(null);
  // const [textualDataSubmitted, setTextualDataSubmitted] = useState(false);
  const [identifier, setIdentifier] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(false);
  const [summarized, setSummarized] = useState('');
  const [textualData, setTextualData] = useState('')
  const [polling, setPolling] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleStandardChange = (e) => setStandard(e.target.value);
  const handleVideoChange = (e) => setVideo(e.target.value);

 useEffect(() => {
    let intervalId;
    const pollForResult = async () => {
      if (!polling || !identifier) return; // If polling is false or identifier doesn't exist, exit

      try {
        const response = await customFetch.get(`/tasks/result/${taskId}`);
        if (response.status === 200 && response.data) {
            // Assuming 'completed' status means the result is ready
            toast.success('Result is ready');
            setPolling(false);  // Stop polling once the result is ready
            setSummarized(response.data.data.choices[0].message.content);
            setTextualData(response.data.pdf_text);
          // } else {
          //   // If status is not completed, just continue polling
          //   console.log('Waiting for result...');
          // }
        }
        else if(response.status===202){
          console.log('Waiting for result...');
        } else {
          toast.error('Failed to get result');
          setPolling(false);  // Stop polling on error
        }
      } catch (error) {
        console.error('Error polling for result:', error);
        toast.error('Failed to get result');
        setPolling(false);  // Stop polling on error
      }
    };

    // Start polling when `polling` is true
    if (polling) {
      intervalId = setInterval(pollForResult, 10000); // Poll every 5 seconds
    }

    // Cleanup function to stop the polling when the component is unmounted or polling stops
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling]);

  // useEffect(() => {
  //   setUploadedFile(true)
  //   setIdentifier('68368d6d7e99961dac957120');

  //    var e = {
  //     preventDefault: function(){
  //       console.log("hello")
  //     }
  //   }
  //   handleSummarize(e)
  // }, []);

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
    // setTextualDataSubmitted(true);
    return ;
    try {
      const response = await customFetch.post('/jobs', data);
      if (response.status === 201 && response.data && response.data.job) {
        const jobId = response.data.job._id;
        toast.success('Textual data submitted successfully. Please upload the PDF file.');
        // setTextualDataSubmitted(true);
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
        setTaskId(response.data.taskId);
        setPolling(true);
        // setSummarized(response.data.summary.data.choices[0].message.content);
        // setTextualData(response.data.summary.pdf_text);
        toast.success('PDF summarization started successfully');
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
    console.log('handleSubmitFile called');
    if (!file || file.size > 5000000) {
      toast.error('File is required and must be less than 5MB');
      return;
    }
    await handleSubmitTextualData(e);

    const formData = new FormData();
    var formObject = JSON.parse(sessionStorage.getItem('jobData'));
    console.log('formObject:', formObject);
    for (const key in formObject) {
      formData.append(key, formObject[key]);
    }

    formData.append('file', file);
    // formData.append('identifier', identifier);

    try {
      var resp = await customFetch.post('/jobs/', formData);
      console.log('Response from file upload:', resp.data);
      setIdentifier(resp.data._id);
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
      !uploadedFile ? (
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
          {/* <button className='btn form-btn' type="submit">
            Submit Textual Data
          </button> */}
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
          <button className='btn form-btn' type="submit">
            Submit
          </button>
        </form>
      ) :(
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
