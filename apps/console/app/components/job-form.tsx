import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
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
import type { FunctionRuntime, JobType, ScheduleType } from "~/data/types";
import { FormErrorMessage, FormInfo } from "./form";

export const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

export const jobTypes = {
  url: "URL",
  function: "Scheduled Function",
} as const satisfies Record<JobType, string>;

export const runtimes = {
  "nodejs-alpine": "Node.js Alpine",
  "nodejs-debian": "Node.js Debian",
  "bun-alpine": "Bun Alpine",
  "bun-debian": "Bun Debian",
} as const satisfies Record<FunctionRuntime, string>;

const ONCE_PLACEHOLDER = "e.g. 2021-09-01T00:00:00Z";

export type CronJobFormData = {
  name?: string;
  url?: string;
  schedule?: string;
  scheduleType?: string;
  jobType?: JobType;
  runtime?: FunctionRuntime;
  file?: File;
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
  const [jobType, setJobType] = useState<JobType>("function");

  const actionData = useActionData<{ errors?: Record<string, string> }>();

  return (
    <Form method="post" className="space-y-8" encType="multipart/form-data">
      <fieldset
        disabled={transition.state === "submitting"}
        className="space-y-6"
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
            {actionData?.errors?.name ? (
              <div className="space-y-2">
                <FormErrorMessage>{actionData.errors.name}</FormErrorMessage>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <div>
              <Label>Schedule</Label>
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
              <Label>&nbsp;</Label>
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
              <FormInfo>
                Check the{" "}
                <a
                  href="https://github.com/pmbanugo/cron-atlas/blob/main/Documentation.md#schedule-specification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  documentation
                </a>{" "}
                for the schedule specification
              </FormInfo>
            </div>
          </div>

          <div className="flex gap-2">
            <div>
              <Label>Job Type</Label>
              <Select
                name="jobType"
                // TODO: render the default value of the select based on DB value
                defaultValue={"function" satisfies JobType}
                onValueChange={(value: JobType) => {
                  setJobType(value);
                }}
                required
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(jobTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {jobType === "function" ? (
              <>
                <div>
                  <Label>Runtime</Label>
                  <Select
                    name="runtime"
                    defaultValue={"nodejs-alpine" satisfies FunctionRuntime}
                    required
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(runtimes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-auto">
                  <Label>Function File</Label>
                  <Input
                    name="file"
                    id="file"
                    type="file"
                    multiple={false}
                    accept="text/javascript,.js,.mjs,.cjs"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="flex-auto">
                <Label>URL</Label>
                <Input
                  placeholder="https://example.com/cron"
                  name="url"
                  type="url"
                  defaultValue={job?.endpoint?.url}
                  readOnly={!!job}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {actionData?.errors?.generic ? (
          <div>
            <FormErrorMessage>{actionData.errors.generic}</FormErrorMessage>
          </div>
        ) : null}
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
