import Axios from "axios";

export class AnalyticsApi {
    private static axios = Axios.create();
    private static async refreshToken() {
        if (!AnalyticsApi.axios.defaults.headers.Authorization) {
            AnalyticsApi.axios.defaults.baseURL = `${process.env.ANALYTICS_SERVER_URL}`;
            const response = await AnalyticsApi.axios.post(`/auth/login`, {
                username: process.env.ANALYTICS_USERNAME,
                password: process.env.ANALYTICS_PASSWORD
            });
            AnalyticsApi.axios.defaults.headers.Authorization = `Bearer ${response.data.token}`;
        }
    }
    public static async getActiveVisitors() {
        await AnalyticsApi.refreshToken();

        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/active`);

        return response.data[0].x as number;
    }

    public static async getEvents(options: EventParams) {
        await AnalyticsApi.refreshToken();

        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/events`, {
            params: {
                startAt: options.startAt,
                endAt: options.endAt,
                unit: options.unit,
                timezone: "America/Indianapolis",
                url: options.url,
                eventName: options.eventName,
            }
        });

        return response.data.map((event: { x: string; t: string; y: number; }) => {
            return { name: event.x, date: event.t, count: event.y };
        }) as AnalyticEvents[];
    }

    public static async getPageviews(options: PageviewParams) {
        await AnalyticsApi.refreshToken();

        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/pageviews`, {
            params: {
                startAt: options.startAt,
                endAt: options.endAt,
                unit: options.unit,
                timezone: "America/Indianapolis",
                url: options.url,
                referrer: options.referrer,
                pageTitle: options.pageTitle,
                os: options.os,
                browser: options.browser,
                device: options.device,
                country: options.country,
                region: options.region,
                city: options.region,
            },
        });

        return {
            pageviews: response.data.pageviews.map((pageview: { x: string; y: number; }) => {
                return {
                    date: pageview.x,
                    count: pageview.y
                };
            }),
            sessions: response.data.sessions.map((session: { x: string; y: number; }) => {
                return {
                    date: session.x,
                    count: session.y
                };
            }),
        } as AnalyticsPageviews;
    }

    public static async getMetrics(options: MetricParams) {
        await AnalyticsApi.refreshToken();
        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/metrics`, {
            params: {
                startAt: options.startAt,
                endAt: options.endAt,
                type: options.type,
                url: options.url,
                referrer: options.referrer,
                os: options.os,
                browser: options.browser,
                device: options.device,
                country: options.country,
                region: options.region,
                city: options.region,
            },
        });
        return response.data.map((metric: { x: string; y: number; }) => {
            return {
                value: metric.x,
                count: metric.y
            };
        }) as AnalyticMetrics;
    }

    public static async getStats(options: StatsParams) {
        await AnalyticsApi.refreshToken();
        const response = await AnalyticsApi.axios.get(`/websites/${process.env.ANALYTICS_ID}/stats`, {
            params: {
                startAt: options.startAt,
                endAt: options.endAt,
                url: options.url,
                referrer: options.referrer,
                os: options.os,
                browser: options.browser,
                device: options.device,
                country: options.country,
                region: options.region,
                city: options.region,
            },
        });
        return response.data as AnalyticStats;
    }
}