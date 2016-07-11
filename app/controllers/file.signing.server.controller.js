var aws = require('aws-sdk'),
    AWS_ACCESS_KEY = process.env.AWS_ACCESS_ID,
    AWS_SECRET_KEY = process.env.AWS_ACCESS_SECRET_KEY,
    S3_BUCKET = "raytee";


exports.sign = function(req, res) {
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    aws.config.update({region: 'us-east-1'});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.file_name,
        Expires: 60000,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data) {
        if (err) {
            console.log(err);
            res.status(400).json({message: 'server error'})
        }
        else {
            var return_data = {
                signed_request: data,
                url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + req.query.file_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
};
