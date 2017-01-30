'use strict';

var chat, node, user;

var sherlock = angular.module('sherlock', ['ui.bootstrap', 'angular.vertilize']);

sherlock.controller('sherlockController', function($scope, $http, $interval, $uibModal) {
  var oneSecond = 1000;
  var timer, turnInterval;
  var colourCameraCost, blackAndWhiteCameraCost, costLimit;
  $scope.cameraSelectionChoices = {
    default: 'Choose camera selection',
    random: 'Random',
    manual: 'Manual'
  };
  $scope.cameraSelection = $scope.cameraSelectionChoices.default;
  var characters = {
    'giraffe': {'sport': 'rugby', 'fruit': 'orange', 'hat': 'red'},
    'zebra': {'sport': 'cricket', 'fruit': 'apple', 'hat': 'purple'},
    'lion': {'sport': 'golf', 'fruit': 'lemon', 'hat': 'pink'},
    'hippopotamus': {'sport': 'football', 'fruit': 'pineapple', 'hat': 'blue'},
    'elephant': {'sport': 'tennis', 'fruit': 'banana', 'hat': 'green'},
    'leopard': {'sport': 'basketball', 'fruit': 'pear', 'hat': 'yellow'}
  };

  $scope.nextTurn = function() {
    $interval.cancel(turnInterval);
    turnInterval = undefined;
    incrementTurn();

    if ($scope.turn < ($scope.config.gameConfig.numTicks - 1)) {
      turnInterval = $interval(incrementTurn, $scope.config.gameConfig.tickLength * oneSecond, $scope.config.gameConfig.numTicks - $scope.turn - 2);
    }
  };

  var calculateScore = function() {
    if ($scope.elusive === 'lion' || $scope.elusive === 'giraffe') {
      $scope.score += 10;
    }

    for (var name in $scope.config.gameElements.objects) {
      var object = $scope.config.gameElements.objects[name];

      if (object.type === "animal") {
        if (node.instances[name]) {
          if (node.instances[name].eats && node.instances[name].eats.name === characters[name].fruit) {
            $scope.score++;
          }
          if (node.instances[name].hat_colour && node.instances[name].hat_colour.name === characters[name].hat) {
            $scope.score++;
          }
          if (node.instances[name].plays && node.instances[name].plays.name === characters[name].sport) {
            $scope.score++;
          }
        }
      }
    }

    return $scope.score;
  };

  var showScoreModal = function() {
    var scoreModalInstance = $uibModal.open({
      animation: true,
      backdrop  : 'static',
      keyboard  : false,
      templateUrl: 'scoreContent.html',
      controller: 'ScoreModalInstanceCtrl',
      resolve: {
        score: function () {
          var score = calculateScore();
          var sentence = 'the score is ' + score;
          $scope.addGameInteractionCard(sentence);

          return score;
        }
      }
    });

    scoreModalInstance.result.then(function () {
      console.log('Modal dismissed at: ' + new Date());
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.endGame = function() {
    if (!$scope.game.ended) {
      $scope.game.started = false;
      $scope.game.ended = true;

      var modalInstance = $uibModal.open({
        animation: true,
        backdrop  : 'static',
        keyboard  : false,
        templateUrl: 'questionContent.html',
        controller: 'QuestionModalInstanceCtrl',
        resolve: {
          objects: function () {
            return $scope.config.gameElements.objects;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.elusive = selectedItem;

        var sentence = 'the most elusive character is ' + selectedItem;
        $scope.addGameInteractionCard(sentence);

        showScoreModal();
      });
    }
  };

  $scope.setCameraSelection = function(cameraSelection) {
    $scope.cameraSelection = cameraSelection;
  };

  var incrementTurn = function() {
    var animals = {};
    var characters = ['giraffe', 'zebra', 'lion', 'hippopotamus', 'elephant', 'leopard'];
    var i, character;

    for (var location in $scope.gameTicks[$scope.turn].locations) {
      var inRoom = $scope.gameTicks[$scope.turn].locations[location];

      for (i in characters) {
        character = characters[i];

        if (inRoom.includes(character)) {
          animals[character] = location;
        }
      }
    }

    for (i in characters) {
      character = characters[i];
      var object = $scope.config.gameElements.objects[character];

      if (node.instances[character]) {
        if (node.instances[character].is_in && animals[character] && node.instances[character].is_in.name.toLowerCase().indexOf(animals[character]) > -1) {
          $scope.score++;
        }
      }
    }

    if ($scope.turn === ($scope.config.gameConfig.numTicks - 1)) {
      $scope.endGame();
      $interval.cancel(timer);
      timer = undefined;
      resetCameras();
    } else {
      $scope.turn++;
      resetCountdown();
      resetCameras();
      add_card_simple("Turn " + $scope.turn, "friend");

      for (var name in $scope.config.gameElements.objects) {
        var object = $scope.config.gameElements.objects[name];

        if (object.room) {
          if ($scope[name + "_style"].opacity > 0) {
            $scope[name + "_style"].opacity -= 0.1;
          }
        }
      }
    }
  };

  var decrementTimer = function() {
    $scope.timeRemaining--;

    if ($scope.turn === ($scope.config.gameConfig.numTicks - 1) && $scope.timeRemaining <= 0) {
      $scope.endGame();
    }

    for (var name in $scope.config.gameElements.objects) {
      var object = $scope.config.gameElements.objects[name];

      if (object.type === "animal") {
        var ceObject = node.instances[name];

        if (ceObject) {
          var sport = ceObject.plays;
          var fruit = ceObject.eats;
          var hat = ceObject.hat_colour;
          var room = ceObject.is_in;

          if (sport) {
            object.sport = "i/" + $scope.config.gameElements.objects[sport.name].url;
          }
          if (fruit) {
            object.fruit = "i/" + $scope.config.gameElements.objects[fruit.name].url;
          }
          if (hat) {
            object.hat = {'background': hat.name};
          }
          if (room) {
            if (object.room !== room.name) {
              object.room = room.name;
              $scope[name + "_style"] = {'opacity': 1};
            }
          }
        }
      }
    }
  };

  var resetCountdown = function() {
    $scope.timeRemaining = $scope.config.gameConfig.tickLength;
    $interval.cancel(timer);
    timer = $interval(decrementTimer, oneSecond,  $scope.timeRemaining);

    // log camera interaction
    var tick = $scope.gameTicks[$scope.turn];

    if (tick) {
      for (var location in tick.locations) {
        var noObjects = 'no objects';
        var objects = 'objects ';

        for (var i in tick.locations[location]) {
          objects += tick.locations[location][i];

          if (i < tick.locations[location].length - 2) {
            objects += ", ";
          } else if (i < tick.locations[location].length - 1) {
            objects += " and ";
          }
        }

        var result = tick.locations[location].length === 0 ? noObjects : objects;
        var sentence = 'at tick ' + $scope.turn + ' ' + location + ' room has ' + result;
        $scope.addGameInteractionCard(sentence);
      }
    }
  };

  var containsObject = function(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }

    return false;
  };

  var resetCameras = function(numCams) {
    numCams = numCams || $scope.config.gameConfig.cameraLimit;
    for (var i = 0; i < numCams; ++i) {
      $scope.cameras[i] = {
        on: false
      };
    }

    if ($scope.cameraSelection === 'Random' && $scope.game.started) {
      randomlySetCameras();
    }
  };

  var randomlySetCameras = function() {
    var totalCost = 0;
    var viewedRooms = [];

    while (totalCost < costLimit) {
      var rand = Math.round(Math.random() * ($scope.config.gameElements.locations.length - 1));
      var location = $scope.config.gameElements.locations[rand];

      while (containsObject(location, viewedRooms)) {
        rand = Math.round(Math.random() * ($scope.config.gameElements.locations.length - 1));
        location = $scope.config.gameElements.locations[rand];
      }

      viewedRooms.push(location);

      var colour;

      if (totalCost < costLimit - blackAndWhiteCameraCost) {
        colour = Math.round(Math.random());
      } else {
        colour = 0;
      }
      $scope.setCamera(location, colour === 1);

      if (colour === 1) {
        totalCost += colourCameraCost;
      } else {
        totalCost += blackAndWhiteCameraCost;
      }
    }
  };

  var setupCE = function() {
    loadChat();
  };

  var setupGameTicks = function() {
    return $http.get('api?turns=' + $scope.config.gameConfig.numTicks)
    .then(function(res) {
      var roomConfig = res.data; //.substring(1, res.data.length - 1);
      var lines = roomConfig.split(/\n/);

      $scope.gameTicks = [];
      var locations = $scope.config.gameConfig.locations;
      var tickNum = 0;

      for (var i = 0; i < lines.length; ++i) {
        var objects = lines[i].split(/\s/);

        if (objects[0] === "room") {
          var tick = {
            tickId: tickNum,
            locations: {}
          };
          $scope.gameTicks.push(tick);

          tickNum++;
        } else {
          if (objects[0] !== "") {
            $scope.gameTicks[tickNum - 1].locations[objects[0]] = [];

            for (var j = 1; j < objects.length; ++j) {
              if (objects[j] !== "-") {
                $scope.gameTicks[tickNum - 1].locations[objects[0]].push(objects[j].replace("_", " "));
              }
            }
          }
        }
      }
    });
  };

  $scope.startGame = function() {
    setupCE();
    setupGameTicks()
      .then(function() {
        $scope.game.ended = false;
        $scope.game.started = true;
        $scope.turn = 0;
        $scope.score = 0;
        $scope.maxTurns = $scope.config.gameConfig.numTicks;
        $scope.timeRemaining = $scope.config.gameConfig.tickLength;
        colourCameraCost = $scope.config.gameConfig.colourCameraCost;
        blackAndWhiteCameraCost = $scope.config.gameConfig.blackAndWhiteCameraCost;
        costLimit = $scope.config.gameConfig.costLimit;

        $scope.maxCams = $scope.config.gameConfig.cameraLimit;
        $scope.bWCost = blackAndWhiteCameraCost;
        $scope.colourCost = colourCameraCost;
        $scope.costLimit = costLimit;

        add_card_simple("Turn " + $scope.turn, "friend");
        turnInterval = $interval(incrementTurn, $scope.config.gameConfig.tickLength * oneSecond, $scope.config.gameConfig.numTicks - 1);

        resetCountdown();
        resetCameras();
      });
  };

  $scope.addGameInteractionCard = function(sentence) {
    var card = "there is a nl card named 'msg_{uid}' that has '"+sentence+"' as content and is to the agent 'local agent' and is from the individual 'action watcher' and has the timestamp '{now}' as timestamp";

    node.add_sentence(card);
  };

  $scope.setCamera = function(location, colour) {
    // find off camera
    var camera;
    var i;

    for (i = 0; i < $scope.cameras.length; ++i) {
      if (!$scope.cameras[i].on) {
        camera = $scope.cameras[i];
        break;
      }
    }

    if (camera) {
      // turn camera on
      camera.on = true;
      camera.location = location.name;
      camera.colour = colour;

      // set camera content
      var tick = $scope.gameTicks[$scope.turn];

      for (i = 0; i < tick.locations[location.name].length; ++i) {
        var objName = tick.locations[location.name][i];
        var obj = $scope.config.gameElements.objects[objName];

        if (obj && obj.type === 'animal') {
          obj = $scope.config.gameElements.objects[objName + '_hat'];
        }

        if (obj) {
          camera[obj.type] = 'i/' + obj.url;
        } else {
          console.log("Can't find obj: " + objName);
        }
      }

      // log camera interaction
      var time = $scope.config.gameConfig.tickLength - $scope.timeRemaining;
      var sentence = location.name + ' ' + (colour ? 'RGB' : 'B&W') + ' camera was turned on ' + time + ' seconds into tick ' + $scope.turn;
      $scope.addGameInteractionCard(sentence);
    }
  };

  $scope.cameraDisabled = function(location, colour) {
    if ($scope.game.started && !$scope.game.ended && $scope.cameraSelection === 'Manual') {
      var allCamerasOn = true;
      var found = false;
      var cost = 0;

      for (var i = 0; i < $scope.cameras.length; ++i) {
        var camera = $scope.cameras[i];
        allCamerasOn = allCamerasOn && camera.on;

        if (camera.on) {
          // calculate cost
          if (camera.colour) {
            cost += colourCameraCost;
          } else {
            cost += blackAndWhiteCameraCost;
          }

          // check if camera is already shown
          if (location.name === camera.location && colour === camera.colour) {
            found = true;
          }
        }
      }

      if (colour) {
        cost += colourCameraCost;
      } else {
        cost += blackAndWhiteCameraCost;
      }

      var exceededCost = cost > costLimit;
      $scope.disableCameras = found || allCamerasOn || exceededCost;

      return $scope.disableCameras;
    } else {
      return true;
    }
  };

  $http.get('config.json')
    .then(function(res) {
      $scope.config = res.data;
      $scope.cameras = [];
      $scope.game = {
        started: false,
        ended: false
      };
      resetCameras();
      setupCE();
    });
});

sherlock.controller('QuestionModalInstanceCtrl', function ($scope, $uibModalInstance, objects) {
  $scope.objects = objects;

  $scope.ok = function (name) {
    $uibModalInstance.close(name);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

sherlock.controller('ScoreModalInstanceCtrl', function ($scope, $uibModalInstance, score) {
  $scope.score = score;

  $scope.ok = function () {
    $uibModalInstance.close();
  };
});

sherlock.filter('capitalise', function() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }) : '';
  };
});
