angular.module('nAuthApp', [
    'ngRoute'
])
    .config(function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginController'
            })
            .when('/signup', {
                templateUrl: 'views/signup.html',
                controller: 'LoginController'
            })
            .when('/', {
                templateUrl: 'views/welcome.html',
                controller: 'WelcomeController'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller('WelcomeController', function() {

    })
    .controller('LoginController', function($scope) {
        $scope.signup = {};
        $scope.login = {};

        $scope.signup = function() {

        };

        $scope.login = function() {

        };
    });