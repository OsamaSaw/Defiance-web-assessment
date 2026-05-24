const { v1: uuidv1 } = require('uuid');

const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_DATA, AWS_S3_BUCKET_TMP, ENV } =
  process.env;

const params = {
  region: AWS_DEFAULT_REGION,
  s3ForcePathStyle: true
};
if (ENV === 'dev') {
  params.credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };
}

const getFile = fileName =>
  new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: AWS_S3_BUCKET_DATA,
        Key: fileName
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
  });

const generateName = ext => uuidv1({ msecs: new Date().getTime(), nsecs: 5678 }) + '.' + ext;

const getType = ext => {
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return false;
  }
};

const getSign = async ext => {
  const fileName = generateName(ext);
  const fileType = getType(ext);

  const s3Params = {
    Bucket: AWS_S3_BUCKET_TMP,
    Key: fileName,
    ContentType: fileType,
    ACL: 'public-read'
  };
};

module.exports = {
  generateName,
  getFile,
  getSign
};
