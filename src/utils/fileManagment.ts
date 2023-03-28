import * as AWS from "aws-sdk";
import * as FS from "fs";
import { ENV } from "src/ENV";
import { generateFilename } from "./utilFunc.util";

export const awsS3uploader = (file, folderName?: string) => {
  AWS.config.update({
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    region: ENV.AWS_REGION,
    signatureVersion: "v4",
  });

  // Set an endpoint.
  const ep = new AWS.Endpoint(ENV.AWS_PREFIX_URL);

  // Create an S3 client
  const s3 = new AWS.S3({ signatureVersion: "v4", endpoint: ep });
  return s3
    .upload({
      ACL: "public-read",
      Bucket: ENV.AWS_BUCKET_NAME,
      Body: FS.createReadStream(file.path),
      Key: `${folderName}/${generateFilename(file)}`,
      ContentType: file.mimetype,
    })
    .promise();
};

export const awsS3remover = (imgPath: string) =>
  new Promise(async (resolve, reject) => {
    console.log("log from awsS3remover");
    // Set an endpoint.
    const ep = new AWS.Endpoint(ENV.AWS_PREFIX_URL);

    // Create an S3 client
    const s3 = new AWS.S3({ signatureVersion: "v4", endpoint: ep });
    s3.createBucket(
      {
        Bucket: ENV.AWS_BUCKET_NAME,
      },
      () => {
        // console.log(imgPath.split(ENV.AWS_PREFIX_URL));
        const params = {
          Bucket: ENV.AWS_BUCKET_NAME,
          Key: imgPath.split(ENV.AWS_PREFIX_URL_REMOVE).pop(),
        };
        // Key: 'images/profile/kuiperz-1654962044076-955523898.jpg',

        s3.deleteObject(params, (err, data) => {
          if (err) console.log(err);
          else console.log("Successfully deleted file from bucket");
          return data;
        });
      }
    );
  });

export interface IServerFileUploaderReturn {
  success: boolean;
  storedFiles?: string[];
}

// amazon S3 File Uploader

export const awsServerFileUploader = async (
  img: any,
  folderName: string,
  deleteOld = true
): Promise<IServerFileUploaderReturn> => {
  try {
    console.log("calling from ServerFileUploader ");

    const storedFiles: string[] = [];

    if (Array.isArray(img)) {
      await asyncForEach(img, async (file) => {
        const t = await awsS3uploader(file, folderName);
        // storedFiles.push(`https://${t.Bucket}/${t.Key}`);
        storedFiles.push(t.Location);
      });
      deleteOld ? localFileDelete(img) : "";
    } else {
      const t = await awsS3uploader(img, folderName);
      //   storedFiles.push(`https://${t.Bucket}/${t.Key}`);
      storedFiles.push(t.Location);
      deleteOld ? localFileDelete(img) : "";
    }

    return { success: true, storedFiles };
  } catch (error) {
    console.log(error);
    return { success: false, storedFiles: [] };
  }
};

// aws s3 remover
export const awsServerFileRemover = async (imgPath: string): Promise<any> => {
  console.log(imgPath);
  return awsS3remover(imgPath);
};

export const localFileDelete = async (files) => {
  if (!files) return;
  setTimeout(async () => {
    try {
      if (Array.isArray(files)) {
        if (files.length == 1) {
          FS.unlinkSync(files[0].path);
        } else {
          await asyncForEach(files, async (file) => {
            FS.unlinkSync(file.path);
          });
        }
      } else {
        FS.unlinkSync(files.path);
      }
    } catch (err) {
      console.error(err);
    }
  }, 100);
};

export const asyncForEach = async (array: any[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
