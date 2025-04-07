import Cookies from "js-cookie";
import './assets/css/global.css';
import LoginPage from "./pages/Login";
import NavBar from "./components/NavBar";
import DomainsPage from "./pages/Domains";
import GetSession from "./global/get-session";
import WorkspacesPage from "./pages/Workspaces";
import { useLayoutEffect, useState } from "react";
import MarketplacePage from "./pages/Marketplace";
import "react-loading-skeleton/dist/skeleton.css";
import GetScreenSize from "./global/get-screen-size";
import team_interface from "./interfaces/team_interface";
import { Navigate, Route, Routes } from "react-router-dom";
import CurrentTeamContext from "./contexts/CurrentTeamContext";

export default () => {
  const [team, setTeam] = useState<null | team_interface>(null);
  const [teams, setTeams] = useState<null | team_interface[]>(null);

  const ScreenSize = GetScreenSize();
  const CurrentSession = GetSession();

  // If user is logged in, render the main UI
  if (CurrentSession != '') {
    useLayoutEffect(() => {
      // Fetch the available teams to expose them to all the paths
      fetch(`${import.meta.env.VITE_API_BASE_URL}/teams`, {
        method: 'GET',
        headers: {
          Authorization: CurrentSession
        }
      })
        .then(res => {
          if (res.status === 200) {
            return res.json();
          } else {
            console.log('List Teams Request Status: ' + res.status);
            alert('Failed to fetch teams');
          }
        })
        .then(data => {
          setTeams(data);

          // Update the expiration of the api key cookie
          Cookies.set('Codesphere_API_Key', CurrentSession.replace('Bearer ', ''), {
            // Expire in 5 months
            expires: 152
          });

          // Retrive the last used team
          const currentTeam = Cookies.get('current-team');
          // Check if the value for it exists
          if (currentTeam) {
            // If the currentTeam cookie exists, then check if that key exists in the array to make sure it doesn't error
            if (data[currentTeam] !== null) {
              setTeam(data[currentTeam]);
              // Update the expiration of the cookie
              Cookies.set('current-team', currentTeam, {
                // Expire in 5 months
                expires: 152
              });
            } else {
              // If the index is not present in the array i.e., the team got deleted, then reset the currentTeam value to 0 to prevent an error in selecting from the array of the teams present
              Cookies.set('current-team', '0', {
                // Expire in 5 months
                expires: 152
              });
              setTeam(data[0]);
            }
          } else {
            // If the last used team index doesn't exist, then set the default to 0
            Cookies.set('current-team', '0', {
              // Expire in 5 months
              expires: 152
            });
            setTeam(data[0]);
          }
        })
        .catch(err => {
          console.error(err);
          alert('Failed to fetch teams');
        });
    }, []);

    return (
      // Main <div>, directly after the <body>
      <div style={{
        width: ScreenSize.width,
        height: ScreenSize.height,
        backgroundColor: '#13121a',
        color: '#cdc8e4'
      }}>
        {/* The main navbar that is constant throught the entire UI */}
        <NavBar
          // Current team
          team={team}
          // List of teams available
          teams={teams}
          // To update the current team
          updateTeam={setTeam}
        />

        {/* Main body of the page */}
        <div
          style={{
            width: ScreenSize.width,
            height: ScreenSize.height - ScreenSize.navbarHeight,
            overflow: 'auto'
          }}
        >
          {/* `CurrentTeamContext` is used to provide the current team's context to the required paths */}
          <CurrentTeamContext.Provider value={team}>
            <Routes>
              {/* Redirect to "/workspaces" when loaded from "/" */}
              <Route path="/" element={<Navigate to={'/workspaces'} />} />
              <Route path="/workspaces" Component={WorkspacesPage} />
              <Route path="/marketplace" Component={MarketplacePage} />
              <Route path="/services" element={<h2 style={{ padding: 10 }}>Unimplementable</h2>} />
              <Route path="/domains" Component={DomainsPage} />
              <Route path="/members" element={<h2 style={{ padding: 10 }}>Unimplementable</h2>} />
              <Route path="*" element={<Navigate to={'/workspaces'} />} />
            </Routes>
          </CurrentTeamContext.Provider>
        </div>
      </div>
    );
  } else {
    return (
      // If user is not logged in, render a login page
      <div style={{
        width: ScreenSize.width,
        height: ScreenSize.height
      }}>
        <LoginPage />
      </div>
    );
  }
}