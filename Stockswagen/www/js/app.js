// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'ionic.service.core', 'ionic.service.analytics', 'ionic-material', 'starter.controllers', 'ionMdInput'])

.factory('Auth', function($firebaseAuth) {
  var endPoint = 'https://stockswagen.firebaseio.com';
  var usersRef = new Firebase(endPoint);
  return $firebaseAuth(usersRef);
})

.run(function($ionicPlatform, $ionicAnalytics) {
  $ionicPlatform.ready(function() {

    $ionicAnalytics.register();

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.portfolio', {
    url: '/portfolio',
    views: {
      'menuContent': {
        templateUrl: 'templates/portfolio.html',
        controller: 'PortfolioCtrl'
      },
      'fabContent': {
        template: '<button id="fab-portfolio" class="button button-fab button-fab-top-right expanded button-energized-900 flap"><i class="icon ion-plus"></i></button>',
        controller: function ($timeout) {
          $timeout(function () {
            document.getElementById('fab-portfolio').classList.toggle('on');
          }, 200);
        }
      }
    }
  })

  .state('app.single', {
    url: '/portfolio/:tick',
    views: {
      'menuContent': {
        templateUrl: 'templates/stock.html',
        controller: 'StockCtrl'
      },
      'fabContent': {
        template: ''
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      },
      'fabContent': {
        template: ''
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/portfolio');
});
