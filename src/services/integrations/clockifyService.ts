import ApiService from "../apiService";

class ClockifyService extends ApiService {

    constructor(apiKey: string) {
        super(process.env.CLOCKIFY_API_URL || 'https://api.clockify.me/api/v1', apiKey);
    }

    public async getUser(userId: string): Promise<any> {
        return this.get(`/users/${userId}`);
    }

}

export default ClockifyService;