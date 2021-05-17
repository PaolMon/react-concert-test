import axios from 'axios';

import React, { useEffect, useState } from 'react';
import logging from './config/logging';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useLocation
  } from "react-router-dom";

import 'typeface-titillium-web';
import ProviderRecord, {SPIDReactButtonDropdown} from '@dej611/spid-react-button'
import '@dej611/spid-react-button/dist/index.css'


import Button from 'react-bootstrap/Button';

export interface IApplicationProps {}

const Application: React.FunctionComponent<IApplicationProps> = props => {
    const [isLogin, setLoggedIn] = useState<boolean>(false);
    const [user, setUserName] = useState<string>('');
    const [userInfo, setUserInfo] = useState<any>('');

    useEffect(() => {
        logging.info('Initiating SAML check.', 'SAML');

        axios({
            method: 'GET',
            url: 'http://localhost:3000/whoami',
            withCredentials: true
        })
        .then(response => {
            logging.info(response.data.user, 'SAML_RESPONSE');
            //logging.info(response.data.user, 'SAML');

            if (response.status === 200 || response.status === 201)
            {
                
                
                //setEmail(response.data.user.nameID);
                setUserName(response.data.user.name);
                setLoggedIn(true);
                setUserInfo(response.data.user);
            }
            else
            {
              setLoggedIn(false);    
            }
        })
        .catch(error => {
            logging.error(error, 'SAML');
            //RedirectToRoot();
        })
    }, []);

    const logout = () => {
      axios({
            method: 'POST',
            url: 'http://localhost:3000/logout',
            withCredentials: true
        })
        .then(response => {
            logging.info(response, 'SAML_RESPONSE');
            //logging.info(response.data.user, 'SAML');

            if (response.status === 200 || response.status === 201)
            {
                
                
                //setEmail(response.data.user.nameID);
                setUserName('');
                setUserInfo('');
                setLoggedIn(false);
            }
            RedirectToRoot();
        })
        .catch(error => {
            logging.error(error, 'SAML');
            RedirectToRoot();
        })
    }

    const RedirectToRoot = () => {
      window.location.replace('http://localhost:4000');
  }

    const testingProviders: ProviderRecord.ProviderRecord[] = [{
      protocols: ['SAML'],
      entityName: 'TESTENV',
      entityID: 'http://localhost:3000/login?entityID=xx_testenv2'
    },{
      protocols: ['SAML'],
      entityName: 'VALIDATOR',
      entityID: 'http://localhost:3000/login?entityID=xx_validator'
    },{
      protocols: ['SAML'],
      entityName: 'SPID_VALIDATOR',
      entityID: 'https://spid.validator.gov.it'
    }
  ]

    const supportedIDP: string[] = ['http://localhost:3000/login?entityID=xx_testenv2', 'http://localhost:3000/login?entityID=xx_validator','https://spid.validator.gov.it']

    const mapping = { 
      'http://localhost:3000/login?entityID=xx_testenv2': 'xx_testenv2',
      'http://localhost:3000/login?entityID=xx_validator': 'xx_validator',
      'https://spid.validator.gov.it':'validator'
    }

    return (
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/users">User</Link>
                </li>
              </ul>
            </nav>
    
            <Switch>
              <Route path="/login">
                <RedirectLogin />
              </Route>
              <Route path="/users">
                <User />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </Router>
      );
      
      function RedirectLogin() {
        const location = useLocation();
        console.log(location.pathname);
        console.log(location)
        window.location.replace('http://localhost:3000'+location.pathname+location.search);
        return null;
      }
    
      
      function Welcome() {
        if(isLogin){
          return (
            <div>
              <h2><p>Hello {user}!</p></h2>
              <Button onClick={logout} variant="outline-dark">LOGOUT</Button>
            </div>
          );
        } else {
          return <Home />
        }
      }

      function User() {
        if(isLogin){
          return (
            <div>
              <h2>
                <p>NOME: {userInfo.name}</p>
                <p>COGNOME: {userInfo.familyName}</p>
                <p>CELLULARE: {userInfo.mobilePhone}</p>
                <p>EMAIL: {userInfo.email}</p>
                <p>CODICE FISCALE: {userInfo.fiscalNumber}</p>
              </h2>
              <Button onClick={logout} variant="outline-dark">LOGOUT</Button>
            </div>
          );
        } else {
          return <Redirect to="/" />
        }
      }

      function Home() {
        if(!isLogin){
          return (
            <div>
              <h2><p>YOU ARE NOT LOGGED IN.</p></h2>
                <SPIDReactButtonDropdown url="/login?entityID={{idp}}" supported={supportedIDP} extraProviders={testingProviders} mapping={mapping}/>
            </div>
          );
        } else {
          return <Welcome/>
        }
      }

}

export default Application;