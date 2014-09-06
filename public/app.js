angular.module('nAuthApp', [
    'ngRoute',
    'ngCookies',
    'nAuthApp.services'
])
    .config(function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/dashboard', {
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardController'
            })
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
    .controller('LoginController', function($scope, $location, UserService) {
        $scope.signup = {};
        $scope.login = {};

        UserService.currentUser().then(function(user) {
            $scope.user = user;
        });

        $scope.signup = function() {
            UserService.signup({
                email: $scope.signup.email,
                password: $scope.signup.password
            })
                .then(function(user) {
                    $location.path('/dashboard');
                }, function(reason) {
                    $scope.signup.errors = reason;
                });
        };

        $scope.login = function() {
            UserService.login({
                email: $scope.login.email,
                password: $scope.login.password
            })
                .then(function(user) {
                    $location.path('/dashboard');
                }, function(reason) {
                    $scope.login.errors = reason;
                });
        };

    })
    .controller('DashboardController', function($scope, $location, UserService) {
        UserService.currentUser().then(function(user) {
            $scope.currentUser = user;
        });

        $scope.logout = function() {
            UserService.logout()
                .then(function(user) {
                    $location.path('/');
                }, function(reason) {
                    $scope.login.errors = reason;
                });
        };
    });