import { Request, Response } from "express";
import { AnalyticsApi } from "../services/analytics.api.js";

const getActiveVisitors = async (req: Request, res: Response) => {
    const activeResponse = await AnalyticsApi.getActiveVisitors();
    res.status(200).json(activeResponse[0].x);
};

const getEvents = async (req: Request, res: Response) => {
    const events = await AnalyticsApi.getEvents({
        ...parseEventParams(req),
    });

    res.status(200).send(events);
};

const getPageviews = async (req: Request, res: Response) => {
    const pageviewsResponse = await AnalyticsApi.getPageviews({
        ...parsePageviewParams(req),
    });

    const pageviews = pageviewsResponse.pageviews.map((pageview) => {
        return {
            since: pageview.x,
            total: pageview.y,
        };
    });

    const sessions = pageviewsResponse.sessions.map((session) => {
        return {
            since: session.x,
            total: session.y,
        };
    });

    res.status(200).send({
        pageviews: pageviews,
        sessions: sessions,
    });
};

const getMetrics = async (req: Request, res: Response) => {
    const metricsResponse = await AnalyticsApi.getMetrics({
        ...parseMetricsParams(req),
    });

    const metrics = metricsResponse.map((metric) => {
        return {
            value: metric.x,
            total: metric.y,
        };
    });

    res.status(200).send(metrics);
};

const getStats = async (req: Request, res: Response) => {
    const statsResponse = await AnalyticsApi.getStats({
        ...parseStatsParams(req),
    });

    res.status(200).send(statsResponse);
};

const parseBaseParams = (req: Request): BaseParams => {
    const startAt = req.query.startAt ? Number.parseInt(<string>req.query.startAt) : 1669784400000;
    const endAt = req.query.endAt ? Number.parseInt(<string>req.query.endAt) : Date.now();

    return {
        startAt: startAt,
        endAt: endAt,
        url: <string | undefined>req.query.url,
    };
};

const parseEventParams = (req: Request): EventParams => {
    const unit = req.query.unit ? <AnalyticsTime>req.query.unit : "year";

    return {
        ...parseBaseParams(req),
        unit: unit,
        timezone: "America/Indiana/Indianapolis",
        eventName: <string | undefined>req.query.eventName,
    };
};

const parseStatsParams = (req: Request): StatParams => {
    return {
        ...parseBaseParams(req),
        referrer: <string | undefined>req.query.referrer,
        pageTitle: <string | undefined>req.query.pageTitle,
        os: <string | undefined>req.query.os,
        browser: <string | undefined>req.query.browser,
        device: <string | undefined>req.query.device,
        country: <string | undefined>req.query.country,
        city: <string | undefined>req.query.city,
    };
};

const parsePageviewParams = (req: Request): PageviewParams => {
    const unit = req.query.unit ? <AnalyticsTime>req.query.unit : "year";

    return {
        ...parseStatsParams(req),
        unit: unit,
        timezone: "America/Indiana/Indianapolis",
    };
};

const parseMetricsParams = (req: Request): MetricParams => {
    const type = req.query.type ? <AnalyticsType>req.query.type : "url";

    return {
        ...parseStatsParams(req),
        type: type,
        unit: <AnalyticsTime | undefined>req.query.unit,
        timezone: "America/Indiana/Indianapolis",
    };
};

export { getActiveVisitors, getEvents, getPageviews, getMetrics, getStats };
