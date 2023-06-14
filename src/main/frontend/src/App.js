import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Switch } from "react-router";
import AuthState from "./context/auth/AuthState";
import Home from "./components/pages/Home";


const App = () => {

  return (
      <AuthState>
          <Router>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="*" component={Home} />
            </Switch>
          </Router>
      </AuthState>
  );
};

export default App;
