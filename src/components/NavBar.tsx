import React, { Dispatch, SetStateAction, useState } from "react";
import ThemeColors from "../global/colors";
import { MdOutlinePeopleAlt, MdWorkspacesFilled } from "react-icons/md";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa6";
import { GoDatabase } from "react-icons/go";
import { CiGlobe } from "react-icons/ci";
import team_interface from "../interfaces/team_interface";
import Skeleton from "react-loading-skeleton";
import '../assets/css/navbar.css';
import { IoAdd } from "react-icons/io5";
import Cookies from 'js-cookie';

const NavBarItem: React.FC<{
    name: string,
    icon: React.ReactNode,
    href: string
}> = ({
    name,
    icon,
    href
}) => {
        const path = useResolvedPath(href);
        const isActive = useMatch({ path: path.pathname, end: true });

        return (
            <Link
                className={`navbar-item ${isActive ? 'active' : ''}`}
                to={href}>
                {icon}
                {name}
            </Link>
        );
    }

function RenderTeamPickerItem({ team, updateTeam, position }: {
    team: team_interface,
    position: number,
    updateTeam: Dispatch<SetStateAction<team_interface | null>>
}) {
    return (
        <div
            className="choose-team"
            onClick={() => {
                updateTeam(team);
                Cookies.set('current-team', position.toString(), {
                    // Expire in 5 months
                    expires: 152
                });
            }}
        >
            <img alt="team-image" className="team-list-image"
                src={team.avatarUrl || 'https://ui-avatars.com/api/?name=' + team.name}
            />

            {team.name}
        </div>
    );
}


export default function NavBar({ team, teams, updateTeam }: {
    team: null | team_interface,
    teams: null | team_interface[],
    updateTeam: Dispatch<SetStateAction<team_interface | null>>
}) {
    // Defines whether the team picker is visible or not
    const [isTeamPickerVisible, setIsTeamPickerVisible] = useState<boolean>(false);

    const handleBodyClick = () => {
        // Hide the team picker
        setIsTeamPickerVisible(false);
        // Unregister the event listener
        document.body.removeEventListener('click', handleBodyClick, true);
    }

    // This variable will be used to set the update the last used team index
    let teamIndex: number = -1;

    return (
        <div className="navbar">
            {
                // If all the data is loaded
                (team !== null && teams !== null) ? (
                    <>
                        {/* The team picker floating modal */}
                        <div
                            id='team-picker-modal'
                            style={{
                                display: isTeamPickerVisible ? 'block' : 'none'
                            }}>

                            <span style={{
                                padding: 10
                            }}>
                                Your Teams
                            </span>
                            {
                                teams.map(item => {
                                    teamIndex++;
                                    // To prevent duplicate elements
                                    if (item.id !== team.id) {
                                        return (
                                            <RenderTeamPickerItem
                                                key={item.id}
                                                team={item}
                                                position={teamIndex}
                                                updateTeam={updateTeam}
                                            />
                                        );
                                    }
                                })
                            }

                            {/* Separator between teams and create team */}
                            <div style={{
                                height: 1,
                                backgroundColor: 'rgb(151, 151, 151)',
                                marginTop: 10,
                                marginBottom: 10
                            }} />

                            <div
                                className="choose-team"
                                onClick={() => {
                                    alert('Feature will be implemented in the future!');
                                }}
                            >
                                <IoAdd size={20} />Create New Team
                            </div>
                        </div>

                        {/* Div to maintain space between team picker and logout button */}
                        <div id="separator">
                            {/* The always visible team picker */}
                            <div
                                className="choose-team"
                                onClick={() => {
                                    setIsTeamPickerVisible(!isTeamPickerVisible);

                                    // // Toggle modal visibility
                                    if (isTeamPickerVisible === true) {
                                        // setIsTeamPickerVisible(false);
                                        document.body.removeEventListener('click', handleBodyClick, true);
                                    } else {
                                        // setIsTeamPickerVisible(true);
                                        document.body.addEventListener('click', handleBodyClick, true);
                                    }
                                }}
                            >
                                <img
                                    alt="team-image"
                                    className="team-list-image"
                                    src={team.avatarUrl || 'https://ui-avatars.com/api/?name=' + team.name}
                                />

                                {team.name}
                            </div>

                            {/* Right side logout button */}
                            <div className="logout-btn flex align-center justify-center"
                                onClick={() => {
                                    Cookies.remove('Codesphere_API_Key');
                                    Cookies.remove('current-team');
                                    window.location.reload();
                                }}
                            >
                                Logout
                            </div>
                        </div>
                    </>
                ) : (
                    // If the team data is not loaded yet, show a skeleton loader
                    <div id="separator" >
                        <div className="loading-box">
                            <Skeleton baseColor={ThemeColors.skeletonLoaderBaseColor}
                                highlightColor={ThemeColors.skeletonLoaderHighlightColor}
                                width={'100%'}
                                height={'100%'}
                            />
                        </div>

                        <div className="loading-box">
                            <Skeleton baseColor={ThemeColors.skeletonLoaderBaseColor}
                                highlightColor={ThemeColors.skeletonLoaderHighlightColor}
                                width={'100%'}
                                height={'100%'}
                            />
                        </div>
                    </div>
                )
            }

            <div id='routes-list'>
                <NavBarItem
                    name={'Workspaces'}
                    icon={<MdWorkspacesFilled />}
                    href="/workspaces"
                />

                <NavBarItem
                    name={'Marketplace'}
                    icon={<FaWarehouse />}
                    href="/marketplace"
                />

                <NavBarItem
                    name={'Services'}
                    icon={<GoDatabase />}
                    href="/services"
                />

                <NavBarItem
                    name={'Domains'}
                    icon={<CiGlobe />}
                    href="/domains"
                />

                <NavBarItem
                    name={'Members'}
                    icon={<MdOutlinePeopleAlt />}
                    href="/members"
                />
            </div>
        </div >
    );
}