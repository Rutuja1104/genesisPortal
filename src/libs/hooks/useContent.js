import AWS from "aws-sdk";
import { fileTypeFromBuffer } from "file-type";

export const updateAWSCreds = (params) => {
  AWS.config.update({
    region: params.region,
    credentials: new AWS.Credentials({
      accessKeyId: params.accessKeyId,
      secretAccessKey: params.secretAccessKey,
      sessionToken: params?.sessionToken,
    }),
  });
};

const s3 = new AWS.S3();
const excludeRegex = new RegExp(/(?!)/);

const downloadFile = async (fileKey, operation) => {
  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: fileKey,
  };
  try {
    const s3 = new AWS.S3();
    const response = await s3.getObject(params).promise();
    const fileContent = response.Body;
    const mimeType =
      (await fileTypeFromBuffer(fileContent)) || "application/octet-stream";
    const blob = new Blob([fileContent], { type: mimeType.mime });
    const url = window.URL.createObjectURL(blob);
    if (operation === "view") {
      window.open(url, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileKey.split("/").pop();
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error("Error downloading file from S3:", err);
  }
};

export const listContents = async (prefix) => {
  console.debug("Retrieving data from AWS SDK");
  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Prefix: prefix,
    Delimiter: "/",
  };
  const s3 = new AWS.S3();
  const data = await s3.listObjectsV2(params).promise();
  return {
    folders: data.CommonPrefixes
      ? await Promise.all(
          data.CommonPrefixes.filter(
            ({ Prefix }) => !excludeRegex.test(Prefix)
          ).map(async ({ Prefix }) => ({
            name: Prefix.slice(prefix.length),
            path: Prefix,
            type: "folder",
            metadata: await getMetadata(Prefix),
            deleteFolder: () => deleteFolder(Prefix),
          }))
        )
      : [],
    objects: data.Contents
      ? await Promise.all(
          data.Contents.filter(
            ({ Key }) =>
              !excludeRegex.test(Key) && Key.slice(prefix.length) !== ""
          ).map(async ({ Key, LastModified, Size }) => ({
            name: Key.slice(prefix.length),
            lastModified: LastModified,
            size: Size,
            path: Key,
            type: "file",
            downloadFile: () => downloadFile(Key),
            openFile: () => downloadFile(Key, "view"),
            deleteFile: () => deleteObject(Key),
            metadata: await getMetadata(Key),
          }))
        )
      : [],
  };
};

export const getMetadata = async (key) => {
  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: key,
  };

  try {
    const s3 = new AWS.S3();
    const response = await s3.headObject(params).promise();
    return response.Metadata;
  } catch (err) {
    console.error("Error getting metadata:", err);
    return {};
  }
};

export const deleteObject = async (key) => {
  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: key,
  };

  try {
    const s3 = new AWS.S3();
    const response = await s3.deleteObject(params).promise();
    console.log(`Object deleted successfully: ${key}`);
    return response;
  } catch (err) {
    console.error(`Error deleting object ${key}:`, err);
    return false;
  }
};

export const deleteFolder = async (folderKey) => {
  const listParams = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Prefix: folderKey,
  };

  try {
    const s3 = new AWS.S3();
    const listData = await s3.listObjectsV2(listParams).promise();
    if (listData.Contents.length > 1) {
      console.log(`Folder is already empty: ${folderKey}`);
      return {
        status: false,
        message: "Folder is not empty",
      };
    }

    const deleteParams = {
      Bucket: process.env.REACT_APP_BUCKET_NAME,
      Delete: {
        Objects: listData.Contents.map(({ Key }) => ({ Key })),
      },
    };

    const deleteData = await s3.deleteObjects(deleteParams).promise();
    console.log(`Folder deleted successfully: ${folderKey}`, deleteData);
    return {
      status: true,
      message: "Folder deleted successfully",
    };
  } catch (err) {
    console.error(`Error deleting folder ${folderKey}:`, err);
  }
};

export const uploadFileToS3 = async (
  path,
  file,
  description,
  uploadedBy,
  progressCallback
) => {
  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: path + file.name,
    Body: file,
    Metadata: {
      description: description,
      uploadedby: uploadedBy,
    },
    queueSize: 4,
    partSize: 10 * 1024 * 1024,
  };

  const s3 = new AWS.S3({
    httpOptions: {
      timeout: 300000,
    },
    maxRetries: 10,
  });

  try {
    const upload = s3.upload(params);
    upload.on("httpUploadProgress", (progress) => {
      const uploadedBytes = progress.loaded;
      const totalBytes = progress.total;
      const percentCompleted = Math.round((uploadedBytes / totalBytes) * 100);

      progressCallback(percentCompleted);
    });

    const data = await upload.promise();
    console.log("File uploaded successfully:", data);
    return data.Location;
  } catch (err) {
    console.error("Error uploading file:", err);
    return false;
  }
};

export const createFolder = async (folderPath, uploadedBy) => {
  const folderKey = `${
    folderPath.endsWith("/") ? folderPath : `${folderPath}/`
  }`;
  const params = {
    Bucket: process.env.REACT_APP_BUCKET_NAME,
    Key: folderKey,
    Metadata: {
      uploadedBy: uploadedBy,
    },
  };

  try {
    const s3 = new AWS.S3();
    const resp = await s3.putObject(params).promise();
    console.log(`Folder created successfully at ${folderKey}`);
    return resp;
  } catch (err) {
    console.error("Error creating folder:", err);
    return false;
  }
};
