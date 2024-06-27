import React from 'react'
import { FormRow, FormRowSelect,SubmitBtn } from '../components';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { useLoaderData, useParams } from 'react-router-dom';
import { Form, useNavigation, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../components/customFetch';

export const loader = async ({params}) => {
  try {
    const {data} = await customFetch.get(`/jobs/${params.id}`)
    return data
    return null;
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return redirect('/dashboard/all-jobs')
  }
}
export const action = async ({request, params}) => {
  const formData = await request.formData()
  // const data = Object.fromEntries(formData)
  try {
    await customFetch.patch(`/jobs/${params.id}`)
    toast.success('Job edited successfully')
    return redirect('/dashboard/all-jobs')
  } catch (error) {
    toast.error("Try contacting LEGEND for this")
    return error
  }
}

const EditJob = () => {
  const {job} = useLoaderData()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  console.log(job);
  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4 className='form-title'>edit job</h4>
        <div className="form-">
          {/* <FormRow type='text' name='position' defaultValue={job.position} />
          <FormRow type='text' name='company' defaultValue={job.company} />
          <FormRow type='text' name='jobLocation' labelText='jobLocation' defaultValue={job.jobLocation} />
          <FormRowSelect name='jobStatus' labelText='job status' defaultValue={job.jobStatus} list={Object.values(CONTENT_STATUS)} /> */}
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  )
}

export default EditJob