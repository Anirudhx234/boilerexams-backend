type ScheduledFunction = (...args: unknown[]) => unknown;

export default class Scheduler {
    public static schedule(next: ScheduledFunction, delay: number, interval: number, ...args: unknown[]) {
        console.log(`Scheduled ${next.name} with ${args.length} arguments`);
        setTimeout(async () => {
            try {
                await next(...args);
            } catch (error: unknown) {
                console.log(error);
            }
            if (interval > 0) {
                setInterval(async () => {
                    try {
                        await next(...args);
                    } catch (error: unknown) {
                        console.log(error);
                    }
                }, interval);
            }
        }, delay);
    }
}
