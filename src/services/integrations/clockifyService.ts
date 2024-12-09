import ApiService from "../apiService";

/**
 * Service class to interact with the Clockify API
 * This Service is Workspace Specific
 */
class ClockifyService extends ApiService {

    /**
     * The ID of the Clockify workspace
     */
    private workspaceId: string = process.env.CLOCKIFY_WORKSPACE_ID || "";

    /**
     * Initializes a new instance of the ClockifyService
     * @param apiKey - The API key used for authenticating with the Clockify API
     */
    constructor(apiKey: string) {
        super({
            baseURL: process.env.CLOCKIFY_API_URL || 'https://api.clockify.me/api/v1',
            apiKey: apiKey,
            authType: "X-Api-Key"
        });
    }

    /**
     * Retrieves the profile details of a user in the workspace
     * @param userId - The ID of the user to retrieve
     * @returns A promise that resolves with the user profile details
     */
    public async getUser(userId: string): Promise<any> {
        return this.get(`workspaces/${this.workspaceId}/member-profile/${userId}`);
    }

    /**
     * Retrieves the details of a specific time entry
     * @param timeEntryId - The ID of the time entry to retrieve
     * @returns A promise that resolves with the time entry details
     */
    public async getTimeEntry(timeEntryId: string): Promise<any> {
        return this.get(`/workspaces/${this.workspaceId}/time-entries/${timeEntryId}`);
    }

}

export default ClockifyService;