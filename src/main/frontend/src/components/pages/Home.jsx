import React from "react";
import { Tabs, Tab }
from "react-bootstrap";
import Header from "../widgets/Header";
import Footer from "../widgets/Footer";
import AuthState from "../../context/auth/AuthState";
import Admin from "./admin/Admin";
import QueryDesign from "./querydesign/QueryDesign";
import ReportDesign from "./reportdesign/ReportDesign";

const Home = () => {
    return (
            <AuthState>
                <div className="home">
                    <Header/>
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
                    <Footer/>
                </div>
            </AuthState>);
};
export default Home;
