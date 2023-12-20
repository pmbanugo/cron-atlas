import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Job } from "~/data/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState } from "react";
import type { ScheduleType } from "~/data/types";
import { FormInfo } from "./form";

const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

const ONCE_PLACEHOLDER = "e.g. 2021-09-01T00:00:00Z";

export type CronJobFormData = {
  name: string | null;
  url: string | null;
  schedule: string | null;
  scheduleType: string | null;
};

export function CronJobForm({
  job,
}: {
  job?: Pick<Job, "name" | "schedule" | "endpoint">;
}) {
  const transition = useNavigation();
  const navigate = useNavigate();
  const [schedulePlaceholder, setSchedulePlaceholder] = useState(
    job?.schedule.type
      ? getSchedulePlaceholder(job.schedule.type)
      : "e.g. 2.5 hrs"
  );

  return (
    <Form method="post" className="space-y-8">
      <fieldset
        disabled={transition.state === "submitting"}
        className="space-y-8"
      >
        <div className="space-y-2">
          <div>
            <Label>Name</Label>
            <Input
              placeholder="e.g call lambda function"
              name="name"
              type="text"
              defaultValue={job?.name}
              maxLength={100}
              required
            />
            <FormInfo>*maximum of hundred characters</FormInfo>
          </div>
          <div>
            <Label>URL</Label>
            <Input
              placeholder="https://example.com"
              name="url"
              type="url"
              defaultValue={job?.endpoint.url}
              readOnly={!!job}
              required
            />
          </div>
          <div className="flex gap-2">
            <div>
              <Label>Type</Label>
              <Select
                name="scheduleType"
                defaultValue={
                  job
                    ? job.schedule.type
                    : ("interval" satisfies keyof typeof scheduleTypes)
                }
                onValueChange={(value) => {
                  setSchedulePlaceholder(
                    getSchedulePlaceholder(value as keyof typeof scheduleTypes)
                  );
                }}
                required
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scheduleTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-auto">
              <Label>Schedule</Label>
              <Input
                defaultValue={job?.schedule.value}
                placeholder={schedulePlaceholder}
                name="schedule"
                type={
                  schedulePlaceholder === ONCE_PLACEHOLDER
                    ? "datetime-local"
                    : "text"
                }
                required
              />
              <FormInfo>*Time is resolved in UTC</FormInfo>
            </div>
          </div>
        </div>

        {/* {actionData?.error ? (
            <div className="space-y-2">
              <FormErrorMessage>{actionData.error}</FormErrorMessage>
            </div>
          ) : null} */}
        <div className="space-x-2">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {transition.state === "submitting" ? "Saving..." : "Save"}
          </Button>
        </div>
      </fieldset>
    </Form>
  );
}

function getSchedulePlaceholder(value: keyof typeof scheduleTypes) {
  switch (value) {
    case "interval":
      return "e.g. 2.5 hrs";
    case "cron":
      return "e.g. * * * * *";
    case "once":
      return ONCE_PLACEHOLDER;

    default:
      break;
  }
}
