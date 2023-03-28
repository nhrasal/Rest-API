import * as path from "path";
import { diskStorage } from "multer";
import { ENV } from "src/ENV";
import * as FS from "fs";
import * as AWS from "aws-sdk";

export const awsS3uploader = (file) => {
  AWS.config.update({
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    region: ENV.AWS_REGION,
    signatureVersion: "v4",
  });

  const s3 = new AWS.S3({ signatureVersion: "v4" });
  return s3
    .upload({
      ACL: "public-read",
      Bucket: ENV.AWS_BUCKET_NAME,
      Body: FS.createReadStream(file.path),
      Key: `images/${generateFilename(file)}`,
      ContentType: file.mimetype,
    })
    .promise();
};

export const awsS3remover = (imgPath: string) =>
  new Promise(async (resolve, reject) => {
    console.log("log from awsS3remover");
    const s3 = new AWS.S3({ signatureVersion: "v4" });
    s3.createBucket(
      {
        Bucket: ENV.AWS_BUCKET_NAME,
      },
      () => {
        const params = {
          Bucket: ENV.AWS_BUCKET_NAME,
          Key: imgPath.split(ENV.AWS_PREFIX_URL).pop(),
        };
        s3.deleteObject(params, (err, data) => {
          if (err) console.log(err);
          else console.log("Successfully deleted file from bucket");
          return data;
        });
      }
    );
  });

export const asyncForEach = async (array: any[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
export const objectSize = async (obj) => {
  let size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
export const fixNullPrototype = async (data: any) => {
  // fixes the issue of [Object: null prototype]{}
  return JSON.parse(JSON.stringify(data));
};
export const convertNullString = async (data: any) => {
  if (data === "null") {
    return null;
  } else {
    return data;
  }
};
export function toNumber(value: string): number {
  return parseInt(value, 10);
}
export function isEmptyObject(obj): boolean {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }
  return true;
}
export function resetValuesToZero(obj) {
  Object.keys(obj).forEach(function (key) {
    if (typeof obj[key] === "object") {
      return resetValuesToZero(obj[key]);
    }
    obj[key] = 0;
  });
  return obj;
}
export function toBool(value: string): boolean {
  return value === "true";
}

export function genHexNumber() {
  const n = (Math.random() * 0xfffff * 1000000).toString(16);
  return n.slice(0, 10).toUpperCase();
}

export const get30digitNumber = (): number => {
  return Math.floor(100000000000 + Math.random() * 100000000000);
};
export const get6digitNumber = (): number => {
  return Math.floor(100000 + Math.random() * 100000);
};

// Remove undefined Entits from object
export function removeUndefinedPropertiesFromObject(obj: Object): Object {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  });
  return obj;
}
export async function selectArrayBuilder(
  entityAlias: string,
  select: (string | number | symbol)[]
) {
  // eslint-disable-next-line prefer-const
  let newSelectArray = [];
  await asyncForEach(select, async (selectString: string) => {
    newSelectArray.push(entityAlias + "." + selectString);
  });
  return newSelectArray;
}

export async function orderByObjectBuilder(entityAlias: string, order: any) {
  const newOrderObj: any = {};
  Object.keys(order).forEach((key) => {
    // eslint-disable-next-line prefer-const
    let newKey = entityAlias + "." + key;
    newOrderObj[newKey] = order[key];
  });
  return newOrderObj;
}

export async function relationBuilder(
  queryBuilder: any,
  entityAlias: string,
  relationArray: string[]
) {
  await asyncForEach(relationArray, async (relation: string) => {
    const nestedRelation = relation.split(".");

    if (nestedRelation && nestedRelation.length > 1) {
      let parent, child;
      // eslint-disable-next-line prefer-const
      parent = nestedRelation[nestedRelation.length - 2];
      // eslint-disable-next-line prefer-const
      child = nestedRelation[nestedRelation.length - 1];
      queryBuilder.leftJoinAndSelect(
        `${parent}.${child}`,
        child,
        `"${child}"."deletedAt" is null`
      );
    } else {
      queryBuilder.leftJoinAndSelect(
        `${entityAlias}.${nestedRelation[0]}`,
        nestedRelation[0],
        `"${nestedRelation[0]}"."deletedAt" is null`
      );
    }
  });
}

export async function base64Encode(text: string | number | any) {
  return await Buffer.from(text).toString("base64");
}

export function base64Encoded(text: string | number | any) {
  return Buffer.from(text).toString("base64");
}
export async function base64Decode(text: string | number | any) {
  return await Buffer.from(text, "base64").toString("utf-8");
}
export function base64Decoded(text: string | number | any) {
  return Buffer.from(text, "base64").toString("utf-8");
}

export const storageOptions = diskStorage({
  destination: (req, file, cb) => {
    cb(null, ENV.IMAGE_LOCAL_PATH);
  },
  // destination: "./uploads",
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

export const generateFilename = (file, prefix = "kuiperz-") => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${prefix + uniqueSuffix + path.extname(file.originalname)}`;
};

export const localFileDelete = async (files) => {
  if (!files) return;
  setTimeout(async () => {
    try {
      // await FS.unlinkSync(ENV.IMAGE_LOCAL_PATH + '/' + files);
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

export const dateFormate = async (date: string) => {
  const createdAt = new Date(date);

  if (!createdAt) return null;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${days[createdAt.getDay()]}, ${createdAt.getDate()} ${
    monthNames[createdAt.getMonth()]
  } ${createdAt.getFullYear()}`;
};

export const splitDate = (dateString: string | number = "") => {
  const orderDate = new Date(dateString);
  const orderDateStr = orderDate.toDateString().split(" ");
  const orderTimeStr = orderDate.toLocaleTimeString().split(":");
  return {
    day: orderDateStr[0],
    month: orderDateStr[1],
    date: orderDateStr[2],
    year: orderDateStr[3],
    hour: orderTimeStr[0],
    minute: orderTimeStr[1],
    second: orderTimeStr[2]?.split(" ")?.[0] || "",
    ampm: orderTimeStr[2]?.split(" ")?.[1] || "",
  };
};

export const dateFormateNew = async (dateString: string | number = "") => {
  const dateTime = splitDate(dateString);
  try {
    return `${dateTime.date} ${dateTime.month}, ${dateTime.year} at ${dateTime.hour}:${dateTime.minute}`;
  } catch (err) {
    return "N/A";
  }
};
export const dateFormateYMD = (date: string) => {
  const dateTime = splitDate(date);
  return `${dateTime.year}-${dateTime.month}-${dateTime.date}`;
};

export const objectTrim = async (object) => {
  if (typeof object !== "object") return object;
  await Object.keys(object).forEach(
    (k) =>
      (object[k] = typeof object[k] == "string" ? object[k].trim() : object[k])
  );
  return object;
};
