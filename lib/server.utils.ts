import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import z from "zod";
// import { Types } from 'mongoose';
import {
  cloudinarySecureUrlBase,
  getCloudinaryFolderName,
  uploadToCloudinary,
} from "@/config/cloudinary";
import { IBusinessHours } from "./types";
interface UploadOptions {
  folderSuffix?: string; // blog | category | user | etc
  resourceType?: "image" | "video" | "auto" | "raw";
}

export function apiResponse<T = undefined>(
  status: boolean,
  statusCode: number = 200,
  message: string,
  data?: T,
  pagination?: T,
) {
  return NextResponse.json(
    {
      status,
      message,
      data,
      pagination,
    },
    { status: statusCode },
  );
}

export function generateSignature<T extends object>(
  payload: T,
  expiresIn: number,
) {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, { expiresIn });
}

export function isTokenExpired(exp?: number): boolean {
  if (!exp) return false;
  const now = Date.now() / 1000;
  return now >= exp;
}

export const makePaginate = <T>(
  docs: T[],
  page: number,
  limit: number,
  skip: number,
  total: number,
) => {
  const hasNext = total > skip + Number(limit);
  const hasPrev = Number(page) > 1;

  return {
    docs,
    page: +page,
    limit: +limit,
    totalPage: Math.ceil(total / Number(limit)),
    totalDocs: total,
    hasNext,
    hasPrev,
  };
};

export const uploadImage = async (image: File, options?: UploadOptions) => {
  const folderName = await getCloudinaryFolderName();

  const { public_id, secure_url } = await uploadToCloudinary(image, {
    folder: options?.folderSuffix
      ? `${folderName}/${options.folderSuffix}`
      : folderName,
    resourceType: options?.resourceType ? options?.resourceType : "image",
  });

  return {
    public_id,
    secure_url,
  };
};

export const convertToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // Handle File objects
    if (value instanceof File) {
      formData.append(key, value);
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (
          typeof item === "object" &&
          item !== null &&
          !(item instanceof File)
        ) {
          // Handle array of objects
          Object.entries(item).forEach(([nestedKey, nestedValue]) => {
            formData.append(
              `${key}[${index}].${nestedKey}`,
              String(nestedValue),
            );
          });
        } else if (item instanceof File) {
          // Handle array of files
          formData.append(`${key}[${index}]`, item);
        } else {
          // Handle array of primitives
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    }
    // Handle nested objects (non-array)
    else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        formData.append(`${key}.${nestedKey}`, String(nestedValue));
      });
    }
    // Handle primitive values
    else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export const extractFormData = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  formData: FormData,
): T => {
  const textData: Record<string, unknown> = {};
  const arrays: Record<string, unknown[]> = {};

  formData.forEach((value, key) => {
    if (!(value instanceof File)) {
      const arrayMatch = key.match(/^(.+)\[(\d+)\]\.?(.*)$/);

      if (arrayMatch) {
        const [, arrayName, index, nestedKey] = arrayMatch;
        const idx = parseInt(index, 10);

        if (!arrays[arrayName]) {
          arrays[arrayName] = [];
        }

        if (nestedKey) {
          if (!arrays[arrayName][idx]) {
            arrays[arrayName][idx] = {};
          }
          (arrays[arrayName][idx] as Record<string, unknown>)[nestedKey] =
            value;
        } else {
          arrays[arrayName][idx] = value;
        }
      } else {
        textData[key] = value;
      }
    }
  });

  Object.entries(arrays).forEach(([key, value]) => {
    textData[key] = value;
  });

  return textData as T;
};

function minutesToTime(minutes: number): string {
  if (minutes < 0 || minutes > 1439) {
    throw new Error("Minutes must be between 0 and 1439");
  }

  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  // Only include minutes if they're not zero
  if (mins === 0) {
    return `${hours} ${period}`;
  }

  return `${hours}:${mins.toString().padStart(2, "0")} ${period}`;
}

function getDayName(dayOfWeek: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfWeek];
}

function formatGroup(group: IBusinessHours[], schedule: string): string {
  if (group.length === 1) {
    return `${getDayName(group[0].dayOfWeek)} - ${schedule}`;
  }

  // Check if days are consecutive
  const isConsecutive = group.every((day, index) => {
    if (index === 0) return true;
    return day.dayOfWeek === group[index - 1].dayOfWeek + 1;
  });

  if (isConsecutive) {
    // Format as range: "Monday to Friday"
    return `${getDayName(group[0].dayOfWeek)} to ${getDayName(
      group[group.length - 1].dayOfWeek,
    )} - ${schedule}`;
  } else {
    // Format as list: "Monday & Wednesday & Friday"
    const dayNames = group.map((day) => getDayName(day.dayOfWeek));
    return `${dayNames.join(" & ")} - ${schedule}`;
  }
}

export function formatBusinessHours(businessHours: IBusinessHours[]): string[] {
  if (!businessHours || businessHours.length === 0) {
    return [];
  }

  // Sort by dayOfWeek
  const sorted = [...businessHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const result: string[] = [];
  let currentGroup: IBusinessHours[] = [];
  let currentSchedule = "";

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const schedule = current.isClosed
      ? "Closed"
      : `${minutesToTime(current.openTime)} - ${minutesToTime(
          current.closeTime,
        )}`;

    // Start a new group
    if (currentGroup.length === 0) {
      currentGroup.push(current);
      currentSchedule = schedule;
    }
    // Continue current group if schedule matches
    else if (schedule === currentSchedule) {
      currentGroup.push(current);
    }
    // Save current group and start new one
    else {
      result.push(formatGroup(currentGroup, currentSchedule));
      currentGroup = [current];
      currentSchedule = schedule;
    }
  }

  // Add the last group
  if (currentGroup.length > 0) {
    result.push(formatGroup(currentGroup, currentSchedule));
  }

  return result;
}

