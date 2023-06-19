import React from "react";
import { Tabs, Tab } from "react-bootstrap";
import AuthState from "../../context/auth/AuthState";

const Home = () => {
    return (
            <AuthState>
                <div style={{paddingTop: "5px"}}>
                    <Tabs defaultActiveKey="adm" id="t1" className="mb-3">
                        <Tab eventKey="imp" title="Admin">
                            <h1>admin</h1>
                        </Tab>
                        <Tab eventKey="qdsgn" title="Query Design">
                            <h1>query design</h1>
                        </Tab>
                        <Tab eventKey="rdsgn" title="Report Design">
                            <h1>report design</h1>
                        </Tab>
                    </Tabs>
                </div>
            </AuthState>
            );
};
export default Home;
