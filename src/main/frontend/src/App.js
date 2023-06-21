import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Switch } from "react-router";
import {AuthProvider} from "./context/AuthContext";
import {MessageProvider} from "./context/MessageContext";
import Home from "./pages/Home";
import appinfo from "./appinfo.json";

import "./css/main.css";


const App = () => {
    return (
            <MessageProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route exact path="/" element={ <Home version={appinfo.version} copyright={appinfo.copyright} /> } />
                            <Route path="*" element={ <Home version={appinfo.version} copyright={appinfo.copyright} / > } />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </MessageProvider>
            );
};

export default App;
