import '../assets/css/workspaces.css';
import GetSession from "../global/get-session";
import { SlOptionsVertical } from "react-icons/sl";
import ActivityIndicator from "../components/ActivityIndicator";
import CurrentTeamContext from "../contexts/CurrentTeamContext";
import workspace_interface from "../interfaces/workspace_interface";
import { BaseSyntheticEvent, Fragment, useContext, useEffect, useLayoutEffect, useState } from "react";
import { IoAdd, IoClose } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import { FaCreditCard } from 'react-icons/fa6';
import loader from '../assets/loader.gif';
import { CiCircleCheck, CiPause1 } from 'react-icons/ci';
import workspaces_interface from '../interfaces/workspace_interface';
import { MdDelete } from 'react-icons/md';

// To cache the result. Else, it would show the loader every time I navigated back to the page, may it be through the back button or by clicking the workspaces button
let workspacesData: null | workspace_interface[] = null;

interface workspace_plan {
    "id": number,
    "priceUsd": number
    "title": string,
    "deprecated": boolean,
    "characteristics": {
        "id": number,
        "CPU": number,
        "GPU": number,
        "RAM": number,
        "SSD": number,
        "TempStorage": number,
        "onDemand": boolean
    },
    "maxReplicas": number
}

export default function WorkspacesPage() {
    // Handles the workspaces [array] data
    const [workspaces, setWorkspaces] = useState<null | workspace_interface[]>(workspacesData);
    // Used for searching workspaces
    const [workspacesList, setWorkspacesList] = useState<null | workspace_interface[]>(workspacesData);

    // New Workspace Modal States
    // Handles whether the new workspace modal is visible or not
    const [newWorkspaceModalVisible, setNewWorkspaceModalVisible] = useState<boolean>(false);
    // Handles the text input value of the git url in new workspace modal
    const [gitURLInput, setGitURLInput] = useState<string>('');
    // Handles the workspaces plans list
    const [workspacePlans, setWorkspacePlans] = useState<null | workspace_plan[]>(null);
    // Handles whether to list off when unused or always on workspaces. By default, show an off when unused domain
    const [isOnDemandSelected, setIsOnDemandSelected] = useState<boolean>(true);
    // Handles which plan is selected
    const [newWorkspaceCurrentlySelectedPlan, setNewWorkspaceCurrentlySelectedPlan] = useState<number>(20);
    // The name of the new workspace
    const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');

    // Workspace option state
    const [workspaceOptionsVisible, setWorkspaceOptionsVisible] = useState<boolean>(false);
    const [workspaceOptionsCurrentWorkspace, setWorkspaceOptionsCurrentWorkspace] = useState<null | workspaces_interface>(null);

    // To prevent too many parallel requests
    const [isRequestOngoing, setIsRequestOngoing] = useState<boolean>(false);

    // Get the current team context
    const CurrentTeam = useContext(CurrentTeamContext);
    const CurrentSession = GetSession();

    useEffect(() => {
        document.title = 'Workspaces • Codesphere';
    }, []);

    useLayoutEffect(() => {
        fetchWorkspaces();
    }, [CurrentTeam]);

    useEffect(() => {
        if (newWorkspaceModalVisible) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/metadata/workspace-plans`, {
                headers: {
                    Authorization: CurrentSession
                }
            })
                .then(res => {
                    if (res.status === 200) {
                        return res.json();
                    } else {
                        console.log('Fetch Workspace Plans Status Code: ' + res.status);
                        alert('Failed to fetch workspace plans');
                    }
                })
                .then(out => {
                    let data: workspace_plan[] = out;
                    // Filter out the free and depreciated plans
                    data = data.filter(x => x.title !== 'Free');
                    data = data.filter(x => !x.deprecated);
                    setWorkspacePlans(data);
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to send fetch list of workspace plans request');
                });
        }
    }, [newWorkspaceModalVisible]);

    const fetchWorkspaces = () => {
        // If current team is not null, i.e., if the team has been authenticated and completely logged in, then fetch the workspaces data
        if (CurrentTeam) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces/team/${CurrentTeam.id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: CurrentSession
                    }
                }
            )
                .then(res => {
                    if (res.status === 200) {
                        return res.json();
                    } else {
                        console.log('Fetch Workspaces Status Code: ' + res.status);
                        alert('Failed to fetch workspaces data');
                    }
                })
                .then(data => {
                    setWorkspaces(data);
                    setWorkspacesList(data);
                    // Cache the output
                    workspacesData = data;
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to send fetch workspaces request');
                });
        }
    }

    const showWorkspaceOptions = (workspace: workspace_interface, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setWorkspaceOptionsVisible(true);
        setWorkspaceOptionsCurrentWorkspace(workspace);

        const workspace_options: null | HTMLElement = (document.querySelector('.workspace-options') as HTMLElement);
        if (workspace_options !== null) {
            workspace_options.style.top = `${event.clientY}px`;
            workspace_options.style.left = `${event.clientX - 100}px`;
        } else {
            alert('[select:.workspace-options] Something went wrong!');
        }
    }

    // Check if the github repo url is valid
    const isGitInputIsValid = () => {
        const input = gitURLInput;
        if (input.match(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\//)) {
            return true;
        } else {
            return false;
        }
    }

    // This is to keep the plan name intact when changed from off when unused to always on
    const setDeploymentType = ({ isOnDemand }: { isOnDemand: boolean }) => {
        if (workspacePlans) {
            // Retrive the current plan
            const current_selected_plan = workspacePlans?.filter(plan => {
                if (plan.id === newWorkspaceCurrentlySelectedPlan)
                    return plan;
            });

            if (current_selected_plan) {
                let index: number = -1;
                let updatedPlanIndex: number = 0;

                // Get the index of the plan with the required isOnDemand prop
                workspacePlans.map(plan => {
                    index++;
                    if (plan.title === current_selected_plan[0].title &&
                        plan.characteristics.onDemand === isOnDemand
                    ) {
                        updatedPlanIndex = index;
                    }
                });

                // Set the setIsOnDemandSelected state
                setIsOnDemandSelected(isOnDemand);
                // Set the updated plan ID
                setNewWorkspaceCurrentlySelectedPlan(workspacePlans[updatedPlanIndex].id);
            }
        }
    }

    useEffect(() => {
        document.body.addEventListener('keyup', (key) => {
            // Hide the new workspace modal when escape button is clicked
            if (key.key === 'Escape') {
                setNewWorkspaceModalVisible(false);
                setWorkspaceOptionsVisible(false);
            }

            return () => window.removeEventListener("keyup", () => { });
        });
    }, []);

    return (
        <div className="workspaces-page">

            {/* {workspaceOptionsVisible && ( */}
            <>
                <div className='workspace-options-overlay'
                    style={{ display: workspaceOptionsVisible ? 'block' : 'none' }}
                    onClick={() => setWorkspaceOptionsVisible(false)}
                ></div>
                <div className='workspace-options' style={{ display: workspaceOptionsVisible ? 'block' : 'none' }}>
                    <div className="workspace-option delete flex align-center gap-10"
                        onClick={() => {
                            setWorkspaceOptionsVisible(false);
                            if (workspaceOptionsCurrentWorkspace) {
                                // Make sure there are no ongoing requests to prevent duplicate delete requests
                                if (!isRequestOngoing) {
                                    if (confirm(`Are you sure you want to delete ${workspaceOptionsCurrentWorkspace.name}?`)) {
                                        setIsRequestOngoing(true);
                                        fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces/${workspaceOptionsCurrentWorkspace.id}`, {
                                            method: 'DELETE',
                                            headers: {
                                                Authorization: CurrentSession
                                            }
                                        })
                                            .then(res => {
                                                if (res.status === 200) {
                                                    setWorkspaces(null);
                                                    setWorkspacesList(null);
                                                    fetchWorkspaces();
                                                } else {
                                                    console.log('Delete Workspace Status Code: ' + res.status);
                                                    alert('Failed to delete workspace');
                                                }
                                            })
                                            .catch(err => {
                                                console.error(err);
                                                alert('Failed to send delete workspace request!');
                                            })
                                            .finally(() => {
                                                setIsRequestOngoing(false);
                                            })
                                    }
                                }
                            } else {
                                alert('[workspaceOptionsCurrentWorkspace:null] Something went wrong!');
                            }
                        }}
                    >
                        <MdDelete />
                        <div>Delete</div>
                    </div>
                </div>
            </>
            { /* )} */}

            {newWorkspaceModalVisible === true && (
                <div className="new-workspace flex align-center justify-center"
                    onClick={(e: BaseSyntheticEvent) => {
                        if (e.target.classList.contains('new-workspace')) {
                            // Hide the modal only if the dark background is clicked
                            setNewWorkspaceModalVisible(false);
                        }
                    }}>
                    <div className='new-workspace-modal'>
                        <div className='topbar'>
                            <h3>Create Workspace</h3>
                            <IoClose id='close-modal-btn' onClick={() => setNewWorkspaceModalVisible(false)} />
                        </div>

                        <input
                            id='workspaceName'
                            className='modal-input'
                            autoComplete='off'
                            placeholder='Enter Workspace Name'
                            value={newWorkspaceName}
                            onChange={e => {
                                setNewWorkspaceName(e.currentTarget.value);
                            }}
                        />

                        <input
                            id='giturl'
                            className='modal-input'
                            autoComplete='off'
                            placeholder='Enter Github URL (optional)'
                            value={gitURLInput}
                            onChange={e => {
                                setGitURLInput(e.currentTarget.value);
                            }}
                        />

                        {/* Deployment modes (i.e., off when unused and always on) */}
                        <div className="deployment-modes">
                            <div className={`deployment-mode ${isOnDemandSelected && 'active'}`}
                                onClick={() => { setDeploymentType({ isOnDemand: true }) }}>Off When Unused</div>
                            <div className={`deployment-mode ${!isOnDemandSelected && 'active'}`}
                                onClick={() => { setDeploymentType({ isOnDemand: false }) }}>Always On</div>
                        </div>

                        {/* Render this section only once the plans data is loaded */}
                        {workspacePlans ? (
                            <>
                                <div className="plans">
                                    {workspacePlans.map(plan => {
                                        return (
                                            <Fragment key={plan.id}>
                                                {plan.characteristics.onDemand === isOnDemandSelected && (
                                                    <div className={`plan ${plan.id === newWorkspaceCurrentlySelectedPlan && 'selected'}`}
                                                        onClick={() => setNewWorkspaceCurrentlySelectedPlan(plan.id)}
                                                    >
                                                        <div className="name">{plan.title}</div>
                                                        <b className='price'>${plan.priceUsd}/m</b>
                                                    </div>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </div>

                                <div className="plan-info">
                                    {/* Using this method because plan IDs are jumbled up in the api response */}
                                    {workspacePlans.map(plan => {
                                        return (
                                            <Fragment key={plan.id}>
                                                {
                                                    (plan.id === newWorkspaceCurrentlySelectedPlan) && (
                                                        <>
                                                            <div>vCPUs: {plan.characteristics.CPU}</div>
                                                            <div className="gap"></div>
                                                            <div>Memory: {(plan.characteristics.RAM / 1000000000).toFixed(0)}GB</div>
                                                            <div className="gap"></div>
                                                            <div>Storage: {(plan.characteristics.SSD / 1000000000).toFixed(0)}GB</div>
                                                        </>
                                                    )
                                                }
                                            </Fragment>
                                        );
                                    })}
                                </div>

                                <div className='info-section flex gap-10'>
                                    <div
                                        className='flex align-center justify-center'
                                        style={{
                                            width: 40,
                                            height: 40,
                                            flexShrink: 0,
                                            backgroundColor: '#00b6d7',
                                            borderRadius: '50%'
                                        }}>
                                        <FaCreditCard />
                                    </div>

                                    <div>
                                        <b>Prorated billing</b><br />
                                        <span>We use prorated billing, meaning you only pay for what you use. You can cancel any time, and if you cancel during the month, we will only bill you for the time you used your workspace.                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Skeleton />
                        )}

                        <div id='create-btn'
                            className={`${!newWorkspaceName.trim() && 'disabled'} flex align-center justify-center gap-10 border-1 border-solid border-default padding-10`}
                            onClick={() => {
                                let gitURL = '';
                                if (isGitInputIsValid()) {
                                    gitURL = gitURLInput;
                                }

                                if (newWorkspaceName.trim() !== '') {
                                    if (!isRequestOngoing) {
                                        setIsRequestOngoing(true);
                                        fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces`, {
                                            method: 'POST',
                                            headers: {
                                                Authorization: CurrentSession
                                            },
                                            body: JSON.stringify({
                                                "teamId": CurrentTeam?.id,
                                                "name": newWorkspaceName,
                                                "planId": newWorkspaceCurrentlySelectedPlan,
                                                "isPrivateRepo": false,
                                                ...(gitURL !== '') && {
                                                    gitUrl: gitURL,
                                                    initialBranch: 'main'
                                                },
                                                "replicas": 1,
                                            })
                                        })
                                            .then(res => {
                                                if (res.status === 200) {
                                                    return res.json();
                                                } else if (res.status === 402) {
                                                    alert('Please add billing info from the codesphere dashboard');
                                                } else {
                                                    console.log('Create Workspace Status Code: ' + res.status);
                                                    alert('Failed to create workspace');
                                                }
                                            })
                                            .then(() => {
                                                fetchWorkspaces();
                                                setNewWorkspaceModalVisible(false);
                                            })
                                            .catch(err => {
                                                console.error(err);
                                                alert('Failed to send create workspace request');
                                            })
                                            .finally(() => {
                                                setIsRequestOngoing(false);
                                            });
                                    }
                                }
                            }}
                        >
                            {/* Show a loader then the request is created */}
                            {isRequestOngoing ? (
                                <img
                                    width={20}
                                    src={loader}
                                />
                            ) : (
                                // Check if the github repo url is valid and based on it render the text
                                <IoAdd size={20} />
                            )}
                            {isGitInputIsValid() ? 'Create Workspace From Github Repo' : 'Create Empty Workspace'}
                        </div>
                    </div>
                </div>
            )
            }

            {
                workspacesList !== null ? (
                    <>
                        <div
                            id='separator'
                        >
                            {/* Workspaces and the number of workspaces */}
                            <h3 style={{ marginLeft: 10, marginTop: 20, marginBottom: 20, textWrap: 'nowrap' }}>Workspaces: {workspacesList.length}</h3>

                            <div
                                id='search-input-div'
                                className='flex align-center gap-10'
                            >
                                {/* Render the input only if there are workspaces available */}
                                {workspaces && workspaces?.length > 0 &&
                                    (<input
                                        className='input-default'
                                        id='search-workspaces-input'
                                        placeholder='Search Workspaces...'
                                        onChange={e => {
                                            const currentQuery = e.currentTarget.value;
                                            // && workspaces added for ts checking
                                            if (currentQuery.trim() !== '' && workspaces) {
                                                const query = workspaces.filter(x => x.name.toLowerCase().includes(currentQuery.toLowerCase()));
                                                setWorkspacesList(query);
                                            } else {
                                                setWorkspacesList(workspaces);
                                            }
                                        }}
                                    />)}

                                <div id='new-workspace-btn' className='flex align-center justify-center gap-5'
                                    onClick={() => setNewWorkspaceModalVisible(true)}>
                                    <IoAdd size={20} />New Workspace
                                </div>
                            </div>
                        </div>

                        <div id='main-table-div'>
                            {
                                // Make sure there are workspaces before rendering the table
                                (workspacesList.length > 0) ? (
                                    // Workspaces Table
                                    <table id="main-table">
                                        {/* Table Head */}
                                        <thead>
                                            <tr>
                                                <th align="left">Name</th>
                                                <th align="left">URL</th>
                                                <th align="left">Plan</th>
                                                <th align="center">Replicas</th>
                                                <th align="center">Owner</th>
                                                <th align="center">Actions</th>
                                            </tr>
                                        </thead>

                                        {/* Table body */}
                                        <tbody>
                                            {
                                                (workspacesList.map((workspace) => {
                                                    return (
                                                        // Individual Workspace Row
                                                        <tr key={workspace.id}>

                                                            {/* Workspace Name */}
                                                            <th className="th-workspace-name">{workspace.name}</th>

                                                            {/* Workspace URL */}
                                                            <td className="padding-10">
                                                                <a href={`https://${workspace.id}-3000.codesphere.com`} target='_blank'>
                                                                    {workspace.id}-3000.codesphere.com
                                                                </a>
                                                            </td>

                                                            {/* Workspace plan ID */}
                                                            <td align="left" style={{ textWrap: 'nowrap', paddingLeft: 20, padding: 5 }}>
                                                                {workspacePlans && workspacePlans?.map(plan => {
                                                                    return (
                                                                        <Fragment key={plan.id}>
                                                                            {
                                                                                plan.id === workspace.planId && (
                                                                                    <>
                                                                                        <b>{plan.title}</b> - {plan.characteristics.CPU} vCPU / {(plan.characteristics.RAM / 1000000000).toFixed(0)} GB Memory
                                                                                        <br />
                                                                                        <div className='flex align-center gap-5'>
                                                                                            {plan.characteristics.onDemand ? (
                                                                                                <CiPause1 />
                                                                                            ) : (
                                                                                                <CiCircleCheck />
                                                                                            )}

                                                                                            {plan.characteristics.onDemand ? (
                                                                                                'Off when unused'
                                                                                            ) : (
                                                                                                'Always On'
                                                                                            )}
                                                                                        </div>
                                                                                    </>
                                                                                )
                                                                            }
                                                                        </Fragment>
                                                                    );
                                                                })}
                                                                {/* {workspace.planId} */}
                                                            </td>

                                                            {/* Workspace replica count */}
                                                            <td>
                                                                <div className="flex align-center justify-center gap-10">
                                                                    {/* Replicas dot */}
                                                                    <div className="replica-dot"></div>
                                                                    {/* Replicas count */}
                                                                    {workspace.replicas}
                                                                </div>
                                                            </td>

                                                            {/* Workspace Owner */}
                                                            <td align="center">{workspace.userId}</td>

                                                            {/* Workspace more options */}
                                                            <td align="center">
                                                                <div
                                                                    className="workspace-options-btn flex align-center justify-center"
                                                                    onClick={(e) => {
                                                                        showWorkspaceOptions(workspace, e);
                                                                    }}
                                                                >
                                                                    <SlOptionsVertical />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }))
                                            }
                                        </tbody>
                                    </table>
                                ) : (<></>)
                            }
                        </div>
                    </>
                ) : (
                    <ActivityIndicator />
                )
            }
        </div >
    );
}