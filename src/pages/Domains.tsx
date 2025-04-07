import '../assets/css/domains.css';
import { GoGlobe } from "react-icons/go";
import { BsLightbulb } from "react-icons/bs";
import GetSession from "../global/get-session";
import { RiCheckDoubleFill } from "react-icons/ri";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { IoCopyOutline, IoSearch } from "react-icons/io5";
import CurrentTeamContext from "../contexts/CurrentTeamContext";
import workspaces_interface from "../interfaces/workspace_interface";
import { MdDelete, MdOutlineAccessTime, MdOutlineDone } from 'react-icons/md';

interface domain_interface {
    "teamId": number,
    "dataCenterId": number,
    "workspaces": {
        [key: string]: number[]
    },
    "name": string,
    "certificateRequestStatus": {
        "issued": boolean,
        "reason": string
    },
    "dnsEntries": {
        "a": string,
        "cname": string,
        "txt": string
    },
    "domainVerificationStatus": {
        "verified": boolean,
        "reason": string
    },
    "customConfigRevision"?: number,
    "customConfig"?: {
        "maxBodySizeMb"?: number,
        "maxConnectionTimeoutS"?: number,
        "useRegex"?: boolean
    }
}

// To cache the result. Else, it would show the loader every time I navigated back to the page, may it be through the back button or by clicking the workspaces button
let domainsData: null | domain_interface[] = null;
let workspacesDataCache: any | workspaces_interface = {};

