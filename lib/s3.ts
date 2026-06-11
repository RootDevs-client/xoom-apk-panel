import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

let client: S3Client | null = null;

function getS3Client() {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_AWS_BASE_URL!;
}

function getBucket() {
  return process.env.AWS_BUCKET_NAME!;
}

export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  folder = "uploads",
) {
  const ext = filename.split(".").pop() ?? "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );

  const url = `${getBaseUrl()}/${key}`;
  return { key, url };
}
