type AnalyticTime = "year" | "month" | "day" | "hour";
type AnalyticType = "url" | "referrer" | "browser" | "os" | "device" | "country" | "event";

type EventParams = {
    startAt: number,
    endAt: number,
    unit: AnalyticTime,
    url?: string,
    eventName?: string,
}

type PageviewParams = {
    startAt: number,
    endAt: number,
    unit: AnalyticTime,
    url?: string,
    referrer?: string,
    pageTitle?: string,
    os?: string,
    browser?: string,
    device?: string,
    country?: string,
    region?: string,
    city?: string,
}

type StatsParams = {
    startAt: number,
    endAt: number,
    url?: string,
    referrer?: string,
    title?: string,
    os?: string,
    browser?: string,
    device?: string,
    country?: string,
    region?: string,
    city?: string,
}

type MetricParams = {
    startAt: number,
    endAt: number,
    type: AnalyticType,
    unit?: AnalyticTime,
    url?: string,
    referrer?: string,
    pageTitle?: string,
    os?: string,
    browser?: string,
    device?: string,
    country?: string,
    region?: string,
    city?: string,
}

type AnalyticEvents = {
    "name": string,
    "date": string,
    "count": number,
}

type AnalyticsPageviews = {
    pageviews: {
        date: string,
        count: number,
    }[],
    sessions: {
        date: string,
        count: number,
    }[]
}

type AnalyticStats = {
    pageviews: { value: number, change: number },
    uniques: { value: number, change: number },
    bounces: { value: number, change: number },
    totalTime: { value: number, change: number },
}

type AnalyticMetrics = {
    value: string,
    count: number,
}[]