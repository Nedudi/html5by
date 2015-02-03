var app = angular.module('app', ['ngMaterial']);

app.controller('AppCtrl', function($scope, $mdDialog) {
    $scope.user = {
        firstName: '',
        lastName: '',
        address: '',
        state: '',
        postalCode: ''
    };
    $scope.users = [];
    $scope.save = function() {
        $scope.users.push($scope.user);
        $scope.user = {
            firstName: '',
            lastName: '',
            address: '',
            state: '',
            postalCode: ''
        };
    }
    $scope.delete = function(index, ev) {
        var confirm = $mdDialog.confirm()
            .title('Вы желаете удалить данного пользователя')
            .content('В случае согласия данные будут полностью удалены из списка.')
            .ok('Удалить!')
            .cancel('Отменить')
            .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
            $scope.users.splice(index, 1);
        }, function() {});
    }
});