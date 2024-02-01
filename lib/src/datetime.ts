import { Duration } from "./duration";
export class DateTime {
    private static unixEpoch: Required<DateTimeData> = {
        year: 1970,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        seconds: 0,
        milliseconds: 0,
        timezoneOffset: 0,
    };

    public static JANUARY: Month = 1;
    public static FEBRUARY: Month = 2;
    public static MARCH: Month = 3;
    public static APRIL: Month = 4;
    public static MAY: Month = 5;
    public static JUNE: Month = 6;
    public static JULY: Month = 7;
    public static AUGUST: Month = 8;
    public static SEPTEMBER: Month = 9;
    public static OCTOBER: Month = 10;
    public static NOVEMBER: Month = 11;
    public static DECEMBER: Month = 12;

    private readonly _data: Required<DateTimeData>;

    protected constructor(data: DateTimeData) {
        this._data = { ...DateTime.unixEpoch, ...data };
    }

    // region conversion
    public static parse(dateString: string): DateTime {
        return this.fromDate(new Date(Date.parse(dateString)));
    }

    public static now(): DateTime {
        return this.fromDate(new Date());
    }

    public static getTimezoneOffsetByName(timezoneName: string): number {
        const dateText = Intl.DateTimeFormat([], { timeZone: timezoneName, timeZoneName: "longOffset" }).format(new Date);
        const timezoneString = dateText.split(" ")[1].slice(3) || '+0';
        const [hourOffset, minuteOffset] = timezoneString.split(':');

        let timezoneOffset = parseInt(hourOffset) * 60;

        if (minuteOffset) {
            timezoneOffset = timezoneOffset + parseInt(minuteOffset);
        }

        return timezoneOffset / 60;

    }

    public static fromUnixTime(millisecondsSinceEpoch: number, timezoneOffset: number = 0): DateTime {
        return this.fromDate(new Date(millisecondsSinceEpoch)).copyWith({ timezoneOffset });
    }

    public static fromDate(date: Date): DateTime {
        return new DateTime({
            year: date.getFullYear(),
            month: (date.getMonth() + 1) as Month,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            seconds: date.getSeconds(),
            milliseconds: date.getMilliseconds(),
            timezoneOffset: date.getTimezoneOffset(),
        });
    }

    public static UTC(
        year: number,
        month: Month,
        day: number,
        hour: number,
        minute: number,
        seconds: number,
        milliseconds: number = 0,
    ) {
        return new DateTime({ year, month, day, hour, minute, seconds, milliseconds });
    }

    public static Local(
        year: number,
        month: Month,
        day: number = 1,
        hour: number = 0,
        minute: number = 0,
        seconds: number = 0,
        milliseconds: number = 0,
        timezoneOffset: number = 0
    ) {
        return new DateTime({ year, month, day, hour, minute, seconds, milliseconds, timezoneOffset });
    }

    private toIsoString(): string {
        const year = this.year.toFixed(0).padStart(4, "0");
        const month = this.month.toFixed(0).padStart(2, "0");
        const day = this.day.toFixed(0).padStart(2, "0");
        const hour = this.hour.toFixed(0).padStart(2, "0");
        const minute = this.minute.toFixed(0).padStart(2, "0");
        const seconds = this.seconds.toFixed(0).padStart(2, "0");
        const milliseconds = this.milliseconds.toFixed(0).padStart(3, "0");
        const hourOffset = 1;
        const partialHourDiff = 0.5;
        const minuteOffset = 60 * partialHourDiff;
        const timezoneOffset = `${this.timezoneOffset >= 0 ? "+" : "-"}${hourOffset.toFixed(0).padStart(2, "0")}${minuteOffset.toFixed(0).padStart(2, "0")}`;
        return `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${milliseconds}${timezoneOffset}`;
    }

    public toLocalIsoString(): string {
        return this.toIsoString();
    }

    public toUTCIsoString(): string {
        return this.copyWith({ timezoneOffset: 0 }).toIsoString();
    }

    public toLocalUnixTime(): number {
        return this.toLocalDate().getTime();
    }

    public toUTCUnixTime(): number {
        return this.toUTCDate().getTime();
    }

    public toLocalDate(): Date {
        return this.convertTimezone(0).toUTCDate();
    }

