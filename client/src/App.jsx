import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Stats,
  AllJobs,
  Profile,
  Admin,
  Issues,
  Messages
} from './pages'

import { action as registerAction } from './pages/Register'
import { action as loginAction } from './pages/Login'
import { loader as dashboardLoader } from './pages/DashboardLayout'
import { loader as allJobsLoader } from './pages/AllJobs'
// import { action as addJobAction } from './pages/AddJob'
import { action as editJobAction } from './pages/EditJob'
import { action as deleteJobAction } from './pages/DeleteJob'
// import {action as addJobAction} from './pages/AddJob'
import { action as profileAction } from './pages/Profile'
import { loader as editJobLoader } from './pages/EditJob'
import { loader as adminLoader } from './pages/Admin'
import { loader as statsLoader } from './pages/Stats'
import { loader as dashboardLoader1 } from './pages/Dashboard'
import Dashboard from './pages/Dashboard'


export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true'
  document.body.classList.toggle('dark-theme', isDarkTheme)
  return isDarkTheme
}

checkDefaultTheme()

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />
      },
      {
        path: 'register',
        element: <Register />,
        action: registerAction,
      },
      {
        path: 'login',
        element: <Login />,
        action: loginAction,
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        loader: dashboardLoader,
        children: [
          {
            index: true,
            element: <Dashboard />,
            loader: dashboardLoader
          },
          {
            path: 'stats',
            element: <Stats />,
            loader: statsLoader,
          },
          {
            path: 'add-job',
            element: <AddJob />,
            // action: addJobAction
          },
          {
            path: 'issues',
            element: <Issues />,
          },
          {
            path: 'messages',
            element: <Messages />,
          },
          {
            path: 'all-jobs',
            element: <AllJobs />,
            loader: allJobsLoader
          },
          {
            path: 'profile',
            element: <Profile />,
            action: profileAction
          },
          {
            path: 'admin',
            element: <Admin />,
            loader: adminLoader
          },
          {
            path: 'edit-job/:id',
            element: <Dashboard />,
            loader: editJobLoader,
            action: editJobAction,
          },
          {
            path: 'delete-job/:id',
            action: deleteJobAction,
          }, 
        ]
      },
    ]
  }
]
);

const App = () => {
  return (
    <>
    {/* <div className='bg-amber-500'>test</div> */}
      <RouterProvider router={router} />
    </>
  )
};

export default App