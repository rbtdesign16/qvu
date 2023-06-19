import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Switch } from "react-router";
import Home from "./components/pages/Home";
import "./css/main.css";



const App = () => {

    return (
            <Router>
                <Switch>
                <Route exact path="/" component={Home} />
                <Route path="*" component={Home} />
                </Switch>
            </Router>
            );
};

export default App;
