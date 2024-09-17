import React from "react";
import SimpleBar from "simplebar-react";
import { Container } from "reactstrap";
import VerticalLayout from "./VerticalLayout";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box">
        <Link to="/" className="logo">
          <img src="/icon.png" alt="insiteflow logo" style={{width:"2rem",borderRadius:"5px"}}></img>
          <p className="logo" >Insiteflow Genesis</p> 
        </Link>
        <span style={{fontSize:".8rem"}}>({process.env.REACT_APP_ENV})</span>
      </div>
      <div className="nav-border-bottom"></div>
      <SimpleBar id="scrollbar" className="h-100">
        <Container fluid className="p-0">
          <ul className="navbar-nav" id="navbar-nav">
            <VerticalLayout />
          </ul>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default Sidebar;
