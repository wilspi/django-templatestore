import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { backendSettings } from './utils.js';
import Home from './pages/home.js';
import TemplateScreen from './pages/templateScreen.js';
import Page404 from './pages/404.js';

const Root = () => (
    <Router forceRefresh>
        <Switch>
            <Route exact path={backendSettings.TE_BASEPATH + '/'}>
                <Home
                    fixedAttributeKeys={
                        backendSettings.TE_TEMPLATE_ATTRIBUTE_KEYS
                    }
                />
            </Route>
            <Route exact path={backendSettings.TE_BASEPATH + '/a/add'}>
                <TemplateScreen editable />
            </Route>
            <Route
                exact
                path={backendSettings.TE_BASEPATH + '/t/:name/:version'}
            >
                <TemplateScreen />
            </Route>
            <Route component={Page404} />
        </Switch>
    </Router>
);

render(<Root />, document.getElementById('te-app'));
