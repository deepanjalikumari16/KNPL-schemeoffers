// @Base Controller
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/BusyIndicator",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/routing/History",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "com/knpl/pragati/SchemeOffers/controller/Validator",
    ],
    function (
        Controller,
        BusyIndicator,
        Filter,
        FilterOperator,
        History,
        JSONModel,
        Fragment,
        MessageBox,
        MessageToast,
        Validator
    ) {
        "use strict";

        return Controller.extend(
            "com.knpl.pragati.SchemeOffers.controller.BaseController", {
            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },

            addContentDensityClass: function () {
                return this.getView().addStyleClass(
                    this.getOwnerComponent().getContentDensityClass()
                );
            },
            /**
             * Convenience method for getting the view model by name.
             * @public
             * @param {string} [sName] the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getViewModel: function (sName) {
                return this.getView().getModel(sName);
            },

            getComponentModel: function () {
                return this.getOwnerComponent().getModel();
            },

            /**
             * Convenience method for setting the view model.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Getter for the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            //for controlling global busy indicator
            presentBusyDialog: function () {
                BusyIndicator.show();
            },

            dismissBusyDialog: function () {
                BusyIndicator.hide();
            },

            onPressBreadcrumbLink: function () {
                this._navToHome();
            },
            onFileUploadChange: function (oEvent) {
                //console.log(oEvent);
                var oFileUploder = oEvent.getSource();
                if (oEvent.getParameter("newValue")) {
                    this._verifyImages(oEvent.mParameters.files[0], oFileUploder);
                }

            },
            _verifyImages: function (files, oFileUploder) {
                var file = files; //I'm doing just for one element (Iterato over it and do for many)
                var obj = this; // to get access of the methods inside the other functions
                var reader = new FileReader();
                reader.onload = function (e) {
                    var img = new Image();
                    img.onload = function () {
                        var info = {
                            image: this,
                            height: this.height,
                            width: this.width
                        };
                        //console.log("Imagem", info); //Just to see the info of the image
                        obj._removeImageOrNot(info, oFileUploder); //Here you will validate if 
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file); //Iterate here if you need
            },
            _removeImageOrNot: function (imgInfo, oFileUploder) {
                //get the UploadColection files and remove if is needed
                //console.log(imgInfo)
                if (imgInfo["height"] < 420 || imgInfo["width"] < 860) {
                    oFileUploder.setValue("");
                    MessageToast.show("Kindly Upload a file greater than dimension 860 X 420.")
                }


            },
            _navToHome: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                this._destroyDialogs();
                // if (sPreviousHash !== undefined) {
                //     window.history.go(-1);
                // } else {
                //     var oRouter = this.getOwnerComponent().getRouter();
                //     oRouter.navTo("RouteLandingPage", {}, true);
                // }
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteLandingPage", {}, true);
            },




            onPostSchemeData: function (oPayload, fileFlag) { },
            onBRRProductChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();
                var oModel = oView.getModel("oModelControl");
                var aNumber = sPath.match(/\d+$/)[0];
                var oTable = oModel.getProperty("/Table/Table4");
                for (var ele in oTable) {
                    if (ele == aNumber) {
                        continue;
                    }
                    if (oTable[ele]["ProductCode"] === sKey) {
                        MessageToast.show(
                            "Product Already Selected, Kindly select a different Product."
                        );
                        oModel.setProperty(sPath + "/ProductCode", "");
                        oModel.refresh(true);
                        break;
                    }
                }
            },
            onBRRPackChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();
                var oModel = oView.getModel("oModelControl");
                var aNumber = sPath.match(/\d+$/)[0];
                var oTable = oModel.getProperty("/Table/Table4");
                for (var ele in oTable) {
                    if (ele == aNumber) {
                        continue;
                    }
                    if (oTable[ele]["SkuCode"] === sKey) {
                        MessageToast.show(
                            "Pack Already Selected, Kindly select a different Pack."
                        );
                        oModel.setProperty(sPath + "/SkuCode", "");
                        oModel.refresh(true);
                        break;
                    }
                }
            },

            onStartDateChange: function (oEvent) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                var oStartDate = oEvent.getSource().getDateValue();
                var oEndDate = oModelView.getProperty("/EndDate");
                if (oEndDate) {
                    if (oStartDate > oEndDate) {
                        MessageToast.show("Kindly select a date less than end date.");
                        oModelControl.setProperty("/StartDate", "");
                        oModelView.setProperty("/StartDate", null);
                        return;
                    }
                }
                // if (oStartDate < new Date().setHours(0, 0, 0, 0)) {
                //     MessageToast.show(
                //         "Kindly enter a date greater than or equal to current date"
                //     );
                //     oModelControl.setProperty("/StartDate", "");
                //     oModelView.setProperty("/StartDate", null);
                //     return;
                // }
            },
            onEndDateChange: function (oEvent) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                var oEndDate = oEvent.getSource().getDateValue();
                var oStartDate = oModelView.getProperty("/StartDate");
                if (oStartDate) {
                    if (oStartDate > oEndDate) {
                        MessageToast.show("Kindly select a date more than or equal start date.");
                        oModelControl.setProperty("/EndDate", "");
                        oModelView.setProperty("/EndDate", null);
                        return;
                    }
                }

                // if (oEndDate < new Date().setHours(0, 0, 0, 0)) {
                //     MessageToast.show("Kindly enter a date greater than or equal to current date");
                //     oModelControl.setProperty("/EndDate", "");
                //     oModelView.setProperty("/EndDate", null);
                // }
            },
            onEndDateChange2: function (oEvent) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl2");
                var oModelView = oView.getModel("oModelDisplay");
                var oEndDate = oEvent.getSource().getDateValue();
                var oStartDate = oModelView.getProperty("/StartDate");
                if (oStartDate) {
                    if (oStartDate > oEndDate) {
                        MessageToast.show("Kindly select a date more than or equal start date.");
                        oModelControl.setProperty("/EndDate", "");
                        oModelView.setProperty("/EndDate", null);
                        return;
                    }
                }

                // if (oEndDate < new Date().setHours(0, 0, 0, 0)) {
                //     MessageToast.show("Kindly enter a date greater than or equal to current date");
                //     oModelControl.setProperty("/EndDate", "");
                //     oModelView.setProperty("/EndDate", null);
                // }
            },

            onOfferTypeChanged: function (oEvent) {
                var oView = this.getView();
                var oSource = oEvent.getSource().getSelectedItem();
                var sKey = oEvent.getSource().getSelectedKey();
                var object = oSource.getBindingContext().getObject();
                var oModelControl = oView.getModel("oModelControl");
                oModelControl.setProperty("/OfferType", object);
                this._OfferTypeFieldsSet();
                this._OfferTypeFieldSet2(sKey);
            },

            _OfferTypeFieldsSet: function () {
                // disabling all the fields that we have to hide.
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oOfferType = oView
                    .getModel("oModelControl")
                    .getProperty("/OfferType");
                var othat = this;
                for (var a in oOfferType) {
                    if (!oOfferType[a]) {
                        if (a === "ApplicablePainters") {
                            othat._propertyToBlank(
                                [
                                    "MultiCombo/ArcheTypes",
                                    "MultiCombo/PainterType",
                                    "MultiCombo/Potential",
                                    "MultiCombo/Zones",
                                    "MultiCombo/Divisions",
                                    "MultiCombo/Depots",
                                    "MultiEnabled/Zones",
                                    "MultiEnabled/Division",
                                    "MultiEnabled/Depots",
                                ],
                                true
                            );
                            othat._RbtnReset([
                                "Rbtn/Zones",
                                "Rbtn/Division",
                                "Rbtn/Depots",
                                "Rbtn/AppPainter",
                            ]);
                        } else if (a === "ApplicablePainterProducts") {
                            othat._propertyToBlank(
                                [
                                    "MultiCombo/PCat2",
                                    "MultiCombo/PClass2",
                                    "MultiCombo/AppProd2",
                                    "MultiCombo/AppPacks2",
                                    "MultiCombo/PCat3",
                                    "MultiCombo/PClass3",
                                    "MultiCombo/AppProd3",
                                    "MultiCombo/AppPacks3",
                                ],
                                true
                            );
                            othat._RbtnReset([
                                "Rbtn/PCat2",
                                "Rbtn/PClass2",
                                "Rbtn/AppProd2",
                                "Rbtn/AppPacks2",
                                "Rbtn/PCat3",
                                "Rbtn/PClass3",
                                "Rbtn/AppProd3",
                                "Rbtn/AppPacks3",
                            ]);
                        } else if (a === "AdditionalReward") {
                            othat._propertyToBlank(
                                [
                                    "MultiCombo/PCat4",
                                    "MultiCombo/PClass4",
                                    "MultiCombo/AppProd4",
                                    "MultiCombo/AppPacks4",
                                    "Table/Table4",
                                    "Table/Table3",
                                ],
                                true
                            );
                            othat._propertyToBlank([
                                "BonusDescription",
                                "PainterGrowth",
                                "PerformanceStartDate",
                                "PerformanceEndDate",
                                "BonusApplicableTopPainter",
                            ]);
                            othat._RbtnReset([
                                "Rbtn/PCat4",
                                "Rbtn/PClass4",
                                "Rbtn/AppProd4",
                                "Rbtn/AppPacks4",
                                "Rbtn/TopAll",
                                "Rbtn/BRewards",
                            ]);
                        } else if (a === "RewardRatio") {
                            // sending the reward ration value as all
                            // reward ratio is false means this is not a slab offer hense we have set max value as 1
                            othat._RbtnReset(["Rbtn/Rewards"]);
                            oModelControl.setProperty("/Fields/RewardRationCount", 1);
                        } else if (a === "EarnedPointsCondition") {
                            // if earned points condition is false we are going to make the offer OfferConditions/IsEarnedPointsCondition false
                            othat._propertyToBlank([
                                "OfferConditions/IsEarnedPointsCondition"
                            ]);
                            othat._propertyToBlank([
                                "Table/Table5"
                            ]);
                        } else if (a === "ProductValueCondition") {
                            // if earned points condition is false we are going to make the offer OfferConditions/IsProductValueCondition false
                            othat._propertyToBlank([
                                "OfferConditions/IsProductValueCondition"
                            ]);
                            othat._propertyToBlank([
                                "Table/Table6"
                            ], true);
                        } else if (a === "RedemptionCycleCondition") {
                            // if earned points condition is false we are going to make the offer OfferConditions/IsRedemptionCycleCondition false
                            othat._propertyToBlank([
                                "OfferConditions/IsRedemptionCycleCondition"
                            ], true);
                            othat._propertyToBlank([
                                "Table/Table7"
                            ], true);
                        }


                    } else if (oOfferType[a]) {
                        if (a === "RewardRatio") {
                            oModelControl.setProperty("/Rbtn/Rewards", 1);
                            oModelControl.setProperty("/Fields/RewardRationCount", 15);
                        }

                        // sending the reward ratio value as 1 that is generic
                        // reward ratio is true means this is not a slab offer hense we have set max value as 1
                    }
                }
                //oModelControl.refresh(true);

                // setting up redemption cycle data based on offer type
                this._SetRedemptionCycle();
            },
            _OfferTypeFieldSet2: function (mParam1) {
                //mParam1 is offer type id
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                // if offer type id is changed we are restting the value to 1
                oModelView.setProperty("/RedemptionCycle", 1);
                if (mParam1 == 1) {
                    oModelView.setProperty("/RedemptionCycle", "");
                }
                // if the Bonus type is slab then we can have table 4 is not visible
                // Bonus Reward Ratio is one
                if (mParam1 == 3) {
                    this._propertyToBlank(
                        ["Table/Table4"],
                        true
                    );
                    this._RbtnReset([
                        "Rbtn/BRewards"
                    ]);
                }
            },
            _setTable2Count: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
            },
            _SetRedemptionCycle: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oOfferType = oModel.getProperty("/OfferType");
                var aMaxValue = parseInt(oOfferType["RedemptionCycle"]);
                var aArray = [];
                for (var a = 1; a <= aMaxValue; a++) {
                    aArray.push({
                        Name: a,
                    });
                }
                oModel.setProperty("/oData/PerGrowth", aArray);
            },
            onMultyZoneChange: function (oEvent) {
                var sKeys = oEvent.getSource().getSelectedKeys();
                var oDivision = this.getView().byId("idDivision");
                var aDivFilter = [];
                for (var y of sKeys) {
                    aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y));
                }
                oDivision.getBinding("items").filter(aDivFilter);
            },
            _CheckAreaChange: function () {
                var oView = this.getView();
                var sZone = oView.byId("idZones");
                var sZoneKey = sZone.getSelectedKeys();
                var oDivision = oView.byId("idDivisions");
                var aDivisioKeys = oDivision.getSelectedKeys();
                var oDivisionItems = oDivision.getSelectedItems();

                var oDivObj;

                // check the division if its there for all the zones selected
                for (var j of oDivisionItems) {
                    oDivObj = j.getBindingContext().getObject();
                    if (sZoneKey.indexOf(oDivObj["Zone"]) < 0) {
                        oDivision.removeSelectedItem(j);
                        f;
                    }
                }
                // check for the depot tokens
                var oDepot = oView.byId("idDepots");
                var aTokens = oDepot.getTokens();
                var oModelControl = oView.getModel("oModelControl");
                var aTokenKeys = oModelControl.getProperty("/MultiCombo/Depots");
                var oNewDivisionKeys = oDivision.getSelectedKeys();
                var aDepotToken = [];
                for (var k in aTokenKeys) {
                    if (oNewDivisionKeys.indexOf(aTokenKeys[k]["Division"]) >= 0) {
                        aDepotToken.push(aTokenKeys[k]);
                    }
                }
                oModelControl.setProperty("/MultiCombo/Depots", aDepotToken);
            },
            onRbPrntOffer: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedIndex();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModel2 = oView.getModel("oModelView");
                if (sKey === 0) {
                    oModel.setProperty("/Fields/ParentOfferTitle", "");
                    oModel2.setProperty("/ParentOfferId", 0);
                }
            },

            onProd1Change: function (oEvent) {
                var oSource = oEvent.getSource();
                var sKeys = oSource.getSelectedKeys();
                var aPackFilter = [];
                var oPacks = this.getView().byId("AppPacks1");

                for (var y of sKeys) {
                    aPackFilter.push(new Filter("ProductCode", FilterOperator.EQ, y));
                }
                oPacks.getBinding("items").filter(aPackFilter);

                this._fnChangeProdPacks({
                    src: {
                        path: "/MultiCombo/AppProd1",
                    },
                    target: {
                        localPath: "/MultiCombo/AppPacks1",
                        oDataPath: "/MasterRepProductSkuSet",
                        key: "ProductCode",
                    },
                });
                this._CreateRewardTableData();
            },
            _fnChangeProdPacks: function (oChgdetl) {
                var oView = this.getView();
                var aSource = oView
                    .getModel("oModelControl")
                    .getProperty(oChgdetl.src.path),
                    oSourceSet = new Set(aSource);

                var aTarget = oView
                    .getModel("oModelControl")
                    .getProperty(oChgdetl.target.localPath),
                    aNewTarget = [];

                var oModel = this.getView().getModel(),
                    tempPath,
                    tempdata;

                aTarget.forEach(function (ele) {
                    if (typeof ele === "string") {
                        tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                            SkuCode: ele["Id"],
                        });
                    } else {
                        tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                            SkuCode: ele[oChgdetl.target.targetKey],
                        });
                    }
                    tempdata = oModel.getData(tempPath);
                    if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                        aNewTarget.push(ele);
                    }
                });

                oView
                    .getModel("oModelControl")
                    .setProperty(oChgdetl.target.localPath, aNewTarget);
            },
            _fnChangeDivDepot: function (oChgdetl) {
                var oView = this.getView();
                var aSource = oView
                    .getModel("oModelControl")
                    .getProperty(oChgdetl.src.path),
                    oSourceSet = new Set(aSource);

                var aTarget = oView
                    .getModel("oModelControl")
                    .getProperty(oChgdetl.target.localPath),
                    aNewTarget = [];

                var oModel = this.getView().getModel(),
                    tempPath,
                    tempdata;

                aTarget.forEach(function (ele) {
                    if (typeof ele === "string") {
                        tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                            Id: ele,
                        });
                    } else {
                        tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                            Id: ele[oChgdetl.target.targetKey],
                        });
                    }
                    tempdata = oModel.getData(tempPath);
                    if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                        aNewTarget.push(ele);
                    }
                });

                oView
                    .getModel("oModelControl")
                    .setProperty(oChgdetl.target.localPath, aNewTarget);
            },
            onBRAppDropChange: function () {
                this._CreateBonusRewardTable();
            },
            onRbRewardRatio: function () {
                this._CreateRewardTableData();
            },
            onBRRbChange: function () {
                this.getView()
                    .getModel("oModelControl")
                    .setProperty("/Table/Table3", []);
                this._CreateBonusRewardTable();
            },
            _CreateBonusRewardTable: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oModelControl = oView.getModel("oModelControl");
                if (!mParam) {
                    oModelControl.setProperty("/Table/Table4", []);
                }

                var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks4");
                var oDataModel = this.getView().getModel();
                var c1, c2, c3, c4, c5;
                if (sCheckPacks == 0) {
                    var aFilter = [];
                    var aCat = oModelControl.getProperty("/MultiCombo/PCat4");
                    var aClass = oModelControl.getProperty("/MultiCombo/PClass4");
                    var aFilter1 = [];
                    var aFilter2 = [];
                    for (var a of aCat) {
                        aFilter.push(
                            new Filter("ProductCategory/Id", FilterOperator.EQ, a)
                        );
                    }
                    for (var b of aClass) {
                        aFilter.push(
                            new Filter("ProductClassification/Id", FilterOperator.EQ, b)
                        );
                    }

                    var c1 = othat._getProductsData(aFilter);
                    c1.then(function () {
                        othat._setBRProductsData();
                    })

                } else {
                    othat._setBRPacksData();
                }
                promise.resolve();
                return promise;
            },
            onPressAddGenericReward2V2: function (oEvent) {
                var oView = this.getView();
                var oModel = this.getView().getModel("oModelControl");
                var oRewardDtl = oModel.getProperty("/Table/Table3");
                if (oEvent !== "add") {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;

                    oModel.refresh();
                } else {
                    var bFlag = true;
                    var sLength = 1;
                    if (oRewardDtl.length >= sLength) {
                        MessageToast.show(
                            "For the current bonus type we can add only " +
                            sLength +
                            " item(s)."
                        );
                        bFlag = false;
                        return;
                    }
                    if (oRewardDtl.length > 0 && oRewardDtl.length <= sLength) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data"
                                );
                                return;
                                break;
                            }
                        }
                    }

                    if (bFlag == true) {
                        oRewardDtl.push({
                            RewardRatioType: 0,
                            StartDate: null,
                            EndDate: null,
                            BonusPoints: "",
                            BonusPercentage: "",
                            editable: true,
                        });
                    }
                    oModel.refresh();
                }
            },
            onSaveGenericBonusReward: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();

                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();
                var cFlag = oValidator.validate(oCells);
                var bFlag = true;
                if (!oObject["StartDate"]) {
                    MessageToast.show("Kindly Input All Bonus Validity Fields to Continue");
                    return;
                }
                if (!oObject["EndDate"]) {
                    MessageToast.show("Kindly Input All Bonus Validity Fields to Continue");
                    return;
                }

                if (!cFlag) {
                    MessageToast.show("Kindly Input All Bonus Validity Fields to Continue.");
                    return;
                }

                //var cFlag = oValidator.validate();
                // var oCheckProp = ["RelationshipId", "Name"];
                // for (var abc in oCheckProp) {
                //     if (oObject[abc] == "") {
                //         bFlag = false;
                //         break;
                //     }
                // }

                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    oModel.refresh(true);
                }
                //oModel.refresh(true);
            },
            onPressAddGenericReward2: function (oEvent) {
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelControl");
                var oBj = {},
                    sPath = "";
                if (oEvent !== "add") {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;

                    oModel.refresh();
                } else {
                    oBj = false;
                    oModel.setProperty("/Dialog/Key2", "add");
                }

                if (!this._RewardsDialog2) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks2",
                        controller: othat,
                    }).then(
                        function (oDialog) {
                            this._RewardsDialog2 = oDialog;
                            oView.addDependent(this._RewardsDialog2);
                            this._setAddGenericRewardDialog2(oBj);
                            this._RewardsDialog2.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._RewardsDialog2);
                    this._setAddGenericRewardDialog2(oBj);
                    this._RewardsDialog2.open();
                }
            },
            _setAddGenericRewardDialog2: function (oBj) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oBj1 = oBj;
                var oBj2 = {
                    RewardRatioType: 0,
                    StartDate: null,
                    EndDate: null,
                    BonusPoints: "",
                };
                var oBj3 = {
                    RewardRatioType: 0,
                    StartDate: null,
                    EndDate: null,
                    BonusPoints: "",
                };
                var oBjFinal;
                var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks4");
                if (iRtnSelected === 0) {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                    oModelControl.setProperty(
                        "/Dialog/Bonus2",
                        Object.assign({}, oBjFinal)
                    );
                } else {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                    oModelControl.setProperty(
                        "/Dialog/Bonus2",
                        Object.assign({}, oBjFinal)
                    );
                }
            },
            onSubmitGenericRewards2: function () {
                var oView = this.getView();
                var oModel2 = oView.getModel("oModelControl");
                var sKey = oModel2.getProperty("/Dialog/Key2");
                var oPayload = oModel2.getProperty("/Dialog/Bonus2");
                var oValidate = new Validator();
                var oForm = oView.byId("FormAddProdPacks2");
                var bFlagValidate = oValidate.validate(oForm, true);

                if (oPayload["StartDate"] == null) {
                    MessageToast.show("Kindly Input Start Date to Continue");
                    return;
                }
                if (oPayload["EndDate"] == null) {
                    MessageToast.show("Kindly Input End Date to Continue");
                    return;
                }
                if (oPayload["BonusPoints"] === "") {
                    MessageToast.show("Kindly Input Bonus Points to Continue");
                    return;
                }
                if (!bFlagValidate) {
                    MessageToast.show("Kindly enter the fields in proper format.");
                    return;
                }

                var oPayloadNew = Object.assign({}, oPayload);
                if (sKey === "add") {
                    oModel2.getProperty("/Table/Table3").push(oPayloadNew);
                } else {
                    oModel2
                        .getProperty("/Table/Table3")
                        .splice(parseInt(sKey), 1, oPayloadNew);
                }

                oModel2.refresh(true);
                this._RewardsDialog2.close();
            },
            onRemovedGenericReward2: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath()
                    .split("/");

                var oTable = oModel.getProperty("/Table/Table3");

                oTable.splice(sPath[sPath.length - 1], 1);
                oModel.refresh(true);
            },
            onPressAddRewards2V2: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oRewardDtl = oModel.getProperty("/Table/Table4");
                var iPackRbtn = oModel.getProperty("/Rbtn/AppPacks4");
                var aProdPackData = oModel.getProperty("/MultiCombo/Reward2");
                if (oEvent !== "add") {
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;
                    oModel.refresh();
                } else {
                    var bFlag = true;
                    var sLength = aProdPackData.length;
                    if (oRewardDtl.length >= sLength) {
                        MessageToast.show(
                            "For the current bonus type we can add only " +
                            sLength +
                            " item(s)."
                        );
                        bFlag = false;
                        return;
                    }
                    if (oRewardDtl.length > 0 && oRewardDtl.length <= sLength) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data"
                                );
                                return;
                                break;
                            }
                        }
                    }

                    if (bFlag == true) {
                        oRewardDtl.push({
                            RewardRatioType: iPackRbtn === 0 ? 1 : 2,
                            SkuCode: "",
                            ProductCode: "",
                            StartDate: null,
                            EndDate: null,
                            BonusPoints: "",
                            BonusPercentage: "",
                            editable: true,
                        });
                    }
                    oModel.refresh(true);
                }
            },
            onSaveBonusRewardV2: function (oEvent) {
                // console.log(
                //     oEvent.getSource().getBindingContext("oModelControl").getObject()
                // );
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();

                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();

                var bFlag = true;

                var bHasPack = oModel.getProperty("/Rbtn/AppPacks4");

                if (bHasPack === 1) {
                    if (oObject["SkuCode"] === "") {
                        MessageToast.show("Kindly Select a Pack To Continue.");
                        return;
                    }
                }
                if (bHasPack === 0) {
                    if (oObject["ProductCode"] === "") {
                        MessageToast.show("Kindly Select a Product To Continue.");
                        return;
                    }
                }
                var cFlag = oValidator.validate(oCells);
                if (!oObject["StartDate"]) {
                    MessageToast.show("Kindly Input All Bonus Validity Fields to Continue");
                    return;
                }
                if (!oObject["EndDate"]) {
                    MessageToast.show("Kindly Input All Bonus Validity Fields to Continue");
                    return;
                }
                if (!cFlag) {
                    MessageToast.show("Kindly Input All Bonus Validity Fields to Continue");
                    return;
                }

                //var cFlag = oValidator.validate();
                // var oCheckProp = ["RelationshipId", "Name"];
                // for (var abc in oCheckProp) {
                //     if (oObject[abc] == "") {
                //         bFlag = false;
                //         break;
                //     }
                // }

                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    oModel.refresh(true);
                }
            },
            onPressAddRewards2: function (oEvent) {
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelControl");
                var oBj = {},
                    sPath = "";
                if (oEvent !== "add") {
                    oBj = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    sPath = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getPath()
                        .split("/");
                    oModel.setProperty("/Dialog/Key2", sPath[sPath.length - 1]);
                } else {
                    oBj = false;
                    oModel.setProperty("/Dialog/Key2", "add");
                }

                if (!this._RewardsDialog2) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks2",
                        controller: othat,
                    }).then(
                        function (oDialog) {
                            this._RewardsDialog2 = oDialog;
                            oView.addDependent(this._RewardsDialog2);
                            this._setAddRewardDialog2(oBj);
                            this._RewardsDialog2.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._RewardsDialog2);
                    this._setAddRewardDialog2(oBj);
                    this._RewardsDialog2.open();
                }
            },
            _setAddRewardDialog2: function (oBj) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oBj1 = oBj;
                var oBj2 = {
                    //for the case of products this is one
                    RewardRatioType: 1,
                    SkuCode: null,
                    ProductCode: "",
                    StartDate: null,
                    EndDate: null,
                    BonusPoints: "",
                };
                var oBj3 = {
                    RewardRatioType: 2,
                    SkuCode: "",
                    ProductCode: null,
                    StartDate: null,
                    EndDate: null,
                    BonusPoints: "",
                };
                var oBjFinal;
                var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks4");
                if (iRtnSelected === 0) {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                    oModelControl.setProperty(
                        "/Dialog/Bonus2",
                        Object.assign({}, oBjFinal)
                    );
                    this._setBRProductsData();
                } else {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                    oModelControl.setProperty(
                        "/Dialog/Bonus2",
                        Object.assign({}, oBjFinal)
                    );
                    this._setBRPacksData();
                }
            },
            onSubmitRewards2: function () {
                var oView = this.getView();

                var oModel2 = oView.getModel("oModelControl");
                var sKey = oModel2.getProperty("/Dialog/Key2");
                var oPayload = oModel2.getProperty("/Dialog/Bonus2");
                var bHasPack = oModel2.getProperty("/Rbtn/AppPacks4");
                var oValidate = new Validator();
                var oForm = oView.byId("FormAddProdPacks2");
                var bFlagValidate = oValidate.validate(oForm, true);

                if (bHasPack === 1) {
                    if (oPayload["SkuCode"] === "") {
                        MessageToast.show("Kindly Select a Pack To Continue.");
                        return;
                    }
                }
                if (bHasPack === 0) {
                    if (oPayload["ProductCode"] === "") {
                        MessageToast.show("Kindly Select a Product To Continue.");
                        return;
                    }
                }
                if (oPayload["StartDate"] == null) {
                    MessageToast.show("Kindly Input Start Date to Continue");
                    return;
                }
                if (oPayload["EndDate"] == null) {
                    MessageToast.show("Kindly Input End Date to Continue");
                    return;
                }
                if (oPayload["BonusPoints"] === "") {
                    MessageToast.show("Kindly Input Bonus Points to Continue");
                    return;
                }
                if (!bFlagValidate) {
                    MessageToast.show("Kindly enter the fields in proper format.");
                    return;
                }
                var oPayloadNew = Object.assign({}, oPayload);
                if (sKey === "add") {
                    oModel2.getProperty("/Table/Table4").push(oPayloadNew);
                } else {
                    oModel2
                        .getProperty("/Table/Table4")
                        .splice(parseInt(sKey), 1, oPayloadNew);
                }

                oModel2.refresh();
                this._RewardsDialog2.close();
            },
            onRemovedReward2: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath()
                    .split("/");

                var oTable = oModel.getProperty("/Table/Table4");

                oTable.splice(sPath[sPath.length - 1], 1);
                oModel.refresh();
            },
            onPressAddGenericRewardsV1: function (oEvent) {
                var oModel = this.getView().getModel("oModelControl");
                var oRewardDtl = oModel.getProperty("/Table/Table1");
                if (oEvent !== "add") { } else {
                    var bFlag = true;
                    if (oRewardDtl.length > 0) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data."
                                );
                                return;
                                break;
                            }
                        }
                    }
                    // if (oRewardDtl.length >= 15) {
                    //     MessageToast.show(
                    //         "We can only add 15 family members. Kindly remove any existing data to add a new family member."
                    //     );
                    //     bFlag = false;
                    //     return;
                    // }
                    if (bFlag == true) {
                        oRewardDtl.push({
                            RequiredVolume: "",
                            RequiredPoints: "",
                            RewardPoints: "",
                            RewardCash: "",
                            editable: true,
                        });
                        oModel.refresh();

                        //relvalue and editable properties are added here and will be removed in the postsave function
                    }
                    // oBj = false;
                    // oModel.setProperty("/Dialog/Key1", "add");
                }
            },
            onPressAddGenericRewards: function (oEvent) {
                var oView = this.getView();
                var othat = this;
                var oModel = oView.getModel("oModelControl");
                var oBj = {},
                    sPath = "";
                if (oEvent !== "add") {
                    oBj = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    sPath = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getPath()
                        .split("/");
                    oModel.setProperty("/Dialog/Key1", sPath[sPath.length - 1]);
                } else {
                    oBj = false;
                    oModel.setProperty("/Dialog/Key1", "add");
                }

                if (!this._RewardsDialog1) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks",
                        controller: othat,
                    }).then(
                        function (oDialog) {
                            this._RewardsDialog1 = oDialog;
                            oView.addDependent(this._RewardsDialog1);
                            this._setAddGenericRewardDialog(oBj);
                            this._RewardsDialog1.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._RewardsDialog1);
                    this._setAddGenericRewardDialog(oBj);
                    this._RewardsDialog1.open();
                }
            },
            _setAddGenericRewardDialog: function (oBj) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oBj1 = oBj;
                var oBj2 = {
                    RequiredVolume: "",
                    RequiredPoints: "",
                    RewardPoints: "",
                    // RewardGiftId: "",
                    RewardCash: "",
                };
                var oBj3 = {
                    RequiredVolume: "",
                    RequiredPoints: "",
                    RewardPoints: "",
                    // RewardGiftId: "",
                    RewardCash: "",
                };
                var oBjFinal;
                var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks1");

                if (iRtnSelected === 0) {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                    oModelControl.setProperty(
                        "/Dialog/Bonus1",
                        Object.assign({}, oBjFinal)
                    );
                } else {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                    oModelControl.setProperty(
                        "/Dialog/Bonus1",
                        Object.assign({}, oBjFinal)
                    );
                }
                if (oBjFinal["RequiredPoints"]) {
                    oModelControl.setProperty("/Rbtn/BrReqVol", 1);
                } else {
                    oModelControl.setProperty("/Rbtn/BrReqVol", 0);
                }
                if (oBjFinal["RewardCash"]) {
                    oModelControl.setProperty("/Rbtn/BrReqCash", 1);
                } else {
                    oModelControl.setProperty("/Rbtn/BrReqCash", 0);
                }
            },

            onRbVolRewardCash: function (oEvent) {
                //1 is for Yes; 0 is for No;
                var sKey = oEvent.getSource().getSelectedIndex();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = "/Dialog/Bonus1";
                oModel.setProperty(sPath + "/RewardCash", "");
            },
            onSubmitGenericRewards1: function () {
                var oView = this.getView();

                var oModel2 = oView.getModel("oModelControl");
                var sKey = oModel2.getProperty("/Dialog/Key1");
                var oPayload = oModel2.getProperty("/Dialog/Bonus1");
                var oValidate = new Validator();
                var oForm = oView.byId("FormAddProdPacks");
                var bFlagValidate = oValidate.validate(oForm, true);
                if (!oPayload["RequiredVolume"] && !oPayload["RequiredPoints"]) {
                    MessageToast.show(
                        "Kindly Input atleast Required Volume or Required Points to Continue."
                    );
                    return;
                }
                if (oPayload["RewardPoints"] == "") {
                    MessageToast.show("Kindly Input Reward Points to Continue.");
                    return;
                }
                if (!bFlagValidate) {
                    MessageToast.show("Kindly enter the fields in proper format.");
                    return;
                }
                var oPayloadNew = Object.assign({}, oPayload);
                if (sKey === "add") {
                    oModel2.getProperty("/Table/Table1").push(oPayloadNew);
                } else {
                    oModel2
                        .getProperty("/Table/Table1")
                        .splice(parseInt(sKey), 1, oPayloadNew);
                }

                this._RewardsDialog1.close();
                oModel2.refresh(true);
            },
            onRemovedGenericReward: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath()
                    .split("/");

                var oTable = oModel.getProperty("/Table/Table1");

                oTable.splice(sPath[sPath.length - 1], 1);
                oModel.refresh(true);
            },
            onPressAddRewardsV1: function (oEvent) {
                var oView = this.getView();
                var oModel = this.getView().getModel("oModelControl");
                var oRewardDtl = oModel.getProperty("/Table/Table2");
                if (oEvent !== "add") {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;

                    oModel.refresh();
                } else {
                    var bFlag = true;
                    var sLength = oModel.getProperty("/Fields/RewardRationCount");
                    if (oRewardDtl.length > 0 && oRewardDtl.length <= sLength) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data"
                                );
                                return;
                                break;
                            }
                        }
                    }
                    if (oRewardDtl.length >= sLength) {
                        MessageToast.show(
                            "For the current Offer type we can add only " +
                            sLength +
                            " item(s)."
                        );
                        bFlag = false;
                        return;
                    }
                    if (bFlag == true) {
                        oRewardDtl.push({
                            RewardGiftId: null,
                            RewardGiftName: "",
                            RequiredVolume: "",
                            RequiredPoints: "",
                            RewardPoints: "",
                            RewardCash: "",
                            editable: true,
                        });

                        //relvalue and editable properties are added here and will be removed in the postsave function
                    }
                    oModel.refresh();
                }
            },
            onPressSaveReward: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();

                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();
                var cFlag = oValidator.validate(oCells);

                var bFlag = true;

                if (!cFlag) {
                    MessageToast.show(
                        "Kindly Input Mandatory Fields In Proper Format To Continue."
                    );
                    return;
                }
                if (
                    !oObject["RewardPoints"] &&
                    !oObject["RewardCash"] &&
                    !oObject["RewardGiftName"]
                ) {
                    MessageToast.show(
                        "Kindly Enter Either Reward Points Or Reward Cash or Reward Gift To Continue."
                    );
                    return;
                }
                //var cFlag = oValidator.validate();
                // var oCheckProp = ["RelationshipId", "Name"];
                // for (var abc in oCheckProp) {
                //     if (oObject[abc] == "") {
                //         bFlag = false;
                //         break;
                //     }
                // }
                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    if (!oObject["RewardGiftName"]) {
                        if (oObject.hasOwnProperty("RewardGiftId")) {
                            oObject["RewardGiftId"] = null;
                        }
                    }
                    oModel.refresh(true);
                }
                //oModel.refresh(true);
            },
            onRbRRDialogVolume: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                oModel.setProperty("/Table/Table2", []);
                oModel.setProperty("/Table/Table5", []);
            },
            onRbRRDialogVolume2: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                oModel.setProperty("/Table/Table3", []);
                oModel.setProperty("/Table/Table4", []);
            },
            onPressAddRewards: function (oEvent) {
                // var oView = this.getView();
                // var othat = this;
                // var oModel = oView.getModel("oModelControl");
                // var oBj = {},
                //     sPath = "";
                if (oEvent !== "add") {
                    // oBj = oEvent
                    //     .getSource()
                    //     .getBindingContext("oModelControl")
                    //     .getObject();
                    // sPath = oEvent
                    //     .getSource()
                    //     .getBindingContext("oModelControl")
                    //     .getPath()
                    //     .split("/");
                    // oModel.setProperty("/Dialog/Key1", sPath[sPath.length - 1]);
                } else {
                    var oModel = this.getView().getModel("oModelControl");
                    var oFamiDtlMdl = oModel.getProperty("/Table/Table2");
                    var bFlag = true;
                    if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length < 15) {
                        for (var prop of oFamiDtlMdl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data."
                                );
                                return;
                                break;
                            }
                        }
                    }
                    if (oFamiDtlMdl.length >= 15) {
                        MessageToast.show("We can only add 15 items");
                        bFlag = false;
                        return;
                    }
                    if (bFlag == true) {
                        oFamiDtlMdl.push({
                            RequiredVolume: "",
                            RequiredPoints: "",
                            RewardPoints: "",
                            RewardCash: "",
                            editable: true,
                        });

                        //relvalue and editable properties are added here and will be removed in the postsave function
                    }
                    oModel.refresh();
                    // oBj = false;
                    // oModel.setProperty("/Dialog/Key1", "add");
                }

                // if (!this._RewardsDialog1) {
                //     Fragment.load({
                //         id: oView.getId(),
                //         name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks",
                //         controller: othat,
                //     }).then(
                //         function (oDialog) {
                //             this._RewardsDialog1 = oDialog;
                //             oView.addDependent(this._RewardsDialog1);
                //             this._setAddRewardDialog(oBj);
                //             this._RewardsDialog1.open();
                //         }.bind(this)
                //     );
                // } else {
                //     oView.addDependent(this._RewardsDialog1);
                //     this._setAddRewardDialog(oBj);
                //     this._RewardsDialog1.open();
                // }
            },
            _setAddRewardDialog: function (oBj) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oBj1 = oBj;
                var oBj2 = {
                    RequiredVolume: "",
                    RequiredPoints: "",
                    RewardPoints: "",
                    //RewardGiftId: "",
                    RewardCash: "",
                };
                var oBj3 = {
                    RequiredVolume: "",
                    RequiredPoints: "",
                    RewardPoints: "",
                    //RewardGiftId: "",
                    RewardCash: "",
                };
                var oBjFinal;
                var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks1");
                if (iRtnSelected === 0) {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                    oModelControl.setProperty(
                        "/Dialog/Bonus1",
                        Object.assign({}, oBjFinal)
                    );
                    this._setProductsData();
                } else {
                    oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                    oModelControl.setProperty(
                        "/Dialog/Bonus1",
                        Object.assign({}, oBjFinal)
                    );
                    this._setPacksData();
                }

                if (oBjFinal["RequiredPoints"]) {
                    oModelControl.setProperty("/Rbtn/BrReqVol", 1);
                } else {
                    oModelControl.setProperty("/Rbtn/BrReqVol", 0);
                }
                if (oBjFinal["RewardCash"]) {
                    oModelControl.setProperty("/Rbtn/BrReqCash", 1);
                } else {
                    oModelControl.setProperty("/Rbtn/BrReqCash", 0);
                }
                oModelControl.refresh(true);
            },
            onSubmitRewards1: function () {
                var oView = this.getView();

                var oModel2 = oView.getModel("oModelControl");
                var sKey = oModel2.getProperty("/Dialog/Key1");
                var oPayload = oModel2.getProperty("/Dialog/Bonus1");
                var oValidate = new Validator();
                var oForm = oView.byId("FormAddProdPacks");
                var bFlagValidate = oValidate.validate(oForm, true);

                // if (oPayload.hasOwnProperty("SkuCode")) {
                //     if (oPayload["SkuCode"] === "") {
                //         MessageToast.show("kindly Select a Pack To Continue.");
                //         return;
                //     }
                // }
                // if (oPayload.hasOwnProperty("ProductCode")) {
                //     if (oPayload["ProductCode"] === "") {
                //         MessageToast.show("Kindly Select a Product To Continue.");
                //         return;
                //     }

                // }
                if (!oPayload["RequiredVolume"] && !oPayload["RequiredPoints"]) {
                    MessageToast.show(
                        "Kindly Input atleast Required Volume or Required Points to Continue."
                    );
                    return;
                }
                if (oPayload["RewardPoints"] == "") {
                    MessageToast.show("Kindly Input Reward Points to Continue.");
                    return;
                }
                if (!bFlagValidate) {
                    MessageToast.show("Kindly enter the fields in proper format.");
                    return;
                }
                var oPayloadNew = Object.assign({}, oPayload);
                if (sKey === "add") {
                    oModel2.getProperty("/Table/Table2").push(oPayloadNew);
                } else {
                    oModel2
                        .getProperty("/Table/Table2")
                        .splice(parseInt(sKey), 1, oPayloadNew);
                }

                oModel2.refresh(true);
                this._RewardsDialog1.close();
            },
            onRemovedReward: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath()
                    .split("/");

                var oTable = oModel.getProperty("/Table/Table2");

                oTable.splice(sPath[sPath.length - 1], 1);
                oModel.refresh(true);
            },
            // conditions table change
            onRbConditions1: function (oEvent) {
                var oView = this.getView();
                var oModelC = oView.getModel("oModelControl");
                var oBinding = oEvent.getSource().getBinding("selectedIndex").getBindings()[0];
                var sPath = oBinding.getPath();
                var oModel = oBinding.getModel();
                var sSelectedIndex = oEvent.getParameter("selectedIndex");
                var oTable = {
                    "/OfferConditions/IsEarnedPointsCondition": "/Table/Table5",
                    "/OfferConditions/IsProductValueCondition": "/Table/Table6",
                    "/OfferConditions/IsRedemptionCycleCondition": "/Table/Table7"
                }
                if (sSelectedIndex === 0) {
                    oModel.setProperty(sPath, false);
                    oModelC.setProperty(oTable[sPath], []);
                } else {
                    oModel.setProperty(sPath, true);
                    // one value should be added by default
                }

            },
            onPressAddCondition1: function (oEvent) {

                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModel2 = oView.getModel("oModelView");
                var oRewardDtl = oModel.getProperty("/Table/Table5");

                if (oEvent !== "add") {
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;
                    oModel.refresh();
                } else {
                    var bFlag = true;
                    var sLength = 1;
                    if (oRewardDtl.length >= sLength) {
                        MessageToast.show(
                            "For the scenario we can only add " +
                            sLength +
                            " item(s)."
                        );
                        bFlag = false;
                        return;
                    }
                    if (oRewardDtl.length > 0 && oRewardDtl.length <= sLength) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data"
                                );
                                return;
                                break;
                            }
                        }
                    }

                    if (bFlag == true) {
                        oRewardDtl.push({
                            InputType: oModel2.getProperty("/InputType"),
                            RequiredPoints: "",
                            RequiredVolume: "",
                            EndDate: null,
                            StartDate: null,
                            editable: true,
                        });
                    }
                    oModel.refresh(true);
                }
            },
            onPressSaveCondition1: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();

                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();

                var bFlag = true;
                var cFlag = oValidator.validate(oCells);

                if (!oObject["EndDate"]) {
                    MessageToast.show("Kindly Input All Fields of table in proper format to Continue.");
                    bFlag = false;
                    return;
                }
                if (!oObject["StartDate"]) {
                    MessageToast.show("Kindly Input All Fields of table in proper format to Continue.");
                    bFlag = false;
                    return;
                }
                if (!cFlag) {
                    MessageToast.show("Kindly Input All Fields of table in proper format to Continue.");
                    return;
                }

                //var cFlag = oValidator.validate();
                // var oCheckProp = ["RelationshipId", "Name"];
                // for (var abc in oCheckProp) {
                //     if (oObject[abc] == "") {
                //         bFlag = false;
                //         break;
                //     }
                // }

                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    oModel.refresh(true);
                }
            },
            onStartDateCondition1: function (oEvent) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                var oCurrentDate = oEvent.getSource().getDateValue();
                var oEndDate = oModelView.getProperty("/EndDate");

                var oStartDate = oModelView.getProperty("/StartDate");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();

                var oConditionEndDate = oModelView.getProperty(sPath + "/EndDate");
                if (oCurrentDate > oConditionEndDate) {
                    MessageToast.show("Kindly select a date less than Earned Point Condition End date.");
                    oModelControl.setProperty(sPath + "/StartDate", null);
                    return;

                } else if (oCurrentDate < oStartDate) {
                    MessageToast.show("Kindly select a date more than Offer Start date.");
                    oModelControl.setProperty(sPath + "/StartDate", null);
                    return;

                } else if (oCurrentDate > oEndDate) {
                    MessageToast.show("Kindly select a date less than Offer End date.");
                    oModelControl.setProperty(sPath + "/StartDate", null);
                    return;

                }

            },
            onEndDateCondition1: function (oEvent) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                var oCurrentDate = oEvent.getSource().getDateValue();
                var oEndDate = oModelView.getProperty("/EndDate");
                var oStartDate = oModelView.getProperty("/StartDate");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();

                var oConditionStartDate = oModelView.getProperty(sPath + "/StartDate");
                if (oCurrentDate < oConditionStartDate) {
                    MessageToast.show("Kindly select a date more than Earned Point Condition Start date.");
                    oModelControl.setProperty(sPath + "/EndDate", null);
                    return;

                } else if (oCurrentDate < oStartDate) {
                    MessageToast.show("Kindly select a date more than Offer Start date.");
                    oModelControl.setProperty(sPath + "/EndDate", null);
                    return;

                } else if (oCurrentDate > oEndDate) {
                    MessageToast.show("Kindly select a date less than Offer End date.");
                    oModelControl.setProperty(sPath + "/EndDate", null);
                    return;

                }

            },
            onRemovedCondition: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();
                var sTablepath = sPath.replace(/[0-9]$/g, '');
                var sPathArray = sPath.split("/");

                var oTable = oModel.getProperty(sTablepath);

                oTable.splice(sPathArray[sPathArray.length - 1], 1);
                oModel.refresh();
            },
            onPressAddCondition2: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oRewardDtl = oModel.getProperty("/Table/Table6");

                if (oEvent !== "add") {
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;
                    oModel.refresh();
                } else {
                    var bFlag = true;
                    var sLength = 5;
                    if (oRewardDtl.length >= sLength) {
                        MessageToast.show(
                            "For the scenario we can only add " +
                            sLength +
                            " item(s)."
                        );
                        bFlag = false;
                        return;
                    }
                    if (oRewardDtl.length > 0 && oRewardDtl.length <= sLength) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data"
                                );
                                return;
                                break;
                            }
                        }
                    }

                    if (bFlag == true) {
                        oRewardDtl.push({
                            ProductCode: "",
                            Percentage: "",
                            editable: true,
                        });
                    }
                    oModel.refresh(true);
                }
            },
            onPressSaveCondition2: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();

                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();

                var bFlag = true;
                var cFlag = oValidator.validate(oCells);

                if (!oObject["ProductCode"]) {
                    MessageToast.show("Kindly Input All Fields of table in proper format to Continue.");
                    return;
                }
                if (!cFlag) {
                    MessageToast.show("Kindly Input All Fields of table in proper format to Continue.");
                    return;
                }

                //var cFlag = oValidator.validate();
                // var oCheckProp = ["RelationshipId", "Name"];
                // for (var abc in oCheckProp) {
                //     if (oObject[abc] == "") {
                //         bFlag = false;
                //         break;
                //     }
                // }

                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    oModel.refresh(true);
                }
            },
            onPressAddCondition3: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oRewardDtl = oModel.getProperty("/Table/Table7");

                if (oEvent !== "add") {
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getObject();
                    oObject["editable"] = true;
                    oModel.refresh();
                } else {
                    var bFlag = true;
                    var sLength = 1;
                    if (oRewardDtl.length >= sLength) {
                        MessageToast.show(
                            "For the scenario we can only add " +
                            sLength +
                            " item(s)."
                        );
                        bFlag = false;
                        return;
                    }
                    if (oRewardDtl.length > 0 && oRewardDtl.length <= sLength) {
                        for (var prop of oRewardDtl) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data"
                                );
                                return;
                                break;
                            }
                        }
                    }

                    if (bFlag == true) {
                        oRewardDtl.push({
                            Percentage: "",
                            RedemptionCycle: 1,
                            editable: true,
                        });
                    }
                    oModel.refresh();
                }
            },
            onPressSaveCondition3: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();
                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();
                var bFlag = true;
                var cFlag = oValidator.validate(oCells);
                if (!cFlag) {
                    MessageToast.show("Kindly Input All Fields of table in proper format to Continue.");
                    return;
                }
                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    oModel.refresh();
                }
            },
            onValueHelpProductsTable: function (oEvent) {
                var oView = this.getView();
                var sPath = oEvent.getSource().getBindingContext("oModelControl").getPath()



                var oModelControl = oView.getModel("oModelControl");
                oModelControl.setProperty("/Dialog/ProdVH2", sPath);

                // create value help dialog
                if (!this._ProdValueHelpDialog2) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AppProdValuehelp2",
                        controller: this,
                    }).then(
                        function (oValueHelpDialog) {
                            this._ProdValueHelpDialog2 = oValueHelpDialog;
                            this.getView().addDependent(this._ProdValueHelpDialog2);
                            this._openPValueHelpDialog2(sPath);
                        }.bind(this)
                    );
                } else {
                    this._openPValueHelpDialog2(sPath);
                }

            },
            _openPValueHelpDialog2: function (mParam1) {

                this._FilterForProds2("AppProd1");
            },
            _FilterForProds2: function (mParam1) {
                var oView = this.getView(),
                    oModel = oView.getModel("oModelControl");
                var aNumber = mParam1.match(/\d+$/)[0];

                var aCat = oModel.getProperty("/MultiCombo/PCat" + aNumber);
                var aClass = oModel.getProperty("/MultiCombo/PClass" + aNumber);
                var aProd = oModel.getProperty("/MultiCombo/AppProd" + aNumber);
                var aFilter1 = [];
                var aFilter2 = [];
                var aFilter1A = [];
                for (var a of aCat) {
                    aFilter1.push(
                        new Filter("ProductCategory/Id", FilterOperator.EQ, a)
                    );
                }
                for (var b of aClass) {
                    aFilter2.push(
                        new Filter("ProductClassification/Id", FilterOperator.EQ, b)
                    );
                }

                // Prod Filters
                var aProdMapped = aProd.map(function (elem) {
                    return parseInt(elem["Id"]);
                });
                var aProdSort = aProdMapped.sort(function (el1, el2) {
                    return el1 - el2;
                })
                var aProdLimitArray = []
                for (var x of aProdSort) {
                    if (aProdSort.indexOf(x - 1) < 0 && aProdSort.indexOf(x + 1) < 0) {
                        aProdLimitArray.push(x);
                        continue;
                    }

                    if (aProdSort.indexOf(x - 1) < 0) {
                        aProdLimitArray.push([x]);
                        continue;
                    }
                    if (aProdSort.indexOf(x + 1) < 0) {
                        aProdLimitArray[aProdLimitArray.length - 1].push(x);
                        continue;
                    }
                }
                for (var a1 of aProdLimitArray) {
                    if (Array.isArray(a1)) {
                        aFilter1A.push(new Filter([
                            new Filter("Id", FilterOperator.GE, ('000' + a1[0]).slice(-3)),
                            new Filter("Id", FilterOperator.LE, ('000' + a1[1]).slice(-3))
                        ], true))
                    } else {
                        aFilter1A.push(
                            new Filter("Id", FilterOperator.EQ, ('000' + a1).slice(-3))
                        );

                    }
                }
                var aFilterProd = new Filter({
                    filters: aFilter1A,
                    and: false,
                });
                var aFilterCat = new Filter({
                    filters: aFilter1,
                    and: false,
                });
                var aFilterClass = new Filter({
                    filters: aFilter2,
                    and: false,
                });
                var aFinalFilter = [];
                if (aFilter1.length > 0) {
                    aFinalFilter.push(aFilterCat);
                }
                if (aFilter2.length > 0) {
                    aFinalFilter.push(aFilterClass);
                }
                if (aFilter1A.length > 0) {
                    aFinalFilter = aFilterProd;
                }
                this._ProdValueHelpDialog2
                    .getBinding("items")
                    .filter(aFinalFilter, "Control");
                this._ProdValueHelpDialog2.open();

            },
            _handlePValueHelpSearch2: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();

                if (sValue.length > 0) {
                    var aFilter = new Filter({
                        path: "ProductName",
                        operator: "Contains",
                        value1: sValue,
                        caseSensitive: false,
                    });
                    this._ProdValueHelpDialog2
                        .getBinding("items")
                        .filter(aFilter, "Application");
                }
            },

            _handleProdValueHelpConfirm2: function (oEvent) {
                var oSelected = oEvent.getParameter("selectedItem").getBindingContext().getObject()["Id"];

                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sPath = oModel.getProperty("/Dialog/ProdVH2");
                var oTable = oModel.getProperty("/Table/Table6");
                var aNumber = sPath.match(/\d+$/)[0];
                var bCheckExistProd = false
                for (var ele in oTable) {
                    if (ele == aNumber) {
                        continue;
                    }
                    if (oTable[ele]["ProductCode"] === oSelected) {
                        MessageToast.show(
                            "Product Already Selected, Kindly select a different Product."
                        );
                        oModel.setProperty(sPath + "/ProductCode", "");
                        bCheckExistProd = true
                        break;
                    }
                }
                if (!bCheckExistProd) {
                    oModel.setProperty(sPath + "/ProductCode", oSelected);
                }


            },

            onRbChnageMain: function (oEvent) {
                var oView = this.getView();
                var oSource = oEvent.getSource();
                var sKey = oSource.getSelectedIndex();
                var sPath = oSource.getBinding("selectedIndex").getPath();
                var sPathArray = sPath.split("/");
                var oModelControl = oView.getModel("oModelControl");
                if (sKey == 1) {
                    oModelControl.setProperty("/MultiEnabled/" + sPathArray[2], true);
                } else {
                    oModelControl.setProperty("/MultiEnabled/" + sPathArray[2], false);
                    this._propertyToBlank(["MultiCombo/" + sPathArray[2]], true);
                }

                var aChkTblData = ["PCat1", "PClass1", "AppProd1"];
                var aChkTblData2 = ["PCat4", "PClass4", "AppProd4", "AppPacks4"];
                if (aChkTblData.indexOf(sPathArray[2]) >= 0) {
                    this._CheckCondProdTable();
                }
                if (aChkTblData2.indexOf(sPathArray[2]) >= 0) {
                    this._CreateBonusRewardTable();
                }
            },
            _CheckCondProdTable: function () {
                this.getView().getModel("oModelControl").setProperty("/Table/Table6", []);
            },
            onRbBonusRewardChange: function (oEvent) { },

            _CreateRewardTableData: function (oEvent) {
                //check if all or specific table is there or not
                var oView = this.getView();
                var othat = this;
                var oModelControl = oView.getModel("oModelControl");
                //oModelControl.setProperty("/Table/Table2", []);
                //oModelControl.setProperty("/Table/Table1", []);
                var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks1");
                var oDataModel = this.getView().getModel();
                var c1, c2, c3, c4, c5;

                //   if (sCheckPacks == 0) {
                //     othat._setProductsData();
                //   } else {
                //     othat._setPacksData();
                //   }
            },
            onRbTable1Change: function (oEvent) {
                var oView = this.getView();
                var sKey = oEvent.getSource().getSeleckedIndex();
                var spath = oEvent.getSource().getBinding("selectedIndex").getPath();
            },

            _setProductsData: function () {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var aSelectedKeys = oModelControl.getProperty("/MultiCombo/AppProd1");
                var oControl = [];
                var bRbProd = oModelControl.getProperty("/Rbtn/AppProd1");
                var aSelectedData = [];
                if (aSelectedKeys.length <= 0 && bRbProd == 0) {
                    oControl = oModelControl.getProperty("/oData/Products");
                    for (var x of oControl) {
                        aSelectedData.push({
                            Id: x["Id"],
                            Name: x["ProductName"],
                        });
                    }
                } else {
                    oControl = aSelectedKeys;
                    for (var x of oControl) {
                        aSelectedData.push({
                            Id: x["Id"],
                            Name: x["Name"],
                        });
                    }
                }

                oModelControl.setProperty("/MultiCombo/Reward", aSelectedData);
            },
            _setPacksData: function (sKey) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var aSelectedKeys = oModelControl.getProperty(
                    "/MultiCombo/AppPacks1"
                );

                var aSelectedData = [],
                    obj;
                for (var x of aSelectedKeys) {
                    aSelectedData.push({
                        Id: x["Id"],
                        Name: x["Name"],
                    });
                }
                oModelControl.setProperty("/MultiCombo/Reward", aSelectedData);
                //console.log(oModelControl);
            },
            _setBRProductsData: function () {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var aSelectedKeys = oModelControl.getProperty("/MultiCombo/AppProd4");
                var oControl = [];
                var bRbProd = oModelControl.getProperty("/Rbtn/AppProd4");
                var aSelectedData = [];
                var othat = this;
                var c1, c2, c3;
                var aFilterProducts = [];
                //c1 = othat._getProductsData();

                if (aSelectedKeys.length <= 0 && bRbProd == 0) {
                    oControl = oModelControl.getProperty("/oData/Products");
                    for (var x of oControl) {
                        aSelectedData.push({
                            Id: x["Id"],
                            Name: x["ProductName"],
                        });
                    }
                } else {
                    oControl = aSelectedKeys;
                    for (var x of oControl) {
                        aSelectedData.push({
                            Id: x["Id"],
                            Name: x["Name"],
                        });
                    }
                }

                oModelControl.setProperty("/MultiCombo/Reward2", aSelectedData);
            },
            _setBRPacksData: function () {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var aSelectedKeys = oModelControl.getProperty(
                    "/MultiCombo/AppPacks4"
                );

                var aSelectedData = [],
                    obj;
                for (var x of aSelectedKeys) {
                    aSelectedData.push({
                        Id: x["Id"],
                        Name: x["Name"],
                    });
                }
                oModelControl.setProperty("/MultiCombo/Reward2", aSelectedData);
            },
            _getProductsData: function (aFilter) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oData = oView.getModel();

                return new Promise((resolve, reject) => {
                    oData.read("/MasterProductSet", {
                        filters: aFilter,
                        success: function (mParam1) {
                            oModelControl.setProperty(
                                "/oData/Products",
                                mParam1["results"]
                            );
                            resolve();
                        },
                        error: function (mParam1) {
                            reject();
                        },
                    });
                });
            },
            _getPacksData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var sPacks = oModelControl.getProperty("/oData/Packs");
                var oData = oView.getModel();
                if (sPacks.length > 0) {
                    promise.resolve();
                    return promise;
                }
                return new Promise((resolve, reject) => {
                    oData.read("/MasterRepProductSkuSet", {
                        success: function (mParam1) {
                            oModelControl.setProperty("/oData/Packs", mParam1["results"]);
                            resolve();
                        },
                        error: function (mParam1) {
                            reject();
                        },
                    });
                });
            },

            onValueHelpRequestedPainter: function () {
                this._PainterMulti = this.getView().byId("Painters");

                this.oColModel = new JSONModel({
                    cols: [{
                        label: "Membership ID",
                        template: "MembershipCard",
                    },
                    {
                        label: "Name",
                        template: "Name",
                    },
                    {
                        label: "Mobile Number",
                        template: "Mobile",
                    },
                    {
                        label: "Zone",
                        template: "ZoneId",
                    },
                    {
                        label: "Division",
                        template: "DivisionId",
                    },
                    {
                        label: "Depot",
                        template: "Depot/Depot",
                    },
                    {
                        label: "Painter Type",
                        template: "PainterType/PainterType",
                    },
                    {
                        label: "Painter ArcheType",
                        template: "ArcheType/ArcheType",
                    },
                    ],
                });
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var aCols = this.oColModel.getData().cols;
                var oFilter = new sap.ui.model.Filter(
                    "IsArchived",
                    sap.ui.model.FilterOperator.EQ,
                    false
                );
                var oSearchData = {
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: "",
                    PainterType: "",
                    ArcheType: "",
                    MembershipCard: "",
                    Name: "",
                    Mobile: "",
                };
                oModel.setProperty("/Search/PainterVh", oSearchData);
                if (!this._PainterValueHelp) {
                    this._PainterValueHelp = sap.ui.xmlfragment(
                        "com.knpl.pragati.SchemeOffers.view.fragment.PainterValueHelp",
                        this
                    );
                    this.getView().addDependent(this._PainterValueHelp);

                    this._PainterValueHelp.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/PainterSet",
                                    parameters: {
                                        expand: "Depot,PainterType,ArcheType",
                                        select: "Id,MembershipCard,Name,Mobile,ZoneId,DivisionId,Depot/Depot,PainterType/PainterType,ArcheType/ArcheType",
                                    },
                                    events: {
                                        dataReceived: function () {
                                            this._PainterValueHelp.update();
                                        }.bind(this),
                                    },
                                });
                            }

                            if (oTable.bindItems) {
                                oTable.bindAggregation("items", "/PainterSet", function () {
                                    return new sap.m.ColumnListItem({
                                        cells: aCols.map(function (column) {
                                            return new sap.m.Label({
                                                text: "{" + column.template + "}",
                                            });
                                        }),
                                    });
                                });
                            }

                            this._PainterValueHelp.update();
                        }.bind(this)
                    );

                    this._PainterValueHelp.setTokens(this._PainterMulti.getTokens());
                    this._PainterValueHelp.open();
                } else {
                    //this._PainterValueHelp.setTokens(this._PainterMulti.getTokens());
                    this._PainterValueHelp.open();
                }
            },
            onPainterOkayPress: function (oEvent) {
                var oData = [];
                var xUnique = new Set();
                var aTokens = oEvent.getParameter("tokens");

                aTokens.forEach(function (ele) {
                    if (xUnique.has(ele.getKey()) == false) {
                        oData.push({
                            PainterName: ele.getText(),
                            PainterId: ele.getKey(),
                        });
                        xUnique.add(ele.getKey());
                    }
                });

                this.getView()
                    .getModel("oModelControl")
                    .setProperty("/MultiCombo/Painters", oData);

                this._PainterValueHelp.close();
            },
            onPainterValueAfterOpen: function () {
                var aFilter = this._getFilterForPainterValue();
                this._FilterPainterValueTable(aFilter, "Control");
            },
            _getFilterForPainterValue: function () {
                var aFilters = [];
                var aFilter1 = new Filter("IsArchived", FilterOperator.EQ, false);
                aFilters.push(new Filter("MembershipCard", FilterOperator.NE, null))
                aFilters.push(new Filter("RegistrationStatus", FilterOperator.EQ, "REGISTERED"));
                aFilters.push(new Filter("ActivationStatus", FilterOperator.NE, "DEACTIVATED"));
                aFilters.push(new Filter("Name", FilterOperator.NotContains, "DIS EXTENTIA%"));
                aFilters.push(aFilter1);
                if (aFilters.length == 0) {
                    return [];
                }

                return aFilters;
            },
            _FilterPainterValueTable: function (oFilter, sType) {

                var oValueHelpDialog = this._PainterValueHelp;

                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable
                            .getBinding("rows")
                            .filter(oFilter, sType || "ApplicatApplication");
                    }

                    if (oTable.bindItems) {
                        oTable
                            .getBinding("items")
                            .filter(oFilter, sType || "Application");
                    }

                    oValueHelpDialog.update();
                });
            },

            onFilterBarSearchPainter: function (oEvent) {
                var afilterBar = oEvent.getParameter("selectionSet");

                var aCurrentFilterValues = [];
                var oViewFilter = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/Search/PainterVh");
                var aFlaEmpty = true;
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
                            );
                        } else if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
                            );
                        } else if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DepotId", FilterOperator.EQ, oViewFilter[prop])
                            );
                        } else if (prop === "PainterType") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "PainterTypeId",
                                    operator: FilterOperator.EQ,
                                    value1: oViewFilter[prop],
                                })
                            );
                        } else if (prop === "ArcheType") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "ArcheTypeId",
                                    operator: FilterOperator.EQ,
                                    value1: oViewFilter[prop],
                                })
                            );
                        } else if (prop === "MembershipCard") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "MembershipCard",
                                    operator: FilterOperator.Contains,
                                    value1: oViewFilter[prop],
                                    caseSensitive: false,
                                })
                            );
                        } else if (prop === "Name") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "Name",
                                    operator: FilterOperator.Contains,
                                    value1: oViewFilter[prop],
                                    caseSensitive: false,
                                })
                            );
                        } else if (prop === "Mobile") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "Mobile",
                                    operator: FilterOperator.Contains,
                                    value1: oViewFilter[prop],
                                })
                            );
                        }
                    }
                }

                aCurrentFilterValues.push(
                    new Filter({
                        path: "IsArchived",
                        operator: FilterOperator.EQ,
                        value1: false,
                    })
                );
                aCurrentFilterValues.push(
                    new Filter({
                        path: "RegistrationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEREGISTERED",
                    })
                );
                aCurrentFilterValues.push(
                    new Filter({
                        path: "ActivationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEACTIVATED",
                    })
                );

                this._FilterPainterValueTable(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    }), "Application"
                );
            },
            onPVhZoneChange: function (oEvent) {
                var sId = oEvent.getSource().getSelectedKey();
                var oView = this.getView();


                var oDivItems = oDivision.getBinding("items");
                var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
                oDivision.clearSelection();
                oDivision.setValue("");
                oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                //setting the data for depot;
                var oDepot = sap.ui.getCore().byId("idPVhDepot");
                oDepot.clearSelection();
                oDepot.setValue("");
                // clearning data for dealer
            },
            onPVhDivisionChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oDepot = sap.ui.getCore().byId("idPVhDepot");
                var oDepBindItems = oDepot.getBinding("items");
                oDepot.clearSelection();
                oDepot.setValue("");
                oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
            },
            onClearPainterVhSearch: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl"),
                    aCurrentFilterValues = [];
                oModel.setProperty("/Search/PainterVh", {
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: "",
                    PainterType: "",
                    ArcheType: "",
                    MembershipCard: "",
                    Name: "",
                    Mobile: "",
                });
                aCurrentFilterValues.push(
                    new Filter({
                        path: "IsArchived",
                        operator: FilterOperator.EQ,
                        value1: false,
                    })
                );
                aCurrentFilterValues.push(
                    new Filter({
                        path: "RegistrationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEREGISTERED",
                    })
                );
                aCurrentFilterValues.push(
                    new Filter({
                        path: "ActivationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEACTIVATED",
                    })
                );
                this._FilterPainterValueTable(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    })
                );
            },
            onZoneChange: function (oEvent) {
                var oView = this.getView();
                var oDivision = oView.byId("idDivisions");
                var sKeys = oEvent.getSource().getSelectedKeys();
                var aDivFilter = [];
                for (var y of sKeys) {
                    aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y));
                }
                oDivision.getBinding("items").filter(aDivFilter);

                this._fnChangeDivDepot({
                    src: {
                        path: "/MultiCombo/Zones",
                    },
                    target: {
                        localPath: "/MultiCombo/Divisions",
                        oDataPath: "/MasterDivisionSet",
                        key: "Zone",
                    },
                });
                this._fnChangeDivDepot({
                    src: {
                        path: "/MultiCombo/Divisions",
                    },
                    target: {
                        localPath: "/MultiCombo/Depots",
                        oDataPath: "/MasterDepotSet",
                        key: "Division",
                        targetKey: "DepotId",
                    },
                });
            },
            onDivisionChange: function (oEvent) {
                // Not requred to set filter for the Depots as this is a valuehelp and filter is applied in onbeforeopen event
                this._fnChangeDivDepot({
                    src: {
                        path: "/MultiCombo/Divisions",
                    },
                    target: {
                        localPath: "/MultiCombo/Depots",
                        oDataPath: "/MasterDepotSet",
                        key: "Division",
                        targetKey: "DepotId",
                    },
                });
            },

            onDepotValueHelpOpen: function (oEvent) {
                this._oMultiInput = this.getView().byId("idDepots");
                this.oColModel = new JSONModel({
                    cols: [{
                        label: "Depot Id",
                        template: "Id",
                        width: "10rem",
                    },
                    {
                        label: "Depot Name",
                        template: "Depot",
                    },
                    ],
                });

                var aCols = this.oColModel.getData().cols;
                var oView = this.getView();
                oView.getModel("oModelControl").setProperty("/Search/DepotVh", {
                    DepotId: "",
                    Depot: "",
                });
                if (!this._oDepotDialog) {
                    this._oDepotDialog = sap.ui.xmlfragment(
                        "com.knpl.pragati.SchemeOffers.view.fragment.DepotFragment",
                        this
                    );
                    this.getView().addDependent(this._oDepotDialog);

                    this._oDepotDialog.getTableAsync().then(
                        function (oTable) {
                            //		oTable.setModel(this.oProductsModel);
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/MasterDepotSet",
                                    events: {
                                        dataReceived: function () {
                                            this._oDepotDialog.update();
                                        }.bind(this),
                                    },
                                });
                            }

                            if (oTable.bindItems) {
                                oTable.bindAggregation(
                                    "items",
                                    "/MasterDepotSet",
                                    function () {
                                        return new sap.m.ColumnListItem({
                                            cells: aCols.map(function (column) {
                                                return new sap.m.Label({
                                                    text: "{" + column.template + "}",
                                                });
                                            }),
                                        });
                                    }
                                );
                            }

                            this._oDepotDialog.update();
                        }.bind(this)
                    );

                    this._oDepotDialog.setTokens(this._oMultiInput.getTokens());
                    this._oDepotDialog.open();
                } else {
                    this._oDepotDialog.open();
                }
            },
            _destroyDialogs: function () {
                var promise = jQuery.Deferred();
                if (this._DepotDialog) {
                    this._oDepotDialog.destroy();
                    delete this._oDepotDialog;
                }
                if (this._PainterValueHelp) {
                    this._PainterValueHelp.destroy();
                    delete this._PainterValueHelp;
                }

                // if (this._RewardsDialog1) {
                //     this._RewardsDialog1.destroy();
                //     delete this._RewardsDialog1;
                // }
                // if (this._RewardsDialog2) {
                //     this._RewardsDialog2.destroy();
                //     delete this._RewardsDialog2;
                // }
                promise.resolve();
                return promise;
            },
            onValueHelpAfterClose: function () {
                if (this._DepotDialog) {
                    this._oDepotDialog.destroy();
                    delete this._oDepotDialog;
                }
                if (this._PainterValueHelp) {
                    this._PainterValueHelp.destroy();
                    delete this._PainterValueHelp;
                }
                if (this._RewardsDialog1) {
                    this._RewardsDialog1.destroy();
                    delete this._RewardsDialog1;
                } //_RewardsDialog2
                if (this._RewardsDialog2) {
                    this._RewardsDialog2.destroy();
                    delete this._RewardsDialog2;
                }
            },
            onValueHelpClose: function () {
                if (this._oDepotDialog) {
                    this._oDepotDialog.close();
                }
                if (this._PainterValueHelp) {
                    this._PainterValueHelp.close();
                }
                if (this._RewardsDialog1) {
                    this._RewardsDialog1.close();
                }
                if (this._RewardsDialog2) {
                    this._RewardsDialog2.close();
                }
            },

            onDepotOkPress: function (oEvent) {
                var oData = [];
                var oView = this.getView();
                var aTokens = oEvent.getParameter("tokens");
                var aArrayBackEnd = [];
                aTokens.forEach(function (ele) {
                    oData.push({
                        DepotId: ele.getKey(),
                        Division: ele.getCustomData()[0].getValue()["Depot"],
                    });
                });

                oView
                    .getModel("oModelControl")
                    .setProperty("/MultiCombo/Depots", oData);

                this._oDepotDialog.close();
            },

            onDepotAfterOpen: function () {
                var aFilter = this._getFilterForDepot();
                this._FilterDepotTable(aFilter, "Control");
            },
            _getLoggedInUserDeatils: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oLoginModel = oView.getModel("LoginInfo");
                var oControlModel = oView.getModel("oModelControl");
                var oLoginData = oLoginModel.getData();

                if (Object.keys(oLoginData).length === 0) {
                    return new Promise((resolve, reject) => {
                        oDataModel.callFunction("/GetLoggedInAdmin", {
                            method: "GET",
                            urlParameters: {
                                $expand: "UserType",
                            },
                            success: function (data) {
                                if (data.hasOwnProperty("results")) {
                                    if (data["results"].length > 0) {
                                        oLoginModel.setData(data["results"][0]);
                                        oControlModel.setProperty(
                                            "/LoggedInUser",
                                            data["results"][0]
                                        );
                                    }
                                }
                                resolve(oData);
                            },
                        });
                    });
                } else {
                    oControlModel.setProperty("/LoggedInUser", oLoginData);
                    promise.resolve(oData);
                    return promise;
                }
            },
            _getFilterForDepot: function () {
                var sDivisions = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/MultiCombo/Divisions");
                var aFilters = [];

                for (var div of sDivisions) {
                    aFilters.push(new Filter("Division", FilterOperator.EQ, div));
                }

                if (aFilters.length == 0) {
                    return [];
                }
                return new Filter({
                    filters: aFilters,
                    and: false,
                });
            },
            _FilterDepotTable: function (oFilter, sType) {
                var oValueHelpDialog = this._oDepotDialog;

                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter, sType || "Application");
                    }

                    if (oTable.bindItems) {
                        oTable
                            .getBinding("items")
                            .filter(oFilter, sType || "Application");
                    }

                    oValueHelpDialog.update();
                });
            },
            onDepotVhSearch: function () {
                var oView = this.getView();
                var aCurrentFilterValues = [];
                var oViewFilter = this.getView()
                    .getModel("oModelControl")
                    .getProperty("/Search/DepotVh");
                var aFlaEmpty = true;
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "Id",
                                    operator: "Contains",
                                    value1: oViewFilter[prop],
                                    caseSensitive: false,
                                })
                            );
                        } else if (prop === "Depot") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "Depot",
                                    operator: "Contains",
                                    value1: oViewFilter[prop],
                                    caseSensitive: false,
                                })
                            );
                        }
                    }
                }

                this._FilterDepotTable(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    })
                );
            },
            onClearDepotFilterVh: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                oModel.setProperty("/Search/DepotVh", {
                    DepotId: "",
                    Depot: "",
                });
                var aCurrentFilterValues = [];
                this._FilterDepotTable([]);
            },

            onProductCatChange: function (oEvent) {
                var oView = this.getView();
                var oSource = oEvent.getSource();
                //var sKey = oSource.getSeleckedKeys();
            },
            onProdClassChange: function (oEvent) { },
            onAppProdChange: function (oEvent) { },
            onArchiTypeChange: function (oEvent) { },
            onPAppDropChange: function (oEvent) {
                var aSpath = oEvent
                    .getSource()
                    .getBinding("selectedKeys")
                    .getPath()
                    .split("/");
                var mParam1 = aSpath[aSpath.length - 1];
                this._ClearPacksProducts(mParam1);
                var aNumber = mParam1.match(/\d+$/)[0];
                if (aNumber == "1") {
                    this._CreateRewardTableData();
                    this._CheckCondProdTable();
                } else if (aNumber == "4") {
                    this._CreateBonusRewardTable();
                }
            },
            _ClearPacksProducts: function (mParam1) {
                var aNumber = mParam1.match(/\d+$/)[0];
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                oModel.setProperty("/MultiCombo/AppProd" + aNumber, []);
                oModel.setProperty("/MultiCombo/AppPacks" + aNumber, []);
            },
            onPackTokenUpdate: function (oEvent) {
                if (oEvent.getParameter("type") === "removed") {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sPath = oEvent.getSource().getBinding("tokens").getPath();
                    var aArray = oModel.getProperty(sPath);
                    var aNewArray;
                    var aRemovedTokens = oEvent.getParameter("removedTokens");
                    var aRemovedKeys = [];
                    aRemovedTokens.forEach(function (item) {
                        aRemovedKeys.push(item.getKey());
                    });

                    aNewArray = aArray.filter(function (item) {
                        return aRemovedKeys.indexOf(item["Id"]) < 0;
                    });

                    oModel.setProperty(sPath, aNewArray);
                    var aSpath = sPath.split("/");
                    var mParam1 = aSpath[aSpath.length - 1];
                    var aNumber = mParam1.match(/\d+$/)[0];
                    //console.log(aNumber);
                    if (aNumber == "1") { } else if (aNumber == "4") {
                        this._CreateBonusRewardTable();
                    }
                }
            },
            handlePackValueHelp: function (oEvent) {
                var oView = this.getView();
                var aPath = oEvent
                    .getSource()
                    .getBinding("tokens")
                    .getPath()
                    .split("/");
                var sParam1 = aPath[aPath.length - 1];

                var oModelControl = oView.getModel("oModelControl");
                oModelControl.setProperty("/Dialog/PackVH", sParam1);
                // create value help dialog
                if (!this._PackValueHelpDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AppPackValueHelp",
                        controller: this,
                    }).then(
                        function (oValueHelpDialog) {
                            this._PackValueHelpDialog = oValueHelpDialog;
                            this.getView().addDependent(this._PackValueHelpDialog);
                            this._OpenPackValueHelp(sParam1);
                        }.bind(this)
                    );
                } else {
                    this._OpenPackValueHelp(sParam1);
                }
            },
            _OpenPackValueHelp: function (mParam1) {
                var sPath = mParam1;
                this._FilterForPack(mParam1);
            },
            _FilterForPack: function (mParam1) {
                var oView = this.getView(),
                    oModel = oView.getModel("oModelControl");
                var aNumber = mParam1.match(/\d+$/)[0];
                var aProd = oModel.getProperty("/MultiCombo/AppProd" + aNumber);
                var aProdMapped = aProd.map(function (elem) {
                    return parseInt(elem["Id"]);
                });
                var aProdSort = aProdMapped.sort(function (el1, el2) {
                    return el1 - el2;
                })
                var aProdLimitArray = []
                for (var x of aProdSort) {
                    if (aProdSort.indexOf(x - 1) < 0 && aProdSort.indexOf(x + 1) < 0) {
                        aProdLimitArray.push(x);
                        continue;
                    }

                    if (aProdSort.indexOf(x - 1) < 0) {
                        aProdLimitArray.push([x]);
                        continue;
                    }
                    if (aProdSort.indexOf(x + 1) < 0) {
                        aProdLimitArray[aProdLimitArray.length - 1].push(x);
                        continue;
                    }
                }
                //console.log(aProd, aProdSort, aProdLimitArray);
                var aClass = oModel.getProperty("/MultiCombo/PClass" + aNumber);
                var aCat = oModel.getProperty("/MultiCombo/PCat" + aNumber);
                var aFilter1 = [];
                var aFilter1A = [];
                var aFilter2 = [];
                var aFilter3 = [];

                for (var a of aProd) {
                    aFilter1.push(
                        new Filter("ProductCode", FilterOperator.EQ, a["Id"])
                    );
                };
                for (var a1 of aProdLimitArray) {
                    if (Array.isArray(a1)) {
                        aFilter1A.push(new Filter([
                            new Filter("ProductCode", FilterOperator.GE, ('000' + a1[0]).slice(-3)),
                            new Filter("ProductCode", FilterOperator.LE, ('000' + a1[1]).slice(-3))
                        ], true))
                    } else {
                        aFilter1A.push(
                            new Filter("ProductCode", FilterOperator.EQ, ('000' + a1).slice(-3))
                        );

                    }
                }
                //console.log(aFilter1A)
                for (var b of aCat) {
                    aFilter2.push(new Filter("CategoryCode", FilterOperator.EQ, b));
                }
                for (var c of aClass) {
                    aFilter3.push(
                        new Filter("ClassificationCode", FilterOperator.EQ, c)
                    );
                }
                var aFilterProd = new Filter({
                    filters: aFilter1A,
                    and: false,
                });
                var aFilterCat = new Filter({
                    filters: aFilter2,
                    and: false,
                });
                var aFilterClass = new Filter({
                    filters: aFilter3,
                    and: false,
                });
                var aFinalFilter = [];
                if (aFilter1A.length > 0) {
                    aFinalFilter.push(aFilterProd);
                }
                if (aFilter2.length > 0) {
                    aFinalFilter.push(aFilterCat);
                }
                if (aFilter3.length > 0) {
                    aFinalFilter.push(aFilterClass);
                }

                this._PackValueHelpDialog.getBinding("items").filter(aFinalFilter);
                this._PackValueHelpDialog.open();
            },
            _handlePackValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();

                if (sValue.length > 0) {
                    var aFilter = new Filter({
                        path: "Description",
                        operator: "Contains",
                        value1: sValue,
                        caseSensitive: false,
                    });
                    this._PackValueHelpDialog
                        .getBinding("items")
                        .filter(aFilter, "Application");
                }
            },
            _handlePackValueHelpConfirm: function (oEvent) {
                var oSelected = oEvent.getParameter("selectedItems");
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var aField = oModel.getProperty("/Dialog/PackVH");
                var aNumber = aField.match(/\d+$/)[0];
                var aProds = [],
                    oBj;
                for (var a of oSelected) {
                    oBj = a.getBindingContext().getObject();
                    aProds.push({
                        Name: oBj["Description"],
                        Id: oBj["SkuCode"],
                    });
                }
                oView
                    .getModel("oModelControl")
                    .setProperty("/MultiCombo/AppPacks" + aNumber, aProds);
                if (aNumber == "1") {
                    //this._CreateRewardTableData();
                } else if (aNumber == "4") {
                    this._CreateBonusRewardTable();
                }
            },
            onProdTokenUpdate: function (oEvent) {
                if (oEvent.getParameter("type") === "removed") {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sPath = oEvent.getSource().getBinding("tokens").getPath();
                    var aArray = oModel.getProperty(sPath);
                    var aNewArray;
                    var aRemovedTokens = oEvent.getParameter("removedTokens");
                    var aRemovedKeys = [];
                    aRemovedTokens.forEach(function (item) {
                        aRemovedKeys.push(item.getKey());
                    });

                    aNewArray = aArray.filter(function (item) {
                        return aRemovedKeys.indexOf(item["Id"]) < 0;
                    });

                    oModel.setProperty(sPath, aNewArray);
                    var aSpath = sPath.split("/");
                    var mParam1 = aSpath[aSpath.length - 1];
                    var aNumber = mParam1.match(/\d+$/)[0];
                    //console.log(aNumber);
                    if (aNumber == "1") { } else if (aNumber == "4") {
                        this._CreateBonusRewardTable();
                    }
                }
                var sPath = oEvent.getSource().getBinding("tokens").getPath();
                var sPathArray = sPath.split("/");
                // console.log(sPathArray);
                var aChkTblDataProdData = ["AppProd1"];
                if (aChkTblDataProdData.indexOf(sPathArray[2]) >= 0) {
                    this._CheckCondProdTable();
                }

            },
            handleProdValueHelp: function (oEvent) {
                var oView = this.getView();
                var aPath = oEvent
                    .getSource()
                    .getBinding("tokens")
                    .getPath()
                    .split("/");
                var sParam1 = aPath[aPath.length - 1];

                var oModelControl = oView.getModel("oModelControl");
                oModelControl.setProperty("/Dialog/ProdVH", sParam1);
                // multiselect or singe select
                // create value help dialog
                if (!this._ProdValueHelpDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AppProdValuehelp",
                        controller: this,
                    }).then(
                        function (oValueHelpDialog) {
                            this._ProdValueHelpDialog = oValueHelpDialog;
                            this.getView().addDependent(this._ProdValueHelpDialog);
                            this._openPValueHelpDialog(sParam1);
                        }.bind(this)
                    );
                } else {
                    this._openPValueHelpDialog(sParam1);
                }
            },
            _openPValueHelpDialog: function (mParam1) {
                var sPath = mParam1;
                this._FilterForProds1(mParam1);
            },

            _handleProdValueHelpConfirm: function (oEvent) {
                var oSelected = oEvent.getParameter("selectedItems");

                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var aField = oModel.getProperty("/Dialog/ProdVH");
                var aNumber = aField.match(/\d+$/)[0];
                var aProds = [],
                    oBj;
                for (var a of oSelected) {
                    oBj = a.getBindingContext().getObject();
                    aProds.push({
                        Name: oBj["ProductName"],
                        Id: oBj["Id"],
                    });
                }

                oModel.setProperty("/MultiCombo/AppProd" + aNumber, aProds);
                oModel.setProperty("/MultiCombo/AppPacks" + aNumber, []);

                if (aNumber == "1") {
                    this._CheckCondProdTable();
                } else if (aNumber == "4") {
                    this._CreateBonusRewardTable();
                }
            },
            _handleProdValueHelpClose: function () {
                if (this._ProdValueHelpDialog) {
                    this._ProdValueHelpDialog.destroy();
                    delete this._ProdValueHelpDialog;
                }
                if (this._PackValueHelpDialog) {
                    this._PackValueHelpDialog.destroy();
                    delete this._PackValueHelpDialog;
                }
                if (this._ProdValueHelpDialog2) {
                    this._ProdValueHelpDialog2.destroy();
                    delete this._ProdValueHelpDialog2;
                }
            },
            _FilterForProds1: function (mParam1) {
                var oView = this.getView(),
                    oModel = oView.getModel("oModelControl");
                var aNumber = mParam1.match(/\d+$/)[0];

                var aCat = oModel.getProperty("/MultiCombo/PCat" + aNumber);
                var aClass = oModel.getProperty("/MultiCombo/PClass" + aNumber);
                var aFilter1 = [];
                var aFilter2 = [];
                for (var a of aCat) {
                    aFilter1.push(
                        new Filter("ProductCategory/Id", FilterOperator.EQ, a)
                    );
                }
                for (var b of aClass) {
                    aFilter2.push(
                        new Filter("ProductClassification/Id", FilterOperator.EQ, b)
                    );
                }
                var aFilterCat = new Filter({
                    filters: aFilter1,
                    and: false,
                });
                var aFilterClass = new Filter({
                    filters: aFilter2,
                    and: false,
                });
                var aFinalFilter = [];
                if (aFilter1.length > 0) {
                    aFinalFilter.push(aFilterCat);
                }
                if (aFilter2.length > 0) {
                    aFinalFilter.push(aFilterClass);
                }
                this._ProdValueHelpDialog
                    .getBinding("items")
                    .filter(aFinalFilter, "Control");
                this._ProdValueHelpDialog.open();
            },
            _handlePValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value").trim();

                if (sValue.length > 0) {
                    var aFilter = new Filter({
                        path: "ProductName",
                        operator: "Contains",
                        value1: sValue,
                        caseSensitive: false,
                    });
                    this._ProdValueHelpDialog
                        .getBinding("items")
                        .filter(aFilter, "Application");
                }
            },
            onRbAppPainter: function (oEvent) {
                var iIndex = oEvent.getSource().getSelectedIndex();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                this._propertyToBlank(
                    ["PointSlabUpperLimit", "PointSlabLowerLimit"],
                    false
                );
                this._propertyToBlank(
                    [
                        "MultiCombo/ArcheTypes",
                        "MultiCombo/PainterType",
                        "MultiCombo/Potential",
                        "MultiCombo/PCat2",
                        "MultiCombo/PClass2",
                        "MultiCombo/AppProd2",
                        "MultiCombo/AppPacks2",
                        "MultiCombo/PCat3",
                        "MultiCombo/PClass3",
                        "MultiCombo/AppProd3",
                        "MultiCombo/AppPacks3",
                        "MultiCombo/Zones",
                        "MultiCombo/Divisions",
                        "MultiCombo/Depots",
                        "MultiCombo/Painters",
                        "Fields/PainterCount",
                        "Fields/Date1",
                        "Fields/Date2",
                    ],
                    true
                );
                oModelControl.setProperty("/Rbtn/PCat2", 0);
                oModelControl.setProperty("/Rbtn/PClass2", 0);
                oModelControl.setProperty("/Rbtn/AppProd2", 0);
                oModelControl.setProperty("/Rbtn/AppPacks2", 0);
                oModelControl.setProperty("/Rbtn/PCat3", 0);
                oModelControl.setProperty("/Rbtn/PClass3", 0);
                oModelControl.setProperty("/Rbtn/AppProd3", 0);
                oModelControl.setProperty("/Rbtn/AppPacks3", 0);
                oModelControl.setProperty("/Rbtn/Zones", 0);
                oModelControl.setProperty("/Rbtn/Divisions", 0);
                oModelControl.setProperty("/Rbtn/Depots", 0);

                //reset

                if (iIndex == 0) {
                    oModelControl.setProperty("/MultiCombo/AppPainter", false);
                    oModelView.setProperty("/PainterSelection", 0);
                } else if (iIndex == 1) {
                    oModelControl.setProperty("/MultiCombo/AppPainter", true);
                    oModelView.setProperty("/PainterSelection", 1);
                } else if (iIndex == 2) {
                    oModelControl.setProperty("/MultiCombo/AppPainter", true);
                    oModelView.setProperty("/PainterSelection", 2);
                } //
                // making the fields blank
            },
            onAppPainterPointsUppChg: function (oEvent) {
                var oView = this.getView();
                var sUvalue = oEvent.getSource().getValue().trim();
                var oModel = oView.getModel("oModelView");
                var sLvalue = oView.byId("PSlabLowLimit").getValue();
                if (sLvalue && sUvalue) {
                    if (parseInt(sUvalue) < parseInt(sLvalue)) {
                        MessageToast.show(
                            "Points Upper Limit Should be greater than Lower limit"
                        );
                        oModel.setProperty("/PointSlabUpperLimit", "");
                    }
                }
            },
            onAppPainterPointsLowChg: function (oEvent) {
                var oView = this.getView();
                var sLvalue = oEvent.getSource().getValue();
                var oModel = oView.getModel("oModelView");
                var sUvalue = oView.byId("PSlabULimit").getValue();
                if (sLvalue && sUvalue) {
                    if (parseInt(sLvalue) > parseInt(sUvalue)) {
                        MessageToast.show(
                            "Points Upper Limit Should be greater than Lower limit"
                        );
                        oModel.setProperty("/PointSlabLowerLimit", "");
                    }
                }
            },
            onRbTopApp: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedIndex();
                this._propertyToBlank(["BonusApplicableTopPainter"]);
            },
            onRbAppRewards: function (oEvent) {
                var iIndex = oEvent.getSource().getSelectedIndex();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");

                if (iIndex == 0) {
                    oModelView.setProperty("/HasBonusPercentage", false);
                    this._propertyToBlank(["BonusRewardPoints"]);
                } else if (iIndex == 1) {
                    oModelView.setProperty("/HasBonusPercentage", true);
                    this._propertyToBlank(["BonusRewardPoints"]);
                } //
                // making the fields blank
            },
            onRbBonusValidity: function (oEvent) {
                var iIndex = oEvent.getSource().getSelectedIndex();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");

                if (iIndex == 0) {
                    oModelControl.setProperty("/HasTillDate", false);
                    this._propertyToBlank(["BonusValidityDate"]);
                } else if (iIndex == 1) {
                    oModelControl.setProperty("/HasTillDate", true);
                    this._propertyToBlank([
                        "BonusValidityDurationYear",
                        "BonusValidityDurationMonth",
                        "BonusValidityDurationDays",
                    ]);
                } //
            },
            onBonusVaidityTo: function (oEvent) {
                var oView = this.getView();

                var oModelView = oView.getModel("oModelView");
                var oStartDate = oEvent.getSource().getDateValue();
                var oEndDate = oModelView.getProperty("/PerformanceEndDate");
                if (oEndDate) {
                    if (oStartDate > oEndDate) {
                        MessageToast.show("Kindly select a date less than to date.");
                        oModelView.setProperty("/PerformanceStartDate", null);
                    }
                }
                if (oStartDate < new Date().setHours(0, 0, 0, 0)) {
                    MessageToast.show(
                        "Kindly enter a date greater than or equal to bonus validity to date"
                    );

                    oModelView.setProperty("/PerformanceStartDate", null);
                }
            },
            onBonusVaidityFrom: function (oEvent) {
                var oView = this.getView();

                var oModelView = oView.getModel("oModelView");
                var oEndDate = oEvent.getSource().getDateValue();
                var oStartDate = oModelView.getProperty("/PerformanceStartDate");
                if (oStartDate >= oEndDate) {
                    MessageToast.show(
                        "Kindly select a date more than bonus validity from date."
                    );

                    oModelView.setProperty("/PerformanceEndDate", null);
                }
            },
            onStartDateBRRChange: function (oEvent) {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oStartDate = oEvent.getSource().getDateValue();
                var oBject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();

                var oEndDate = oBject["EndDate"];
                if (oEndDate) {
                    if (oStartDate > oEndDate) {
                        MessageToast.show(
                            "Kindly select a date less than Bonus Validity To date."
                        );
                        oModelControl.setProperty(sPath + "/StartDate", null);
                        return;
                    }
                }
                // if (oStartDate < new Date().setHours(0, 0, 0, 0)) {
                //     MessageToast.show("Kindly enter a date greater than current date");

                //     oModelControl.setProperty(sPath + "/StartDate", null);
                //     return;
                // }
            },
            onEndDateBRRChange: function (oEvent) {
                var oView = this.getView();

                var oModelControl = oView.getModel("oModelControl");
                var oEndDate = oEvent.getSource().getDateValue();
                var oBject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();
                // var oContext = oEvent.getSource().getBinding("dateValue").getContext();
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath();
                var oStartDate = oBject["StartDate"];
                if (oStartDate) {
                    if (oStartDate > oEndDate) {
                        MessageToast.show(
                            "Kindly select a date more than Bonus Validity From date."
                        );
                        oModelControl.setProperty(sPath + "/EndDate", null);
                        return;
                    }
                }

                // if (oEndDate < new Date().setHours(0, 0, 0, 0)) {
                //     MessageToast.show("Kindly enter a date greater than current date");

                //     oModelControl.setProperty(sPath + "/EndDate", null);
                //     return;
                // }
            },

            _propertyToBlank: function (aArray, aModel2) {
                var aProp = aArray;
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                if (aModel2) {
                    oModelView = oView.getModel("oModelControl");
                }

                for (var x of aProp) {
                    var oGetProp = oModelView.getProperty("/" + x);
                    if (Array.isArray(oGetProp)) {
                        oModelView.setProperty("/" + x, []);
                        //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
                    } else if (oGetProp === null) {
                        oModelView.setProperty("/" + x, null);
                    } else if (oGetProp instanceof Date) {
                        oModelView.setProperty("/" + x, null);
                    } else if (typeof oGetProp === "boolean") {
                        oModelView.setProperty("/" + x, false);
                    } else {
                        oModelView.setProperty("/" + x, "");
                    }
                }
                oModelView.refresh(true);
            },
            _RbtnReset: function (aArray, aModel2 = true) {
                var aProp = aArray;
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                if (aModel2) {
                    oModelView = oView.getModel("oModelControl");
                }
                for (var x of aProp) {
                    var oGetProp = oModelView.getProperty("/" + x);

                    oModelView.setProperty("/" + x, 0);
                    //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
                }
                oModelView.refresh(true);
            },
            onValueHelpParentOffer: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();

                if (!this._pOfferpDialog) {
                    this._pOfferpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.OfferDialog",
                        controller: this,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._pOfferpDialog.then(function (oDialog) {
                    // Create a filter for the binding

                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open();
                });
            },
            onParentOfferValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
                var oView = this.getView();
                var oViewModel = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                if (!oSelectedItem) {
                    return;
                }
                var obj = oSelectedItem.getBindingContext().getObject();
                oViewModel.setProperty("/ParentOfferId", obj["Id"]);
                oModelControl.setProperty("/Fields/ParentOfferTitle", obj["Title"]);
            },
            onValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter(
                    [
                        new Filter({
                            path: "Title",
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false,
                        }),
                        new Filter({
                            path: "Description",
                            operator: FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false,
                        }),
                    ],
                    false
                );

                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            GetPackName: function (mParam1) {
                var sPath = "/MasterRepProductSkuSet('" + mParam1 + "')";
                var oData = this.getView().getModel().getProperty(sPath);
                if (oData !== undefined && oData !== null) {
                    return oData["Description"];
                }
            },
            GetProdName: function (mParam1) {
                var sPath = "/MasterProductSet('" + mParam1 + "')";
                var oModel = this.getView().getModel();
                var oData = oModel.getObject(sPath, {
                    select: "ProductName"
                });
                //console.log(sPath,oData,oModel);
                if (oData) {
                    return oData["ProductName"];
                }
                //return oData["ProductName"];
            },
            GetProdNam2: function (mParam1) {
                //console.log(mParam1);
                return mParam1["ProductName"]
            },

            /// Methods Specific to Display and Edit Offers
            // 1. Display Offers

            //2. Edit Offers

            // create payload for edit and add

            _CheckTableValidation: function () {
                // check if the table 1 or 2 is visible
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModelData = oModel.getData();
                var oData = oModelData["Table"]["Table2"];
                if (oModelData["Table"]["Table2"].length == 0) {
                    return [
                        false,
                        "Kindly Enter the data in the Reward Ratio Table to Continue.",
                    ];
                }
                var bFlag = true;
                oModelData["Table"]["Table2"].forEach(function (a) {
                    if (a.hasOwnProperty("editable")) {
                        if (a["editable"]) {
                            bFlag = false;
                        }
                    }
                });
                if (bFlag) {
                    return [true, ""];
                } else {
                    return [
                        false,
                        "Kindly Save the data in the Reward Ratio Table to Continue.",
                    ];
                }
            },
            _CheckTableBonusValidation: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModelData = oModel.getData();
                var oData = oModelData["Table"]["Table3"];
                var bFlag = true;
                if (oModelData["Table"]["Table3"].length > 0) {
                    oModelData["Table"]["Table3"].forEach(function (a) {
                        if (a.hasOwnProperty("editable")) {
                            if (a["editable"]) {
                                bFlag = false;
                            }
                        }
                    });
                }
                if (oModelData["Table"]["Table4"].length > 0) {
                    oModelData["Table"]["Table4"].forEach(function (a) {
                        if (a.hasOwnProperty("editable")) {
                            if (a["editable"]) {
                                bFlag = false;
                            }
                        }
                    });
                }

                if (bFlag) {
                    return [true, ""];
                } else {
                    return [
                        false,
                        "Kindly Save the data in the Bonus Reward Ratio Table to Continue",
                    ];
                }
            },
            _CheckTableCondition1: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModelData = oModel.getData();
                var oData = oModelData["Table"]["Table5"];
                var bFlag = true;
                if (oModelData["Table"]["Table5"].length > 0) {
                    oModelData["Table"]["Table5"].forEach(function (a) {
                        if (a.hasOwnProperty("editable")) {
                            if (a["editable"]) {
                                bFlag = false;
                            }
                        }
                    });
                }
                if (bFlag) {
                    return [true, ""];
                } else {
                    return [
                        false,
                        "Kindly Save the data in the Earned Points Conditon Table to Continue.",
                    ];
                }
            },
            _CheckTableCondition2: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModelData = oModel.getData();
                var oDataTable = oModelData["Table"]["Table6"];
                var bFlag = true;
                if (oDataTable.length > 0) {
                    oDataTable.forEach(function (a) {
                        if (a.hasOwnProperty("editable")) {
                            if (a["editable"]) {
                                bFlag = false;
                            }
                        }
                    });
                }
                if (bFlag) {
                    return [true, ""];
                } else {
                    return [
                        false,
                        "Kindly Save the data in the Product Value Conditions Table to Continue.",
                    ];
                }
            },
            _CheckTableCondition3: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oModelData = oModel.getData();
                var oDataTable = oModelData["Table"]["Table7"];
                var bFlag = true;
                if (oDataTable.length > 0) {
                    oDataTable.forEach(function (a) {
                        if (a.hasOwnProperty("editable")) {
                            if (a["editable"]) {
                                bFlag = false;
                            }
                        }
                    });
                }
                if (bFlag) {
                    return [true, ""];
                } else {
                    return [
                        false,
                        "Kindly Save the data in the Redemption Cycle Conditions Table to Continue.",
                    ];
                }
            },
            onAttachDialogClose: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            GetPainterCount: function () {
                var oView = this.getView();
                var oModelC = oView.getModel("oModelControl");
                var oModelV = oView.getModel("oModelView");
                var sMultiKeys = oModelC.getProperty("/MultiCombo");
                var oData = oView.getModel();
                var oPayLoad = {
                    IsSpecificZone: true,
                    OfferZone: sMultiKeys["Zones"].map(function (elem) {
                        return {
                            ZoneId: elem,
                        };
                    }),
                    IsSpecificDivision: true,
                    OfferDivision: sMultiKeys["Divisions"].map(function (elem) {
                        return {
                            DivisionId: elem,
                        };
                    }),
                    IsSpecificDepot: true,
                    OfferDepot: sMultiKeys["Depots"].map(function (elem) {
                        return {
                            DepotId: elem["DepotId"],
                        };
                    }),
                    OfferPainterType: sMultiKeys["PainterType"].map(function (elem) {
                        return {
                            PainterTypeId: parseInt(elem),
                        };
                    }),
                    OfferPainterArcheType: sMultiKeys["ArcheTypes"].map(function (
                        elem
                    ) {
                        return {
                            ArcheTypeId: parseInt(elem),
                        };
                    }),
                    OfferPainterPotential: sMultiKeys["Potential"].map(function (elem) {
                        return {
                            PotentialId: parseInt(elem),
                        };
                    }),
                    PointSlabLowerLimit: oView.byId("PSlabLowLimit").getValue(),
                    PointSlabUpperLimit: oView.byId("PSlabULimit").getValue(),
                };
                var oPayLoadNew = this._RemoveEmptyValueV1(oPayLoad);
                var inTegerProperty = ["PointSlabUpperLimit", "PointSlabLowerLimit"];

                for (var y of inTegerProperty) {
                    if (oPayLoadNew.hasOwnProperty(y)) {
                        if (oPayLoadNew[y] !== null) {
                            oPayLoadNew[y] = parseInt(oPayLoadNew[y]);
                        }
                    }
                }
                var aBoleanProps = {
                    IsSpecificZone: "Zones",
                    IsSpecificDivision: "Divisions",
                    IsSpecificDepot: "Depots",
                };
                var oPropRbtn = oModelC.getProperty("/Rbtn");
                for (var key in aBoleanProps) {
                    if (oPropRbtn[aBoleanProps[key]] === 0) {
                        oPayLoadNew[key] = false;
                    } else {
                        oPayLoadNew[key] = true;
                    }

                    //oPayLoad[key] = oPropRbtn[aBoleanProps[key]] == 0 ? false : true;
                }

                oData.create("/OfferApplicablePainterCountSet", oPayLoadNew, {
                    success: function (oData) {
                        if (oData.hasOwnProperty("PainterCount")) {
                            oModelC.setProperty(
                                "/Fields/PainterCount",
                                oData["PainterCount"]
                            );
                        }
                    },
                    error: function () { },
                });
            },
            _RemoveEmptyValueV1: function (mParam) {
                var obj = Object.assign({}, mParam);
                // remove string values
                var oNew = Object.entries(obj).reduce(
                    (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)), {}
                );
                // remove the null values
                var oNew2 = Object.entries(oNew).reduce(
                    (a, [k, v]) => (v === null ? a : ((a[k] = v), a)), {}
                );

                return oNew2;
            },
            _CreateWorkFlowData: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oLoggedInInfo = oModel.getProperty("/LoggedInUser");
                if (oPayLoad["OfferStatus"]) {
                    var sExistStatus = JSON.parse(
                        JSON.stringify(oPayLoad["OfferStatus"])
                    ); //;
                } else {
                    var sExistStatus = null;
                }

                if (oLoggedInInfo["UserTypeId"] === 5) {
                    oPayLoad["OfferStatus"] = "DRAFT";
                    oPayLoad["IsWorkFlowApplicable"] = false;
                } else if (
                    oLoggedInInfo["UserTypeId"] === 6 ||
                    oLoggedInInfo["UserTypeId"] === 7
                ) {
                    if (sExistStatus === "APPROVED") {
                        oPayLoad["OfferStatus"] = "APPROVED";
                        oPayLoad["IsWorkFlowApplicable"] = false;
                    } else if (sExistStatus === "PUBLISHED") {
                        oPayLoad["OfferStatus"] = "PUBLISHED";
                        oPayLoad["IsWorkFlowApplicable"] = false;
                    } else {
                        oPayLoad["OfferStatus"] = "APPROVED";
                        if (oPayLoad["WorkflowInstanceId"]) {
                            oPayLoad["IsWorkFlowApplicable"] = true;
                        } else {
                            oPayLoad["IsWorkFlowApplicable"] = false;
                        }
                    }
                    // if the existing status is approved then
                    //is workflow applicable false else true
                }

                oPayLoad["InitiateForceTat"] = false;
                promise.resolve(oPayLoad);
                return promise;
            },
            _CheckExpandPainter: function (oPayload) {
                var promise = jQuery.Deferred();
                if (oPayload.hasOwnProperty("OfferSpecificPainter")) {
                    if (oPayload["OfferSpecificPainter"].hasOwnProperty("results")) {
                        if (oPayload["OfferSpecificPainter"]["results"].length > 0) {
                            for (var x in oPayload["OfferSpecificPainter"]["results"]) {
                                if (
                                    oPayload["OfferSpecificPainter"]["results"][
                                        x
                                    ].hasOwnProperty("Painter")
                                ) {
                                    delete oPayload["OfferSpecificPainter"]["results"][x][
                                        "Painter"
                                    ];
                                }
                            }
                        }
                    } else if (Array.isArray(oPayload["OfferSpecificPainter"])) {
                        // this is for update data basically in add its not required as the data wont have painter expand
                        if (oPayload["OfferSpecificPainter"].length > 0) {
                            for (var x in oPayload["OfferSpecificPainter"]) {
                                if (
                                    oPayload["OfferSpecificPainter"][x].hasOwnProperty(
                                        "Painter"
                                    )
                                ) {
                                    delete oPayload["OfferSpecificPainter"][x]["Painter"];
                                }
                            }
                        }
                    }
                }

                promise.resolve(oPayload);
                return promise;
            },
            _CreatePayloadPart1(bFileFlag) {
                var promise = jQuery.Deferred();
                //creating the payload
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                var oDataModel = oView.getModel();
                var oViewData = oModelView.getData();
                var oPayLoad = this._RemoveEmptyValue(oViewData);

                var inTegerProperty = [
                    "PointSlabUpperLimit",
                    "PointSlabLowerLimit",
                    "BonusApplicableTopPainter",
                    "ParentOfferId",
                    "RedemptionCycle",
                ];
                for (var y of inTegerProperty) {
                    if (oPayLoad.hasOwnProperty(y)) {
                        if (oPayLoad[y] !== null) {
                            oPayLoad[y] = parseInt(oPayLoad[y]);
                        }
                    }
                }
                // setting the flag for increasing the end date time
                // oPayLoad["EndDate"] = new Date(
                //     oPayLoad["EndDate"].setHours(23, 59, 59, 999)
                // );
                promise.resolve(oPayLoad);
                return promise;
            },
            _CreatePayLoadPart1AForEndDate: function (oPayLoad) {
                var oPromise = jQuery.Deferred();
                if (oPayLoad.hasOwnProperty("EndDate")) {
                    oPayLoad["EndDate"] = new Date(
                        oPayLoad["EndDate"].setHours(23, 59, 59, 999)
                        //oPayLoad["EndDate"].setHours(17, 51, 59, 999)
                    );
                }
                oPromise.resolve(oPayLoad);
                return oPromise;

            },
            _CreatePayloadPart2: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var aBoleanProps = {
                    IsSpecificZone: "Zones",
                    IsSpecificDivision: "Divisions",
                    IsSpecificDepot: "Depots",
                    IsSpecificApplicableProductCategory: "PCat1",
                    IsSpecificApplicableProductClassification: "PClass1",
                    IsSpecificApplicableProduct: "AppProd1",
                    IsSpecificApplicablePack: "AppPacks1",
                    IsSpecificRewardRatio: "Rewards",
                    IsSpecificBuyerProductCategory: "PCat2",
                    IsSpecificBuyerProductClassification: "PClass2",
                    IsSpecificBuyerProduct: "AppProd2",
                    IsSpecificBuyerPack: "AppPacks2",
                    IsSpecificNonBuyerProductCategory: "PCat3",
                    IsSpecificNonBuyerProductClassification: "PClass3",
                    IsSpecificNonBuyerProduct: "AppProd3",
                    IsSpecificNonBuyerPack: "AppPacks3",
                    IsSpecificBonusProductCategory: "PCat4",
                    IsSpecificBonusProductClassification: "PClass4",
                    IsSpecificBonusProduct: "AppProd4",
                    IsSpecificBonusPack: "AppPacks4",
                    IsSpecificBonusRewardRatio: "BRewards",
                };
                var oModelControl = oView.getModel("oModelControl");
                var oPropRbtn = oModelControl.getProperty("/Rbtn");
                for (var key in aBoleanProps) {
                    if (oPropRbtn[aBoleanProps[key]] === 0) {
                        oPayLoad[key] = false;
                    } else {
                        oPayLoad[key] = true;
                    }
                }

                promise.resolve(oPayLoad);
                return promise;
            },

            // postdata
            _CreatePayloadPart3: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModelCtrlData = oModelControl.getData();
                var oModelView = oView.getModel("oModelView");
                var oModelViewData = oModelView.getData();
                var sMultiKeys = oModelControl.getProperty("/MultiCombo");
                var aHashPCat1 = oModelControl.getProperty("/Hash/PCat1");
                var aHashPCat2 = oModelControl.getProperty("/Hash/PCat2");
                var aHashPCat3 = oModelControl.getProperty("/Hash/PCat3");
                var aHashPCat4 = oModelControl.getProperty("/Hash/PCat4");
                var aHashPClass1 = oModelControl.getProperty("/Hash/PClass1");
                var aHashPClass2 = oModelControl.getProperty("/Hash/PClass2");
                var aHashPClass3 = oModelControl.getProperty("/Hash/PClass3");
                var aHashPClass4 = oModelControl.getProperty("/Hash/PClass4");
                var aHashAppProd1 = oModelCtrlData["Hash"]["AppProd1"],
                    aHashAppProd2 = oModelCtrlData["Hash"]["AppProd2"],
                    aHashAppProd3 = oModelCtrlData["Hash"]["AppProd3"],
                    aHashAppProd4 = oModelCtrlData["Hash"]["AppProd4"];
                var aHashAppPack1 = oModelCtrlData["Hash"]["AppPack1"],
                    aHashAppPack2 = oModelCtrlData["Hash"]["AppPack2"],
                    aHashAppPack3 = oModelCtrlData["Hash"]["AppPack3"],
                    aHashAppPack4 = oModelCtrlData["Hash"]["AppPack4"];
                //   ArcheTypes: [],
                //         PainterType: [],
                //         Potential: [],
                var aHashArcheType = oModelCtrlData["Hash"]["ArcheType"],
                    aHashPainterType = oModelCtrlData["Hash"]["PainterType"],
                    aHashPotential = oModelCtrlData["Hash"]["Potential"];
                var aHashZone = oModelCtrlData["Hash"]["Zone"],
                    aHashDivision = oModelCtrlData["Hash"]["Division"],
                    aHashDepot = oModelCtrlData["Hash"]["Depot"];
                var aHashPainter = oModelCtrlData["Hash"]["Painter"];
                var aDataPCat1 = [],
                    aDataPCat2 = [],
                    aDataPCat3 = [],
                    aDataPCat4 = [],
                    aDataPClass1 = [],
                    aDataPClass2 = [],
                    aDataPClass3 = [],
                    aDataPClass4 = [];
                var aDataAppProd1 = [],
                    aDataAppProd2 = [],
                    aDataAppProd3 = [],
                    aDataAppProd4 = [];
                var aDataAppPack1 = [],
                    aDataAppPack2 = [],
                    aDataAppPack3 = [],
                    aDataAppPack4 = [];
                var aDataArcheType = [],
                    aDataPainterType = [],
                    aDataPotential = [];
                var aDataZone = [],
                    aDataDepot = [],
                    aDataDivision = [];
                var aDataPainter = [];
                if (oModelControl.getProperty("/mode") === "edit") {
                    aDataPCat1 =
                        oModelViewData["OfferApplicableProductCategory"]["results"];
                    aDataPCat2 = oModelViewData["OfferBuyerProductCategory"]["results"];
                    aDataPCat3 =
                        oModelViewData["OfferNonBuyerProductCategory"]["results"];
                    aDataPCat4 = oModelViewData["OfferBonusProductCategory"]["results"];
                    aDataPClass1 =
                        oModelViewData["OfferApplicableProductClassification"]["results"];
                    aDataPClass2 =
                        oModelViewData["OfferBuyerProductClassification"]["results"];
                    aDataPClass3 =
                        oModelViewData["OfferNonBuyerProductClassification"]["results"];
                    aDataPClass4 =
                        oModelViewData["OfferBonusProductClassification"]["results"];
                    aDataAppProd1 = oModelViewData["OfferApplicableProduct"]["results"];
                    aDataAppProd2 = oModelViewData["OfferBuyerProduct"]["results"];
                    aDataAppProd3 = oModelViewData["OfferNonBuyerProduct"]["results"];
                    aDataAppProd4 = oModelViewData["OfferBonusProduct"]["results"];
                    aDataAppPack1 = oModelViewData["OfferApplicablePack"]["results"];
                    aDataAppPack2 = oModelViewData["OfferBuyerPack"]["results"];
                    aDataAppPack3 = oModelViewData["OfferNonBuyerPack"]["results"];
                    aDataAppPack4 = oModelViewData["OfferBonusPack"]["results"];
                    aDataArcheType = oModelViewData["OfferPainterArcheType"]["results"];
                    aDataPainterType = oModelViewData["OfferPainterType"]["results"];
                    aDataPotential = oModelViewData["OfferPainterPotential"]["results"];
                    aDataZone = oModelViewData["OfferZone"]["results"];
                    aDataDivision = oModelViewData["OfferDivision"]["results"];
                    aDataDepot = oModelViewData["OfferDepot"]["results"];
                    aDataPainter = oModelViewData["OfferSpecificPainter"]["results"];
                }

                // setting the values of zone
                oPayLoad["OfferZone"] = sMultiKeys["Zones"].map(function (elem) {
                    if (aHashZone[elem]) {
                        return aDataZone[aHashZone[elem]];
                    } else {
                        return {
                            ZoneId: elem,
                        };
                    }
                });
                oPayLoad["OfferDivision"] = sMultiKeys["Divisions"].map(function (
                    elem
                ) {
                    if (aHashDivision[elem]) {
                        return aDataDivision[aHashDivision[elem]];
                    } else {
                        return {
                            DivisionId: elem,
                        };
                    }
                });
                oPayLoad["OfferDepot"] = sMultiKeys["Depots"].map(function (elem) {
                    if (aHashDepot[elem["DepotId"]]) {
                        return aDataDepot[aHashDepot[elem["DepotId"]]];
                    } else {
                        return {
                            DepotId: elem["DepotId"],
                        };
                    }
                });

                oPayLoad["OfferApplicableProductCategory"] = sMultiKeys["PCat1"].map(
                    function (elem) {
                        if (aHashPCat1[elem]) {
                            return aDataPCat1[aHashPCat1[elem]];
                        } else {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    }
                );
                oPayLoad["OfferApplicableProductClassification"] = sMultiKeys[
                    "PClass1"
                ].map(function (elem) {
                    if (aHashPClass1[elem]) {
                        return aDataPClass1[aHashPClass1[elem]];
                    } else {
                        return {
                            ProductClassificationCode: elem,
                        };
                    }
                });
                oPayLoad["OfferApplicableProduct"] = sMultiKeys["AppProd1"].map(
                    function (elem) {
                        if (aHashAppProd1[elem["Id"]]) {
                            return aDataAppProd1[aHashAppProd1[elem["Id"]]];
                        } else {
                            return {
                                ProductCode: elem["Id"],
                            };
                        }
                    }
                );
                oPayLoad["OfferApplicablePack"] = sMultiKeys["AppPacks1"].map(
                    function (elem) {
                        if (aHashAppPack1[elem["Id"]]) {
                            return aDataAppPack1[aHashAppPack1[elem["Id"]]];
                        } else {
                            return {
                                SkuCode: elem["Id"],
                            };
                        }
                    }
                );
                oPayLoad["OfferPainterType"] = sMultiKeys["PainterType"].map(
                    function (elem) {
                        if (aHashPainterType[elem]) {
                            return aDataPainterType[aHashPainterType[elem]];
                        } else {
                            return {
                                PainterTypeId: parseInt(elem),
                            };
                        }
                    }
                );
                oPayLoad["OfferPainterArcheType"] = sMultiKeys["ArcheTypes"].map(
                    function (elem) {
                        if (aHashArcheType[elem]) {
                            return aDataArcheType[aHashArcheType[elem]];
                        } else {
                            return {
                                ArcheTypeId: parseInt(elem),
                            };
                        }
                    }
                );
                oPayLoad["OfferPainterPotential"] = sMultiKeys["Potential"].map(
                    function (elem) {
                        if (aHashPotential[elem]) {
                            return aDataPotential[aHashPotential[elem]];
                        } else {
                            return {
                                PotentialId: parseInt(elem),
                            };
                        }
                    }
                );
                oPayLoad["OfferBuyerProductCategory"] = sMultiKeys["PCat2"].map(
                    function (elem) {
                        if (aHashPCat2[elem]) {
                            return aDataPCat2[aHashPCat2[elem]];
                        } else {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    }
                );
                oPayLoad["OfferBuyerProductClassification"] = sMultiKeys[
                    "PClass2"
                ].map(function (elem) {
                    if (aHashPClass2[elem]) {
                        return aDataPClass2[aHashPClass2[elem]];
                    } else {
                        return {
                            ProductClassificationCode: elem,
                        };
                    }
                });
                oPayLoad["OfferBuyerProduct"] = sMultiKeys["AppProd2"].map(function (
                    elem
                ) {
                    if (aHashAppProd2[elem["Id"]]) {
                        return aDataAppProd2[aHashAppProd2[elem["Id"]]];
                    } else {
                        return {
                            ProductCode: elem["Id"],
                        };
                    }
                });
                oPayLoad["OfferBuyerPack"] = sMultiKeys["AppPacks2"].map(function (
                    elem
                ) {
                    if (aHashAppPack2[elem["Id"]]) {
                        return aDataAppPack2[aHashAppPack2[elem["Id"]]];
                    } else {
                        return {
                            SkuCode: elem["Id"],
                        };
                    }
                });
                oPayLoad["OfferNonBuyerProductCategory"] = sMultiKeys["PCat3"].map(
                    function (elem) {
                        if (aHashPCat3[elem]) {
                            return aDataPCat3[aHashPCat3[elem]];
                        } else {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    }
                );
                oPayLoad["OfferNonBuyerProductClassification"] = sMultiKeys[
                    "PClass3"
                ].map(function (elem) {
                    if (aHashPClass3[elem]) {
                        return aDataPClass3[aHashPClass3[elem]];
                    } else {
                        return {
                            ProductClassificationCode: elem,
                        };
                    }
                });
                oPayLoad["OfferNonBuyerProduct"] = sMultiKeys["AppProd3"].map(
                    function (elem) {
                        if (aHashAppProd3[elem["Id"]]) {
                            return aDataAppProd3[aHashAppProd3[elem["Id"]]];
                        } else {
                            return {
                                ProductCode: elem["Id"],
                            };
                        }
                    }
                );
                oPayLoad["OfferNonBuyerPack"] = sMultiKeys["AppPacks3"].map(function (
                    elem
                ) {
                    if (aHashAppPack3[elem["Id"]]) {
                        return aDataAppPack3[aHashAppPack3[elem["Id"]]];
                    } else {
                        return {
                            SkuCode: elem["Id"],
                        };
                    }
                });
                // Bonus Reward Ratio
                oPayLoad["OfferBonusProductCategory"] = sMultiKeys["PCat4"].map(
                    function (elem) {
                        if (aHashPCat4[elem]) {
                            return aDataPCat4[aHashPCat4[elem]];
                        } else {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    }
                );
                oPayLoad["OfferBonusProductClassification"] = sMultiKeys[
                    "PClass4"
                ].map(function (elem) {
                    if (aHashPClass4[elem]) {
                        return aDataPClass4[aHashPClass4[elem]];
                    } else {
                        return {
                            ProductClassificationCode: elem,
                        };
                    }
                });
                oPayLoad["OfferBonusProduct"] = sMultiKeys["AppProd4"].map(function (
                    elem
                ) {
                    if (aHashAppProd4[elem["Id"]]) {
                        return aDataAppProd4[aHashAppProd4[elem["Id"]]];
                    } else {
                        return {
                            ProductCode: elem["Id"],
                        };
                    }
                });
                oPayLoad["OfferBonusPack"] = sMultiKeys["AppPacks4"].map(function (
                    elem
                ) {
                    if (aHashAppPack4[elem["Id"]]) {
                        return aDataAppPack4[aHashAppPack4[elem["Id"]]];
                    } else {
                        return {
                            SkuCode: elem["Id"],
                        };
                    }
                });

                oPayLoad["OfferSpecificPainter"] = sMultiKeys["Painters"].map(
                    function (elem) {
                        if (aHashPainter[elem["PainterId"]]) {
                            return aDataPainter[aHashPainter[elem["PainterId"]]];
                        } else {
                            return {
                                PainterId: parseInt(elem["PainterId"]),
                            };
                        }
                    }
                );
                // check for null
                promise.resolve(oPayLoad);
                return promise;
            },
            _CreatePayLoadPart4: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var bRewardSelected = oModel.getProperty("/Rbtn/Rewards");
                var aFinalArray = [];
                //if (bRewardSelected === 0) {
                var oDataTbl = oModel.getProperty("/Table/Table2").map(function (a) {
                    return Object.assign({}, a);
                });

                var aCheckProp = [
                    "RequiredVolume",
                    "RequiredPoints",
                    "RewardPoints",
                    "RewardGiftName",
                    "RewardCash",
                ];
                aFinalArray = oDataTbl.filter(function (ele) {
                    for (var a in aCheckProp) {
                        if (ele[aCheckProp[a]] === "") {
                            ele[aCheckProp[a]] = null;
                        }
                        if (aCheckProp[a] === "RequiredVolume") {
                            if (ele[aCheckProp[a]]) {
                                ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                            }
                        }
                        if (aCheckProp[a] === "RequiredPoints") {
                            if (ele[aCheckProp[a]]) {
                                ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                            }
                        }
                        if (aCheckProp[a] === "RewardPoints") {
                            if (ele[aCheckProp[a]]) {
                                ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                            }
                        }
                        if (aCheckProp[a] === "RewardCash") {
                            if (ele[aCheckProp[a]]) {
                                ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                            }
                        }
                    }
                    delete ele["editable"];
                    return ele;
                });
                oPayLoad["OfferRewardRatio"] = aFinalArray;

                promise.resolve(oPayLoad);
                return promise;
                //}
                // this menas that specific is selected we will check first
                // if packs all is selected and products data will be displayed

                var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks1");
                // if (bAllProdSelected === 0) {
                //     var oDataTbl = oModel
                //         .getProperty("/Table/Table2")
                //         .map(function (a) {
                //             return Object.assign({}, a);
                //         });

                //     var aCheckProp = [
                //         "RequiredVolume",
                //         "RequiredPoints",
                //         "RewardPoints",
                //         //"RewardGiftId",
                //         "RewardCash",
                //     ];
                //     aFinalArray = oDataTbl.filter(function (ele) {

                //         for (var a in aCheckProp) {
                //             if (ele[aCheckProp[a]] === "") {
                //                 ele[aCheckProp[a]] = null;
                //             } else {
                //                 ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                //             }
                //         }
                //         delete ele["editable"]
                //         return ele;

                //     });
                //     oPayLoad["OfferRewardRatio"] = aFinalArray;

                //     promise.resolve(oPayLoad);
                //     return promise;
                // }
                // if (bAllProdSelected === 1) {
                //     var oDataTbl = oModel
                //         .getProperty("/Table/Table2")
                //         .map(function (a) {
                //             return Object.assign({}, a);
                //         });

                //     var aCheckProp = [
                //         "RequiredVolume",
                //         "RequiredPoints",
                //         "RewardPoints",
                //         //"RewardGiftId",
                //         "RewardCash",
                //     ];

                //     aFinalArray = oDataTbl.filter(function (ele) {

                //         for (var a in aCheckProp) {
                //             if (ele[aCheckProp[a]] === "") {
                //                 ele[aCheckProp[a]] = null;
                //             } else {
                //                 ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                //             }
                //         }
                //         delete ele["editable"]
                //         return ele;

                //     });
                //     oPayLoad["OfferRewardRatio"] = aFinalArray;

                //     promise.resolve(oPayLoad);
                //     return promise;
                // }
            },
            _CreatePayLoadPart5: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var bRewardSelected = oModel.getProperty("/Rbtn/BRewards");
                var aFinalArray = [];
                if (bRewardSelected === 0) {
                    var oDataTbl = oModel
                        .getProperty("/Table/Table3")
                        .map(function (a) {
                            return Object.assign({}, a);
                        });

                    var aCheckProp = [
                        "StartDate",
                        "EndDate",
                        "BonusPoints",
                        "BonusPercentage",
                    ];
                    aFinalArray = oDataTbl.filter(function (ele) {
                        for (var a in aCheckProp) {
                            if (ele[aCheckProp[a]] === "") {
                                ele[aCheckProp[a]] = null;
                            }
                            if (aCheckProp[a] === "BonusPoints") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            if (aCheckProp[a] === "BonusPercentage") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            if (aCheckProp[a] === "EndDate") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = new Date(
                                        ele[aCheckProp[a]].setHours(23, 59, 59, 999)
                                    );
                                }
                            }
                        }
                        delete ele["editable"];
                        return ele;
                    });
                    oPayLoad["OfferBonusRewardRatio"] = aFinalArray;

                    promise.resolve(oPayLoad);
                    return promise;
                }
                // this menas that specific is selected we will check first
                // if packs all is selected and products data will be displayed
                var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks4");
                if (bRewardSelected === 1) {
                    var oDataTbl = oModel
                        .getProperty("/Table/Table4")
                        .map(function (a) {
                            return Object.assign({}, a);
                        });
                    var aCheckProp = [
                        "StartDate",
                        "EndDate",
                        "BonusPoints",
                        "BonusPercentage",
                        "SkuCode",
                        "ProductCode",
                    ];
                    aFinalArray = oDataTbl.filter(function (ele) {
                        for (var a in aCheckProp) {
                            if (ele[aCheckProp[a]] === "") {
                                ele[aCheckProp[a]] = null;
                            }
                            if (aCheckProp[a] === "BonusPoints") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            if (aCheckProp[a] === "BonusPercentage") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            if (aCheckProp[a] === "EndDate") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = new Date(
                                        ele[aCheckProp[a]].setHours(23, 59, 59, 999)
                                    );
                                }
                            }
                        }
                        delete ele["editable"];
                        return ele;
                    });
                    oPayLoad["OfferBonusRewardRatio"] = aFinalArray;

                    promise.resolve(oPayLoad);
                    return promise;
                }
                // this means that the user has selected specific for bonus reward packs
            },
            _CreatePayLoadConditions: function (oPayLoad) {
                var promise = jQuery.Deferred();
                // conditions table 1 
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");

                var aTable5 = oModel.getProperty("/Table/Table5");
                var aFinalArray = [];
                if (aTable5.length > 0) {
                    var oDataTbl = aTable5.map(function (a) {
                        return Object.assign({}, a);
                    });
                    var aCheckProp = [
                        "EndDate",
                        "RequiredVolume",
                        "RequiredPoints",
                        "StartDate"
                    ];
                    aFinalArray = oDataTbl.filter(function (ele) {
                        for (var a in aCheckProp) {
                            if (ele[aCheckProp[a]] === "") {
                                ele[aCheckProp[a]] = null;
                            }
                            if (aCheckProp[a] === "RequiredVolume") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            if (aCheckProp[a] === "RequiredPoints") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            if (aCheckProp[a] === "EndDate") {
                                if (ele[aCheckProp[a]]) {
                                    ele[aCheckProp[a]] = new Date(
                                        ele[aCheckProp[a]].setHours(23, 59, 59, 999)
                                    );
                                }
                            }

                        }
                        delete ele["editable"];
                        return ele;
                    });
                    oPayLoad["OfferEarnedPointsCondition"] = aFinalArray;

                }
                var aTable6 = oModel.getProperty("/Table/Table6");
                var aFinalArray3 = [];
                if (aTable6.length > 0) {
                    var oDataTbl3 = aTable6.map(function (a) {
                        return Object.assign({}, a);
                    });
                    var aCheckProp3 = [
                        "ProductCode",
                        "Percentage"
                    ];
                    aFinalArray3 = oDataTbl3.filter(function (ele) {
                        for (var a in aCheckProp3) {
                            if (ele[aCheckProp3[a]] === "") {
                                ele[aCheckProp3[a]] = null;
                            }

                        }
                        delete ele["editable"];
                        return ele;
                    });
                    oPayLoad["OfferProductValueCondition"] = aFinalArray3;

                }

                var aTable7 = oModel.getProperty("/Table/Table7");
                var aFinalArray2 = [];
                if (aTable7.length > 0) {
                    var oDataTbl2 = aTable7.map(function (a) {
                        return Object.assign({}, a);
                    });
                    var aCheckProp2 = [
                        "Percentage"
                    ];
                    aFinalArray2 = oDataTbl2.filter(function (ele) {
                        for (var a in aCheckProp2) {
                            if (ele[aCheckProp2[a]] === "") {
                                ele[aCheckProp2[a]] = null;
                            }

                        }
                        delete ele["editable"];
                        return ele;
                    });
                    oPayLoad["OfferRedemptionCycleCondition"] = aFinalArray2;

                }
                promise.resolve(oPayLoad);
                return promise;
            },
            onViewAttachment: function (oEvent) {
                var oButton = oEvent.getSource();
                var oView = this.getView();
                if (!this._pKycDialog) {
                    Fragment.load({
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.AttachmentDialog",
                        controller: this,
                    }).then(
                        function (oDialog) {
                            this._pKycDialog = oDialog;
                            oView.addDependent(this._pKycDialog);
                            this._pKycDialog.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._pKycDialog);
                    this._pKycDialog.open();
                }
            },
            onUploadMisMatch: function () {
                MessageToast.show("Kindly upload a file of type .png, .jpg, .jpeg");
            },
            onpressfrag: function () {
                var oView = this.getView();

                var dataModel = oView.getModel("FragData");
                this.getView().setModel(dataModel, "DataModel");
                var fragmentData = oView.getModel("DataModel").getData();

                oView.getModel("oModelControl").setProperty("/ofragmentModel", fragmentData.OfferSet);


                return new Promise(function (resolve, reject) {
                    if (!this._RewardsDialog21) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.PainterDialogue",
                            controller: this,
                        }).then(
                            function (oDialog) {
                                this._RewardsDialog21 = oDialog;
                                oView.addDependent(this._RewardsDialog21);

                                this._RewardsDialog21.open();
                                resolve();
                            }.bind(this)
                        );
                    } else {

                        this._RewardsDialog21.open();
                        resolve();
                    }
                }.bind(this));
            },

            onSavePaitner: function (oEvent) {
                var oView = this.getView();
                var fragmentData = oView.getModel("oModelControl").getProperty("/ofragmentModel");
                var iGetSelIndices = oView.byId("idPainterDialog").getSelectedIndices();
                var selectedData = iGetSelIndices.map(i => fragmentData[i]);

                  console.log(selectedData);

            },
            /**
             * Adds a history entry in the FLP page history
             * @public
             * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
             * @param {boolean} bReset If true resets the history before the new entry is added
             */
            addHistoryEntry: (function () {
                var aHistoryEntries = [];

                return function (oEntry, bReset) {
                    if (bReset) {
                        aHistoryEntries = [];
                    }

                    var bInHistory = aHistoryEntries.some(function (entry) {
                        return entry.intent === oEntry.intent;
                    });

                    if (!bInHistory) {
                        aHistoryEntries.push(oEntry);
                        this.getOwnerComponent()
                            .getService("ShellUIService")
                            .then(function (oService) {
                                oService.setHierarchy(aHistoryEntries);
                            });
                    }
                };
            })(),
        }
        );
    }
);