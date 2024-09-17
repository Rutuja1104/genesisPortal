import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const index = props => {
    return (
        <div id='layout-wrapper'>
            <Header />
            <Sidebar />
            <div className='main-content' style={{height:"100%"}}>
                <div className='page-content' style={{height:"100vh"}}>
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default index
