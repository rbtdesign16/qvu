import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Switch } from "react-router";
import {AuthProvider} from "./context/AuthContext";
import {MessageProvider} from "./context/MessageContext";
import Home from "./pages/Home";
import "./css/main.css";


const App = () => {
    return (
            <MessageProvider>
                <AuthProvider>
                    <Router>
                        <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="*" component={Home} />
                        </Switch>
                    </Router>
                </AuthProvider>
            </MessageProvider>
            );
};

export default App;
