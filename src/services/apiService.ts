import axios, { AxiosInstance } from "axios";
import { serviceManager } from "./serviceManager";
import { Logger } from "./logging/logger";

interface ApiServiceConfig {
    baseURL: string;
    apiKey: string;
    authType?: "Bearer" | "X-Api-Key" | "Custom";
}

/**
 * Base service class for interacting with REST APIs.
 * Provides common functionality such as authentication, HTTP GET, and POST requests.
 */
class ApiService {
    protected client: AxiosInstance;
    protected logger: Logger;
    
    /**
     * Creates an instance of `ApiService`.
     * Initializes an Axios client with the given configuration.
     * 
     * @param config - Configuration for the API service, including base URL and authentication details.
     */
    constructor(config: ApiServiceConfig) {
        this.logger = serviceManager.getLogger();

        const headers = this.createAuthHeader(config.apiKey, config.authType || "Bearer");

        this.client = axios.create({
            baseURL: config.baseURL,
            headers: {
                ...headers,
                "Content-Type": "application/json"
            }
        });
        this.logger.debug(`Axios Client Started: ${this.client} | ${config.baseURL}`);
    }

    /**
     * Creates an authentication header based on the specified authentication type.
     * 
     * @param apiKey - The API key or token used for authentication.
     * @param authType - The type of authentication to apply.
     *   - `Bearer`: Includes the API key in the Authorization header as a Bearer token.
     *   - `X-Api-Key`: Includes the API key in the `X-Api-Key` header.
     *   - `Custom`: Subclasses can customize the authentication logic.
     * 
     * @returns An object containing the appropriate authentication header(s).
     * 
     * @throws {Error} If the provided `authType` is unsupported.
     */
    protected createAuthHeader(apiKey: string, authType: "Bearer" | "X-Api-Key" | "Custom"): Record<string, string> {
        switch (authType) {
            case "Bearer":
                return { Authorization: `Bearer ${apiKey}` };
            case "X-Api-Key":
                return { "X-Api-Key": apiKey };
            case "Custom":
                return {};
            default:
                throw new Error(`Unsupported auth type: ${authType}`);
        }
    }
    
    /**
     * Makes a GET request to the specified API endpoint.
     * 
     * @param endpoint - The relative URL of the API endpoint.
     * @returns A promise that resolves with the response data.
     */
    public async get(endpoint: string): Promise<any> {
        return this.client.get(endpoint);
    }

    /**
     * Makes a POST request to the specified API endpoint with the provided data.
     * 
     * @param endpoint - The relative URL of the API endpoint.
     * @param data - The payload to send with the POST request.
     * @returns A promise that resolves with the response data.
     */
    public async post(endpoint: string, data: any): Promise<any> {
        return this.client.post(endpoint, data);
    }

    // TODO

}

export default ApiService;