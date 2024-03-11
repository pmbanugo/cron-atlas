import { FUNCTION_RUNTIME_OPTIONS } from "@cron-atlas/workflow";
import {
  maxLength,
  minLength,
  object,
  string,
  picklist,
  merge,
  url,
  startsWith,
  mimeType,
  maxSize,
  minSize,
  instance,
} from "valibot";
import { JOB_TYPES, SCHEDULE_TYPES } from "~/data/types";

export const BaseJobInputSchema = object({
  name: string([minLength(2), maxLength(100)]),
  jobType: picklist(JOB_TYPES),
  scheduleType: picklist(SCHEDULE_TYPES),
  schedule: string(),
});

export const UrlJobInputSchema = merge([
  BaseJobInputSchema,
  object({
    url: string([url(), startsWith("https://")]),
    jobType: picklist(["url"]),
  }),
]);

export const ScheduledFunctionInputSchema = merge([
  BaseJobInputSchema,
  object({
    jobType: picklist(["function"]),
    runtime: picklist(FUNCTION_RUNTIME_OPTIONS, "Invalid runtime value"),
    file: instance(File, "Please select a function handler file.", [
      mimeType(
        ["text/javascript"],
        "Please ensure that the uploaded file is a JavaScript file."
      ),
      maxSize(1024 * 1024 * 2, "Please select a file smaller than 2 MB."),
      //using 50 bytes as the minimum size for the file. A guess, but it's a guess that's likely to be correct
      minSize(50, "Please select a file that's not empty"),
    ]),
  }),
]);

export const FunctionFileUploadInputSchema = object({
  runtime: picklist(FUNCTION_RUNTIME_OPTIONS, "Invalid runtime value"),
  file: instance(File, "Please select a function handler file.", [
    mimeType(
      ["text/javascript"],
      "Please ensure that the uploaded file is a JavaScript file."
    ),
    maxSize(1024 * 1024 * 2, "Please select a file smaller than 2 MB."),
    //using 50 bytes as the minimum size for the file. A guess, but it's a guess that's likely to be correct
    minSize(50, "Please select a file that's not empty"),
  ]),
});
