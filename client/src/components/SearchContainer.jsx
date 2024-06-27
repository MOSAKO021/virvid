import { FormRow, FormRowSelect, SubmitBtn } from '.';
import { Form, useSubmit, Link } from 'react-router-dom';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { SORT_BY } from '../../../utils/constants';
import { useAllJobsContext } from '../pages/AllJobs';

const SearchContainer = () => {
    const {searchValues} = useAllJobsContext()
    const {verified, sort} = searchValues;
    const submit = useSubmit();


    return <Wrapper>
        <Form className='form'>
            <div className='form-center'>
                <FormRowSelect labelText='verified' name='verified' list={['all', "true", "false"]} defaultValue={verified} onChange={(e) => {
                    submit(e.currentTarget.form);
                }} />
                <br></br>
                <FormRowSelect name='sort' defaultValue={sort} list={['newest', 'oldest']} onChange={(e) => {
                    submit(e.currentTarget.form);
                }} />
                <br/>
                <Link to='/dashboard/all-jobs?verified=all&sort=newest' className='btn form-btn delete-btn' >
                    Reset Values
                </Link>
                <br/>
            </div>
        </Form>
    </Wrapper>
};

export default SearchContainer;
