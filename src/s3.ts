import AWS from "aws-sdk";

function envOrFail(key: string): string {
  const env = process.env[key];

  if (!env) {
    throw new Error(`Missing key ${key}`);
  }
  return env;
}

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: envOrFail("AWS_ACCESS_KEY_ID"),
    secretAccessKey: envOrFail("AWS_SECRET_ACCESS_KEY_ID")
  }
});

export function uploadToS3(data: any) {
  s3.putObject(
    {
      Bucket: "espanelm",
      Key: "news.json",
      Body: JSON.stringify(data)
    },
    function() {
      console.log("Successfully uploaded package.");
    }
  );
}
