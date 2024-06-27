import customFetch from '../components/customFetch'
import {toast} from 'react-toastify'
import { redirect } from 'react-router-dom'

export const action = async({params}) => {
  try {
    await customFetch.delete(`/jobs/${params.id}`)
    toast.success('Content deleted successfully')
  } catch (error) {
    toast.error(error?.response?.data?.msg)
  }
  return redirect('/dashboard/all-jobs')
}
export default action