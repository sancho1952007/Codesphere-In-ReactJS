import { createContext } from 'react';
import team_interface from '../interfaces/team_interface';

const CurrentTeamContext = createContext<null | team_interface>(null);

export default CurrentTeamContext;