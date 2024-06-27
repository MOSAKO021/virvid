import React from 'react';
import { IoBarChartSharp } from 'react-icons/io5';
import { MdQueryStats } from 'react-icons/md';
import { FaAcquisitionsIncorporated, FaAddressCard, FaFacebookMessenger, FaShieldAlt, FaBug, FaUserShield, FaWpforms } from 'react-icons/fa';
import { ImProfile } from 'react-icons/im';
import { MdAdminPanelSettings, MdMessage } from 'react-icons/md';

const links = [
    {
    text: 'Dashboard',
    path:'.',
    icon: <FaShieldAlt />
    },
    { 
    text: 'Add Content', 
    path: 'add-job', 
    icon: <FaWpforms /> 
},
    { 
    text: 'All Contents', 
    path: 'all-jobs', 
    icon: <MdQueryStats /> 
},
    { 
    text: 'stats', 
    path: 'stats', 
    icon: <IoBarChartSharp /> 
},
    { 
    text: 'profile', 
    path: 'profile', 
    icon: <ImProfile /> 
},
    { 
    text: 'admin', 
    path: 'admin', 
    icon: <MdAdminPanelSettings /> 
},
    {
    text: 'report bugs',
    path: 'issues',
    icon: <FaBug />
},
    {
    text: 'messages',
    path: 'messages',
    icon: <MdMessage/>,
    }
  ];
  
  export default links;