import {Request, Response} from "express";
import {AnalyticsApi} from "../services/analytics.api.js";

const getActiveVisitors = async (req: Request, res: Response) => {
    const activeVisitors = await AnalyticsApi.getActiveVisitors();
    res.status(200).json(activeVisitors);
};

const getEvents = async (req: Request, res: Response) => {
    const {
        startAt,
        endAt,
        unit,
        url,
        eventName
    } = req.query;

    const events = await AnalyticsApi.getEvents({
        startAt: Number.parseInt(startAt as string),
        endAt: Number.parseInt(endAt as string),
        unit: unit as AnalyticTime,
        url: url as string,
        eventName: eventName as string
    });

    res.status(200).send(events);
};

const getPageviews = async (req: Request, res: Response) => {
    const {
        startAt,
        endAt,
        unit,
        url,
        referrer,
        pageTitle,
        os ,
        browser,
        device,
        country,
        region,
        city,
    } = req.query;

    const pageviews = await AnalyticsApi.getPageviews({
        startAt: Number.parseInt(startAt as string),
        endAt: Number.parseInt(endAt as string),
        unit: unit as AnalyticTime,
        url: url as string,
        referrer: referrer as string,
        pageTitle: pageTitle as string,
        os: os as string,
        browser: browser as string,
        device: device as string,
        country: country as string,
        region: region as string,
        city: city as string,
    });

    res.status(200).send(pageviews);
};

const getMetrics = async (req: Request, res: Response) => {
    const {
        startAt,
        endAt,
        type,
        unit,
        url,
        referrer,
        pageTitle,
        os,
        browser,
        device,
        country,
        region,
        city,
    } = req.query;

    const metrics = await AnalyticsApi.getMetrics({
        startAt: Number.parseInt(startAt as string),
        endAt: Number.parseInt(endAt as string),
        type: type as AnalyticType,
        unit: unit as AnalyticTime,
        url: url as string,
        referrer: referrer as string,
        pageTitle: pageTitle as string,
        os: os as string,
        browser: browser as string,
        device: device as string,
        country: country as string,
        region: region as string,
        city: city as string,
    });

    res.status(200).send(metrics);
};

const getStats = async (req: Request, res: Response) => {
    const {
        startAt,
        endAt,
        url,
        referrer,
        pageTitle,
        os,
        browser,
        device,
        country,
        region,
        city,
    } = req.query;

    const stats = await AnalyticsApi.getStats({
        startAt: Number.parseInt(startAt as string),
        endAt: Number.parseInt(endAt as string),
        url: url as string,
        referrer: referrer as string,
        title: pageTitle as string,
        os: os as string,
        browser: browser as string,
        device: device as string,
        country: country as string,
        region: region as string,
        city: city as string,
    });

    res.status(200).send(stats);
};

export {
    getActiveVisitors,
    getEvents,
    getPageviews,
    getMetrics,
    getStats
};