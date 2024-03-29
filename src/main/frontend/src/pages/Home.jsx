import React, {useEffect} from "react";
import { Tabs, Tab } from "react-bootstrap";
import Header from "../widgets/Header";
import Footer from "../widgets/Footer";
import Admin from "./admin/Admin";
import QueryDesign from "./querydesign/QueryDesign";
import ReportDesign from "./reportdesign/ReportDesign";
import Message from "../widgets/Message"
import Help from "../widgets/Help"
import Splash from "../widgets/Splash"
import useLang from "../context/LangContext";
import useAuth from "../context/AuthContext";
import useDataHandler from "../context/DataHandlerContext";
import useMessage from "../context/MessageContext";
import RepositorySetup from "../widgets/RepositorySetup";
import {QueryDesignProvider} from "../context/QueryDesignContext";
import {ReportDesignProvider} from "../context/ReportDesignContext";

import PropTypes from "prop-types";
import {INFO, isAdministrator} from "../utils/authHelper";
import {loadAuth, loadLang} from  "../utils/apiHelper";

const Home = (props) => {
    const {copyright, version} = props;
    const {authData, initializeAuth} = useAuth();
    const {datasources, initializeDataHandler} = useDataHandler();
    const {showMessage, hideMessage} = useMessage();
    const {getText} = useLang();

    useEffect(() => {
        initializeAuth();
    }, [authData]);

    useEffect(() => {
         initializeDataHandler();
    }, [datasources]);

    const getDefaultActiveTabKey = () => {
        if (isAdministrator(authData)) {
            return "adm";
        } else {
            return "qdsgn";
        } 
    };

    const getBody = () => {
        if (authData) {
            if (authData.initializingApplication) {
                return <RepositorySetup/>;
            } else {
                return (<div>
                         <Tabs defaultActiveKey={getDefaultActiveTabKey()} id="t1" className="mb-3">
                            { isAdministrator(authData) && <Tab bsPrefix="mytab" eventKey="adm" title={getText("Admin")}>
                                <Admin/>
                            </Tab> }
                            <Tab eventKey="qdsgn" title={getText("Query Design")}>
                                <QueryDesignProvider>
                                    <QueryDesign/>
                                </QueryDesignProvider>
                            </Tab>
                            <Tab eventKey="rdsgn" title={getText("Report Design")}>
                                <ReportDesignProvider>
                                    <ReportDesign/>
                                </ReportDesignProvider>
                            </Tab>
                        </Tabs></div>);
                return <Splash />;
            }
        } else {
            return <Splash message={getText("Initializing", "...")}/>;
        }
    };

    return (
            <div className="home">
                <Message/>
                <Help/>
                <Header version={version}/>
                <div className="tab-container" style={{overflow: "hidden"}}>
                    { getBody() }
                </div>
                <Footer copyright={copyright} authData={authData} />
            </div>);
};

Home.propTypes = {
    version: PropTypes.string.isRequired,
    copyright: PropTypes.string.isRequired
};


export default Home;
