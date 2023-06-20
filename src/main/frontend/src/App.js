import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Switch } from "react-router";
import AuthState from "./context/auth/AuthState";
import MessageState from "./context/message/MessageState";
import Home from "./components/pages/Home";
import "./css/main.css";


const App = () => {

    return (
            <MessageState>
                <AuthState>
                    <Router>
                        <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="*" component={Home} />
                        </Switch>
                    </Router>
                </AuthState>
            </MessageState>
            );
};

export default App;
