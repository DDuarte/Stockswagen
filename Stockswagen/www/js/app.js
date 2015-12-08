// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'ionic.service.core', 'ionic.service.analytics', 'ionic-material',
  'starter.controllers', 'ionMdInput', 'ion-autocomplete', 'highcharts-ng', 'angularMoment'])

.factory('Auth', function($firebaseAuth) {
  var endPoint = 'https://stockswagen.firebaseio.com';
  var usersRef = new Firebase(endPoint);
  return $firebaseAuth(usersRef);
})

.factory('Portfolio', function($firebaseArray) {
  return function(userId) {
    var portfolioRef = new Firebase('https://stockswagen.firebaseio.com/portfolios');
    return $firebaseArray(portfolioRef.child(userId));
  }
})

.factory('Quotes', function($firebaseObject) {
  var quotesRef = new Firebase('https://stockswagen.firebaseio.com/quotes');
  return $firebaseObject(quotesRef);
})

.factory('Quote', function($firebaseObject) {
  return function(tickSymbol) {
    var quoteRef = new Firebase('https://stockswagen.firebaseio.com/quotes');
    return $firebaseObject(quoteRef.child(tickSymbol));
  }
})

.run(function($rootScope, $state, $ionicPlatform, $ionicAnalytics) {
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

  $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  // $ionicConfigProvider.views.maxCache(0);

  $stateProvider

  .state('app', {
    url: '/app',
    resolve: {
      'currentAuth': ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }]
    },
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('app.portfolio', {
    url: '/portfolio',
    views: {
      'menuContent': {
        templateUrl: 'templates/portfolio.html',
        controller: 'PortfolioListCtrl'
      },
      'fabContent': {
        template: '<button ng-click="openAddStock()" id="fab-portfolio" class="button button-fab button-fab-bottom-right expanded button-energized-900 spin"><i class="icon ion-plus"></i></button>',
        controller: 'AddStockCtrl'
      }
    }
  })

  .state('app.portfolioItem', {
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
  $urlRouterProvider.otherwise('/login');
});
