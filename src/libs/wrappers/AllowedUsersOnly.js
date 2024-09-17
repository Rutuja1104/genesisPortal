import { useEffect, useState } from 'react';
import { isAccessAllowed } from '../hooks/userHooks'

const AllowedUsersOnly = ({ allowedRoles = [], children }) => {
    const [isallow, setIsAllow] = useState(false);
    
    useEffect(()=>{
        (async()=>{
            let isallow = await isAccessAllowed(allowedRoles)
            setIsAllow(isallow)
        })()
    },[])
        
    return isallow ? children : null
}

export default AllowedUsersOnly