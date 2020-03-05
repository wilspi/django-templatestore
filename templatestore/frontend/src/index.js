import React from 'react';
import ReactDOM from 'react-dom';
import TemplateScreen from "./templateScreen";
import AllTemplates from './allTemplates';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Root = () => (
    <Router>
        <Switch>
            <Route exact path="/template-editor/">
                <AllTemplates />
            </Route>
            <Route path="/template-editor/:name/:version" component={TemplateScreen} />
            <Route path="/template-editor/addNewTemplate" component={TemplateScreen} />
        </Switch>
    </Router>
);

//ReactDOM.render(<TemplateScreen />, document.getElementById('te-app'));
ReactDOM.render(<Root />, document.getElementById('te-app'));
