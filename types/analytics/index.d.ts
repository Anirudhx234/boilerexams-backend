type AnalyticsTime = "year" | "month" | "day" | "hour";

type AnalyticsType = "url" | "referrer" | "browser" | "os" | "device" | "country" | "event";

interface BaseParams {
    startAt: number;
    endAt: number;
    url?: string;
}

interface EventParams extends BaseParams {
    unit: string;
    timezone: string;
    eventName?: string;
}

interface StatParams extends BaseParams {
    referrer?: string;
    pageTitle?: string;
    os?: string;
    browser?: string;
    device?: string;
    country?: string;
    region?: string;
    city?: string;
}

interface PageviewParams extends StatParams {
    unit: AnalyticsTime;
    timezone: string;
}

interface MetricParams extends StatParams {
    type: AnalyticsType;
    unit?: AnalyticsTime,
    timezone?: string;
}

type ActiveResponse = {
    x: number
}[];

type EventResponse = {
    x: string,
    t: string,
    y: number
}[];

type PageviewsResponse = {
    pageviews: {
        x: string,
        y: number
    }[],
    sessions: {
        x: string,
        y: number
    }[];
};

type MetricsResponse = {
    x: string,
    y: number
}[];

type StatsResponse = {
    pageviews: {
        value: number,
        change: number
    },
    uniques: {
        value: number,
        change: number
    },
    bounces: {
        value: number,
        change: number
    },
    totaltime: {
        value: number,
        change: number
    }
}