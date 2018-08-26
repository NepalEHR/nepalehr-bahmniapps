'use strict';

angular.module('bahmni.common.displaycontrol.orders')
    .directive('ordersControl', ['orderService', 'orderTypeService', '$q', 'spinner', '$filter', 'appService',
        function (orderService, orderTypeService, $q, spinner, $filter, appService) {
            var controller = function ($scope) {
                $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue('displayNepaliDates');
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);
                if ($scope.config.showHeader === null || $scope.config.showHeader === undefined) {
                    $scope.config.showHeader = true;
                }

                var includeAllObs = true;
                var getOrders = function () {
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        orderTypeUuid: $scope.orderTypeUuid,
                        conceptNames: $scope.config.conceptNames,
                        includeObs: includeAllObs,
                        numberOfVisits: $scope.config.numberOfVisits,
                        obsIgnoreList: $scope.config.obsIgnoreList,
                        visitUuid: $scope.visitUuid,
                        orderUuid: $scope.orderUuid
                    };
                    return orderService.getOrders(params).then(function (response) {
                        $scope.bahmniOrders = response.data;
                    });
                };
                var init = function () {
                    return getOrders().then(function () {
                        _.forEach($scope.bahmniOrders, function (order) {
                            if (order.bahmniObservations.length === 0) {
                                order.hideIfEmpty = true;
                            }
                        });
                        if (_.isEmpty($scope.bahmniOrders)) {
                            $scope.noOrdersMessage = $scope.getSectionTitle();
                        } else {
                            $scope.bahmniOrders[0].isOpen = true;
                        }
                    });
                };
                $scope.getTitle = function (order) {
                    return order.conceptName + " on " + $filter('bahmniDateTime')(order.orderDate) + " by " + order.provider;
                };

                $scope.toggle = function (element) {
                    element.isOpen = !element.isOpen;
                };

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };

                $scope.isClickable = function () {
                    return $scope.isOnDashboard && $scope.section.expandedViewConfig;
                };

                $scope.hasTitleToBeShown = function () {
                    return !$scope.isClickable() && $scope.getSectionTitle();
                };

                $scope.message = Bahmni.Common.Constants.messageForNoFulfillment;

                $scope.getSectionTitle = function () {
                    return $filter('titleTranslate')($scope.section);
                };
                $scope.initialization = init();
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/orders/views/ordersControl.html",
                scope: {
                    patient: "=",
                    section: "=",
                    orderType: "=",
                    orderUuid: "=",
                    config: "=",
                    isOnDashboard: "=",
                    visitUuid: "="
                }
            };
        }]);
