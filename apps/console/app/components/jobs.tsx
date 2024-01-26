import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Job } from "~/data/schema";
import { Link, useSubmit } from "@remix-run/react";
import type { JobType, ScheduleType } from "~/data/types";
import { useState } from "react";

const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

const jobTypes = {
  function: "Scheduled Function",
  url: "Remote Job (URL)",
} as const satisfies Record<JobType, string>;

type JobDTO = Pick<Job, "id" | "name" | "schedule" | "endpoint" | "jobType">;
type Jobs = JobDTO[];

export function JobsTable({ jobs }: { jobs: Jobs }) {
  const [jobToDelete, setJobToDelete] = useState<JobDTO | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Schedule Type</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{jobTypes[job.jobType]}</TableCell>
                  <TableCell>{scheduleTypes[job.schedule.type]}</TableCell>
                  <TableCell>
                    {job.schedule.type === "once"
                      ? new Date(job.schedule.value).toLocaleString()
                      : job.schedule.value}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem>
                          <Link className="w-full" to={`/jobs/${job.id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link className="w-full" to={`/jobs/${job.id}/runs`}>
                            Recent Runs
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setJobToDelete(job)}
                        >
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={true}>
                          Trigger
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No result.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {jobToDelete !== null && (
        <DeleteDialog job={jobToDelete} onClose={() => setJobToDelete(null)} />
      )}
    </>
  );
}

function DeleteDialog({ job, onClose }: { job: JobDTO; onClose: () => void }) {
  const submit = useSubmit();

  return (
    <AlertDialog
      defaultOpen={true}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete "
            {job.name}" and any planned run.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              submit(null, {
                method: "POST",
                action: `/jobs/${job.id}/delete`,
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
