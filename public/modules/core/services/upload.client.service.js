/**
* core Module
*
* Description
*/
angular.module('core').factory('Upload', ['$http', function(){

    function getSignedRequest(file, url, cb) {
        var xhr;
        if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        else{
            xhr = new XMLHttpRequest(); 
        }

        var token = angular.fromJson(Storage.get('auth_token')).token;

        xhr.open('GET', '/api/sign_s3?file_name='+Date.now()+file.name+'&file_type='+file.type, true);
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    console.log(response, "response");
                    url = response.url;
                    uploadFile(file, response.signed_request, response.url);
                } else {
                    alert('Could not get signed URL.');
                    $scope.isLoading = false;
                }
            }
        };

        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();
    }

    function uploadFile(file, signedRequest, ur, cb) {
        var xhr;
        if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        else{
            xhr = new XMLHttpRequest(); 
        }
        xhr.open('PUT', signedRequest);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    $scope.createService(image_url);
                    // image_url = url;
                    // alert('finished');
                } else {
                    alert('Could not upload file.');
                }

            }
        };
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.send(file);
    }

    return {
        getSignedRequest: getSignedRequest
    }
}])