export const transformCloudinaryPaths = async (
  data: any,
  folderName: string,
): Promise<any> => {
  if (!data || !folderName) return data;
  const CLOUDINARY_SECURE_URL_BASE = await cloudinarySecureUrlBase();

  const baseUrl = CLOUDINARY_SECURE_URL_BASE || "";
  const folderPattern = `${folderName}/`;
  const defaultFolderPattern = "uploads/";

  // Handle arrays

  if (Array.isArray(data)) {
    return Promise.all(
      data.map((item) => transformCloudinaryPaths(item, folderName)),
    );
  }

  // Handle objects
  if (typeof data === "object" && data !== null) {
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === "string" &&
        (value.startsWith(folderPattern) ||
          value.startsWith(defaultFolderPattern))
      ) {
        transformed[key] = `${baseUrl}/${value}`;
      } else if (typeof value === "object") {
        transformed[key] = await transformCloudinaryPaths(value, folderName);
      } else {
        transformed[key] = value;
      }
    }

    return transformed;
  }

  // Handle primitive values
  if (
    typeof data === "string" &&
    (data.startsWith(folderPattern) || data.startsWith(defaultFolderPattern))
  ) {
    return `${baseUrl}/${data}`;
  }

  return data;
};

export const requiredStringField = (fieldName: string) =>
  z
    .string({
      error: (issue) => {
        if (issue.input === undefined) {
          return `${fieldName} is required!`;
        }
        return `${fieldName} must be string!`;
      },
    })
    .transform((val) => val.trim())
    .refine((str) => str.length > 0, {
      message: `${fieldName} must not be empty!`,
    });

export const requiredStringFieldLowerCase = (fieldName: string) =>
  z
    .string({
      error: (issue) => {
        if (issue.input === undefined) {
          return `${fieldName} is required!`;
        }
        return `${fieldName} must be string!`;
      },
    })
    .transform((val) => val.trim().toLowerCase())
    .refine((str) => str.length > 0, {
      message: `${fieldName} must not be empty!`,
    });

export const optionalStringField = (fieldName: string) =>
  z
    .string({ error: () => `${fieldName} must be string!` })
    .transform((val) => val.trim())
    .refine((str) => str.length > 0, {
      message: `${fieldName} must not be empty!`,
    })
    .optional();

export const optionalStringFieldLowerCase = (fieldName: string) =>
  z
    .string({ error: () => `${fieldName} must be string!` })
    .transform((val) => val.trim().toLowerCase())
    .refine((str) => str.length > 0, {
      message: `${fieldName} must not be empty!`,
    })
    .optional();

export const requiredEnumField = <T extends readonly [string, ...string[]]>(
  fieldName: string,
  values: T,
) =>
  z.enum(values, {
    error: (issue) => {
      const input = issue.input;

      if (input === undefined) return `${fieldName} is required!`;

      if (typeof input !== "string") {
        return `${fieldName} must be a valid ${fieldName}!`;
      }

      return `${fieldName} must be one of: ${values.join(", ")}`;
    },
  });

export const requiredObjectIdField = (fieldName: string) =>
  z
    .string({
      error: (issue) => {
        const input = issue.input;

        if (input === undefined) return `${fieldName} is required!`;
        if (typeof input !== "string") return `${fieldName} must be a string!`;

        return `${fieldName} must be a valid ObjectId!`;
      },
    })
    .refine((val) => /^[a-fA-F0-9]{24}$/.test(val), {
      message: `${fieldName} must be a valid ObjectId!`,
    });

export const optionalEnumField = <T extends readonly [string, ...string[]]>(
  fieldName: string,
  values: T,
) =>
  z
    .enum(values, {
      error: () => `${fieldName} must be one of: ${values.join(", ")}`,
    })
    .optional();

export const optionalObjectIdField = (fieldName: string) =>
  z
    .string({ error: () => `${fieldName} must be a string!` })
    .refine((val) => /^[a-fA-F0-9]{24}$/.test(val), {
      message: `${fieldName} must be a valid ObjectId!`,
    })
    .optional();

export const booleanField = (fieldName: string, defaultValue?: boolean) => {
  const baseSchema = z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true") return true;
      if (val === "false") return false;
      throw new Error(`${fieldName} must be a boolean!`);
    })
    .optional();

  return defaultValue !== undefined
    ? baseSchema.default(defaultValue)
    : baseSchema;
};

export const requiredNumberField = (
  fieldName: string,
  enumValues?: number[],
) => {
  let schema = z.coerce.number({
    error: (issue) => {
      if (issue.input === undefined) {
        return `${fieldName} is required!`;
      }
      return `${fieldName} must be a number!`;
    },
  });

  if (enumValues && enumValues.length > 0) {
    schema = schema.refine((val) => enumValues.includes(val), {
      message: `${fieldName} must be one of: ${enumValues.join(", ")}`,
    });
  }

  return schema;
};

export const numberField = (fieldName: string, defaultValue?: number) => {
  const baseSchema = z.coerce
    .number({
      error: (issue) => {
        if (issue.input === undefined) {
          return `${fieldName} is required!`;
        }
        return `${fieldName} must be a number!`;
      },
    })
    .optional();

  return defaultValue !== undefined
    ? baseSchema.default(defaultValue)
    : baseSchema;
};

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd();
}

const AWS_BASE_URL = process.env.AWS_BASE_URL || "";

export function prependAwsBaseUrl(value: string | undefined): string | undefined {
  if (!value || value.startsWith("http")) return value;
  return `${AWS_BASE_URL}/${value}`;
}
