angular.module('nAuthApp.services', [])
    .service('AuthService', function($cookieStore, $q) {
        var service = this;
        this._user = null;

        this.setCurrentUser = function(user) {
            service._user = user;
        };

        this.removeCurrentUser = function() {
            $cookieStore.remove('user')
            service._user = null;
        };

        this.currentUser = function() {
            var d = $q.defer();
            if (service._user) {
                d.resolve(service._user);
            } else if ($cookieStore.get('user')) {
                service.setCurrentUser($cookieStore.get('user'));
                d.resolve(service._user);
            } else {
                d.resolve(null);
            }
            return d.promise;
        };
    })
    .service('UserService', function(AuthService, $http, $q) {
        this.currentUser = AuthService.currentUser;

        this.signup = function(params) {
            var d = $q.defer();
            $http.post('/api/signup', params)
                .success(function(data) {
                    var user = data;
                    AuthService.setCurrentUser(user);
                    d.resolve(user);
                })
                .error(function(reason) {
                    d.reject(reason);
                });
            return d.promise;
        };

        this.login = function(params) {
            var d = $q.defer();
            if (params.provider) {
                console.log("Login Plz*******");
                $http.get('/auth/'+params.provider)
                    .success(function(data) {
                        var user = data;
                        AuthService.setCurrentUser(user);
                        d.resolve(user);
                    })
                    .error(function(reason) {
                        d.reject(reason);
                    });
                return d.promise;

            } else {
                $http.post('/api/login', params)
                    .success(function(data) {
                        var user = data;
                        AuthService.setCurrentUser(user);
                        d.resolve(user);
                    })
                    .error(function(reason) {
                        d.reject(reason);
                    });
                return d.promise;
            }
        };

        this.logout = function() {
            var d = $q.defer();
            $http.get('/api/logout')
                .success(function() {
                    AuthService.removeCurrentUser();
                    d.resolve();
                });
            return d.promise;
        };
    });