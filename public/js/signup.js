var signup = angular.module("signup", []);

signup.controller("signupController", signupController);
signupController.$inject = ["$window", "$scope", "$http"]

function signupController($window, $scope, $http) {
    // var url = "http://localhost:3000";
    var url = "http://ec2-54-208-152-167.compute-1.amazonaws.com";
    var signupButton = document.getElementById("signupButton");
    var passwordField = document.getElementById("password");
    var confirmPasswordField = document.getElementById("confirmPassword");

    function validatePassword() {
        if ($scope.password != $scope.confirmPassword || ($scope.password === "")) {
            signupButton.className = "btn waves-effect waves-light disabled";

        } else {
            signupButton.className = "btn waves-effect waves-light";
        }
    }
    passwordField.onchange = validatePassword;
    confirmPasswordField.onkeyup = validatePassword;

    $scope.signup = function() {
        // console.log($scope.first_name);
        // console.log($scope.last_name);
        // console.log($scope.userID);
        // console.log($scope.email);
        // console.log($scope.password);
        // var v = grecaptcha.getResponse();
        var v = "sdf";
        if (v.length == 0) {
            Materialize.toast("You can't leave Captcha Code empty", 2000, 'red');
        } else {

            $http({
                url: url + "/api/signup",
                method: "POST",
                data: {
                    first_name: $scope.first_name,
                    last_name: $scope.last_name,
                    username: $scope.userID,
                    email: $scope.email,
                    password: $scope.password,

                }
            }).then(function(data, status, headers, config) {
                console.log("success post");
                console.log("return:" + data.data);
                if (data.data.includes("login")) {
                    Materialize.toast("SIGN UP SUCCESS", 2000, 'teal lighten-2');
                    Materialize.toast("PLEASE LOG IN AGAIN...", 2000, 'teal lighten-2');
                    setTimeout(function() { window.location.replace(url); }, 2000);

                } else {
                    Materialize.toast("USER ID ALREADY EXIST", 3000, 'red');

                }
            }, function(response) {
                console.log("fail: " + response);
            });
        }
    };

};