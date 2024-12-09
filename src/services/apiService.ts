import axios, { AxiosInstance } from "axios";

class ApiService {
    protected client: AxiosInstance;
    
    constructor(baseURL: string, apiKey?: string) {
        this.client = axios.create({
            baseURL,
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
        });
    }

    public async get(endpoint: string): Promise<any> {
        return this.client.get(endpoint);
    }

    public async post(endpoint: string, data: any): Promise<any> {
        return this.client.post(endpoint, data);
    }
}

export default ApiService;