import React from "react";
import { Tabs, Tab }
from "react-bootstrap";
import Header from "../widgets/Header";
import Footer from "../widgets/Footer";
import Admin from "./admin/Admin";
import QueryDesign from "./querydesign/QueryDesign";
import ReportDesign from "./reportdesign/ReportDesign";
import Message from "../widgets/Message"

const Home = (props) => {
    return (
            <div className="home">
                <Header/>
                <div className="tab-container">
                    <Message/>
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
                <Footer test={new Date().getFullYear() + " Rbt"}/>
            </div>);
};

export default Home;
