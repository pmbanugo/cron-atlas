# Documentation

## Getting Started

## Schedule specification

Cron Atlas currently has three schedule types: once, interval, and cron.

### Once

Jobs scheduled to run once allows a _datetime_ value, which you can supply using the date field on the page. This type of jobs only run once.

### Interval

You can use the schedule type to specify an interval for when the job should run. The value allowed is a number followed by character(s) to denote the timeframe. The timeframe could be represented as such:

- minute: any of _m_, _min_, _mins_, or _minutes_.
- hour: any of _h_, _hr_, _hrs_, or _hours_.
- day: any of _d_, _day_, or _days_.
- year: any of _y_, _year_, or _years_.

For example, you can set a job to run on an interval of `2.5 hrs`. The given value is then converted to a decimal value denoting the value in seconds. Using the given example, `2.5 hrs` gets converted to `9000` seconds.

> The interval for when the job should run is calculated using the formula `(currentTimestampUTC % interval) == 0`.

### Cron expression

Cron expression holds a traditional cron specification as a string. It accepts 5, 6, or 7 fields, separated by spaces.

- 5 fields: minute, hour, day of month, month, day of week.
- 6 fields: minute, hour, day of month, month, day of week, year.
- 7 fields: second, minute, hour, day of month, month, day of week, year.

If year is not given, it defaults to `*`. If second is not given, it defaults to `0`.

For day of week, it supports 0 to 6 standard values, and 7 to denote Sunday. You can alternatively use string values of _SUN_ to _SAT_.

For month, it supports 1 to 12 values, as well as _JAN_ to _DEC_ string.

Shorthands such as `@yearly`, `@monthly`, `@weekly`, `@daily`, and `@hourly` are also accepted instead of the 5-7 time fields.

## Timezone

The schedule is calculated in UTC. So the time entered from the console/dashboard is represented as UTC by default. In the future, you'll be allowed to specify a timezone used for the calculation.
