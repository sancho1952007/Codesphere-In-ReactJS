export default interface workspaces_interface {
    "id": number,
    "dataCenterId": number,
    "userId": number,
    "teamId": number,
    "name": string,
    "gitUrl": string,
    "isPrivateRepo": boolean,
    "welcomeMessage": string,
    "initialBranch": string,
    "sourceWorkspaceId": number,
    "planId": number,
    "replicas": number,
    "vpnConfig": string
}