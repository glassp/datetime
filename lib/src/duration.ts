export class Duration {
    private readonly _data: Required<DurationData>;
    public constructor(data: DurationData) {
        this._data = {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
            isPositive: true,
            ...data,
        };
    }

    public get years(): number {
        return this._data.years;
    }

    public get months(): number {
        return this._data.months;
    }

    public get days(): number {
        return this._data.days;
    }

    public get hours(): number {
        return this._data.hours;
    }

    public get minutes(): number {
        return this._data.minutes;
    }

    public get seconds(): number {
        return this._data.seconds;
    }

    public get milliseconds(): number {
        return this._data.milliseconds;
    }

    public get isPositive(): boolean {
        return this._data.isPositive;
    }
}

export type DurationData = {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    isPositive?: boolean;
};
