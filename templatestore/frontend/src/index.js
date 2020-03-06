import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Home from './pages/home.js';
import TemplateScreen from './pages/templateScreen.js';
import Page404 from './pages/404.js';

const backendSettings = JSON.parse(
    document.getElementById('settings-data').textContent.replace(/&quot;/g, '"')
);

const Root = () => (
    <Router>
        <Switch>
            <Route exact path="/templatestore/">
                <Home fixedAttributeKeys={backendSettings.TE_TEMPLATE_ATTRIBUTE_KEYS} />
            </Route>
            <Route exact path="/templatestore/t/add">
                <TemplateScreen />
            </Route>
            <Route exact path="/templatestore/t/:name/:version">
                <TemplateScreen />
            </Route>
            <Route component={Page404} />
        </Switch>
    </Router>
);

render(<Root />, document.getElementById('te-app'));
