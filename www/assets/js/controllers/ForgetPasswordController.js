
/*global angular*/
/*global app*/
app.controller('ForgetPasswordController', function($rootScope, $scope, $state, eresApi, eresPopup, $cordovaNetwork, toastr) {

    if ($cordovaNetwork.isOffline()) {

        toastr.error("Este recurso não está disponível enquanto o aplicativo está offline", "Erro");
        return false;
    }

  /**
     * 
     * If a user forgets the password to their eres-app account, you can reset their password
     * 
     * @param {type} login   
     * 
     * @returns {Boolean}
     */
    
    $scope.data = [];
    
    var endpoint = "app/v1/forget-password/";

    $scope.changePassword = function() {
        if (!$scope.data.login) {
            eresPopup.showAlert("Erro", "O campo está vazio");
            return false;
        }
        var config = {
            data: {
                "user_login": $scope.data.login
            },
            method: 'POST'
        };
       eresApi.apiRequest(endpoint, config).
        then(
            function(success) {
                $rootScope.$broadcast('loading:hide');
                if(success.data.message === "success"){
                   eresPopup.showAlert("Sucesso", "Por favor, verifique seu e-mail para o link de confirmação");
                    $state.go('login');
                }
                return true;
            },
            function(error) {
                $rootScope.$broadcast('loading:hide');
                eresPopup.showAlert("Erro", "Não foi possível encontrar a conta com este CPF/CNPJ. Por favor, tente novamente.");
                return false;
            }

        );
    };

})