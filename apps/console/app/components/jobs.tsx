import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Job } from "~/data/schema";
import { Link } from "@remix-run/react";
import type { ScheduleType } from "~/data/types";

const scheduleTypes = {
  interval: "Interval",
  cron: "Cron Expression",
  once: "Once",
} as const satisfies Record<ScheduleType, string>;

type Jobs = Pick<Job, "id" | "name" | "schedule" | "endpoint">[];

export function JobsTable({ jobs }: { jobs: Jobs }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Schedule Type</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map(({ name, schedule, id }) => (
              <TableRow key={id}>
                <TableCell>{name}</TableCell>
                <TableCell>{scheduleTypes[schedule.type]}</TableCell>
                <TableCell>
                  {schedule.type === "once"
                    ? new Date(schedule.value).toLocaleString()
                    : schedule.value}
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
                        <Link className="w-full" to={`/jobs/${id}`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link className="w-full" to={`/jobs/${id}/runs`}>
                          Recent Runs
                        </Link>
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
  );
}