export default function DomainsPage() {
    const [addDomainInputValue, setAddDomainInputValue] = useState('');
    const CurrentSession = GetSession();
    const CurrentTeam = useContext(CurrentTeamContext);

    // Main domain list
    const [domains, setDomains] = useState<null | domain_interface[]>(domainsData);
    // To allow limited results when domains are searched using the input
    const [domainsList, setDomainsList] = useState<null | domain_interface[]>(domainsData);
    // To get the workspace name of the domain connected
    const [workspacesData, setWorkspacesData] = useState<any | {
        [key: string]: workspaces_interface
    }>(workspacesDataCache);

    const isAddDomainInputValueValid = () => {
        if (addDomainInputValue.match(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i)) return true;
        else return false;
    }

    useEffect(() => {
        document.title = 'Domains • Codesphere';
    }, []);

    useEffect(() => {
        if (CurrentTeam) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/domains/team/${CurrentTeam.id}`, {
                method: 'GET',
                headers: {
                    Authorization: CurrentSession
                }
            })
                .then(res => {
                    if (res.status === 200) {
                        return res.json();
                    } else {
                        console.log('List Domains Request Status: ' + res.status);
                        alert('Failed to load domains');
                    }
                })
                .then(result => {
                    const data: domain_interface[] = result;

                    setDomains(data);
                    setDomainsList(data);
                    // Cache the output
                    domainsData = data;

                    data.map(domain => {
                        const keys = Object.keys(domain.workspaces)
                        keys.forEach(key => {
                            fetch(`${import.meta.env.VITE_API_BASE_URL}/workspaces/${domain.workspaces[key]}`, {
                                method: 'GET',
                                headers: {
                                    Authorization: CurrentSession
                                }
                            })
                                .then(res => res.json())
                                .then(workspaceResult => {
                                    const workspace_data: workspaces_interface = workspaceResult;

                                    // Add the workspace info to the main state
                                    workspacesData[workspace_data.id] = workspace_data;

                                    setWorkspacesData({
                                        ...workspacesData
                                    });

                                    // Cache the outputs returned by the workspace info request
                                    workspacesDataCache = workspacesData;
                                });
                        });
                    });
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to fetch domains');
                });
        }
    }, [CurrentTeam]);

    // Taken help from https://stackoverflow.com/questions/69438702/why-does-navigator-clipboard-writetext-not-copy-text-to-clipboard-if-it-is-pro/74528564#74528564
    // Multiple modifications made to optimize it better
    // Took it to get maximum cross platform compatibility
    function Copy({ text }: { text: string }) {
        return new Promise<void>((resolve, reject) => {
            // For newer desktop browsers
            if (typeof navigator !== "undefined" && typeof navigator.clipboard !== "undefined" && typeof navigator.permissions !== "undefined") {
                const type = "text/plain";
                const blob = new Blob([text], { type });
                const data = [new ClipboardItem({ [type]: blob })];
                const permissionName = "clipboard-write" as PermissionName;
                navigator.permissions.query({ name: permissionName }).then((permission) => {
                    if (permission.state === "granted" || permission.state === "prompt") {
                        navigator.clipboard.write(data).then(resolve, reject).catch(reject);
                    }
                    else {
                        reject(new Error("Permission not granted!"));
                    }
                });
            }

            // For older browsers and mobile browsers
            else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                var textarea = document.createElement("textarea");
                textarea.textContent = text;
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try {
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                    resolve();
                }
                catch (e) {
                    document.body.removeChild(textarea);
                    reject(e);
                } finally {
                    textarea.remove();
                }
            }
            else {
                reject(new Error("None of copying methods are supported by this browser!"));
            }
        });
    }


    return (
        <div
            className="domains-page padding-10 overflow-auto">
            <h3>Domains</h3>
            <br />

            {/* Information section */}
            <div className="flex gap-10 brad-10" id="info-section-div">
                {/* Light bulb icon section */}
                <div id="bulb-icn-div" className="flex align-center justify-center">
                    <BsLightbulb fontWeight={500} size={20} />
                </div>

                {/* Info text content */}
                <div>
                    <h3>How it works</h3>
                    <p style={{ fontSize: 15 }}>In order to verify your domain, navigate to your domain provider's (e.g. GoDaddy) DNS settings and add the DNS records that you can find by pressing on an unverified domain.
                        After adding the DNS records, press ‘Check status’ button.
                        <br /><br />
                        Tip: Scale horizontally or perform A/B testing by connecting multiple workspaces to a single domain.</p>
                </div>
            </div>

            <div className="padding-10 brad-10" id="main-section">
                <div className="flex align-center gap-10 padding-10 brad-5 border-1 border-solid border-default" >
                    <div className="icon-div flex align-center justify-center brad-5">
                        <IoIosAddCircleOutline size={30} />
                    </div>

                    <b>Add domain</b>
                </div>

                <div className="gap-10 align-center" id="add-domain-section">
                    <span>Add a domain that you own or buy a new one from <a href="https://www.namecheap.com/" target="_blank">Namecheap</a> or <a href="https://www.godaddy.com/" target="_blank">GoDaddy</a></span>

                    <div
                        id="add-domain-input-section"
                        className="flex gap-10">
                        <input
                            value={addDomainInputValue}
                            placeholder="Ex: yourdomain.com"
                            autoComplete='off'
                            autoCapitalize='off'
                            className="input-default"
                            id="domain-name-input"
                            onChange={x => {
                                setAddDomainInputValue(x.currentTarget.value);
                            }}
                        />

                        <div
                            // Add the scale transition, background, cursor, etc. effect only when the domain name is valid
                            className={`add-domain-btn ${isAddDomainInputValueValid() ? 'allowed' : ''}`}
                            onClick={() => {
                                // Make sure the domain name is valid
                                if (isAddDomainInputValueValid()) {
                                    fetch(`${import.meta.env.VITE_API_BASE_URL}/domains/team/${CurrentTeam?.id}/domain/${addDomainInputValue}`, {
                                        method: 'POST',
                                        headers: {
                                            Authorization: CurrentSession
                                        }
                                    })
                                        .then(res => {
                                            if (res.status === 200) {
                                                setAddDomainInputValue('');
                                                return res.json();
                                            } else {
                                                console.log('Create Domain Request Status: ' + res.status);
                                                alert('Failed to add domain due to internal issue');
                                            }
                                        })
                                        .then(data => {
                                            // For ts checking
                                            if (domains) {
                                                const newDomainsList = [...domains, data];
                                                setDomains(newDomainsList);
                                                setDomainsList(newDomainsList);
                                                domainsData = newDomainsList;
                                            }
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            alert('Failed to send create domain request!');
                                        });
                                }
                            }}
                        >Add</div>
                    </div>
                </div>

                {
                    // Render this section only if domains are added to the account
                    (domains && domains?.length > 0) && (
                        <>
                            <div
                                className="flex align-center gap-10 padding-10 brad-5 border-1 border-solid border-default"
                                style={{
                                    marginTop: 20
                                }}>

                                <div className="icon-div flex align-center justify-center brad-5">
                                    <GoGlobe size={25} />
                                </div>

                                <b>Domains: {domainsList?.length}</b>
                            </div>
                            <br />
                            <IoSearch id="search-input-search-icon" /><input
                                placeholder="Ex: yourdomain.com"
                                className="input-default padding-10"
                                id="search-workspace-input"
                                onChange={inp => {
                                    if (inp.currentTarget.value.trim() !== '') {
                                        if (domains && domainsList) {
                                            // Filter by domain search list
                                            const results = domains.filter(x => x.name.toLowerCase().includes(inp.currentTarget.value.toLowerCase()));
                                            setDomainsList(results);
                                        }
                                    } else {
                                        setDomainsList(domains);
                                    }
                                }} />

                            <div className="overflow-auto">
                                {
                                    // Render the domains names based on the domains list
                                    (domainsList && domainsList.length > 0) && (
                                        // Main table showing all the domains
                                        <table id="main-table">
                                            <thead>
                                                <tr>
                                                    <th align="left" style={{ paddingLeft: 10 }}>Domain</th>
                                                    <th align="left">Workspaces</th>
                                                    <th align="left">Port</th>
                                                    <th></th>
                                                </tr>
                                            </thead>

                                            {domainsList.map((domain) => {
                                                return (
                                                    <tbody key={domain.name}>
                                                        {/* Main element: Domain name, connected workspaces & ports */}
                                                        <tr>
                                                            <td className="domain-name flex align-center gap-10 padding-10"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    // Toggle the collapsable info on how to set up <tr>'s visibility
                                                                    const element = document.getElementById(domain.name);
                                                                    // If the more info section is already collapsed
                                                                    if (element?.classList.contains('collapsed')) {
                                                                        element?.classList.remove('collapsed');
                                                                    } else {
                                                                        // If not,
                                                                        element?.classList.add('collapsed');
                                                                    }
                                                                }}
                                                            >{domain.name}{domain.domainVerificationStatus.verified === true ? <MdOutlineDone color='green' size={20} /> : <MdOutlineAccessTime />}</td>
                                                            {<>
                                                                {/* Check if at least one workspace is connected or not */}
                                                                {Object.keys(domain.workspaces).length > 0 ? (
                                                                    <td>
                                                                        {
                                                                            // List the workspaces
                                                                            // Using this is because the keys are unknown
                                                                            (Object.keys(domain.workspaces)).map(key => {
                                                                                // Using <span> since there can be multiple workspaces connected
                                                                                return (
                                                                                    <span key={key}>{workspacesData && workspacesData[domain.workspaces[key].toString()]?.name}</span>
                                                                                );
                                                                            })}
                                                                    </td>
                                                                ) : (
                                                                    <td>[No Workspace Connected]</td>
                                                                )}
                                                            </>}
                                                            <td style={{ paddingLeft: 20, paddingRight: 20 }}>3000</td>
                                                            <td>
                                                                {/* Delete domain button */}
                                                                <div className='delete-domain-btn flex align-center justify-center'
                                                                    onClick={() => {
                                                                        if (confirm(`Are you sure you want to delete ${domain.name}?`)) {
                                                                            fetch(`${import.meta.env.VITE_API_BASE_URL}/domains/team/${CurrentTeam?.id}/domain/${domain.name}`, {
                                                                                method: 'DELETE',
                                                                                headers: {
                                                                                    Authorization: CurrentSession
                                                                                }
                                                                            })
                                                                                .then(res => {
                                                                                    if (res.status === 200) {
                                                                                        // Remove the current domain from the domains list since it got deleted
                                                                                        const newDomainsData = domains.filter(x => x.name !== domain.name);
                                                                                        setDomains(newDomainsData);
                                                                                        setDomainsList(newDomainsData);
                                                                                    } else {
                                                                                        console.log('Domain Delete Request Status: ' + res.status);
                                                                                        alert('Something went wrong internally!');
                                                                                    }
                                                                                }).catch(err => {
                                                                                    console.error(err);
                                                                                    alert('Failed to send delete domain request');
                                                                                });
                                                                        }
                                                                    }}
                                                                >
                                                                    <MdDelete />
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Info in how to set up the domain */}
                                                        <tr className="row-collapsable collapsed" id={domain.name}>
                                                            <td colSpan={3}>
                                                                <br />
                                                                <b
                                                                    className="padding-10"
                                                                    style={{
                                                                        backgroundColor: '#0f0e15',
                                                                    }}>Verification Records <RiCheckDoubleFill />
                                                                </b>

                                                                <div className="data-section padding-10">
                                                                    <br />
                                                                    {/* Recommended for subdomains info chip */}
                                                                    <span style={{ fontSize: 13 }}>Option 1:&nbsp;
                                                                        <div
                                                                            className="chip"
                                                                            style={{
                                                                                color: 'rgb(0, 182, 215)',
                                                                                backgroundColor: 'rgb(25, 35, 44)',
                                                                                border: '1px solid rgb(28, 65, 99)',
                                                                            }}
                                                                        >Recommended for subdomains</div>
                                                                    </span>

                                                                    <table
                                                                        className="sub-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th align="left" className="sub-table-item">TYPE</th>
                                                                                <th align="left" className="sub-table-item">NAME</th>
                                                                                <th align="left" className="sub-table-item">VALUE</th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody className="border-1 border-solid border-default">
                                                                            <tr>
                                                                                <td className="sub-table-item">CNAME</td>
                                                                                <td className="sub-table-item" style={{ textWrap: 'nowrap' }}>{domain.name}</td>
                                                                                <td className="sub-table-item">
                                                                                    <div className="flex align-center gap-5">
                                                                                        {domain.dnsEntries.cname}
                                                                                        <IoCopyOutline className="copy-icon" onClick={() => Copy({ text: domain.dnsEntries.cname })} />
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>

                                                                    {/* Required for root domains info chip */}
                                                                    <div
                                                                        style={{
                                                                            marginTop: 20
                                                                        }}
                                                                    >
                                                                        <span style={{
                                                                            fontSize: 13,
                                                                        }}>Option 2:&nbsp;
                                                                            <div
                                                                                className="chip"
                                                                                style={{
                                                                                    backgroundColor: 'rgb(40, 40, 40)',
                                                                                    border: '1px solid rgb(89, 89, 89)',
                                                                                }}
                                                                            >Required for root domains</div>
                                                                        </span>
                                                                    </div>

                                                                    <table className="sub-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th align="left" className="sub-table-item">TYPE</th>
                                                                                <th align="left" className="sub-table-item">NAME</th>
                                                                                <th align="left" className="sub-table-item">VALUE</th>
                                                                            </tr>
                                                                        </thead>

                                                                        <tbody>
                                                                            <tr style={{
                                                                                border: '1px solid var(--border-default-color)'
                                                                            }}>
                                                                                <td className="sub-table-item">A</td>
                                                                                <td className="sub-table-item" style={{ textWrap: 'nowrap' }}>{domain.name}</td>
                                                                                <td className="sub-table-item">
                                                                                    <div className="flex align-center gap-5">
                                                                                        {domain.dnsEntries.a}
                                                                                        <IoCopyOutline className="copy-icon padding-10 brad-5" onClick={() => Copy({ text: domain.dnsEntries.a })} />
                                                                                    </div>
                                                                                </td>
                                                                            </tr>

                                                                            <tr>
                                                                                <td className="sub-table-item">TXT</td>
                                                                                <td className="sub-table-item" style={{ textWrap: 'nowrap' }}>{domain.name}</td>
                                                                                <td className="sub-table-item">
                                                                                    <div className="flex align-center gap-5">
                                                                                        {domain.dnsEntries.txt}
                                                                                        <IoCopyOutline className="copy-icon padding-10 brad-5" onClick={() => Copy({ text: domain.dnsEntries.txt })} />
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>

                                                                    <div className="flex align-center gap-10">
                                                                        <div className="check-status-btn"
                                                                            onClick={() => {
                                                                                fetch(`${import.meta.env.VITE_API_BASE_URL}/domains/team/${domain.teamId}/domain/${domain.name}/verify`, {
                                                                                    method: 'POST',
                                                                                    headers: {
                                                                                        Authorization: CurrentSession
                                                                                    }
                                                                                })
                                                                                    .then(res => {
                                                                                        if (res.status === 200) {
                                                                                            return res.json();
                                                                                        } else {
                                                                                            console.log('Domains Verification Request Status: ' + res.status);
                                                                                            alert('Failed to verify domain due to internal error!');
                                                                                        }
                                                                                    })
                                                                                    .then(data => {
                                                                                        // Check if the domain is verified or not and set the status based on it, update the status if changed
                                                                                        if (data.verified === true) {
                                                                                            const changes: domain_interface[] = domains.map(item => {
                                                                                                if (item.name === domain.name) {
                                                                                                    return {
                                                                                                        ...item,
                                                                                                        // Mark the domain verified
                                                                                                        domainVerificationStatus: {
                                                                                                            verified: true,
                                                                                                            reason: ""
                                                                                                        },
                                                                                                    };
                                                                                                } else {
                                                                                                    return item;
                                                                                                }
                                                                                            });

                                                                                            setDomains(changes);
                                                                                            setDomainsList(changes);
                                                                                        } else {
                                                                                            const changes: domain_interface[] = domains.map(item => {
                                                                                                if (item.name === domain.name) {
                                                                                                    return {
                                                                                                        ...item,
                                                                                                        // Mark the domain verified
                                                                                                        domainVerificationStatus: {
                                                                                                            verified: false,
                                                                                                            reason: ""
                                                                                                        },
                                                                                                    };
                                                                                                } else {
                                                                                                    return item;
                                                                                                }
                                                                                            });

                                                                                            setDomains(changes);
                                                                                            setDomainsList(changes);
                                                                                            alert('Failed To Verify Domain: ' + data.reason);
                                                                                        }
                                                                                    })
                                                                                    .catch(err => {
                                                                                        console.error(err);
                                                                                        alert('Failed To Send Verify Request!');
                                                                                    });
                                                                            }}
                                                                        >Check Status</div>
                                                                        <span>(It may take up to a few hours for DNS changes to take effect)</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                );
                                            })}
                                        </table>
                                    )}
                            </div>
                        </>
                    )}
            </div>
        </div>
    );
}