    public toUTCDate(): Date {
        return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.seconds, this.milliseconds));
    }

    // endregion

    // region accessor
    public get year(): number {
        return this._data.year;
    }

    public get month(): Month {
        return this._data.month;
    }

    public get day(): number {
        return this._data.day;
    }

    public get hour(): number {
        return this._data.hour;
    }

    public get minute(): number {
        return this._data.minute;
    }

    public get seconds(): number {
        return this._data.seconds;
    }

    public get milliseconds(): number {
        return this._data.milliseconds;
    }

    public get timezoneOffset(): number {
        return this._data.timezoneOffset;
    }

    public get data() {
        return this._data;
    }
    //endregion

    // region calculation
    public copyWith(data: DateTimeData): DateTime {
        return new DateTime({ ...this._data, ...data });
    }

    public convertTimezone(timezoneOffset: number): DateTime {
        const diff = timezoneOffset - this.timezoneOffset;
        const fullHourDiff = Math.round(diff);
        const partialHourDiff = diff - fullHourDiff;
        const minuteDiff = 60 * partialHourDiff;

        return diff > 0
            ? this.add(new Duration({ hours: fullHourDiff, minutes: minuteDiff })).copyWith({ timezoneOffset })
            : this.substract(new Duration({ hours: fullHourDiff, minutes: minuteDiff })).copyWith({ timezoneOffset });
    }

    public add(duration: Duration): DateTime {
        if (!duration.isPositive) throw Error("Cannot add negative duration to DateTime. Use DateTime.substract instead");
        // important to use toUTCDate here as it keeps the exact millisecond. Timezone is hard-ignored here because it will be handled by the toLocal methods based on the DateTime data (reparsing)
        const date = this.toUTCDate();

        // Date constructor actually handles calculations like last day of month based on the input. e.g. first day of next month therefore Date.UTC(2023, 11, 32) === Date.UTC(2024, 0, 1) or aka. New Years Day
        const futureDate = Date.UTC(
            date.getFullYear() + duration.years,
            date.getMonth() + duration.months,
            date.getDate() + duration.days,
            date.getHours() + duration.hours,
            date.getMinutes() + duration.minutes,
            date.getSeconds() + duration.seconds,
            date.getMilliseconds() + duration.milliseconds
        );

        // important call copyWith to ensure timezone is not set to UTC. This is needed so that the toLocal methods can work correctly
        return DateTime.fromDate(new Date(futureDate)).copyWith({ timezoneOffset: this.timezoneOffset });
    }

    public substract(duration: Duration): DateTime {
        if (!duration.isPositive) throw Error("Cannot substract negative duration from DateTime. Use DateTime.add instead");
        // important to use toUTCDate here as it keeps the exact millisecond. Timezone is hard-ignored here because it will be handled by the toLocal methods based on the DateTime data (reparsing)
        const date = this.toUTCDate();

        // Date constructor actually handles calculations like last day of month based on the input. e.g. day = 0 last day of previous month therefore Date.UTC(2024, 0, 0) === Date.UTC(2023, 11, 31) or aka. Silvester
        const pastDate = Date.UTC(
            date.getFullYear() - duration.years,
            date.getMonth() - duration.months,
            date.getDate() - duration.days,
            date.getHours() - duration.hours,
            date.getMinutes() - duration.minutes,
            date.getSeconds() - duration.seconds,
            date.getMilliseconds() - duration.milliseconds
        );

        // important call copyWith to ensure timezone is not set to UTC. This is needed so that the toLocal methods can work correctly
        return DateTime.fromDate(new Date(pastDate)).copyWith({ timezoneOffset: this.timezoneOffset });
    }
    // endregion

    // region comparision
    public isSameAs(other: DateTime): boolean {
        return this.toUTCUnixTime() === other.toUTCUnixTime();
    }

    public isAfter(other: DateTime): boolean {
        return this.toUTCUnixTime() > other.toUTCUnixTime();
    }

    public isBefore(other: DateTime): boolean {
        return this.toUTCUnixTime() < other.toUTCUnixTime();
    }

    public diff(other: DateTime): Duration {
        return new Duration({
            years: Math.abs(this.year - other.year),
            months: Math.abs(this.month - other.month),
            days: Math.abs(this.day - other.day),
            hours: Math.abs(this.hour - other.hour),
            minutes: Math.abs(this.minute - other.minute),
            seconds: Math.abs(this.seconds - other.seconds),
            milliseconds: Math.abs(this.milliseconds - other.milliseconds),
            isPositive: this.isAfter(other),
        });
    }

    // endregion
}

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type DateTimeData = {
    year?: number;
    month?: Month;
    day?: number;
    hour?: number;
    minute?: number;
    seconds?: number;
    milliseconds?: number;
    timezoneOffset?: number;
};
