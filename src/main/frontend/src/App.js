import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Switch } from "react-router";
import {AuthProvider} from "./context/AuthContext";
import {MessageProvider} from "./context/MessageContext";
import {DataHandlerProvider} from "./context/DataHandlerContext";
import {LangProvider} from "./context/LangContext";
import {HelpProvider} from "./context/HelpContext";
import Home from "./pages/Home";
import appinfo from "./appinfo.json";
import "./css/main.css";


const App = () => {
    return (
            <LangProvider>
                <MessageProvider>
                    <HelpProvider>
                        <AuthProvider>
                            <DataHandlerProvider>
                                <BrowserRouter>
                                    <Routes>
                                        <Route exact path="/" element={ < Home version = {appinfo.version} copyright = {appinfo.copyright} / > } />
                                         <Route path="*" element={ < Home version = {appinfo.version} copyright = {appinfo.copyright} / > } />
                                    </Routes>
                                </BrowserRouter>
                            </DataHandlerProvider>
                        </AuthProvider>
                    </HelpProvider>
                </MessageProvider>
            </LangProvider>);
};

export default App;
