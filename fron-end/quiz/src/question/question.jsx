import React from 'react'
import Navbar from '../Dashboard/navbar'
import SidebarRight from '../Dashboard/sidebarright'
import SidebarLeft from '../Dashboard/sidebarleft'

export default function Question() {
    return (
        <div>
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                    <SidebarLeft />
                    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                        <h1>Questions</h1>
                        
             <img src="" alt="img-quistion" />
             <SidebarRight />
             </main>
             
        </div>
      
        </div>
        </div>
    )
}