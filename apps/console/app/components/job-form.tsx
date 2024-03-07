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
import type { JobType, ScheduleType } from "~/data/types";
import { FormErrorMessage, FormInfo } from "./form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MinusCircle, PlusCircle } from "lucide-react";
import type { FunctionRuntime } from "@cron-atlas/workflow";

const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

const jobTypes = {
  url: "URL",
  function: "Scheduled Function",
} as const satisfies Record<JobType, string>;

export const formTypes = {
  functionUpload: "function-upload",
} as const;

const runtimes = {
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
  scheduleType?: ScheduleType;
  jobType?: JobType;
  runtime?: FunctionRuntime;
  file?: File;
};

export function CronJobForm({
  job,
}: {
  job?: Pick<
    Job,
    "name" | "schedule" | "endpoint" | "jobType" | "functionConfig"
  >;
}) {
  const transition = useNavigation();
  const navigate = useNavigate();
  const [schedulePlaceholder, setSchedulePlaceholder] = useState(
    job?.schedule.type
      ? getSchedulePlaceholder(job.schedule.type)
      : "e.g. 2.5 hrs"
  );
  const [jobType, setJobType] = useState<JobType>(
    job?.jobType ? job.jobType : "function"
  );

  const actionData = useActionData<{ errors?: Record<string, string> }>();

  return (
    <>
      <Card className="p-6">
        <Form
          method="post"
          className="space-y-8"
          encType="multipart/form-data"
          autoComplete="off"
        >
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
                    <FormErrorMessage>
                      {actionData.errors.name}
                    </FormErrorMessage>
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
                        getSchedulePlaceholder(
                          value as keyof typeof scheduleTypes
                        )
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
                    defaultValue={
                      job?.jobType
                        ? job.jobType
                        : ("function" satisfies JobType)
                    }
                    disabled={!!job}
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
                  {!!job && (
                    <input type="hidden" name="jobType" value={job.jobType} />
                  )}
                </div>
                {jobType === "function" ? (
                  <>
                    <div>
                      <Label>Runtime</Label>
                      <Select
                        name="runtime"
                        defaultValue={
                          job?.functionConfig?.runtime
                            ? job.functionConfig.runtime
                            : ("nodejs-alpine" satisfies FunctionRuntime)
                        }
                        required
                        disabled={!!job}
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
                    {!job && (
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
                    )}
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

              {!job && jobType === "function" && <SecretsForm />}
            </div>

            {actionData?.errors?.generic ? (
              <div>
                <FormErrorMessage>{actionData.errors.generic}</FormErrorMessage>
              </div>
            ) : null}
            <div className="space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {transition.state === "submitting" ? "Saving..." : "Save"}
              </Button>
            </div>
          </fieldset>
        </Form>
      </Card>

      {job && job.jobType === "function" ? (
        <FunctionUpdateForm
          runtime={job.functionConfig?.runtime ?? "nodejs-alpine"}
        />
      ) : null}
    </>
  );
}

function SecretsForm() {
  const [secretIds, setSecretIds] = useState([randomId()]);
  return (
    <div className="space-y-2 pt-4">
      <div className="font-medium">Secrets</div>
      <hr className="bg-border" />
      {secretIds.map((id) => (
        <div key={id} className="flex gap-2">
          <div className="flex-auto space-y-1">
            <Label>Key</Label>
            <Input placeholder="Key" id="secretKeys" name="secretKeys" />
          </div>
          <div className="flex-auto space-y-1">
            <Label>Value</Label>
            <Input placeholder="Value" id="secretValues" name="secretValues" />
          </div>
          <div className="flex-none place-self-center pt-5">
            <MinusCircle
              className="text-muted-foreground w-5 h-5 cursor-pointer"
              onClick={() => setSecretIds((ids) => ids.filter((x) => x !== id))}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setSecretIds((ids) => [...ids, randomId()])}
      >
        <PlusCircle className="w-4 h-4 mr-1" /> Add more
      </Button>
    </div>
  );
}

function FunctionUpdateForm({ runtime }: { runtime: FunctionRuntime }) {
  const actionData = useActionData<{ errors?: Record<string, string> }>();
  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Function File Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" encType="multipart/form-data" className="space-y-6">
          <div className="grid grid-cols-6 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="runtime">Runtime</Label>
              <Select
                name="runtime"
                defaultValue={runtime satisfies FunctionRuntime}
                required
              >
                <SelectTrigger>
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
            <div className="space-y-2 col-span-5">
              <Label htmlFor="file">Function File</Label>
              <Input
                name="file"
                id="file"
                type="file"
                multiple={false}
                accept="text/javascript,.js,.mjs,.cjs"
                required
              />
            </div>
            {actionData?.errors ? (
              <ul>
                {Object.entries(actionData.errors).map(([key, value]) => (
                  <li key={key} className="col-span-6">
                    <FormErrorMessage>{value}</FormErrorMessage>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            <Button type="submit">Upload</Button>
          </div>
          <input
            type="hidden"
            name="formType"
            value={formTypes.functionUpload}
          />
        </Form>
      </CardContent>
    </Card>
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

function randomId() {
  return Math.random().toString(32).slice(2);
}
