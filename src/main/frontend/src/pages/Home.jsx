import React, {useEffect} from "react";
import { Tabs, Tab } from "react-bootstrap";
import Header from "../widgets/Header";
import Footer from "../widgets/Footer";
import Admin from "./admin/Admin";
import QueryDesign from "./querydesign/QueryDesign";
import ReportDesign from "./reportdesign/ReportDesign";
import Message from "../widgets/Message"
import Splash from "../widgets/Splash"
import useAuth from "../context/AuthContext";
import useDataHandler from "../context/DataHandlerContext";
import useMessage from "../context/MessageContext";
import InitialSetup from "./InitialSetup";
import PropTypes from "prop-types";
import {INFO, isAdministrator, isQueryDesigner, isReportDesigner} from "../utils/helper"


const Home = (props) => {
    const {copyright, version} = props;
    const {authData, initializeAuth} = useAuth();
    const {datasources, initializeDataHandler} = useDataHandler();
    const {showMessage, hideMessage} = useMessage();

    useEffect(() => {
        initializeAuth();
    }, [authData]);

    useEffect(() => {
        initializeDataHandler();
    }, [datasources]);

    const getDefaultActiveTabKey = () => {
        if (isAdministrator(authData)) {
            return "adm";
        } else if (isQueryDesigner(authData)) {
            return "qdsgn";
        } else if (isReportDesigner(authData)) {
            return "rdsgn";
        }
    };

    const hasTabAcccess = () => {
        return isAdministrator(authData) || isQueryDesigner(authData) || isReportDesigner(authData);
    };

    const getBody = () => {
        if (authData) {
            if (authData.initialSetupRequired) {
                return <InitialSetup/>;
            } else if (hasTabAcccess()) {
                return (
                        <Tabs defaultActiveKey={getDefaultActiveTabKey()} id="t1" className="mb-3">
                            { isAdministrator(authData) && <Tab bsPrefix="mytab" eventKey="adm" title="Admin">
                                <Admin/>
                            </Tab> }
                            { isQueryDesigner(authData) && <Tab eventKey="qdsgn" title="Query Design">
                                <QueryDesign/>
                            </Tab>}
                            { isReportDesigner(authData) && <Tab eventKey="rdsgn" title="Report Design">
                                <ReportDesign/>
                            </Tab>}
                        </Tabs>);
            } else {
                return <Splash image="logo.png" imageWidth="120" message="Qvu"/>
            }
        } else {
            return <Splash image="logo.png" imageWidth="120" message="Initializing..."/>
        }
    }
    return (
            <div className="home">
                <Message/>
                <Header version={version}/>
                <div className="tab-container">
                    { getBody() }
                </div>
                <Footer copyright={copyright} authData={authData} />
            </div>);
}

Home.propTypes = {
    version: PropTypes.string.isRequired,
    copyright: PropTypes.string.isRequired
};


export default Home;
