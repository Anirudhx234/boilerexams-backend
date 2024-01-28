import Axios from "axios";

export class AnalyticsApi {
    private static axios = Axios.create();

    private static async refreshToken() {
        if (!AnalyticsApi.axios.defaults.headers.Authorization) {
            AnalyticsApi.axios.defaults.baseURL = `${process.env.ANALYTICS_SERVER_URL}`;
            const response = await AnalyticsApi.axios.post(`/auth/login`, {
                username: process.env.ANALYTICS_USERNAME,
                password: process.env.ANALYTICS_PASSWORD,
            });
            AnalyticsApi.axios.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        }
    }

    public static async getActiveVisitors() {
        await AnalyticsApi.refreshToken();

        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/active`);

        return response.data as ActiveResponse;
    }

    public static async getEvents(options: EventParams) {
        await AnalyticsApi.refreshToken();

        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/events`, {
            params: {
                ...options,
            },
        });

        return response.data as EventResponse;
    }

    public static async getPageviews(options: PageviewParams) {
        await AnalyticsApi.refreshToken();

        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/pageviews`, {
            params: {
                ...options,
            },
        });

        return response.data as PageviewsResponse;
    }

    public static async getMetrics(options: MetricParams) {
        await AnalyticsApi.refreshToken();
        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/metrics`, {
            params: {
                ...options,
            },
        });
        return response.data as MetricsResponse;
    }

    public static async getStats(options: StatParams) {
        await AnalyticsApi.refreshToken();
        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/stats`, {
            params: {
                ...options,
            },
        });
        return response.data as StatsResponse;
    }
}
