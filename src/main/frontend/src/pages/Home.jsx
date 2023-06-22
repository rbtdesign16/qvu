import React, {useEffect} from "react";
import { Tabs, Tab }
from "react-bootstrap";
import Header from "../widgets/Header";
import Footer from "../widgets/Footer";
import Admin from "./admin/Admin";
import QueryDesign from "./querydesign/QueryDesign";
import ReportDesign from "./reportdesign/ReportDesign";
import Message from "../widgets/Message"
import useAuth from "../context/AuthContext";
import PropTypes from "prop-types";


const Home = (props) => {
    const {copyright, version} = props;
    const {initializeAuth} = useAuth();
    
    useEffect(() => {
        initializeAuth();
    });
    
    
    return (
            <div className="home">
                <Message/>
                <Header version={version}/>
                <div className="tab-container">
                    <Tabs defaultActiveKey="adm" id="t1" className="mb-3">
                        <Tab eventKey="imp" title="Admin">
                            <Admin/>
                        </Tab>
                        <Tab eventKey="qdsgn" title="Query Design">
                            <QueryDesign/>
                        </Tab>
                        <Tab eventKey="rdsgn" title="Report Design">
                            <ReportDesign/>
                        </Tab>
                    </Tabs>
                </div>
                <Footer copyright={copyright}/>
            </div>);
};

Home.propTypes = {
    version: PropTypes.string.isRequired,
    copyright: PropTypes.string.isRequired
};


export default Home;
